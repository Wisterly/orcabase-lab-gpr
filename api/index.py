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
        "code": "SINAPI-94965",
        "description": "CONCRETO FCK 20MPA, TRACO 1:2,7:3,0 - LANCAMENTO E ADENSAMENTO",
        "unit": "M3",
        "unit_price": 438.50,
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
        "code": "SINAPI-101687",
        "description": "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 8,0 MM",
        "unit": "KG",
        "unit_price": 10.80,
        "source": "SINAPI",
        "category": "Estrutura"
    },
    {
        "code": "SINAPI-101685",
        "description": "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-60 DE 5,0 MM",
        "unit": "KG",
        "unit_price": 11.20,
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
        "code": "SINAPI-92414",
        "description": "FORMA DE COMPENSADO PLASTIFICADO ESPESSURA 18MM C/ ESCORAMENTO METALICO",
        "unit": "M2",
        "unit_price": 105.40,
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
        "code": "SINAPI-87535",
        "description": "ALVENARIA DE VEDACAO BLOCO DE CONCRETO 14X19X39CM E=14CM",
        "unit": "M2",
        "unit_price": 82.15,
        "source": "SINAPI",
        "category": "Alvenaria"
    },
    {
        "code": "SINAPI-87878",
        "description": "CHAPISCO APLICADO EM ALVENARIA ESTRUTURAL COM COLHER DE PEDREIRO",
        "unit": "M2",
        "unit_price": 8.70,
        "source": "SINAPI",
        "category": "Revestimentos"
    },
    {
        "code": "SINAPI-87879",
        "description": "EMBOCO OU MASSA UNICA PARA RECEBIMENTO DE PINTURA ESPESSURA 20MM",
        "unit": "M2",
        "unit_price": 31.40,
        "source": "SINAPI",
        "category": "Revestimentos"
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
        "code": "SINAPI-88484",
        "description": "APLICACAO MANUAL DE PINTURA COM TINTA LATEX PVA EM TETOS DUAS DEMAOS",
        "unit": "M2",
        "unit_price": 20.30,
        "source": "SINAPI",
        "category": "Pintura"
    },
    {
        "code": "SINAPI-87251",
        "description": "REVESTIMENTO CERAMICO ESMALTADO PARA PISO 60X60CM PEI-4 COM ARGAMASSA AC-I",
        "unit": "M2",
        "unit_price": 79.50,
        "source": "SINAPI",
        "category": "Pisos"
    },
    {
        "code": "SINAPI-87253",
        "description": "PORCELANATO POLIDO RETIFICADO 80X80CM COM ARGAMASSA AC-III",
        "unit": "M2",
        "unit_price": 138.90,
        "source": "SINAPI",
        "category": "Pisos"
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
        "code": "SINAPI-91797",
        "description": "CABO DE COBRE FLEXIVEL ISOLADO 4,0 MM2 ANTI-CHAMA 450/750V",
        "unit": "M",
        "unit_price": 6.10,
        "source": "SINAPI",
        "category": "Elétrica"
    },
    {
        "code": "SINAPI-91799",
        "description": "CABO DE COBRE FLEXIVEL ISOLADO 6,0 MM2 ANTI-CHAMA 450/750V",
        "unit": "M",
        "unit_price": 9.25,
        "source": "SINAPI",
        "category": "Elétrica"
    },
    {
        "code": "SINAPI-91834",
        "description": "ELETRODUTO FLEXIVEL CORRUGADO PVC DN 25 MM (3/4 POL) EMBUTIDO EM LAJE",
        "unit": "M",
        "unit_price": 8.40,
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
        "code": "SINAPI-89357",
        "description": "TUBO PVC SOLDAVEL AGUA FRIA MARROM DN 32 MM (1 POL) INSTALADO EM PAREDE",
        "unit": "M",
        "unit_price": 27.50,
        "source": "SINAPI",
        "category": "Hidráulica"
    },
    {
        "code": "SINAPI-89707",
        "description": "TUBO PVC ESGOTO SERIE NORMAL DN 100 MM INSTALADO EM RAMAL DE DESCARGA",
        "unit": "M",
        "unit_price": 39.80,
        "source": "SINAPI",
        "category": "Hidráulica"
    },
    {
        "code": "SICRO-5502981",
        "description": "ESCAVACAO MECANICA DE VALAS EM MATERIAL DE 1A CATEGORIA",
        "unit": "M3",
        "unit_price": 14.30,
        "source": "SICRO",
        "category": "Terraplenagem"
    },
    {
        "code": "SICRO-5502985",
        "description": "REATERRO E COMPACTACAO MANUAL DE VALAS COM ARGAMASSA OU SOLO",
        "unit": "M3",
        "unit_price": 28.90,
        "source": "SICRO",
        "category": "Terraplenagem"
    },
    {
        "code": "SINAPI-98557",
        "description": "IMPERMEABILIZACAO COM MANTA ASFALTICA E=4MM APLICADA A MACARICO",
        "unit": "M2",
        "unit_price": 88.50,
        "source": "SINAPI",
        "category": "Impermeabilização"
    }
]

