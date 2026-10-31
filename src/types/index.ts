/**
 * OrçaBase.lab - GPR — Modelos de Dados Oficiais (PR.002)
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
}

export interface CatalogItem {
  code: string;
  description: string;
  unit: string;
  unit_price: number;
  source: 'SINAPI' | 'SICRO' | 'PROPRIA';
  category?: string;
}

export interface MappingMemory {
  base_description: string;
  base_unit: string;
  dest_code: string;
  dest_description: string;
  dest_unit: string;
  match_type: 'AI_SUGGESTION' | 'MANUAL_OVERRIDE' | 'HISTORICAL_MEMORY';
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
