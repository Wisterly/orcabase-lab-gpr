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
    {"pintura", "tinta", "látex", "latex", "acrílica", "acrilica", "pva", "emboço", "reboco", "demãos", "demaos", "parede", "teto", "selador", "massa", "corrida", "esmalte"},
    {"concreto", "fck", "usinado", "bombeavel", "bombeável", "slump", "traço", "traco", "adensamento", "lançamento", "lancamento", " estrutural", "pilar", "viga", "laje"},
    {"aço", "aco", "armacao", "armação", "ca-50", "ca50", "ca-60", "ca60", "vergalhão", "vergalhao", "corte", "dobra", "barra"},
    {"forma", "fôrma", "compensado", "resinado", "plastificado", "madeirite", "escoramento", "tábua", "tabua", "sarrafo"},
    {"alvenaria", "bloco", "tijolo", "cerâmico", "ceramico", "concreto", "vedação", "vedacao", "estrutural", "argamassa"},
    {"impermeabilização", "impermeabilizacao", "manta", "asfáltica", "asfaltica", "primer", "baldrame", "laje", "emulsão", "hidrofugante"},
    {"tubo", "tubulação", "tubulacao", "pvc", "soldável", "soldavel", "esgoto", "água", "agua", "pluvial", "conexão", "conexao", "joelho", "luva", "registro"},
    {"cabo", "fio", "cobre", "flexível", "flexivel", "eletroduto", "corrugado", "disjuntor", "quadro", "tomada", "interruptor", "luminária", "luminaria"},
    {"piso", "revestimento", "cerâmica", "ceramica", "porcelanato", "azulejo", "rejunte", "ac-i", "ac-ii", "ac-iii", "rodapé", "rodape", "contrapiso"},
    {"escavação", "escavacao", "reaterro", "vala", "terraplenagem", "compactação", "compactacao", "solo", "aterro", "bota-fora"}
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
    
    syn_bonus = 0.0
    for group in SYNONYM_GROUPS:
        has_s = any(t in group for t in s_tokens)
        has_t = any(t in group for t in t_tokens)
        if has_s and has_t:
            syn_bonus = 0.25
            break

    source_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', source_desc or ''))
    target_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', target_desc or ''))
    num_matches = source_nums.intersection(target_nums)
    num_bonus = min(0.30, 0.15 * len(num_matches)) if source_nums and num_matches else 0.0
    
    unit_bonus = 0.15 if (source_unit or '').strip().upper() == (target_unit or '').strip().upper() else 0.0
    
    score = (jaccard * 0.45) + syn_bonus + num_bonus + unit_bonus
    return round(min(99.0, max(15.0, score * 100.0)), 1)

def find_budget_sheet(wb, preferred_name=None):
    """Localiza a aba de orçamento da planilha Excel."""
    if preferred_name and preferred_name in wb.sheetnames:
        return wb[preferred_name], preferred_name

    for name in wb.sheetnames:
        n_lower = name.lower()
        if any(k in n_lower for k in ["orçamento", "orcamento", "planilha orçamentária", "planilha", "composições", "analítico", "sintético"]):
            return wb[name], name
            
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

