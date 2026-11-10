// ============================================================================
// MOTOR DE GERAÇÃO E INJEÇÃO DE MEMORIAL DESCRITIVO EM PLANILHA EXCEL (.XLSX)
// Substituição inteligente de tags terminadas em "= AQUI" com fidelidade de layout
// ============================================================================

import * as XLSX from "xlsx";
import { DescritivoStage, MemorialMetadata } from "./descritivoAI";

export interface MemorialExcelInjectionParams {
  schoolName: string;
  municipio: string;
  uf?: string;
  bdiPercent?: string;
  mesAnoRef?: string;
  dataExtensa?: string;
  stages: DescritivoStage[];
}

/**
 * Escaneia e injeta os dados do memorial descritivo nas células da planilha base
 * que finalizam com "= AQUI" ou contêm a marcação de substituição.
 */
export function injectMemorialIntoExcelTemplate(
  templateBuffer: ArrayBuffer | Uint8Array,
  params: MemorialExcelInjectionParams
): Uint8Array {
  const wb = XLSX.read(templateBuffer, { type: "array", cellStyles: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  if (!ws || !ws["!ref"]) {
    return generateDefaultMemorialTemplate(params);
  }

  const range = XLSX.utils.decode_range(ws["!ref"]);
  let memorialStartRow = -1;
  let memorialStartCol = 0;

  // 1. Escaneia todas as células procurando por tags "= AQUI"
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (!cell || typeof cell.v !== "string") continue;

      const rawVal = cell.v.trim();

      // Verifica se a célula contém a terminação "= AQUI" ou "=AQUI"
      if (/=\s*AQUI\b/i.test(rawVal)) {
        const lower = rawVal.toLowerCase();

        // Tag: NOME DA ESCOLA
        if (lower.includes("escola") || lower.includes("unidade")) {
          cell.v = replaceTagContent(rawVal, params.schoolName);
          cell.t = "s";
        }
        // Tag: MUNICÍPIO / CIDADE / UF
        else if (lower.includes("município") || lower.includes("municipio") || lower.includes("cidade") || lower.includes("local")) {
          const locStr = params.uf ? `${params.municipio} - ${params.uf}` : params.municipio;
          cell.v = replaceTagContent(rawVal, locStr);
          cell.t = "s";
        }
        // Tag: BDI
        else if (lower.includes("bdi")) {
          cell.v = replaceTagContent(rawVal, params.bdiPercent || "24,50%");
          cell.t = "s";
        }
        // Tag: MÊS / ANO REF (ex: Novembro de 2026)
        else if (lower.includes("mês") || lower.includes("mes") || lower.includes("mês/ano") || lower.includes("mes/ano")) {
          cell.v = replaceTagContent(rawVal, params.mesAnoRef || "");
          cell.t = "s";
        }
        // Tag: DATA EXTENSA COM DIA DA SEMANA (ex: Domingo, 8 de novembro de 2026)
        else if (lower.includes("data") || lower.includes("extensa") || lower.includes("dia")) {
          cell.v = replaceTagContent(rawVal, params.dataExtensa || "");
          cell.t = "s";
        }
        // Tag de início do Memorial / Serviços
        else if (
          lower.includes("memorial") ||
          lower.includes("serviço") ||
          lower.includes("servico") ||
          lower.includes("item") ||
          lower.includes("descritivo") ||
          lower.includes("titulo")
        ) {
          memorialStartRow = r;
          memorialStartCol = c;
          // Limpa o marcador dessa célula
          cell.v = "";
        }
      }
    }
  }

  // 2. Se encontrou a tag de início do memorial, injeta sequencialmente as etapas e itens
  if (memorialStartRow !== -1 && params.stages.length > 0) {
    let currentRow = memorialStartRow;

    params.stages.forEach((stg) => {
      // Linha do Título da Etapa (CAIXA ALTA, sem numeração)
      const titleCellRef = XLSX.utils.encode_cell({ r: currentRow, c: memorialStartCol });
      ws[titleCellRef] = {
        v: stg.title.toUpperCase(),
        t: "s",
      };
      currentRow++;

      // Linhas dos Serviços da Etapa
      stg.items.forEach((it) => {
        const itemCellRef = XLSX.utils.encode_cell({ r: currentRow, c: memorialStartCol });
        ws[itemCellRef] = {
          v: it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim(),
          t: "s",
        };
        currentRow++;
      });

      // Linha em branco entre grupos de serviços para separação elegante
      currentRow++;
    });

    // Atualiza o range da planilha para garantir que todas as novas linhas apareçam
    range.e.r = Math.max(range.e.r, currentRow);
    ws["!ref"] = XLSX.utils.encode_range(range);
  }

  // Gera o binário do arquivo .xlsx atualizado
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(out);
}

/**
 * Auxiliar para substituição limpa do texto com "= AQUI"
 */
function replaceTagContent(rawText: string, replacement: string): string {
  // Se o texto for algo como "NOME DA ESCOLA = AQUI", retorna apenas o nome
  const matchPrefix = rawText.match(/^([^=]+)=\s*AQUI\s*$/i);
  if (matchPrefix) {
    const label = matchPrefix[1].trim();
    if (label.endsWith(":")) {
      return `${label} ${replacement}`;
    }
    // Se for apenas o nome da variável, substitui pelo valor direto
    return replacement;
  }
  // Substitui a ocorrência "= AQUI" dentro do texto
  return rawText.replace(/=\s*AQUI/gi, replacement).trim();
}

/**
 * Cria a planilha base padrão oficial da SEDUC / GPR com a formatação institucional
 * e as tags "= AQUI" devidamente esquematizadas.
 */
