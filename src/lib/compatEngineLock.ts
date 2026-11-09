/**
 * ============================================================================
 * 🔒 CADEADO DE ENGENHARIA — MOTOR DE COMPATIBILIZAÇÃO DE ORÇAMENTOS (LOCKED)
 * ============================================================================
 * ATENÇÃO: ESTE ARQUIVO E `src/lib/excelEngine.ts` ESTÃO BLINDADOS POR CADEADO
 * CRIPTOGRÁFICO SHA-256 (`scripts/verify-compat-lock.mjs` + `.compat-lock.json`).
 *
 * PROIBIDO MODIFICAR, REFATORAR OU ALTERAR QUALQUER FUNÇÃO DESTE MÓDULO OU DE
 * `src/lib/excelEngine.ts` SEM SOLICITAÇÃO EXPLÍCITA E DIRETA DO USUÁRIO.
 * ============================================================================
 */

import {
  ItemBase,
  CalculationStrategy,
  ContractCompositionMatch,
  SpreadsheetStudy,
  CustomColumnKeywords,
  ExplicitColumnOverrides,
} from "../types";
import {
  studySpreadsheetFromBuffer,
  buildCompatibilityMatrix,
  applyCalculationStrategyToMatches,
  calculateItemSimilarity,
  injectQuantitiesPreservingOriginalWorkbook,
  buildCompatOutputFileName,
  colIndexToLetter,
  letterToColIndex,
} from "./excelEngine";

export const COMPAT_ENGINE_LOCK_VERSION = "LOCK-PR023-PR038-BLINDADO";

export interface LockedContractDescriptor {
  id: string;
  contractName: string;
  contractNumber?: string;
  fileName?: string;
  budgetSheetName?: string;
  bdiPercent: number;
  detectedColumns?: {
    colQty?: number;
    colQtyLetter?: string;
    descHeaderName?: string;
    qtyHeaderName?: string;
    unitHeaderName?: string;
    startRow?: number;
    endRow?: number;
  };
  items: ItemBase[];
}

/**
 * Executa a leitura blindada de planilha (Planilha 1 ou Contrato Base) pelo nome das colunas.
 */
export function runLockedSpreadsheetStudy(
  buffer: ArrayBuffer,
  preferredSheet?: string,
  fileName: string = "Planilha.xlsx",
  fileSizeFormatted: string = "0 KB",
  customKeywords?: CustomColumnKeywords,
  explicitOverrides?: ExplicitColumnOverrides
): SpreadsheetStudy {
  return studySpreadsheetFromBuffer(
    buffer,
    preferredSheet,
    fileName,
    fileSizeFormatted,
    customKeywords,
    explicitOverrides
  );
}

/**
 * Executa a matriz de compatibilização blindada entre os itens da Planilha 1 e as composições do Contrato Base.
 */
export function runLockedCompatibilityMatrix(
  sheet1Items: ItemBase[],
  contractItems: ItemBase[],
  strategyMode: CalculationStrategy["mode"],
  targetTotalValue: number,
  contractBdiPercent: number
): ContractCompositionMatch[] {
  return buildCompatibilityMatrix(
    sheet1Items,
    contractItems,
    strategyMode,
    targetTotalValue,
    contractBdiPercent
  );
}

/**
 * Reaplica a regra de cálculo (Manter Valor Final vs Manter Quantitativo Exato) ou ajusta para um Valor Alvo específico.
 */
export function runLockedStrategyAdjustment(
  currentMatches: ContractCompositionMatch[],
  strategyMode: CalculationStrategy["mode"],
  targetTotalValue: number
): ContractCompositionMatch[] {
  return applyCalculationStrategyToMatches(currentMatches, strategyMode, targetTotalValue);
}

/**
 * Calcula similaridade entre item da Planilha 1 e composição do Contrato Base.
 */
export function runLockedItemSimilarity(sourceItem: ItemBase, contractItem: ItemBase) {
  return calculateItemSimilarity(sourceItem, contractItem);
}

/**
 * Gera o nome oficial blindado do arquivo final (.xlsx ou .xlsm) garantindo a ordem exata dos 4 argumentos:
 * 1º: initialFileName (Planilha 1)
 * 2º: contractName (Nome do Contrato Base)
 * 3º: contractNumber (Número do Contrato Base)
 * 4º: extension ("xlsx" ou "xlsm" detectado no binário)
 */
export function getLockedCompatOutputFilename(
  initialFileName: string | null,
  contractName: string,
  contractNumber?: string,
  extension: string = "xlsx"
): string {
  return buildCompatOutputFileName(initialFileName, contractName, contractNumber, extension);
}

/**
 * Clona cirurgicamente o arquivo Excel original (.xlsx ou .xlsm) preservando 100% de formatação,
 * abas, fórmulas, cabeçalhos, larguras, alturas e macros VBA (`vbaProject.bin`), injetando apenas os quantitativos.
 */
export async function generateLockedCompatibleWorkbook(
  contractBase64: string,
  contract: LockedContractDescriptor,
  compositionMatches: ContractCompositionMatch[],
  initialFileName: string | null
): Promise<{ blob: Blob; extension: string; finalFilename: string }> {
  const colQtyLetter =
    contract.detectedColumns?.colQtyLetter ||
    (contract.detectedColumns?.colQty ? colIndexToLetter(contract.detectedColumns.colQty) : "I");
  const colQtyOneBased = letterToColIndex(colQtyLetter);

  const { blob, extension } = await injectQuantitiesPreservingOriginalWorkbook(contractBase64, {
    budgetSheetName: contract.budgetSheetName,
    contractFileName: contract.fileName,
    colQtyOneBased,
    colQtyLetter,
    compositionMatches: compositionMatches
      .filter((cm) => cm.contract_item.row_index && cm.contract_item.row_index > 0)
      .map((cm) => ({
        contract_row_index: cm.contract_item.row_index,
        final_injected_quantity: cm.final_injected_quantity,
      })),
  });

  const finalFilename = buildCompatOutputFileName(
    initialFileName,
    contract.contractName || "",
    contract.contractNumber,
    extension
  );

  return {
    blob,
    extension,
    finalFilename,
  };
}