def detect_sheet_columns(ws):
    """Detecta as colunas da aba de orçamento varrendo até 80 linhas."""
    header_row = -1
    col_item = -1
    col_code = -1
    col_desc = -1
    col_unit = -1
    col_qty = -1
    col_price = -1
    col_total = -1
    best_score = 0

    for r in range(1, min(ws.max_row + 1, 80)):
        c_item, c_code, c_desc, c_unit, c_qty, c_price, c_total = -1, -1, -1, -1, -1, -1, -1
        score = 0
        for c in range(1, min(ws.max_column + 1, 25)):
            val = str(ws.cell(row=r, column=c).value or '').strip().lower()
            if not val:
                continue
            if val in ["item", "it", "it.", "nº", "seq"] or "item" in val:
                if c_item == -1:
                    c_item = c
                    score += 1
            elif any(k in val for k in ["código", "codigo", "cod", "cód", "composic", "sinapi", "referência"]):
                if c_code == -1:
                    c_code = c
                    score += 2
            elif any(k in val for k in ["descrição", "descricao", "discriminação", "discriminacao", "especificação", "serviço", "servico", "objeto"]):
                if c_desc == -1:
                    c_desc = c
                    score += 3
            elif val in ["un", "un.", "und", "und.", "unid", "unid.", "unidade", "medida"]:
                if c_unit == -1:
                    c_unit = c
                    score += 2
            elif any(k in val for k in ["quant", "qtd", "qtde", "quantidade"]):
                if c_qty == -1:
                    c_qty = c
                    score += 3
            elif any(k in val for k in ["unitário", "unitario", "preço unit", "preco unit", "valor unit", "vlr unit", "custo unit", "p.u."]):
                if c_price == -1:
                    c_price = c
                    score += 2
            elif any(k in val for k in ["total", "valor total", "preço total", "custo total", "subtotal"]):
                if c_total == -1 and c != c_price:
                    c_total = c
                    score += 2

        if score > best_score and c_desc != -1 and (c_qty != -1 or c_unit != -1 or c_price != -1):
            best_score = score
            header_row = r
            col_item = c_item
            col_code = c_code if c_code != -1 else c_item
            col_desc = c_desc
            col_unit = c_unit
            col_qty = c_qty
            col_price = c_price
            col_total = c_total

    if col_desc == -1:
        col_desc = 2
    if col_code == -1:
        col_code = 1
    if col_unit == -1:
        col_unit = col_desc + 1
    if col_qty == -1:
        col_qty = col_unit + 1
    if col_price == -1:
        col_price = col_qty + 1
    if col_total == -1:
        col_total = col_price + 1

    return {
        "header_row": header_row,
        "col_item": col_item if col_item != -1 else col_code,
        "col_code": col_code,
        "col_desc": col_desc,
        "col_unit": col_unit,
        "col_qty": col_qty,
        "col_price": col_price,
        "col_total": col_total
    }

def inspect_contract_spreadsheet(file_bytes, preferred_sheet=None):
    """
    Lê a planilha do contrato por completo, identifica a aba de orçamento,
    detecta o TOTAL GERAL no final da planilha e extrai todas as composições e colunas.
    """
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    ws, sheet_name = find_budget_sheet(wb, preferred_sheet)
    cols = detect_sheet_columns(ws)
    
    header_row = cols["header_row"]
    col_code = cols["col_code"]
    col_desc = cols["col_desc"]
    col_unit = cols["col_unit"]
    col_qty = cols["col_qty"]
    col_price = cols["col_price"]
    col_total = cols["col_total"]

    # Procura o "TOTAL GERAL", "VALOR TOTAL", "TOTAL DO ORÇAMENTO" de baixo para cima
    total_geral_val = 0.0
    total_geral_label = "Total do Orçamento"
    total_geral_row = -1
    
    for r in range(ws.max_row, max(1, ws.max_row - 60), -1):
        row_text = ""
        row_max_num = 0.0
        for c in range(1, min(ws.max_column + 1, 20)):
            val = ws.cell(row=r, column=c).value
            if val is not None:
                if isinstance(val, (int, float)) and val > row_max_num:
                    row_max_num = float(val)
                else:
                    s = str(val).strip()
                    if any(k in s.lower() for k in ["total geral", "valor total", "total do orçamento", "total orcamento", "total da planilha", "total com bdi", "total c/ bdi"]):
                        row_text = s
        if row_text and row_max_num > 0:
            total_geral_val = round(row_max_num, 2)
            total_geral_label = row_text
            total_geral_row = r
            break

    start_row = header_row + 1 if header_row != -1 else 2
    end_row = total_geral_row if total_geral_row != -1 else ws.max_row + 1
    
    extracted_compositions = []
    calculated_sum = 0.0
    
    for r in range(start_row, end_row):
        desc_val = ws.cell(row=r, column=col_desc).value
        if not desc_val or len(str(desc_val).strip()) < 3:
            continue
            
        desc = str(desc_val).strip()
        desc_lower = desc.lower()
        if any(k in desc_lower for k in ["total geral", "valor total do orçamento", "b.d.i.", "total com bdi", "encargos sociais"]):
            continue
            
        raw_qty = ws.cell(row=r, column=col_qty).value if col_qty > 0 else None
        raw_price = ws.cell(row=r, column=col_price).value if col_price > 0 else None
        raw_tot = ws.cell(row=r, column=col_total).value if col_total > 0 else None
        unit_val = str(ws.cell(row=r, column=col_unit).value or "").strip().upper() if col_unit > 0 else ""

        # Se não tem unidade nem preço unitário nem quantidade, pode ser cabeçalho de etapa
        qty = float(raw_qty) if isinstance(raw_qty, (int, float)) else 0.0
        price = float(raw_price) if isinstance(raw_price, (int, float)) else 0.0
        tot = float(raw_tot) if isinstance(raw_tot, (int, float)) else round(qty * price, 2)

        if not unit_val and price == 0.0 and qty == 0.0:
            continue

        code = str(ws.cell(row=r, column=col_code).value or f"IT-{len(extracted_compositions)+1:02d}").strip()
        if price == 0.0 and qty > 0 and tot > 0:
            price = round(tot / qty, 2)
        if tot == 0.0 and qty > 0 and price > 0:
            tot = round(qty * price, 2)

        calculated_sum += tot
        extracted_compositions.append({
            "id": f"{code}_{r}",
            "code": code,
            "description": desc,
            "unit": unit_val or "UN",
            "quantity": qty,
            "unit_price": price,
            "total_value": tot,
            "row_index": r
        })
        
    if total_geral_val == 0.0 and calculated_sum > 0:
        total_geral_val = round(calculated_sum, 2)

    return {
        "sheet_names": wb.sheetnames,
        "budget_sheet_name": sheet_name,
        "total_geral_value": total_geral_val,
        "total_geral_label": total_geral_label,
        "total_geral_row": total_geral_row,
        "compositions_count": len(extracted_compositions),
        "compositions": extracted_compositions,
        "detected_columns": cols
    }

