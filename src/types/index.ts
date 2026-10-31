/**
 * OrçaBase.lab - GPR — Modelos de Dados Oficiais (PR.007)
 */

export interface CalculationStrategy {
  mode: 'KEEP_QUANTITY' | 'KEEP_TOTAL_VALUE';
}

export interface ItemBase {
  id: string;
  code?: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  row_index?: number;
  matched_code?: string;
  matched_description?: string;
  matched_unit?: string;
  matched_price?: number;
}

export interface ContractBaseCard {
  id: string;
  title: string;
  company: string;
  contractNumber: string;
  bdi: number;
  fileName: string;
  fileSize?: string;
  fileBase64?: string;
  budgetSheetName?: string;
  totalGeralValue?: number;
  totalGeralLabel?: string;
  compositionsCount: number;
  stagesCount: number;
  createdAt: string;
  items: ItemBase[];
  rawWorkbookBase64?: string;
}

export interface CatalogItem {
  code: string;
  description: string;
  unit: string;
  unit_price: number;
  source: 'SINAPI' | 'SICRO' | 'CONTRATO';
  category?: string;
}

export interface MappingMemory {
  id?: string;
  base_description: string;
  base_unit: string;
  dest_code: string;
  dest_description: string;
  dest_unit: string;
  unit_price: number;
  match_type: 'AI_SUGGESTION' | 'MANUAL_OVERRIDE' | 'HISTORICAL_MEMORY';
  updated_at?: string;
}

export interface MatchCandidate {
  dest_code: string;
  dest_description: string;
  dest_unit: string;
  unit_price: number;
  confidence_score: number;
  match_type: MappingMemory['match_type'];
  explanation?: string;
}

export interface MatchingResultItem {
  source_item: ItemBase;
  selected_match?: MatchCandidate;
  candidates: MatchCandidate[];
  strategy_applied: CalculationStrategy['mode'];
  calculated_quantity: number;
  calculated_unit_price: number;
  calculated_total_value: number;
  status: 'PENDING' | 'MATCHED' | 'MANUAL_REQUIRED';
  contract_row_index?: number;
}

export interface MatchingStatistics {
  total_items: number;
  matched_count: number;
  manual_count: number;
  original_total_value: number;
  calculated_total_value: number;
  variance_value: number;
  variance_percentage: number;
}
