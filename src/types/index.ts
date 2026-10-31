/**
 * OrçaBase.lab - GPR — Modelos de Dados Oficiais (PR.008)
 * Estudo Estrutural 100% Completo de Planilhas e Injeção Fiel de Quantitativos
 */

export interface CalculationStrategy {
  mode: "KEEP_QUANTITY" | "KEEP_TOTAL_VALUE";
}

export interface DetectedColumns {
  headerRow: number;        // 1-based row index in Excel
  colItem: number;          // 1-based col index (Item: 1.1, 1.2)
  colCode: number;          // 1-based col index (Código SINAPI/Próprio)
  colSource?: number;       // 1-based col index (Fonte/Banco)
  colDesc: number;          // 1-based col index (Descrição/Composição)
  colUnit: number;          // 1-based col index (Unidade)
  colQty: number;           // 1-based col index (Quantitativo - COLUNA ALVO)
  colUnitPrice?: number;    // 1-based col index (Preço Unitário)
  colPrice?: number;        // Alias para Preço Unitário
  colUnitPriceBdi?: number; // 1-based col index (Preço Unitário com BDI, se existir)
  colTotal: number;         // 1-based col index (Valor Total da linha)
  qtyColLetter?: string;    // Letra da coluna de Quantitativo (ex: 'E', 'F')
  colQtyLetter?: string;    // Alias da letra da coluna de Quantitativo
}

export interface StageGroup {
  id?: string;
  code?: string;
  itemNumber?: string;
  title: string;
  discipline: string;
  rowIndex: number;
  itemsCount: number;
  subtotalValue?: number;
  subtotal?: number;
}

export interface ItemBase {
  id: string;
  itemNumber?: string;      // Ex: "1.1", "2.3"
  code: string;             // Ex: "88489", "COMP-01"
  source?: string;          // Ex: "SINAPI", "ORSE", "PRÓPRIO"
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  unit_price_bdi?: number;
  total_value: number;
  row_index?: number;       // Linha exata na planilha Excel (1-based)
  stage_id?: string;        // Etapa a que pertence (ex: "3.0")
  stage_code?: string;      // Código da etapa (ex: "3.0")
  stage_title?: string;     // Nome da etapa (ex: "PINTURA E ACABAMENTOS")
  discipline?: string;      // Categoria semântica (ex: "PINTURA", "HIDRÁULICA", "ELÉTRICA")
  has_formula?: boolean;
}

export interface SpreadsheetStudy {
  fileName: string;
  fileSize: string;
  sheetNames: string[];
  selectedSheet: string;
  selectedSheetName: string;
  totalRows: number;
  totalCols: number;
  detectedColumns: DetectedColumns;
  stages: StageGroup[];
  compositions: ItemBase[];
  items: ItemBase[];
  totalSemBdi: number;
  bdiPercentage: number;
  totalGeralValue: number;
  totalGeralLabel: string;
  totalGeralRow: number;
}

export interface ContractBaseCard {
  id: string;
  contractName: string;
  contractNumber: string;
  organization: string;
  bdiPercent: number;
  referenceBase: string;
  updatedAt: string;
  fileName?: string;
  fileSize?: string;
  budgetSheetName?: string;
  sheetNames?: string[];
  totalGeralValue?: number;
  totalGeralLabel?: string;
  detectedColumns?: DetectedColumns;
  stages?: StageGroup[];
  itemsCount: number;
  items: ItemBase[];
  rawWorkbookBase64?: string;
}

export interface MatchCandidate {
  source_item_id: string;
  source_item_number?: string;
  source_description: string;
  source_unit: string;
  source_quantity: number;
  source_unit_price: number;
  source_total_value: number;
  source_stage?: string;
  source_discipline?: string;
  confidence_score: number;
  match_reason: string;
}

export interface ContractCompositionMatch {
  contract_item: ItemBase;              // A composição fixa na Planilha Base do Contrato
  matched_source_items: ItemBase[];     // Itens da Planilha 1 alocados nesta composição
  best_candidate?: MatchCandidate;
  candidates: MatchCandidate[];         // Sugestões da Planilha 1 para o usuário trocar se quiser
  base_quantity_from_sheet1: number;    // Quantidade vinda da Planilha 1 (sem ajuste financeiro)
  final_injected_quantity: number;      // Quantidade final que será escrita na célula do Excel
  contract_unit_price: number;          // Preço unitário oficial do Contrato Base
  calculated_total_value: number;       // Valor total na linha do Contrato Base
  confidence_score: number;
  status: "MATCHED" | "MANUAL_OVERRIDE" | "ZEROED";
}
