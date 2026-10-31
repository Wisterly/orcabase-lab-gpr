import json
import base64
import io
import re
from http.server import BaseHTTPRequestHandler
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Sinônimos e termos chave da Engenharia Civil para AI Matching Semântico
SYNONYM_GROUPS = [
    {"pintura", "tinta", "látex", "latex", "acrílica", "acrilica", "pva", "emboço", "reboco", "demãos", "demaos", "parede", "teto"},
    {"concreto", "fck", "usinado", "bombeavel", "bombeável", "slump", "traço", "traco", "adensamento", "lançamento", "lancamento"},
    {"aço", "aco", "armacao", "armação", "ca-50", "ca50", "ca-60", "ca60", "vergalhão", "vergalhao", "corte", "dobra", "barra"},
    {"forma", "compensado", "resinado", "plastificado", "madeirite", "escoramento", "tábua", "tabua", "sarrafo"},
    {"alvenaria", "bloco", "tijolo", "cerâmico", "ceramico", "concreto", "vedação", "vedacao", "estrutural", "argamassa"},
    {"impermeabilização", "impermeabilizacao", "manta", "asfáltica", "asfaltica", "primer", "baldrame", "laje"},
    {"tubo", "tubulação", "tubulacao", "pvc", "soldável", "soldavel", "esgoto", "água", "agua", "pluvial", "conexão", "conexao"},
    {"cabo", "fio", "cobre", "flexível", "flexivel", "eletroduto", "corrugado", "disjuntor", "quadro"},
    {"piso", "revestimento", "cerâmica", "ceramica", "porcelanato", "azulejo", "rejunte", "ac-i", "ac-ii", "ac-iii"},
    {"escavação", "escavacao", "reaterro", "vala", "terraplenagem", "compactação", "compactacao", "solo"}
]

def clean_tokens(text):
    if not text:
        return set()
    t = text.lower()
    t = re.sub(r'[\/\\,\.\-\(\)\:\;\_\+\"\'\%\*]', ' ', t)
    stop = {"de", "em", "para", "com", "e", "ou", "a", "o", "da", "do", "das", "dos", "p", "c", "espessura", "tipo", "sobre", "manual"}
    return set(word.strip() for word in t.split() if len(word.strip()) > 1 and word.strip() not in stop)

def compute_similarity(source_desc, source_unit, target_desc, target_unit):
    s_tokens = clean_tokens(source_desc)
    t_tokens = clean_tokens(target_desc)
    if not s_tokens or not t_tokens:
        return 0.0
        
    intersection = s_tokens.intersection(t_tokens)
    union = s_tokens.union(t_tokens)
    jaccard = len(intersection) / len(union) if union else 0.0
    
    # Bônus por sinônimos da construção civil
    syn_bonus = 0.0
    for group in SYNONYM_GROUPS:
        has_s = any(t in group for t in s_tokens)
        has_t = any(t in group for t in t_tokens)
        if has_s and has_t:
            syn_bonus = 0.25
            break

    # Bônus por compatibilidade numérica exata (ex: 30 MPa, 10mm, 12mm)
    source_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', source_desc))
    target_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', target_desc))
    num_matches = source_nums.intersection(target_nums)
    num_bonus = min(0.30, 0.15 * len(num_matches)) if source_nums and num_matches else 0.0
    
    # Bônus de unidade de medida idêntica
    unit_bonus = 0.15 if (source_unit or '').strip().upper() == (target_unit or '').strip().upper() else 0.0
    
    score = (jaccard * 0.45) + syn_bonus + num_bonus + unit_bonus
    return round(min(99.0, max(15.0, score * 100.0)), 1)

def find_budget_sheet(wb):
    """Localiza inteligentemente a aba de orçamento da planilha Excel."""
    for name in wb.sheetnames:
        n_lower = name.lower()
        if any(k in n_lower for k in ["orçamento", "orcamento", "planilha orçamentária", "planilha", "composições", "analítico"]):
            return wb[name], name
            
    # Se não houver nome específico, escolhe a aba com mais linhas
    max_rows = 0
    best_sheet = wb.active
    best_name = wb.sheetnames[0]
    for name in wb.sheetnames:
        ws = wb[name]
        if ws.max_row > max_rows:
            max_rows = ws.max_row
            best_sheet = ws
            best_name = name
    return best_sheet, best_name

