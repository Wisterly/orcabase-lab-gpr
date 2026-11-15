// ============================================================================
// MOTOR OFICIAL DE PLANILHA BASE DO MEMORIAL DESCRITIVO (.XLSX) — SEDUC / GPR
// Clonagem Cirúrgica OpenXML (JSZip) preservando 100% de estilos, bordas,
// mesclagens, fórmulas ("PLANILHA... "&C8, "SERVIÇOS - "&C8) e Brasão Oficial,
// com armazenamento ilimitado em IndexedDB + Sincronização em Nuvem.
// ============================================================================

import JSZip from "jszip";
import * as XLSX from "xlsx";
import { DescritivoStage } from "./descritivoAI";

export interface MemorialExcelInjectionParams {
  schoolName: string;
  municipio: string;
  uf?: string;
  bdiPercent?: string;
  mesAnoRef?: string;
  dataExtensa?: string;
  stages: DescritivoStage[];
}

export interface StoredTemplateMeta {
  fileName: string;
  fileSize: number;
  updatedAt: string;
  tagsCount?: number;
}

export const DEFAULT_BUILTIN_MEMORIAL_META: StoredTemplateMeta = {
  fileName: "DESCRITIVO MODELO.xlsx",
  fileSize: 19674,
  updatedAt: "2026-11-15T05:25:00.000Z",
  tagsCount: 9,
};

export const DEFAULT_BUILTIN_MEMORIAL_URL = "/contracts-base/DESCRITIVO_MODELO.xlsx";

const TEMPLATE_META_KEY = "orcabase_memorial_template_meta_v2";
const TEMPLATE_IDB_NAME = "orcabase_memorial_db";
const TEMPLATE_IDB_STORE = "templates";
const TEMPLATE_IDB_KEY = "active_memorial_template";

// Cache em memória para acesso síncrono/instantâneo na sessão ativa
let memoryTemplateBuffer: ArrayBuffer | null = null;
let memoryTemplateMeta: StoredTemplateMeta | null = null;

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function arrayBufferToBase64Fast(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize))));
  }
  return btoa(chunks.join(""));
}

