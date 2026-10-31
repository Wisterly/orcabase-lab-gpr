import json
import base64
import io
import re
from http.server import BaseHTTPRequestHandler
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Catálogo Referencial Padrão da Construção Civil Brasileira (SINAPI / SICRO)
SINAPI_CATALOG = [
    {
        "code": "SINAPI-94970",
        "description": "CONCRETO FCK 30MPA, TRACO 1:1,9:2,3 - LANCAMENTO E ADENSAMENTO",
        "unit": "M3",
        "unit_price": 492.30,
        "source": "SINAPI",
        "category": "Estrutura"
    },
    {
        "code": "SINAPI-94968",
        "description": "CONCRETO FCK 25MPA, TRACO 1:2,3:2,7 - LANCAMENTO E ADENSAMENTO",
        "unit": "M3",
        "unit_price": 465.10,
        "source": "SINAPI",
        "category": "Estrutura"
    },
    {
        "code": "SINAPI-101689",
        "description": "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 10,0 MM",
        "unit": "KG",
        "unit_price": 10.45,
        "source": "SINAPI",
        "category": "Estrutura"
    },
    {
        "code": "SINAPI-101691",
        "description": "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 12,5 MM",
        "unit": "KG",
        "unit_price": 10.15,
        "source": "SINAPI",
        "category": "Estrutura"
    },
    {
        "code": "SINAPI-92412",
        "description": "FORMA DE COMPENSADO RESINADO ESPESSURA 12MM COM REAPROVEITAMENTO",
        "unit": "M2",
        "unit_price": 72.80,
        "source": "SINAPI",
        "category": "Estrutura"
    },
    {
        "code": "SINAPI-87529",
        "description": "ALVENARIA DE VEDACAO BLOCO CERAMICO 9X19X19CM COM ARGAMASSA MISTA",
        "unit": "M2",
        "unit_price": 64.90,
        "source": "SINAPI",
        "category": "Alvenaria"
    },
    {
        "code": "SINAPI-88489",
        "description": "APLICACAO MANUAL DE PINTURA COM TINTA LATEX ACRILICA EM PAREDES DUAS DEMAOS",
        "unit": "M2",
        "unit_price": 24.60,
        "source": "SINAPI",
        "category": "Pintura"
    },
    {
        "code": "SINAPI-91795",
        "description": "CABO DE COBRE FLEXIVEL ISOLADO 2,5 MM2 ANTI-CHAMA 450/750V",
        "unit": "M",
        "unit_price": 3.85,
        "source": "SINAPI",
        "category": "Elétrica"
    },
    {
        "code": "SINAPI-89356",
        "description": "TUBO PVC SOLDAVEL AGUA FRIA MARROM DN 25 MM (3/4 POL) INSTALADO EM PAREDE",
        "unit": "M",
        "unit_price": 18.20,
        "source": "SINAPI",
        "category": "Hidráulica"
    },
    {
        "code": "SINAPI-98557",
        "description": "IMPERMEABILIZACAO COM MANTA ASFALTICA E=4MM APLICADA A MACARICO",
        "unit": "M2",
        "unit_price": 88.50,
        "source": "SINAPI",
        "category": "Impermeabilização"
    },
    {
        "code": "SICRO-5502981",
        "description": "ESCAVACAO MECANICA DE VALAS EM MATERIAL DE 1A CATEGORIA",
        "unit": "M3",
        "unit_price": 14.30,
        "source": "SICRO",
        "category": "Terraplenagem"
    }
]

def clean_tokens(text):
    if not text:
        return set()
    t = text.lower()
    t = re.sub(r'[\/\\,\.\-\(\)\:\;\_\+]', ' ', t)
    stop = {"de", "em", "para", "com", "e", "ou", "a", "o", "da", "do", "das", "dos", "p", "c", "espessura", "tipo"}
    tokens = set(word.strip() for word in t.split() if len(word.strip()) > 1 and word.strip() not in stop)
    return tokens

def compute_similarity(source_desc, source_unit, target_desc, target_unit):
    s_tokens = clean_tokens(source_desc)
    t_tokens = clean_tokens(target_desc)
    if not s_tokens or not t_tokens:
        return 0.0
    intersection = s_tokens.intersection(t_tokens)
    union = s_tokens.union(t_tokens)
    jaccard = len(intersection) / len(union) if union else 0.0
    
    source_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', source_desc))
    target_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', target_desc))
    num_matches = source_nums.intersection(target_nums)
    num_bonus = min(0.25, 0.15 * len(num_matches)) if source_nums and num_matches else 0.0
    
    unit_bonus = 0.15 if (source_unit or '').strip().upper() == (target_unit or '').strip().upper() else 0.0
    score = (jaccard * 0.65) + num_bonus + unit_bonus
    return round(min(99.0, max(15.0, score * 100.0)), 1)