def inspect_contract_spreadsheet(file_bytes):
    """
    Lê a planilha do contrato, identifica a aba de orçamento, detecta o TOTAL GERAL
    no final da planilha (ou ao lado) e extrai todas as composições e colunas.
    """
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    ws, sheet_name = find_budget_sheet(wb)
    
    # 1. Procura o "TOTAL GERAL", "VALOR TOTAL", "TOTAL DO ORÇAMENTO"
    total_geral_val = 0.0
    total_geral_label = "Total do Orçamento"
    total_geral_row = -1
    
    # Varre as linhas de baixo para cima buscando o total
    for r in range(ws.max_row, max(1, ws.max_row - 40), -1):
        for c in range(1, min(ws.max_column + 1, 15)):
            val = ws.cell(row=r, column=c).value
            if val is not None:
                val_str = str(val).strip().lower()
                if any(k in val_str for k in ["total geral", "valor total", "total do orçamento", "total orcamento", "total da planilha", "total"]):
                    total_geral_label = str(val).strip()
                    total_geral_row = r
                    # Procura o valor numérico na mesma linha (à direita)
                    for look_c in range(c + 1, min(ws.max_column + 1, c + 8)):
                        cand_val = ws.cell(row=r, column=look_c).value
                        if isinstance(cand_val, (int, float)) and cand_val > 0:
                            total_geral_val = float(cand_val)
                            break
                    if total_geral_val > 0:
                        break
        if total_geral_val > 0:
            break

    # 2. Detecta colunas de cabeçalho
    header_row = -1
    col_code = -1
    col_desc = -1
    col_unit = -1
    col_qty = -1
    col_price = -1
    col_total = -1
    
    for r in range(1, min(ws.max_row + 1, 20)):
        row_vals = [str(ws.cell(row=r, column=c).value or '').lower() for c in range(1, ws.max_column + 1)]
        for c_idx, val in enumerate(row_vals, 1):
            if any(k in val for k in ["código", "codigo", "item"]):
                col_code = c_idx
            if any(k in val for k in ["descrição", "discriminacao", "especificacao", "composição", "serviço"]):
                col_desc = c_idx
            if any(k in val for k in ["unid", "un"]):
                col_unit = c_idx
            if any(k in val for k in ["quant", "qtd", "quantidade"]):
                col_qty = c_idx
            if any(k in val for k in ["unitário", "unitario", "preço", "preco"]):
                col_price = c_idx
            if any(k in val for k in ["total", "valor"]):
                col_total = c_idx
        if col_desc != -1 and col_qty != -1:
            header_row = r
            break
            
    if col_desc == -1: col_desc = 2
    if col_unit == -1: col_unit = 3
    if col_qty == -1: col_qty = 4
    if col_price == -1: col_price = 5
    
    start_row = header_row + 1 if header_row != -1 else 2
    end_row = total_geral_row if total_geral_row != -1 else ws.max_row + 1
    
    extracted_compositions = []
    calculated_sum = 0.0
    
    for r in range(start_row, end_row):
        desc_val = ws.cell(row=r, column=col_desc).value
        if not desc_val or len(str(desc_val).strip()) < 3:
            continue
            
        desc = str(desc_val).strip()
        # Ignora linhas que são subtotais ou palavras-chave de resumo
        if any(k in desc.lower() for k in ["total geral", "b.d.i.", "bdi", "resumo"]):
            continue
            
        code = str(ws.cell(row=r, column=col_code).value or f"IT-{len(extracted_compositions)+1:02d}").strip()
        unit = str(ws.cell(row=r, column=col_unit).value or "UN").strip().upper()
        
        raw_qty = ws.cell(row=r, column=col_qty).value
        qty = float(raw_qty) if isinstance(raw_qty, (int, float)) else 1.0
        
        raw_price = ws.cell(row=r, column=col_price).value
        price = float(raw_price) if isinstance(raw_price, (int, float)) else 0.0
        
        tot = round(qty * price, 2)
        calculated_sum += tot
        
        extracted_compositions.append({
            "id": code,
            "code": code,
            "description": desc,
            "unit": unit,
            "quantity": qty,
            "unit_price": price,
            "total_value": tot,
            "row_index": r
        })
        
    if total_geral_val == 0.0 and calculated_sum > 0:
        total_geral_val = round(calculated_sum, 2)

    return {
        "budget_sheet_name": sheet_name,
        "total_geral_value": total_geral_val,
        "total_geral_label": total_geral_label,
        "compositions_count": len(extracted_compositions),
        "compositions": extracted_compositions,
        "detected_columns": {
            "col_code": col_code,
            "col_desc": col_desc,
            "col_unit": col_unit,
            "col_qty": col_qty,
            "col_price": col_price,
            "col_total": col_total,
            "header_row": header_row
        }
    }