export function base64ToArrayBufferFast(base64: string): ArrayBuffer {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================================================
// BANCO INDEXEDDB PARA SUPORTAR PLANILHAS GRANDES (5MB, 10MB, 25MB+) SEM ERRO
// ============================================================================
function openMemorialIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB indisponível"));
    }
    const req = window.indexedDB.open(TEMPLATE_IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TEMPLATE_IDB_STORE)) {
        db.createObjectStore(TEMPLATE_IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveBufferToMemorialIDB(buffer: ArrayBuffer, meta: StoredTemplateMeta): Promise<void> {
  try {
    const db = await openMemorialIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(TEMPLATE_IDB_STORE, "readwrite");
      const store = tx.objectStore(TEMPLATE_IDB_STORE);
      store.put({ buffer, meta }, TEMPLATE_IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("Aviso ao gravar no IndexedDB do memorial:", e);
  }
}

async function loadBufferFromMemorialIDB(): Promise<{ buffer: ArrayBuffer; meta: StoredTemplateMeta } | null> {
  try {
    const db = await openMemorialIDB();
    const res = await new Promise<{ buffer: ArrayBuffer; meta: StoredTemplateMeta } | null>((resolve, reject) => {
      const tx = db.transaction(TEMPLATE_IDB_STORE, "readonly");
      const store = tx.objectStore(TEMPLATE_IDB_STORE);
      const req = store.get(TEMPLATE_IDB_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return res;
  } catch {
    return null;
  }
}

async function clearMemorialIDB(): Promise<void> {
  try {
    const db = await openMemorialIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(TEMPLATE_IDB_STORE, "readwrite");
      const store = tx.objectStore(TEMPLATE_IDB_STORE);
      store.delete(TEMPLATE_IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore
  }
}

/**
 * Higieniza e otimiza o arquivo .xlsx enviado pelo usuário:
 * - Remove vínculos externos mortos (`xl/externalLinks/*`) e validações `#REF!`
 *   que deixavam o arquivo com 7.68 MB+ e geravam avisos no Excel, mantendo 100%
 *   das abas, estilos, bordas, mesclagens, fórmulas locais e imagens (`image1.png`).
 * - Conta quantas marcações `=AQUI` / `= AQUI` existem na planilha.
 */
export async function sanitizeAndInspectMemorialZip(
  rawBuffer: ArrayBuffer
): Promise<{ cleanBuffer: ArrayBuffer; tagsCount: number }> {
  try {
    const zip = await JSZip.loadAsync(rawBuffer);
    let tagsCount = 0;

    // 1. Conta tags "=AQUI" no sharedStrings.xml e nas worksheets
    const sstFile = zip.file("xl/sharedStrings.xml");
    if (sstFile) {
      const sstXml = await sstFile.async("string");
      const matches = sstXml.match(/=\s*AQUI/gi);
      if (matches) tagsCount += matches.length;
    }

    for (const fileName of Object.keys(zip.files)) {
      if (fileName.startsWith("xl/worksheets/sheet") && fileName.endsWith(".xml")) {
        let shXml = await zip.file(fileName)!.async("string");
        const matches = shXml.match(/=\s*AQUI/gi);
        if (matches) tagsCount += matches.length;

        // Remove dataValidations quebradas com #REF! se houver
        if (shXml.includes("<formula1>#REF!</formula1>")) {
          shXml = shXml.replace(/<dataValidations[\s\S]*?<\/dataValidations>/g, "");
          zip.file(fileName, shXml);
        }
      }
    }

    // 2. Remove xl/externalLinks/* caso nenhuma fórmula de worksheet dependa de [1], [2], etc.
    let usesExternalFormula = false;
    for (const fileName of Object.keys(zip.files)) {
      if (fileName.startsWith("xl/worksheets/sheet") && fileName.endsWith(".xml")) {
        const shXml = await zip.file(fileName)!.async("string");
        if (/<f[^>]*>[^<]*\[\d+\]/i.test(shXml)) {
          usesExternalFormula = true;
          break;
        }
      }
    }

    if (!usesExternalFormula) {
      let removedExternal = false;
      for (const k of Object.keys(zip.files)) {
        if (k.startsWith("xl/externalLinks/")) {
          zip.remove(k);
          removedExternal = true;
        }
      }
      if (removedExternal) {
        if (zip.file("[Content_Types].xml")) {
          let ct = await zip.file("[Content_Types].xml")!.async("string");
          ct = ct.replace(/<Override[^>]*externalLink[^>]*\/>/g, "");
          zip.file("[Content_Types].xml", ct);
        }
        if (zip.file("xl/_rels/workbook.xml.rels")) {
          let rels = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
          rels = rels.replace(/<Relationship[^>]*externalLink[^>]*\/>/g, "");
          zip.file("xl/_rels/workbook.xml.rels", rels);
        }
        if (zip.file("xl/workbook.xml")) {
          let wbXml = await zip.file("xl/workbook.xml")!.async("string");
          wbXml = wbXml.replace(/<externalReferences>[\s\S]*?<\/externalReferences>/g, "");
          zip.file("xl/workbook.xml", wbXml);
        }
      }
    }

    const cleanUint8 = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const outBuffer = cleanUint8.buffer.slice(
      cleanUint8.byteOffset,
      cleanUint8.byteOffset + cleanUint8.byteLength
    ) as ArrayBuffer;

    return { cleanBuffer: outBuffer, tagsCount: Math.max(tagsCount, 1) };
  } catch (e) {
    console.warn("Aviso ao inspecionar zip da planilha base, mantendo buffer original:", e);
    return { cleanBuffer: rawBuffer, tagsCount: 6 };
  }
}

/**
 * Salva a planilha base personalizada enviada pelo usuário no IndexedDB + Memória
 * (Sem estourar o limite de 5 MB do LocalStorage mesmo em planilhas de 10 MB ou 20 MB)
 */
export async function saveCustomTemplateToStorage(file: File): Promise<StoredTemplateMeta> {
  const rawBuffer = await file.arrayBuffer();
  const { cleanBuffer, tagsCount } = await sanitizeAndInspectMemorialZip(rawBuffer);

  const meta: StoredTemplateMeta = {
    fileName: file.name,
    fileSize: file.size,
    updatedAt: new Date().toISOString(),
    tagsCount,
  };

  memoryTemplateBuffer = cleanBuffer;
  memoryTemplateMeta = meta;

  if (typeof window !== "undefined") {
    try {
      // Remove chave legada pesada se existir para liberar espaço no LocalStorage
      localStorage.removeItem("orcabase_memorial_template_base64");
      localStorage.setItem(TEMPLATE_META_KEY, JSON.stringify(meta));
    } catch {
      // Ignora erro de quota no localStorage pois o arquivo real fica no IndexedDB
    }
    await saveBufferToMemorialIDB(cleanBuffer, meta);
  }

  return meta;
}

/**
 * Garante que a planilha oficial `DESCRITIVO MODELO.xlsx` esteja carregada
 * automaticamente se nenhuma outra planilha personalizada estiver no IndexedDB.
 */
export async function ensureDefaultMemorialTemplateLoaded(): Promise<StoredTemplateMeta> {
  if (memoryTemplateBuffer && memoryTemplateMeta) {
    return memoryTemplateMeta;
  }

  const fromIdb = await loadBufferFromMemorialIDB();
  if (fromIdb && fromIdb.buffer && fromIdb.meta) {
    memoryTemplateBuffer = fromIdb.buffer;
    memoryTemplateMeta = fromIdb.meta;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(TEMPLATE_META_KEY, JSON.stringify(fromIdb.meta));
      } catch {
        // ignore
      }
    }
    return fromIdb.meta;
  }

  // Carrega o `DESCRITIVO MODELO.xlsx` oficial embutido em `/contracts-base/DESCRITIVO_MODELO.xlsx`
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`${DEFAULT_BUILTIN_MEMORIAL_URL}?_t=${Date.now()}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        memoryTemplateBuffer = buf;
        memoryTemplateMeta = DEFAULT_BUILTIN_MEMORIAL_META;
        try {
          localStorage.setItem(TEMPLATE_META_KEY, JSON.stringify(DEFAULT_BUILTIN_MEMORIAL_META));
        } catch {
          // ignore
        }
        await saveBufferToMemorialIDB(buf, DEFAULT_BUILTIN_MEMORIAL_META);
        return DEFAULT_BUILTIN_MEMORIAL_META;
      }
    } catch (e) {
      console.warn("Aviso ao carregar DESCRITIVO_MODELO.xlsx padrão:", e);
    }
  }

  return DEFAULT_BUILTIN_MEMORIAL_META;
}

/**
 * Recupera a planilha base armazenada (Memória -> IndexedDB -> `/contracts-base/DESCRITIVO_MODELO.xlsx`)
 */
export async function getStoredCustomTemplate(): Promise<{ buffer: ArrayBuffer; meta: StoredTemplateMeta } | null> {
  if (memoryTemplateBuffer && memoryTemplateMeta) {
    return { buffer: memoryTemplateBuffer, meta: memoryTemplateMeta };
  }

  const fromIdb = await loadBufferFromMemorialIDB();
  if (fromIdb && fromIdb.buffer && fromIdb.meta) {
    memoryTemplateBuffer = fromIdb.buffer;
    memoryTemplateMeta = fromIdb.meta;
    return fromIdb;
  }

  if (typeof window !== "undefined") {
    try {
      const res = await fetch(DEFAULT_BUILTIN_MEMORIAL_URL);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        memoryTemplateBuffer = buf;
        memoryTemplateMeta = DEFAULT_BUILTIN_MEMORIAL_META;
        await saveBufferToMemorialIDB(buf, DEFAULT_BUILTIN_MEMORIAL_META);
        return { buffer: buf, meta: DEFAULT_BUILTIN_MEMORIAL_META };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Retorna os metadados da planilha base ativa de forma síncrona (para inicialização rápida de UI)
 */
export function getStoredCustomTemplateSyncMeta(): StoredTemplateMeta {
  if (memoryTemplateMeta) return memoryTemplateMeta;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(TEMPLATE_META_KEY) || localStorage.getItem("orcabase_memorial_template_meta");
      if (raw) {
        return JSON.parse(raw) as StoredTemplateMeta;
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_BUILTIN_MEMORIAL_META;
}

/**
 * Restaura a planilha base para o `DESCRITIVO MODELO.xlsx` oficial da SEDUC / GPR
 */
export async function removeCustomTemplateFromStorage(): Promise<StoredTemplateMeta> {
  memoryTemplateBuffer = null;
  memoryTemplateMeta = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("orcabase_memorial_template_base64");
    localStorage.removeItem("orcabase_memorial_template_meta");
    localStorage.removeItem(TEMPLATE_META_KEY);
    await clearMemorialIDB();
  }
  return await ensureDefaultMemorialTemplateLoaded();
}

/**
 * Retorna o base64 da planilha base ativa do Memorial (para sincronização em nuvem)
 */
export async function getStoredCustomTemplateBase64(): Promise<string | null> {
  const stored = await getStoredCustomTemplate();
  if (!stored || !stored.buffer) return null;
  return arrayBufferToBase64Fast(stored.buffer);
}

/**
 * Hidrata no IndexedDB + Memória uma planilha base de Memorial vinda da nuvem
 */
export async function hydrateCustomTemplateToStorage(meta: StoredTemplateMeta, base64: string): Promise<void> {
  if (typeof window === "undefined" || !meta || !base64) return;
  try {
    const rawBuf = base64ToArrayBufferFast(base64);
    const { cleanBuffer, tagsCount } = await sanitizeAndInspectMemorialZip(rawBuf);
    const enrichedMeta: StoredTemplateMeta = {
      ...meta,
      tagsCount: meta.tagsCount || tagsCount,
    };
    memoryTemplateBuffer = cleanBuffer;
    memoryTemplateMeta = enrichedMeta;
    try {
      localStorage.removeItem("orcabase_memorial_template_base64");
      localStorage.setItem(TEMPLATE_META_KEY, JSON.stringify(enrichedMeta));
    } catch {
      // ignore
    }
    await saveBufferToMemorialIDB(cleanBuffer, enrichedMeta);
  } catch (e) {
    console.warn("Falha ao hidratar planilha base do memorial da nuvem:", e);
  }
}

// ============================================================================
// MOTOR CIRÚRGICO OPENXML (JSZIP) PARA INJEÇÃO NO `DESCRITIVO MODELO.XLSX`
// Preserva 100% do Brasão do Piauí/SEDUC, bordas, cores, larguras e fórmulas!
// ============================================================================
export async function injectMemorialIntoExcelTemplate(
  templateBuffer: ArrayBuffer | Uint8Array,
  params: MemorialExcelInjectionParams
): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(templateBuffer);

  // Localiza a aba do Memorial Descritivo (normalmente xl/worksheets/sheet1.xml)
  const sheetPath =
    Object.keys(zip.files).find((k) => k === "xl/worksheets/sheet1.xml") ||
    Object.keys(zip.files).find((k) => k.startsWith("xl/worksheets/sheet") && k.endsWith(".xml"));

  if (!sheetPath) {
    return generateDefaultMemorialTemplate(params);
  }

  let sheetXml = await zip.file(sheetPath)!.async("string");
  const sstFile = zip.file("xl/sharedStrings.xml");
  let sstXml = sstFile ? await sstFile.async("string") : "";

  const schoolUpper = (params.schoolName || "UNIDADE ESCOLAR").trim().toUpperCase();
  const cityUpper = (params.municipio || "TERESINA").trim().toUpperCase();

  // Formata MÊS ATUAL, ANO ATUAL no padrão exato da tag: "NOVEMBRO, 2026"
  const rawMesAno = (params.mesAnoRef || "Novembro de 2026").trim();
  const mesAnoFormatted = rawMesAno.replace(/\s+de\s+/i, ", ").toUpperCase();

  // Formata BDI decimal para célula numérica percentual (ex: "24,50%" -> 0.245)
  const bdiClean = String(params.bdiPercent || "24,50%").replace("%", "").replace(",", ".").trim();
  const bdiParsed = parseFloat(bdiClean);
  const bdiDecimal = !isNaN(bdiParsed) ? (bdiParsed > 1 ? bdiParsed / 100 : bdiParsed) : 0.245;

  // Formata Data Extensa com dia da semana no padrão exato da tag: "domingo, 15 de novembro de 2026"
  const footerDateFormatted = (params.dataExtensa || "").trim().toLowerCase();

  // Verifica se a planilha segue o layout oficial `DESCRITIVO MODELO.xlsx` da SEDUC / UGERF
  const isSeducDescritivoModelo =
    sheetXml.includes('"PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - "&amp;C8') ||
    sheetXml.includes('"SERVIÇOS - "&amp;C8') ||
    sstXml.includes("TÍTULO (EX. GERAL)=AQUI");

  if (isSeducDescritivoModelo) {
    // 1. Atualiza o cabeçalho fixo (Linhas 1 a 16) preservando estilos e fórmulas
    const sheetDataMatch = sheetXml.match(/<sheetData>([\s\S]*?)<\/sheetData>/);
    if (sheetDataMatch) {
      const allRowsXml = sheetDataMatch[1].match(/<row\b[\s\S]*?<\/row>/g) || [];
      const headerRowsXml: string[] = [];

      for (const rowXml of allRowsXml) {
        const rAttr = rowXml.match(/\br="(\d+)"/);
        const rNum = rAttr ? parseInt(rAttr[1], 10) : 0;
        if (rNum >= 1 && rNum <= 16) {
          let updatedRow = rowXml;

          // Linha 2: B2 tem fórmula `"PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - "&C8`
          if (rNum === 2) {
            updatedRow = updatedRow.replace(
              /<c r="B2"([^>]*)>[\s\S]*?<\/c>/,
              `<c r="B2" s="56" t="str"><f>"PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - "&amp;C8</f><v>${escapeXml(
                `PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - ${schoolUpper}`
              )}</v></c>`
            );
          }
          // Linha 7: C7 = MÊS ATUAL, ANO ATUAL (EX. NOVEMBRO, 2026)=AQUI
          else if (rNum === 7) {
            updatedRow = updatedRow.replace(
              /<c r="C7"[^>]*>[\s\S]*?<\/c>/,
              `<c r="C7" s="42" t="inlineStr"><is><t>${escapeXml(mesAnoFormatted)}</t></is></c>`
            );
          }
          // Linha 8: C8 = NOME DA ESCOLA (EX. CETI BENEDITO OLIVEIRA)=AQUI
          else if (rNum === 8) {
            updatedRow = updatedRow.replace(
              /<c r="C8"[^>]*>[\s\S]*?<\/c>/,
              `<c r="C8" s="47" t="inlineStr"><is><t>${escapeXml(schoolUpper)}</t></is></c>`
            );
          }
          // Linha 9: C9 = NOME DA CIDADE=AQUI e I9 = BDI=AQUI
          else if (rNum === 9) {
            updatedRow = updatedRow.replace(
              /<c r="C9"[^>]*>[\s\S]*?<\/c>/,
              `<c r="C9" s="50" t="inlineStr"><is><t>${escapeXml(cityUpper)}</t></is></c>`
            );
            updatedRow = updatedRow.replace(
              /<c r="I9"[^>]*>[\s\S]*?<\/c>/,
              `<c r="I9" s="25"><v>${bdiDecimal}</v></c>`
            );
          }
          // Linha 13: B13 tem fórmula `"SERVIÇOS - "&C8`
          else if (rNum === 13) {
            updatedRow = updatedRow.replace(
              /<c r="B13"([^>]*)>[\s\S]*?<\/c>/,
              `<c r="B13" s="36" t="str"><f>"SERVIÇOS - "&amp;C8</f><v>${escapeXml(
                `SERVIÇOS - ${schoolUpper}`
              )}</v></c>`
            );
          }

          headerRowsXml.push(updatedRow);
        }
      }

      // 2. Constrói dinamicamente as linhas das Categorias e Serviços a partir da linha 17
      const dynamicRowsXml: string[] = [];
      const dynamicMerges: string[] = [
        "B2:G2",
        "H2:I5",
        "B3:G3",
        "B4:G4",
        "B5:G5",
        "C6:G6",
        "C7:D7",
        "E7:G7",
        "C8:G8",
        "C9:E9",
        "B11:I11",
        "B12:D12",
        "B13:I13",
      ];

      let currentRow = 17;
      const stagesToRender: DescritivoStage[] =
        params.stages && params.stages.length > 0
          ? params.stages
          : [
              {
                id: "empty-stage",
                stageCode: "1",
                title: "SERVIÇOS GERAIS",
                items: [],
              },
            ];

      stagesToRender.forEach((stg, idx) => {
        const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
        const numberedTitle = `${idx + 1}. ${cleanTitle}`;

        // Linha do Título da Categoria (Em CAIXA ALTA, Negrito Vermelho Centralizado, Mesclado C:H)
        if (idx === 0) {
          dynamicRowsXml.push(
            `<row r="${currentRow}" spans="2:18" ht="16" x14ac:dyDescent="0.4">` +
              `<c r="B${currentRow}" s="19"/>` +
              `<c r="C${currentRow}" s="39" t="inlineStr"><is><t>${escapeXml(numberedTitle)}</t></is></c>` +
              `<c r="D${currentRow}" s="40"/><c r="E${currentRow}" s="40"/><c r="F${currentRow}" s="40"/><c r="G${currentRow}" s="40"/>` +
              `<c r="H${currentRow}" s="41"/><c r="I${currentRow}" s="20"/>` +
              `</row>`
          );
        } else {
          dynamicRowsXml.push(
            `<row r="${currentRow}" spans="2:18" ht="16" x14ac:dyDescent="0.4">` +
              `<c r="B${currentRow}" s="19"/>` +
              `<c r="C${currentRow}" s="34" t="inlineStr"><is><t>${escapeXml(numberedTitle)}</t></is></c>` +
              `<c r="D${currentRow}" s="74"/><c r="E${currentRow}" s="74"/><c r="F${currentRow}" s="74"/><c r="G${currentRow}" s="74"/>` +
              `<c r="H${currentRow}" s="35"/><c r="I${currentRow}" s="20"/>` +
              `</row>`
          );
        }
        dynamicMerges.push(`C${currentRow}:H${currentRow}`);
        currentRow++;

        // Linha Espaçadora com Borda Superior da Caixa de Serviços (originalmente Linha 18 / 27)
        dynamicRowsXml.push(
          `<row r="${currentRow}" spans="2:18" ht="15" customHeight="1" x14ac:dyDescent="0.35">` +
            `<c r="B${currentRow}" s="21"/><c r="C${currentRow}" s="28"/><c r="D${currentRow}" s="69"/>` +
            `<c r="E${currentRow}" s="70"/><c r="F${currentRow}" s="70"/><c r="G${currentRow}" s="71"/>` +
            `<c r="H${currentRow}" s="23"/><c r="I${currentRow}" s="20"/>` +
            `</row>`
        );
        currentRow++;

        // Linhas dos Subitens de Serviço da Categoria (Mesclado C:H, sem marcadores, iniciando com Maiúscula)
        stg.items.forEach((it) => {
          const rawItem = it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim();
          const formattedItem = rawItem ? rawItem.charAt(0).toUpperCase() + rawItem.slice(1) : "";
          const estimatedLines = Math.max(1, Math.ceil(formattedItem.length / 100));
          const rowHt = estimatedLines === 1 ? "15.75" : String(estimatedLines * 15.5);

          dynamicRowsXml.push(
            `<row r="${currentRow}" spans="2:18" ht="${rowHt}" customHeight="1" x14ac:dyDescent="0.35">` +
              `<c r="B${currentRow}" s="21"/>` +
              `<c r="C${currentRow}" s="65" t="inlineStr"><is><t>${escapeXml(formattedItem)}</t></is></c>` +
              `<c r="D${currentRow}" s="72"/><c r="E${currentRow}" s="72"/><c r="F${currentRow}" s="72"/><c r="G${currentRow}" s="72"/>` +
              `<c r="H${currentRow}" s="67"/><c r="I${currentRow}" s="22"/>` +
              `</row>`
          );
          dynamicMerges.push(`C${currentRow}:H${currentRow}`);
          currentRow++;
        });

        // Linha Separadora entre Categorias (originalmente Linha 25)
        if (idx < stagesToRender.length - 1) {
          dynamicRowsXml.push(
            `<row r="${currentRow}" spans="2:18" ht="16" x14ac:dyDescent="0.35">` +
              `<c r="B${currentRow}" s="21"/><c r="C${currentRow}" s="30"/>` +
              `<c r="D${currentRow}" s="73"/><c r="E${currentRow}" s="73"/><c r="F${currentRow}" s="73"/><c r="G${currentRow}" s="73"/>` +
              `<c r="H${currentRow}" s="29"/><c r="I${currentRow}" s="22"/>` +
              `</row>`
          );
          dynamicMerges.push(`C${currentRow}:H${currentRow}`);
          currentRow++;
        }
      });

      // 3. Linhas de Fechamento da Moldura (originalmente Linhas 34, 35 e 36)
      // Fechamento 1 (borda inferior interna da caixa de itens)
      dynamicRowsXml.push(
        `<row r="${currentRow}" spans="2:9" x14ac:dyDescent="0.35">` +
          `<c r="B${currentRow}" s="19"/><c r="C${currentRow}" s="75"/>` +
          `<c r="D${currentRow}" s="24"/><c r="E${currentRow}" s="24"/><c r="F${currentRow}" s="24"/><c r="G${currentRow}" s="24"/>` +
          `<c r="H${currentRow}" s="76"/><c r="I${currentRow}" s="20"/>` +
          `</row>`
      );
      currentRow++;

      // Fechamento 2 (espaçamento inferior da moldura externa)
      dynamicRowsXml.push(
        `<row r="${currentRow}" spans="2:9" x14ac:dyDescent="0.35">` +
          `<c r="B${currentRow}" s="26"/><c r="C${currentRow}" s="24"/><c r="D${currentRow}" s="24"/>` +
          `<c r="E${currentRow}" s="24"/><c r="F${currentRow}" s="24"/><c r="G${currentRow}" s="24"/>` +
          `<c r="H${currentRow}" s="24"/><c r="I${currentRow}" s="27"/>` +
          `</row>`
      );
      currentRow++;

      // Fechamento 3 (borda inferior espessa antes da data)
      dynamicRowsXml.push(
        `<row r="${currentRow}" spans="2:9" ht="15" thickBot="1" x14ac:dyDescent="0.4">` +
          `<c r="B${currentRow}" s="31"/><c r="C${currentRow}" s="32"/><c r="D${currentRow}" s="32"/>` +
          `<c r="E${currentRow}" s="32"/><c r="F${currentRow}" s="32"/><c r="I${currentRow}" s="20"/>` +
          `</row>`
      );
      dynamicMerges.push(`B${currentRow}:F${currentRow}`);
      currentRow++;

      // 4. Linha Final da Data Extensa com Dia da Semana (originalmente Linha 37: B37:I37)
      dynamicRowsXml.push(
        `<row r="${currentRow}" spans="2:9" x14ac:dyDescent="0.35">` +
          `<c r="B${currentRow}" s="33" t="inlineStr"><is><t>${escapeXml(footerDateFormatted)}</t></is></c>` +
          `<c r="C${currentRow}" s="33"/><c r="D${currentRow}" s="33"/><c r="E${currentRow}" s="33"/>` +
          `<c r="F${currentRow}" s="33"/><c r="G${currentRow}" s="33"/><c r="H${currentRow}" s="33"/><c r="I${currentRow}" s="33"/>` +
          `</row>`
      );
      dynamicMerges.push(`B${currentRow}:I${currentRow}`);

      // Substitui <sheetData>, <mergeCells> e <dimension>
      const newSheetDataXml = `<sheetData>${headerRowsXml.join("")}${dynamicRowsXml.join("")}</sheetData>`;
      sheetXml = sheetXml.replace(/<sheetData>[\s\S]*?<\/sheetData>/, newSheetDataXml);

      const newMergeCellsXml =
        `<mergeCells count="${dynamicMerges.length}">` +
        dynamicMerges.map((ref) => `<mergeCell ref="${ref}"/>`).join("") +
        `</mergeCells>`;
      if (sheetXml.includes("<mergeCells")) {
        sheetXml = sheetXml.replace(/<mergeCells[^>]*>[\s\S]*?<\/mergeCells>/, newMergeCellsXml);
      } else {
        sheetXml = sheetXml.replace("</sheetData>", `</sheetData>${newMergeCellsXml}`);
      }

      sheetXml = sheetXml.replace(/<dimension ref="[^"]*"\/>/, `<dimension ref="B1:I${currentRow}"/>`);

      // Remove validações quebradas #REF! se houver
      sheetXml = sheetXml.replace(/<dataValidations[\s\S]*?<\/dataValidations>/g, "");

      zip.file(sheetPath, sheetXml);
    }
  } else {
    // Caso o usuário anexe outra planilha qualquer com tags "= AQUI" em células diversas:
    // Substitui diretamente no sharedStrings.xml e no sheet1.xml mantendo estilos intactos
    const replaceGenericTag = (text: string): string => {
      if (!/=\s*AQUI/i.test(text)) return text;
      const lower = text.toLowerCase();
      if (lower.includes("dia da semana") || lower.includes("extensa") || lower.includes("dia atual")) {
        return footerDateFormatted;
      }
      if (lower.includes("mês") || lower.includes("mes")) {
        return mesAnoFormatted;
      }
      if (lower.includes("escola") || lower.includes("unidade")) {
        return schoolUpper;
      }
      if (lower.includes("cidade") || lower.includes("município") || lower.includes("municipio") || lower.includes("local")) {
        return cityUpper;
      }
      if (lower.includes("bdi")) {
        return params.bdiPercent || "24,50%";
      }
      return text.replace(/=\s*AQUI/gi, "").trim();
    };

    if (sstXml) {
      sstXml = sstXml.replace(/<t([^>]*)>([\s\S]*?)<\/t>/g, (full, attrs, inner) => {
        if (/=\s*AQUI/i.test(inner)) {
          return `<t${attrs}>${escapeXml(replaceGenericTag(inner))}</t>`;
        }
        return full;
      });
      zip.file("xl/sharedStrings.xml", sstXml);
    }
  }

  // Remove calcChain.xml e ativa fullCalcOnLoad="1" para que o Excel recalcule B2 e B13 ao abrir sem erro
  if (zip.file("xl/calcChain.xml")) {
    zip.remove("xl/calcChain.xml");
    if (zip.file("[Content_Types].xml")) {
      let ct = await zip.file("[Content_Types].xml")!.async("string");
      ct = ct.replace(/<Override[^>]*calcChain\.xml[^>]*\/>/g, "");
      zip.file("[Content_Types].xml", ct);
    }
    if (zip.file("xl/_rels/workbook.xml.rels")) {
      let rels = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
      rels = rels.replace(/<Relationship[^>]*calcChain\.xml[^>]*\/>/g, "");
      zip.file("xl/_rels/workbook.xml.rels", rels);
    }
  }

  if (zip.file("xl/workbook.xml")) {
    let wbXml = await zip.file("xl/workbook.xml")!.async("string");
    if (wbXml.includes("<calcPr")) {
      wbXml = wbXml.replace(/<calcPr[^>]*\/>/, '<calcPr calcId="191029" fullCalcOnLoad="1"/>');
    } else {
      wbXml = wbXml.replace("</workbook>", '<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>');
    }
    zip.file("xl/workbook.xml", wbXml);
  }

  const outBytes = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return outBytes;
}

/**
 * Gera a planilha base padrão do Memorial Descritivo:
 * Usa prioritariamente o `DESCRITIVO MODELO.xlsx` oficial da SEDUC / GPR.
 */
export async function generateDefaultMemorialTemplate(
  params: MemorialExcelInjectionParams
): Promise<Uint8Array> {
  const stored = await getStoredCustomTemplate();
  if (stored && stored.buffer) {
    return injectMemorialIntoExcelTemplate(stored.buffer, params);
  }

  // Fallback se executado em ambiente sem fetch local
  const wb = XLSX.utils.book_new();
  const rows: (string | null)[][] = [
    [`PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - ${(params.schoolName || "").toUpperCase()}`, null, null, null],
    ["GOVERNO DO ESTADO DO PIAUÍ", null, null, null],
    ["SECRETARIA DE ESTADO DA EDUCAÇÃO - SEDUC", null, null, null],
    ["UNIDADE DE GESTÃO DA REDE FÍSICA - UGERF", null, null, null],
    ["OBJETO:", "MANUTENÇÃO PREDIAL DAS UNIDADES ESCOLARES DA REDE ESTADUAL", "L.S. (MENSAL)=", "70,90%"],
    ["DATA:", (params.mesAnoRef || "").replace(/\s+de\s+/i, ", ").toUpperCase(), "L.S. (HORISTA)=", "113,05%"],
    ["UNIDADE.:", (params.schoolName || "").toUpperCase(), "BDI (DIF)=", "0,00%"],
    ["MUNICÍPIO:", (params.municipio || "").toUpperCase(), "BDI=", params.bdiPercent || "24,50%"],
    [],
    ["MEMORIAL DESCRITIVO", null, null, null],
    [`SERVIÇOS - ${(params.schoolName || "").toUpperCase()}`, null, null, null],
    [],
  ];

  (params.stages || []).forEach((stg, idx) => {
    const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    rows.push([`${idx + 1}. ${cleanTitle}`, null, null, null]);
    stg.items.forEach((it) => {
      rows.push([it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim(), null, null, null]);
    });
    rows.push([]);
  });

  rows.push([(params.dataExtensa || "").toLowerCase(), null, null, null]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "DESCRITIVO");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Uint8Array(out);
}

/**
 * Baixa o arquivo de modelo oficial `DESCRITIVO MODELO.xlsx` contendo as tags `=AQUI`
 */
export async function generateBlankMemorialTemplateWithTags(): Promise<Uint8Array> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(DEFAULT_BUILTIN_MEMORIAL_URL);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
      }
    } catch {
      // ignore
    }
  }
  const stored = await getStoredCustomTemplate();
  if (stored && stored.buffer) {
    return new Uint8Array(stored.buffer);
  }
  return generateDefaultMemorialTemplate({
    schoolName: "NOME DA ESCOLA (EX. CETI BENEDITO OLIVEIRA)=AQUI",
    municipio: "NOME DA CIDADE (EX. JULIO BORGES)=AQUI",
    bdiPercent: "BDI (EX. 25,3)=AQUI",
    mesAnoRef: "MÊS ATUAL, ANO ATUAL (EX. NOVEMBRO, 2026)=AQUI",
    dataExtensa: "DIA DA SEMANA ATUAL, DIA ATUAL DE MÊS ATUAL DE ANO ATUAL (EX. domingo, 8 de novembro de 2026)=AQUI",
    stages: [],
  });
}