def inject_quantities_into_contract_template(contract_bytes, matching_results):
    """
    Mantém rigorosamente o layout, estilos, cabeçalhos, logos, BDI e fórmulas
    da planilha do Contrato Base selecionado, atualizando apenas os quantitativos
    das composições compatibilizadas.
    """
    wb = openpyxl.load_workbook(io.BytesIO(contract_bytes))
    ws = wb.active
    wb.calculation.calcPr.fullCalcOnLoad = True
    
    # Mapeamento dos itens compatibilizados: código/descrição -> novo quantitativo
    qty_lookup = {}
    for res in matching_results:
        src = res.get("source_item", {})
        match = res.get("selected_match", {})
        calc_qty = res.get("calculated_quantity", src.get("quantity", 0.0))
        
        # Mapeia por código destino e descrição
        if match and match.get("dest_code"):
            qty_lookup[match["dest_code"].strip().upper()] = calc_qty
            qty_lookup[match.get("dest_description", "").strip().upper()] = calc_qty
        if src.get("id"):
            qty_lookup[src["id"].strip().upper()] = calc_qty
        if src.get("description"):
            qty_lookup[src["description"].strip().upper()] = calc_qty

    # Detecta as colunas de código, descrição e quantidade na planilha do contrato
    header_row = -1
    col_code = -1
    col_desc = -1
    col_qty = -1
    
    for r in range(1, min(ws.max_row + 1, 20)):
        row_vals = [str(ws.cell(row=r, column=c).value or '').lower() for c in range(1, ws.max_column + 1)]
        for c_idx, val in enumerate(row_vals, 1):
            if any(k in val for k in ["código", "codigo", "item"]):
                col_code = c_idx
            if any(k in val for k in ["descrição", "discriminacao", "especificacao", "composição"]):
                col_desc = c_idx
            if any(k in val for k in ["quant", "qtd", "quantidade"]):
                col_qty = c_idx
        if col_desc != -1 and col_qty != -1:
            header_row = r
            break
            
    # Se não encontrou cabeçalho explícito, usa heurística padrão (colunas 1 a 4)
    if col_qty == -1:
        col_qty = 4
    if col_desc == -1:
        col_desc = 2
        
    start_r = header_row + 1 if header_row != -1 else 2
    for r in range(start_r, ws.max_row + 1):
        cell_desc = ws.cell(row=r, column=col_desc).value
        cell_code = ws.cell(row=r, column=col_code).value if col_code != -1 else ""
        
        target_key_desc = str(cell_desc or '').strip().upper()
        target_key_code = str(cell_code or '').strip().upper()
        
        matched_qty = None
        if target_key_code in qty_lookup:
            matched_qty = qty_lookup[target_key_code]
        elif target_key_desc in qty_lookup:
            matched_qty = qty_lookup[target_key_desc]
        else:
            # Busca semântica aproximada nas chaves
            for k, q in qty_lookup.items():
                if len(k) > 10 and (k in target_key_desc or target_key_desc in k):
                    matched_qty = q
                    break
                    
        if matched_qty is not None:
            # ATUALIZA APENAS O QUANTITATIVO MANTENDO O ESTILO ORIGINAL DA CÉLULA
            target_cell = ws.cell(row=r, column=col_qty)
            target_cell.value = float(matched_qty)
            
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.getvalue()