def inject_quantities_into_contract_template(contract_bytes, matching_results):
    """
    Clona integralmente a planilha do Contrato Base selecionado com openpyxl,
    mantendo rigorosamente todo o layout, configurações, cabeçalhos, logos, BDI e fórmulas.
    Modifica UNICAMENTE a célula de quantitativo na composição específica correspondente!
    """
    # Abre o workbook original mantendo fórmulas (data_only=False)
    wb = openpyxl.load_workbook(io.BytesIO(contract_bytes), data_only=False)
    ws, sheet_name = find_budget_sheet(wb)
    wb.calculation.calcPr.fullCalcOnLoad = True
    
    # Mapeamento dos quantitativos compatibilizados: row_index ou dest_code -> new_quantity
    qty_by_row = {}
    qty_by_code = {}
    qty_by_desc = {}
    
    for res in matching_results:
        calc_qty = float(res.get("calculated_quantity", 0.0))
        match = res.get("selected_match", {})
        
        if res.get("contract_row_index"):
            qty_by_row[int(res["contract_row_index"])] = calc_qty
            
        if match and match.get("dest_code"):
            qty_by_code[match["dest_code"].strip().upper()] = calc_qty
            
        if match and match.get("dest_description"):
            qty_by_desc[match["dest_description"].strip().upper()] = calc_qty

    # Detecta a coluna de quantidade
    col_qty = 4
    col_desc = 2
    col_code = 1
    
    for r in range(1, min(ws.max_row + 1, 20)):
        for c in range(1, min(ws.max_column + 1, 15)):
            val = str(ws.cell(row=r, column=c).value or '').lower()
            if any(k in val for k in ["quant", "qtd", "quantidade"]):
                col_qty = c
            if any(k in val for k in ["descrição", "discriminacao", "composição"]):
                col_desc = c
            if any(k in val for k in ["código", "codigo", "item"]):
                col_code = c

    # Aplica as injeções de quantidade mantendo células, estilos e fórmulas intactas
    for r in range(1, ws.max_row + 1):
        target_qty = None
        if r in qty_by_row:
            target_qty = qty_by_row[r]
        else:
            c_val = str(ws.cell(row=r, column=col_code).value or '').strip().upper()
            d_val = str(ws.cell(row=r, column=col_desc).value or '').strip().upper()
            if c_val and c_val in qty_by_code:
                target_qty = qty_by_code[c_val]
            elif d_val and d_val in qty_by_desc:
                target_qty = qty_by_desc[d_val]
                
        if target_qty is not None:
            # ATUALIZA UNICAMENTE O VALOR DO QUANTITATIVO
            cell = ws.cell(row=r, column=col_qty)
            cell.value = target_qty

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.getvalue()

class handler(BaseHTTPRequestHandler):
    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_json(200, {
            "status": "online",
            "module": "OrçaBase.lab - GPR",
            "cycle": "PR.007",
            "excel_engine": "openpyxl (Strict Mode)",
            "features": [
                "Leitura Inteligente com Busca do TOTAL GERAL",
                "Detecção Automática da Aba de Orçamento",
                "Clonagem Integral com Injeção Exclusiva de Quantitativos",
                "Compatibilização Semântica com Preservação de Fórmulas Vivas"
            ]
        })

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_json(400, {"status": "error", "message": f"JSON inválido: {str(e)}"})
            return

        action = body.get("action", "")

        # 1. Rota de Inspeção Inteligente do Contrato Base
        if action == "inspect_contract":
            b64_data = body.get("file_base64", "")
            if not b64_data:
                self.send_json(400, {"status": "error", "message": "file_base64 obrigatório"})
                return
            try:
                if "," in b64_data:
                    b64_data = b64_data.split(",")[1]
                raw_bytes = base64.b64decode(b64_data)
                inspection = inspect_contract_spreadsheet(raw_bytes)
                self.send_json(200, {
                    "status": "success",
                    "inspection": inspection
                })
            except Exception as e:
                self.send_json(500, {"status": "error", "message": f"Erro na inspeção do contrato: {str(e)}"})
            return

        # 2. Rota de Injeção de Quantitativos Fiel com openpyxl
        if action == "inject_quantities":
            contract_b64 = body.get("contract_base64", "")
            matching_results = body.get("matching_results", [])
            filename = body.get("filename", "Planilha_Final_Compatibilizada.xlsx")
            
            try:
                if "," in contract_b64:
                    contract_b64 = contract_b64.split(",")[1]
                contract_bytes = base64.b64decode(contract_b64)
                
                final_bytes = inject_quantities_into_contract_template(contract_bytes, matching_results)
                b64_output = base64.b64encode(final_bytes).decode('utf-8')
                
                self.send_json(200, {
                    "status": "success",
                    "filename": filename,
                    "file_base64": b64_output,
                    "engine": "openpyxl v3.1.5 (Layout 100% Preservado)"
                })
            except Exception as e:
                self.send_json(500, {"status": "error", "message": f"Erro na injeção de quantitativos: {str(e)}"})
            return

        # 3. Rota de Matching Semântico de Insumos
        if action == "semantic_match":
            source_items = body.get("source_items", [])
            contract_items = body.get("contract_items", [])
            
            matched = []
            for src in source_items:
                s_desc = src.get("description", "")
                s_unit = src.get("unit", "")
                best_cand = None
                best_score = 0.0
                
                for comp in contract_items:
                    conf = compute_similarity(s_desc, s_unit, comp.get("description", ""), comp.get("unit", ""))
                    if conf > best_score:
                        best_score = conf
                        best_cand = comp
                        
                matched.append({
                    "source_item": src,
                    "selected_match": {
                        "dest_code": best_cand.get("code", "") if best_cand else "",
                        "dest_description": best_cand.get("description", "") if best_cand else "",
                        "dest_unit": best_cand.get("unit", "") if best_cand else "",
                        "unit_price": best_cand.get("unit_price", 0.0) if best_cand else 0.0,
                        "confidence_score": best_score,
                    } if best_cand else None,
                    "calculated_quantity": src.get("quantity", 0.0),
                    "contract_row_index": best_cand.get("row_index", None) if best_cand else None
                })
                
            self.send_json(200, {"status": "success", "results": matched})
            return

        self.send_json(200, {"status": "success", "received": action})