def clean_tokens(text):
    """Normaliza texto e extrai tokens para busca vetorial/semântica."""
    if not text:
        return set()
    t = text.lower()
    t = re.sub(r'[\/\\,\.\-\(\)\:\;\_\+]', ' ', t)
    stop = {"de", "em", "para", "com", "e", "ou", "a", "o", "da", "do", "das", "dos", "p", "c", "espessura", "tipo"}
    tokens = set(word.strip() for word in t.split() if len(word.strip()) > 1 and word.strip() not in stop)
    return tokens

def compute_similarity(source_desc, source_unit, target_desc, target_unit):
    """Calcula score de confiança de 0 a 100 baseado em similaridade semântica e técnica."""
    s_tokens = clean_tokens(source_desc)
    t_tokens = clean_tokens(target_desc)
    
    if not s_tokens or not t_tokens:
        return 0.0
    
    intersection = s_tokens.intersection(t_tokens)
    union = s_tokens.union(t_tokens)
    
    jaccard = len(intersection) / len(union) if union else 0.0
    
    # Bônus para números e especificações críticas (ex: 30, 25, 10, 12, 18, 450)
    source_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', source_desc))
    target_nums = set(re.findall(r'\b\d+(?:[\.,]\d+)?\b', target_desc))
    num_matches = source_nums.intersection(target_nums)
    
    num_bonus = 0.0
    if source_nums and num_matches:
        num_bonus = min(0.25, 0.15 * len(num_matches))
        
    # Bônus de unidade de medida compatível
    unit_bonus = 0.0
    s_u = (source_unit or '').strip().upper()
    t_u = (target_unit or '').strip().upper()
    if s_u and t_u and s_u == t_u:
        unit_bonus = 0.15
        
    score = (jaccard * 0.65) + num_bonus + unit_bonus
    confidence = min(99.0, max(15.0, score * 100.0))
    return round(confidence, 1)

def run_ai_matching(items, catalog, memories=None):
    """Executa a busca de melhores candidatos para cada item do orçamento."""
    results = []
    cat = catalog if catalog else SINAPI_CATALOG
    
    for item in items:
        s_desc = item.get("description", "")
        s_unit = item.get("unit", "")
        s_qty = float(item.get("quantity", 0.0))
        s_price = float(item.get("unit_price", 0.0))
        s_total = float(item.get("total_value", s_qty * s_price))
        
        candidates = []
        for cat_item in cat:
            conf = compute_similarity(s_desc, s_unit, cat_item["description"], cat_item["unit"])
            candidates.append({
                "dest_code": cat_item["code"],
                "dest_description": cat_item["description"],
                "dest_unit": cat_item["unit"],
                "unit_price": cat_item["unit_price"],
                "confidence_score": conf,
                "match_type": "AI_SUGGESTION",
                "explanation": f"Similaridade semântica de {conf}% com base {cat_item.get('source', 'SINAPI')}"
            })
            
        candidates.sort(key=lambda x: x["confidence_score"], reverse=True)
        top_candidates = candidates[:4]
        best_match = top_candidates[0] if top_candidates else None
        
        if best_match and best_match["unit_price"] > 0:
            calc_unit_price = best_match["unit_price"]
            calc_quantity = round(s_total / calc_unit_price, 4)
            calc_total = round(calc_quantity * calc_unit_price, 2)
            status = "MATCHED" if best_match["confidence_score"] >= 50 else "MANUAL_REQUIRED"
        else:
            calc_quantity = s_qty
            calc_unit_price = s_price
            calc_total = s_total
            status = "PENDING"
            
        results.append({
            "source_item": {
                "id": item.get("id", f"ITEM-{len(results)+1:03d}"),
                "description": s_desc,
                "unit": s_unit,
                "quantity": s_qty,
                "unit_price": s_price,
                "total_value": s_total
            },
            "selected_match": best_match,
            "candidates": top_candidates,
            "strategy_applied": "KEEP_TOTAL_VALUE",
            "calculated_quantity": calc_quantity,
            "calculated_unit_price": calc_unit_price,
            "calculated_total_value": calc_total,
            "status": status
        })
        
    return results