def inject_quantities_into_contract_template(
    contract_bytes,
    composition_matches=None,
    matching_results=None,
    preferred_sheet=None,
    explicit_col_qty=None,
    explicit_col_price=None,
    explicit_col_total=None
):
    """
    Clona integralmente a planilha do Contrato Base selecionado com openpyxl,
    mantendo rigorosamente todo o layout, configurações, cabeçalhos, logos, BDI e fórmulas.
    Modifica UNICAMENTE a célula de quantitativo na composição específica correspondente!
    """
    wb = openpyxl.load_workbook(io.BytesIO(contract_bytes), data_only=False)
    ws, sheet_name = find_budget_sheet(wb, preferred_sheet)
    wb.calculation.calcPr.fullCalcOnLoad = True
    
    cols = detect_sheet_columns(ws)
    col_qty = int(explicit_col_qty) if explicit_col_qty and int(explicit_col_qty) > 0 else cols["col_qty"]
    col_price = int(explicit_col_price) if explicit_col_price and int(explicit_col_price) > 0 else cols["col_price"]
    col_total = int(explicit_col_total) if explicit_col_total and int(explicit_col_total) > 0 else cols["col_total"]
    col_code = cols["col_code"]
    col_desc = cols["col_desc"]

    qty_by_row = {}
    qty_by_code = {}
    qty_by_desc = {}

    # 1. Processa composition_matches (novo formato completo PR.008)
    if composition_matches:
        for cm in composition_matches:
            calc_qty = float(cm.get("final_injected_quantity", 0.0))
            r_idx = cm.get("contract_row_index")
            if r_idx is not None and int(r_idx) > 0:
                qty_by_row[int(r_idx)] = calc_qty
            c_code = str(cm.get("contract_code") or "").strip().upper()
            if c_code:
                qty_by_code[c_code] = calc_qty
            c_desc = str(cm.get("contract_description") or "").strip().upper()
            if c_desc:
                qty_by_desc[c_desc] = calc_qty

    # 2. Retrocompatibilidade com matching_results
    if matching_results:
        for res in matching_results:
            calc_qty = float(res.get("calculated_quantity", 0.0))
            match = res.get("selected_match", {}) or {}
            if res.get("contract_row_index"):
                r_idx = int(res["contract_row_index"])
                qty_by_row[r_idx] = qty_by_row.get(r_idx, 0.0) + calc_qty
            if match.get("dest_code"):
                k = str(match["dest_code"]).strip().upper()
                qty_by_code[k] = qty_by_code.get(k, 0.0) + calc_qty
            if match.get("dest_description"):
                k = str(match["dest_description"]).strip().upper()
                qty_by_desc[k] = qty_by_desc.get(k, 0.0) + calc_qty

    # 3. Injeta os quantitativos linha por linha sem alterar estilos nem fórmulas
    for r in range(1, ws.max_row + 1):
        target_qty = None
        if r in qty_by_row:
            target_qty = qty_by_row[r]
        else:
            c_val = str(ws.cell(row=r, column=col_code).value or '').strip().upper() if col_code > 0 else ''
            d_val = str(ws.cell(row=r, column=col_desc).value or '').strip().upper() if col_desc > 0 else ''
            if c_val and c_val in qty_by_code:
                target_qty = qty_by_code[c_val]
            elif d_val and d_val in qty_by_desc:
                target_qty = qty_by_desc[d_val]
                
        if target_qty is not None:
            # Atualiza EXCLUSIVAMENTE o número do quantitativo na célula
            qty_cell = ws.cell(row=r, column=col_qty)
            qty_cell.value = round(float(target_qty), 4)

            # Se a coluna de Total da linha NÃO for uma fórmula (ex: era número estático),
            # transforma em fórmula viva =QTD*PRECO para que o Excel recalcule automaticamente
            if col_total > 0 and col_price > 0 and col_total != col_qty:
                tot_cell = ws.cell(row=r, column=col_total)
                tot_val = tot_cell.value
                if not (isinstance(tot_val, str) and tot_val.strip().startswith("=")):
                    q_letter = get_column_letter(col_qty)
                    p_letter = get_column_letter(col_price)
                    tot_cell.value = f"=ROUND({q_letter}{r}*{p_letter}{r}, 2)"

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.getvalue()