export function generateDefaultMemorialTemplate(params: MemorialExcelInjectionParams): Uint8Array {
  const wb = XLSX.utils.book_new();

  const rows: (string | null)[][] = [
    ["GOVERNO DO ESTADO DO PIAUÍ — SECRETARIA DE ESTADO DA EDUCAÇÃO (SEDUC / GPR)", null, null, null],
    ["MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS", null, null, null],
    [],
    ["DADOS DA UNIDADE ESCOLAR", null, null, null],
    ["UNIDADE ESCOLAR:", params.schoolName || "UNIDADE ESCOLAR = AQUI", null, null],
    ["MUNICÍPIO / UF:", params.uf ? `${params.municipio} - ${params.uf}` : "MUNICÍPIO = AQUI", null, null],
    ["BDI DA OBRA (%):", params.bdiPercent || "BDI = AQUI", null, null],
    ["MÊS / ANO REF.:", params.mesAnoRef || "MÊS/ANO = AQUI", null, null],
    [],
    ["DISCRIMINAÇÃO DOS SERVIÇOS A EXECUTAR", null, null, null],
    ["MEMORIAL = AQUI", null, null, null],
  ];

  // Se houver etapas prontas, injeta logo abaixo
  if (params.stages && params.stages.length > 0) {
    // Remove a tag "MEMORIAL = AQUI"
    rows.pop();

    params.stages.forEach((stg) => {
      rows.push([stg.title.toUpperCase(), null, null, null]);
      stg.items.forEach((it) => {
        rows.push([it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim(), null, null, null]);
      });
      rows.push([]);
    });

    // Encerramento
    rows.push([]);
    rows.push([`Local e Data: ${params.municipio || "Teresina"} - ${params.uf || "PI"}, ${params.dataExtensa || "DATA EXTENSA = AQUI"}`, null, null, null]);
    rows.push([]);
    rows.push(["Engenheiro Responsável Técnico", null, "Fiscal de Obras — SEDUC / GPR", null]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Define larguras das colunas
  ws["!cols"] = [
    { wch: 32 }, // Coluna A
    { wch: 65 }, // Coluna B
    { wch: 30 }, // Coluna C
    { wch: 25 }, // Coluna D
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Memorial Descritivo");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(out);
}

/**
 * Gera um arquivo de modelo em branco contendo unicamente as marcações e tags "= AQUI"
 * para servir de exemplo para o usuário criar ou personalizar sua planilha base.
 */
export function generateBlankMemorialTemplateWithTags(): Uint8Array {
  const wb = XLSX.utils.book_new();

  const rows: (string | null)[][] = [
    ["GOVERNO DO ESTADO DO PIAUÍ — SECRETARIA DE ESTADO DA EDUCAÇÃO (SEDUC / GPR)", null, null, null],
    ["MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS DE OBRAS ESCOLARES", null, null, null],
    [],
    ["DADOS GERAIS DA UNIDADE ESCOLAR", null, null, null],
    ["NOME DA ESCOLA = AQUI", null, null, null],
    ["MUNICÍPIO = AQUI", null, null, null],
    ["BDI = AQUI", null, null, null],
    ["MÊS/ANO = AQUI", null, null, null],
    [],
    ["DISCRIMINAÇÃO DOS SERVIÇOS A EXECUTAR (ETAPAS E ITENS TÉCNICOS)", null, null, null],
    ["MEMORIAL = AQUI", null, null, null],
    [],
    ["DATA EXTENSA = AQUI", null, null, null],
    [],
    ["Responsável Técnico", null, "Fiscal Contratante — SEDUC / GPR", null],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 35 },
    { wch: 70 },
    { wch: 30 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Modelo Memorial Base");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(out);
}

const TEMPLATE_STORAGE_KEY = "orcabase_memorial_template_base64";
const TEMPLATE_META_KEY = "orcabase_memorial_template_meta";

export interface StoredTemplateMeta {
  fileName: string;
  fileSize: number;
  updatedAt: string;
}

/**
 * Salva a planilha base personalizada enviada pelo usuário no LocalStorage
 */
export async function saveCustomTemplateToStorage(file: File): Promise<StoredTemplateMeta> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const meta: StoredTemplateMeta = {
    fileName: file.name,
    fileSize: file.size,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, base64);
    localStorage.setItem(TEMPLATE_META_KEY, JSON.stringify(meta));
  }

  return meta;
}

/**
 * Recupera a planilha base personalizada armazenada no LocalStorage
 */
export function getStoredCustomTemplate(): { buffer: ArrayBuffer; meta: StoredTemplateMeta } | null {
  if (typeof window === "undefined") return null;

  try {
    const base64 = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    const metaStr = localStorage.getItem(TEMPLATE_META_KEY);
    if (!base64 || !metaStr) return null;

    const meta = JSON.parse(metaStr) as StoredTemplateMeta;
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return { buffer: bytes.buffer, meta };
  } catch (err) {
    console.warn("Erro ao recuperar planilha base do memorial:", err);
    return null;
  }
}

/**
 *Remove a planilha base personalizada do LocalStorage, restaurando o padrão
 */
export function removeCustomTemplateFromStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TEMPLATE_STORAGE_KEY);
    localStorage.removeItem(TEMPLATE_META_KEY);
  }
}

/**
 * Retorna o base64 da planilha base personalizada do Memorial (para sincronização em nuvem)
 */
export function getStoredCustomTemplateBase64(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TEMPLATE_STORAGE_KEY);
}

/**
 * Hidrata no LocalStorage uma planilha base de Memorial vinda da nuvem
 */
export function hydrateCustomTemplateToStorage(meta: StoredTemplateMeta, base64: string): void {
  if (typeof window !== "undefined" && meta && base64) {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, base64);
    localStorage.setItem(TEMPLATE_META_KEY, JSON.stringify(meta));
  }
}