def generate_excel_export(results, strategy_mode="KEEP_TOTAL_VALUE"):
    """Gera planilha Excel profissional com openpyxl contendo duas abas: Compatibilização e Curva ABC."""
    wb = openpyxl.Workbook()
    
    # Habilitar cálculo automático ao abrir o Excel
    wb.calculation.calcPr.fullCalcOnLoad = True
    
    # ----------------------------------------------------
    # ABA 1: ORÇAMENTO COMPATIBILIZADO
    # ----------------------------------------------------
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
    
    align_left = Alignment(horizontal='left', vertical='center', wrap_text=True)
    align_center = Alignment(horizontal='center', vertical='center')
    align_right = Alignment(horizontal='right', vertical='center')
    
    # Título
    ws1.merge_cells("A1:N1")
    ws1["A1"] = "ORÇABASE.LAB - GPR — RELATÓRIO DE COMPATIBILIZAÇÃO ORÇAMENTÁRIA"
    ws1["A1"].font = font_title
    ws1["A1"].alignment = Alignment(horizontal='left', vertical='center')
    
    ws1.merge_cells("A2:N2")
    ws1["A2"] = f"Estratégia: {strategy_mode} | Motor: openpyxl (Strict Mode com Fórmulas Vivas) | Status: Compatibilizado"
    ws1["A2"].font = font_subtitle
    ws1["A2"].alignment = Alignment(horizontal='left', vertical='center')
    
    ws1.row_dimensions[1].height = 26
    ws1.row_dimensions[2].height = 18
    ws1.row_dimensions[4].height = 24
    
    headers1 = [
        "Item", "Descrição Original (Base)", "UN", "Qtd Base", "Unit. Orig (R$)", "Total Orig (R$)",
        "Cód. Ref", "Descrição de Referência (SINAPI/SICRO)", "UN Ref", "Unit. Ref (R$)",
        "Qtd Calculada", "Total Compat. (R$)", "Score IA", "Status"
    ]
    
    start_row = 4
    for col_idx, h_text in enumerate(headers1, 1):
        cell = ws1.cell(row=start_row, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_header_navy if col_idx <= 6 else fill_header_ref
        cell.alignment = align_center
        cell.border = border_thin
        
    data_start = start_row + 1
    current_row = data_start
    
    for idx, item in enumerate(results):
        src = item.get("source_item", {})
        match = item.get("selected_match", {})
        
        ws1.cell(row=current_row, column=1, value=src.get("id", f"IT-{idx+1:03d}")).alignment = align_center
        ws1.cell(row=current_row, column=2, value=src.get("description", "")).alignment = align_left
        ws1.cell(row=current_row, column=3, value=src.get("unit", "")).alignment = align_center
        
        c_qtd_base = ws1.cell(row=current_row, column=4, value=float(src.get("quantity", 0.0)))
        c_qtd_base.number_format = "#,##0.00"
        c_qtd_base.alignment = align_right
        
        c_unit_orig = ws1.cell(row=current_row, column=5, value=float(src.get("unit_price", 0.0)))
        c_unit_orig.number_format = "R$ #,##0.00"
        c_unit_orig.alignment = align_right
        
        # FÓRMULA VIVA: =D{row}*E{row}
        c_tot_orig = ws1.cell(row=current_row, column=6, value=f"=D{current_row}*E{current_row}")
        c_tot_orig.number_format = "R$ #,##0.00"
        c_tot_orig.alignment = align_right
        
        if match:
            ws1.cell(row=current_row, column=7, value=match.get("dest_code", "")).alignment = align_center
            ws1.cell(row=current_row, column=8, value=match.get("dest_description", "")).alignment = align_left
            ws1.cell(row=current_row, column=9, value=match.get("dest_unit", "")).alignment = align_center
            
            c_unit_ref = ws1.cell(row=current_row, column=10, value=float(match.get("unit_price", 0.0)))
            c_unit_ref.number_format = "R$ #,##0.00"
            c_unit_ref.alignment = align_right
            
            # FÓRMULA VIVA DA ESTRATÉGIA:
            if strategy_mode == "KEEP_TOTAL_VALUE":
                c_calc_qtd = ws1.cell(row=current_row, column=11, value=f"=IF(J{current_row}>0, ROUND(F{current_row}/J{current_row}, 4), D{current_row})")
            else:
                c_calc_qtd = ws1.cell(row=current_row, column=11, value=f"=D{current_row}")
                
            c_calc_qtd.number_format = "#,##0.00"
            c_calc_qtd.alignment = align_right
            
            # FÓRMULA VIVA: =K{row}*J{row}
            c_tot_compat = ws1.cell(row=current_row, column=12, value=f"=K{current_row}*J{current_row}")
            c_tot_compat.number_format = "R$ #,##0.00"
            c_tot_compat.alignment = align_right
            
            score_val = float(match.get("confidence_score", 0.0))
            ws1.cell(row=current_row, column=13, value=f"{score_val:.1f}%").alignment = align_center
            ws1.cell(row=current_row, column=14, value=item.get("status", "MATCHED")).alignment = align_center
        else:
            for c_empty in range(7, 15):
                ws1.cell(row=current_row, column=c_empty, value="-").alignment = align_center
                
        is_even = (current_row % 2 == 0)
        for col_idx in range(1, 15):
            cell = ws1.cell(row=current_row, column=col_idx)
            cell.font = font_data
            cell.border = border_thin
            if is_even:
                cell.fill = fill_zebra
                
        ws1.row_dimensions[current_row].height = 20
        current_row += 1
        
    total_row = current_row
    ws1.merge_cells(f"A{total_row}:E{total_row}")
    ws1.cell(row=total_row, column=1, value="TOTAL GERAL CONSOLIDADO:").font = font_total
    ws1.cell(row=total_row, column=1).alignment = Alignment(horizontal='right', vertical='center')
    
    # Fórmulas de totalização viva (=SUM)
    c_sum_orig = ws1.cell(row=total_row, column=6, value=f"=SUM(F{data_start}:F{total_row-1})")
    c_sum_orig.font = font_total
    c_sum_orig.number_format = "R$ #,##0.00"
    c_sum_orig.alignment = align_right
    c_sum_orig.fill = fill_total
    c_sum_orig.border = border_total
    
    ws1.merge_cells(f"G{total_row}:K{total_row}")
    ws1.cell(row=total_row, column=7, value="TOTAL COMPATIBILIZADO:").font = font_total
    ws1.cell(row=total_row, column=7).alignment = Alignment(horizontal='right', vertical='center')
    
    c_sum_compat = ws1.cell(row=total_row, column=12, value=f"=SUM(L{data_start}:L{total_row-1})")
    c_sum_compat.font = font_total
    c_sum_compat.number_format = "R$ #,##0.00"
    c_sum_compat.alignment = align_right
    c_sum_compat.fill = fill_total
    c_sum_compat.border = border_total
    
    for c_idx in range(1, 15):
        ws1.cell(row=total_row, column=c_idx).border = border_total
        
    col_widths1 = {
        1: 10, 2: 44, 3: 8, 4: 12, 5: 15, 6: 18,
        7: 15, 8: 44, 9: 8, 10: 15, 11: 14, 12: 18,
        13: 12, 14: 14
    }
    for col_idx, width in col_widths1.items():
        ws1.column_dimensions[get_column_letter(col_idx)].width = width
        
    # ----------------------------------------------------
    # ABA 2: CURVA ABC ANALÍTICA (PARETO 80/20)
    # ----------------------------------------------------
    ws2 = wb.create_sheet(title="Curva ABC (Pareto)")
    
    ws2.merge_cells("A1:I1")
    ws2["A1"] = "CURVA ABC DE INSUMOS — ANÁLISE DE IMPACTO FINANCEIRO (PARETO 80/20)"
    ws2["A1"].font = font_title
    ws2["A1"].alignment = Alignment(horizontal='left', vertical='center')
    
    ws2.merge_cells("A2:I2")
    ws2["A2"] = "Classe A (até 80% do custo) | Classe B (80% a 95%) | Classe C (95% a 100%)"
    ws2["A2"].font = font_subtitle
    ws2["A2"].alignment = Alignment(horizontal='left', vertical='center')
    
    ws2.row_dimensions[1].height = 26
    ws2.row_dimensions[2].height = 18
    ws2.row_dimensions[4].height = 24
    
    headers2 = [
        "Rank", "Código / Item", "Descrição do Insumo", "UN", "Qtd", "Preço Unit. (R$)",
        "Valor Total (R$)", "% do Orçamento", "Classe ABC"
    ]
    
    for col_idx, h_text in enumerate(headers2, 1):
        cell = ws2.cell(row=4, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_header_navy
        cell.alignment = align_center
        cell.border = border_thin
        
    # Ordenar itens pelo valor total decrescente
    sorted_items = sorted(
        [r["source_item"] for r in results],
        key=lambda x: x.get("total_value", 0.0),
        reverse=True
    )
    grand_total = sum(x.get("total_value", 0.0) for x in sorted_items) or 1.0
    
    acc_val = 0.0
    row_abc = 5
    for rank, it in enumerate(sorted_items, 1):
        val = it.get("total_value", 0.0)
        acc_val += val
        pct = (val / grand_total) * 100
        acc_pct = (acc_val / grand_total) * 100
        
        if acc_pct <= 80.0 or rank == 1:
            cls_abc = "A"
            fill_cls = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
            font_cls = Font(name="Segoe UI", size=9, bold=True, color="B45309")
        elif acc_pct <= 95.0:
            cls_abc = "B"
            fill_cls = PatternFill(start_color="FFEDD5", end_color="FFEDD5", fill_type="solid")
            font_cls = Font(name="Segoe UI", size=9, bold=True, color="C2410C")
        else:
            cls_abc = "C"
            fill_cls = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
            font_cls = Font(name="Segoe UI", size=9, color="475569")
            
        ws2.cell(row=row_abc, column=1, value=rank).alignment = align_center
        ws2.cell(row=row_abc, column=2, value=it.get("id", f"IT-{rank:03d}")).alignment = align_center
        ws2.cell(row=row_abc, column=3, value=it.get("description", "")).alignment = align_left
        ws2.cell(row=row_abc, column=4, value=it.get("unit", "")).alignment = align_center
        
        c_q = ws2.cell(row=row_abc, column=5, value=float(it.get("quantity", 0.0)))
        c_q.number_format = "#,##0.00"
        c_q.alignment = align_right
        
        c_u = ws2.cell(row=row_abc, column=6, value=float(it.get("unit_price", 0.0)))
        c_u.number_format = "R$ #,##0.00"
        c_u.alignment = align_right
        
        # FÓRMULA VIVA: =E{row}*F{row}
        c_t = ws2.cell(row=row_abc, column=7, value=f"=E{row_abc}*F{row_abc}")
        c_t.number_format = "R$ #,##0.00"
        c_t.alignment = align_right
        
        # FÓRMULA VIVA: % do Orçamento
        c_pct = ws2.cell(row=row_abc, column=8, value=pct / 100.0)
        c_pct.number_format = "0.00%"
        c_pct.alignment = align_center
        
        c_c = ws2.cell(row=row_abc, column=9, value=f"Classe {cls_abc}")
        c_c.font = font_cls
        c_c.fill = fill_cls
        c_c.alignment = align_center
        
        for col_idx in range(1, 10):
            ws2.cell(row=row_abc, column=col_idx).border = border_thin
            if col_idx < 9:
                ws2.cell(row=row_abc, column=col_idx).font = font_data
                
        ws2.row_dimensions[row_abc].height = 20
        row_abc += 1
        
    col_widths2 = {1: 8, 2: 15, 3: 48, 4: 8, 5: 12, 6: 16, 7: 18, 8: 16, 9: 14}
    for col_idx, width in col_widths2.items():
        ws2.column_dimensions[get_column_letter(col_idx)].width = width

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
        path = self.path.split('?')[0].rstrip('/')
        
        if path.endswith('/catalog'):
            self.send_json(200, {
                "status": "success",
                "count": len(SINAPI_CATALOG),
                "catalog": SINAPI_CATALOG
            })
            return
            
        self.send_json(200, {
            "status": "online",
            "module": "OrçaBase.lab - GPR",
            "cycle": "PR.003",
            "backend": "Python Serverless (Vercel)",
            "excel_engine": "openpyxl (Strict Mode)",
            "openpyxl_version": getattr(openpyxl, "__version__", "active"),
            "features": [
                "Mesa De-Para Operacional",
                "Curva ABC Analítica (Pareto 80/20)",
                "Memória de Mapeamento Persistente",
                "openpyxl Multi-Aba com Fórmulas Vivas"
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

        path = self.path.split('?')[0].rstrip('/')
        action = body.get("action", "")
        
        # 1. Upload e extração
        if path.endswith('/upload-budget') or action == 'upload_budget':
            b64_data = body.get("file_base64", "")
            if not b64_data:
                self.send_json(400, {"status": "error", "message": "file_base64 obrigatório"})
                return
                
            try:
                if "," in b64_data:
                    b64_data = b64_data.split(",")[1]
                raw_bytes = base64.b64decode(b64_data)
                
                wb = openpyxl.load_workbook(io.BytesIO(raw_bytes), data_only=True)
                ws = wb.active
                
                extracted_items = []
                for row_idx, row in enumerate(ws.iter_rows(values_only=True), 1):
                    if not row or all(v is None for v in row):
                        continue
                        
                    row_str = " ".join([str(v).lower() for v in row if v is not None])
                    if any(k in row_str for k in ["descrição", "discriminacao", "especificacao"]) and any(k in row_str for k in ["un", "qtd", "unit", "total", "valor"]):
                        continue
                        
                    row_vals = [v for v in row if v is not None]
                    if len(row_vals) >= 4:
                        desc = ""
                        unit = "UN"
                        qty = 1.0
                        price = 0.0
                        code = f"ITEM-{len(extracted_items)+1:03d}"
                        
                        for v in row_vals:
                            if isinstance(v, str) and len(v) > 5 and not desc:
                                desc = v.strip()
                            elif isinstance(v, str) and len(v) <= 4 and v.upper() in ["M3", "M2", "M", "KG", "UN", "VB", "H", "CJ", "PAR", "TON"]:
                                unit = v.upper().strip()
                            elif isinstance(v, (int, float)):
                                if qty == 1.0 and v > 0:
                                    qty = float(v)
                                elif price == 0.0 and v > 0:
                                    price = float(v)
                                    
                        if desc:
                            extracted_items.append({
                                "id": code,
                                "description": desc,
                                "unit": unit,
                                "quantity": qty,
                                "unit_price": price,
                                "total_value": round(qty * price, 2)
                            })
                            
                self.send_json(200, {
                    "status": "success",
                    "extracted_count": len(extracted_items),
                    "items": extracted_items
                })
            except Exception as e:
                self.send_json(500, {"status": "error", "message": f"Falha no parser openpyxl: {str(e)}"})
            return

        # 2. Matching Semântico
        if path.endswith('/match') or action == 'match':
            items = body.get("items", [])
            custom_catalog = body.get("catalog", None)
            matched = run_ai_matching(items, custom_catalog)
            self.send_json(200, {
                "status": "success",
                "count": len(matched),
                "results": matched
            })
            return

        # 3. Exportação Excel com openpyxl (Multi-Aba)
        if path.endswith('/export-xlsx') or action == 'export_xlsx':
            results = body.get("items", [])
            strategy = body.get("strategy", "KEEP_TOTAL_VALUE")
            
            try:
                xlsx_bytes = generate_excel_export(results, strategy)
                b64_output = base64.b64encode(xlsx_bytes).decode('utf-8')
                
                self.send_json(200, {
                    "status": "success",
                    "filename": "Orcamento_Compatibilizado_OrcaBase.xlsx",
                    "file_base64": b64_output,
                    "engine": "openpyxl v3.1.5",
                    "calcProperties_fullCalcOnLoad": True,
                    "sheets": ["Orçamento Compatibilizado", "Curva ABC (Pareto)"]
                })
            except Exception as e:
                self.send_json(500, {"status": "error", "message": f"Erro na geração Excel: {str(e)}"})
            return

        self.send_json(200, {
            "status": "success",
            "received_action": action,
            "processed_by": "OrçaBase.lab - GPR Python Serverless Engine"
        })