def generate_structured_contract_workbook(contract_meta, composition_matches):
    """
    Gera com openpyxl uma planilha completa no padrão do Contrato Base
    (usado quando o contrato é demonstrativo e não possui arquivo .xlsx bruto prévio).
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Orçamento Compatibilizado"
    wb.calculation.calcPr.fullCalcOnLoad = True

    navy_fill = PatternFill(start_color="0B0F19", end_color="0B0F19", fill_type="solid")
    header_fill = PatternFill(start_color="141A28", end_color="141A28", fill_type="solid")
    stage_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    total_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")

    gold_font = Font(name="Calibri", size=12, bold=True, color="D4AF37")
    white_bold = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    stage_font = Font(name="Calibri", size=10, bold=True, color="F97316")
    normal_font = Font(name="Calibri", size=10, bold=False, color="111827")
    qty_font = Font(name="Calibri", size=10, bold=True, color="047857")

    thin_side = Side(style='thin', color='CBD5E1')
    border_all = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

    # Cabeçalho Institucional do Contrato
    ws.merge_cells("A1:H1")
    ws["A1"] = f"PLANILHA ORÇAMENTÁRIA COMPATIBILIZADA — {contract_meta.get('contractName', 'CONTRATO BASE')}"
    ws["A1"].fill = navy_fill
    ws["A1"].font = gold_font
    ws["A1"].alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[1].height = 28

    ws.merge_cells("A2:H2")
    ws["A2"] = f"Nº Contrato: {contract_meta.get('contractNumber', '-')} | Órgão/Cliente: {contract_meta.get('organization', '-')} | Base: {contract_meta.get('referenceBase', 'SINAPI')} | BDI: {contract_meta.get('bdiPercent', 0)}%"
    ws["A2"].fill = header_fill
    ws["A2"].font = white_bold
    ws.row_dimensions[2].height = 20

    headers = ["ITEM", "CÓDIGO", "FONTE", "DESCRIÇÃO DA COMPOSIÇÃO / SERVIÇO", "UNID.", "QUANTITATIVO", "PREÇO UNIT. (R$)", "VALOR TOTAL (R$)"]
    header_row = 4
    for col_idx, h_text in enumerate(headers, 1):
        c = ws.cell(row=header_row, column=col_idx, value=h_text)
        c.fill = navy_fill
        c.font = gold_font
        c.alignment = Alignment(horizontal="center" if col_idx != 4 else "left", vertical="center")
        c.border = border_all
    ws.row_dimensions[header_row].height = 24

    current_row = 5
    last_stage = None
    first_data_row = current_row

    for idx, cm in enumerate(composition_matches, 1):
        stage_label = f"{cm.get('stage_code', '')} {cm.get('stage_title', '')}".strip()
        if stage_label and stage_label != last_stage:
            last_stage = stage_label
            ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=8)
            sc = ws.cell(row=current_row, column=1, value=stage_label)
            sc.fill = stage_fill
            sc.font = stage_font
            ws.row_dimensions[current_row].height = 20
            current_row += 1

        c_item = ws.cell(row=current_row, column=1, value=cm.get("contract_item_number") or f"{idx}.0")
        c_code = ws.cell(row=current_row, column=2, value=cm.get("contract_code") or f"COMP-{idx:02d}")
        c_src = ws.cell(row=current_row, column=3, value=cm.get("contract_source") or "CONTRATO")
        c_desc = ws.cell(row=current_row, column=4, value=cm.get("contract_description") or "")
        c_unit = ws.cell(row=current_row, column=5, value=cm.get("contract_unit") or "UN")
        c_qty = ws.cell(row=current_row, column=6, value=round(float(cm.get("final_injected_quantity", 0.0)), 4))
        c_price = ws.cell(row=current_row, column=7, value=round(float(cm.get("contract_unit_price", 0.0)), 2))
        c_tot = ws.cell(row=current_row, column=8, value=f"=ROUND(F{current_row}*G{current_row}, 2)")

        for col_i, cell_obj in enumerate([c_item, c_code, c_src, c_desc, c_unit, c_qty, c_price, c_tot], 1):
            cell_obj.border = border_all
            cell_obj.font = qty_font if col_i == 6 else normal_font
            if col_i in [1, 2, 3, 5]:
                cell_obj.alignment = Alignment(horizontal="center", vertical="center")
            elif col_i in [6, 7, 8]:
                cell_obj.alignment = Alignment(horizontal="right", vertical="center")

        c_qty.number_format = '#,##0.0000'
        c_price.number_format = '#,##0.00'
        c_tot.number_format = '#,##0.00'
        ws.row_dimensions[current_row].height = 20
        current_row += 1

    last_data_row = max(first_data_row, current_row - 1)
    ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=7)
    tot_label = ws.cell(row=current_row, column=1, value="TOTAL GERAL DO ORÇAMENTO COMPATIBILIZADO")
    tot_label.fill = total_fill
    tot_label.font = gold_font
    tot_label.alignment = Alignment(horizontal="right", vertical="center")

    tot_val = ws.cell(row=current_row, column=8, value=f"=SUM(H{first_data_row}:H{last_data_row})")
    tot_val.fill = total_fill
    tot_val.font = gold_font
    tot_val.number_format = 'R$ #,##0.00'
    tot_val.alignment = Alignment(horizontal="right", vertical="center")
    ws.row_dimensions[current_row].height = 26

    col_widths = [10, 14, 12, 58, 10, 16, 18, 20]
    for i, w in enumerate(col_widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

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
            "cycle": "PR.008",
            "excel_engine": "openpyxl (Strict Mode + Full Calc On Load)",
            "features": [
                "Estudo Estrutural 100% Completo de Ambas as Planilhas (Etapas, Setores, Colunas e Total Geral)",
                "Compatibilização Semântica Contextual (Disciplina/Etapa + Palavras-Chave + Unidade)",
                "Clonagem Integral com Injeção Exclusiva na Coluna de Quantitativo",
                "Modos KEEP_QUANTITY (Manter Quantitativo) e KEEP_TOTAL_VALUE (Bater Valor Total Final)"
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
            preferred_sheet = body.get("sheet_name", None)
            if not b64_data:
                self.send_json(400, {"status": "error", "message": "file_base64 obrigatório"})
                return
            try:
                if "," in b64_data:
                    b64_data = b64_data.split(",")[1]
                raw_bytes = base64.b64decode(b64_data)
                inspection = inspect_contract_spreadsheet(raw_bytes, preferred_sheet)
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
            composition_matches = body.get("composition_matches", [])
            matching_results = body.get("matching_results", [])
            contract_meta = body.get("contract_meta", {})
            preferred_sheet = body.get("sheet_name", None)
            col_qty = body.get("col_qty", None)
            col_price = body.get("col_price", None)
            col_total = body.get("col_total", None)
            filename = body.get("filename", "Planilha_Final_Compatibilizada.xlsx")
            
            try:
                if contract_b64 and len(contract_b64.strip()) > 20:
                    if "," in contract_b64:
                        contract_b64 = contract_b64.split(",")[1]
                    contract_bytes = base64.b64decode(contract_b64)
                    final_bytes = inject_quantities_into_contract_template(
                        contract_bytes=contract_bytes,
                        composition_matches=composition_matches,
                        matching_results=matching_results,
                        preferred_sheet=preferred_sheet,
                        explicit_col_qty=col_qty,
                        explicit_col_price=col_price,
                        explicit_col_total=col_total
                    )
                    engine_label = "openpyxl v3.1.5 (Clone Fiel 100% da Planilha do Contrato Base)"
                else:
                    final_bytes = generate_structured_contract_workbook(contract_meta, composition_matches)
                    engine_label = "openpyxl v3.1.5 (Planilha Gerada no Padrão do Contrato)"

                b64_output = base64.b64encode(final_bytes).decode('utf-8')
                
                self.send_json(200, {
                    "status": "success",
                    "filename": filename,
                    "file_base64": b64_output,
                    "engine": engine_label
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