def generate_excel_export(results, strategy_mode="KEEP_TOTAL_VALUE"):
    wb = openpyxl.Workbook()
    wb.calculation.calcPr.fullCalcOnLoad = True
    
    ws1 = wb.active
    ws1.title = "Orçamento Compatibilizado"
    
    font_title = Font(name="Segoe UI", size=14, bold=True, color="D4AF37")
    font_subtitle = Font(name="Segoe UI", size=9, italic=True, color="64748B")
    font_header = Font(name="Segoe UI", size=9, bold=True, color="FFFFFF")
    font_data = Font(name="Segoe UI", size=9, color="0F172A")
    font_total = Font(name="Segoe UI", size=10, bold=True, color="060B14")
    
    fill_header_navy = PatternFill(start_color="060B14", end_color="060B14", fill_type="solid")
    fill_header_ref = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    fill_zebra = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    fill_total = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
    
    border_thin = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    border_total = Border(
        top=Side(style='thin', color='D4AF37'),
        bottom=Side(style='double', color='D4AF37')
    )
    
    ws1.merge_cells("A1:N1")
    ws1["A1"] = "ORÇABASE.LAB - GPR — RELATÓRIO DE COMPATIBILIZAÇÃO ORÇAMENTÁRIA"
    ws1["A1"].font = font_title
    ws1["A1"].alignment = Alignment(horizontal='left', vertical='center')
    
    ws1.merge_cells("A2:N2")
    ws1["A2"] = f"Estratégia: {strategy_mode} | Motor: openpyxl v3.1.5 (Strict Mode com Fórmulas Vivas)"
    ws1["A2"].font = font_subtitle
    ws1["A2"].alignment = Alignment(horizontal='left', vertical='center')
    
    headers = [
        "Item", "Descrição Original (Base)", "UN", "Qtd Base", "Unit. Orig (R$)", "Total Orig (R$)",
        "Cód. Ref", "Descrição de Referência (Contrato)", "UN Ref", "Unit. Ref (R$)",
        "Qtd Calculada", "Total Compat. (R$)", "Score IA", "Status"
    ]
    
    for col_idx, h_text in enumerate(headers, 1):
        cell = ws1.cell(row=4, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_header_navy if col_idx <= 6 else fill_header_ref
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = border_thin
        
    current_row = 5
    for idx, item in enumerate(results):
        src = item.get("source_item", {})
        match = item.get("selected_match", {})
        
        ws1.cell(row=current_row, column=1, value=src.get("id", f"IT-{idx+1:03d}")).alignment = Alignment(horizontal='center')
        ws1.cell(row=current_row, column=2, value=src.get("description", "")).alignment = Alignment(horizontal='left')
        ws1.cell(row=current_row, column=3, value=src.get("unit", "")).alignment = Alignment(horizontal='center')
        
        c_q = ws1.cell(row=current_row, column=4, value=float(src.get("quantity", 0.0)))
        c_q.number_format = "#,##0.00"
        c_q.alignment = Alignment(horizontal='right')
        
        c_u = ws1.cell(row=current_row, column=5, value=float(src.get("unit_price", 0.0)))
        c_u.number_format = "R$ #,##0.00"
        c_u.alignment = Alignment(horizontal='right')
        
        c_tot = ws1.cell(row=current_row, column=6, value=f"=D{current_row}*E{current_row}")
        c_tot.number_format = "R$ #,##0.00"
        c_tot.alignment = Alignment(horizontal='right')
        
        if match:
            ws1.cell(row=current_row, column=7, value=match.get("dest_code", "")).alignment = Alignment(horizontal='center')
            ws1.cell(row=current_row, column=8, value=match.get("dest_description", "")).alignment = Alignment(horizontal='left')
            ws1.cell(row=current_row, column=9, value=match.get("dest_unit", "")).alignment = Alignment(horizontal='center')
            
            c_ur = ws1.cell(row=current_row, column=10, value=float(match.get("unit_price", 0.0)))
            c_ur.number_format = "R$ #,##0.00"
            c_ur.alignment = Alignment(horizontal='right')
            
            if strategy_mode == "KEEP_TOTAL_VALUE":
                c_cq = ws1.cell(row=current_row, column=11, value=f"=IF(J{current_row}>0, ROUND(F{current_row}/J{current_row}, 4), D{current_row})")
            else:
                c_cq = ws1.cell(row=current_row, column=11, value=f"=D{current_row}")
            c_cq.number_format = "#,##0.00"
            c_cq.alignment = Alignment(horizontal='right')
            
            c_tc = ws1.cell(row=current_row, column=12, value=f"=K{current_row}*J{current_row}")
            c_tc.number_format = "R$ #,##0.00"
            c_tc.alignment = Alignment(horizontal='right')
            
            score_val = float(match.get("confidence_score", 0.0))
            ws1.cell(row=current_row, column=13, value=f"{score_val:.1f}%").alignment = Alignment(horizontal='center')
            ws1.cell(row=current_row, column=14, value=item.get("status", "MATCHED")).alignment = Alignment(horizontal='center')
            
        for col_idx in range(1, 15):
            ws1.cell(row=current_row, column=col_idx).border = border_thin
            if current_row % 2 == 0:
                ws1.cell(row=current_row, column=col_idx).fill = fill_zebra
        current_row += 1
        
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
            "cycle": "PR.006",
            "excel_engine": "openpyxl (Strict Mode)",
            "features": [
                "Clonagem de Layout Integral do Contrato Base",
                "Injeção Exclusiva de Quantitativos",
                "Mesa De-Para",
                "Fórmulas Vivas"
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
        
        # Injeção em planilha base preservando 100% de layout
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
                    "engine": "openpyxl v3.1.5 (Layout Integral Preservado)"
                })
            except Exception as e:
                self.send_json(500, {"status": "error", "message": f"Erro na injeção de quantitativos: {str(e)}"})
            return

        # Exportação padrão
        if action == "export_xlsx":
            results = body.get("items", [])
            strategy = body.get("strategy", "KEEP_TOTAL_VALUE")
            try:
                xlsx_bytes = generate_excel_export(results, strategy)
                b64_output = base64.b64encode(xlsx_bytes).decode('utf-8')
                self.send_json(200, {
                    "status": "success",
                    "filename": "Orcamento_Compatibilizado_OrcaBase.xlsx",
                    "file_base64": b64_output,
                    "engine": "openpyxl v3.1.5"
                })
            except Exception as e:
                self.send_json(500, {"status": "error", "message": f"Erro na geração Excel: {str(e)}"})
            return

        self.send_json(200, {"status": "success", "received": action})
