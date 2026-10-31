/**
 * OrçaBase.lab - GPR — Motor de Estudo Estrutural 100% Completo de Planilhas,
 * Inteligência Semântica por Disciplina (Pintura, Hidráulica, Elétrica, etc.)
 * e Injeção Fiel de Quantitativos com Preservação de Layout.
 */

import * as XLSX from "xlsx";
import {
  DetectedColumns,
  StageGroup,
  ItemBase,
  SpreadsheetStudy,
  ContractCompositionMatch,
  MatchCandidate,
  CalculationStrategy,
} from "@/types";

// ============================================================================
// 1. ARMAZENAMENTO BINÁRIO NO INDEXEDDB (SUPORTA PLANILHAS GRANDES SEM LIMITE)
// ============================================================================

const DB_NAME = "OrcaBaseGPR_Storage_v1";
const STORE_NAME = "contract_binaries";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB não disponível"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveContractBinary(contractId: string, base64Data: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(base64Data, contractId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("Aviso ao salvar binário no IndexedDB:", e);
  }
}

export async function getContractBinary(contractId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(contractId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteContractBinary(contractId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(contractId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

// ============================================================================
// 2. CLASSIFICADOR DE DISCIPLINA / LOCALIZAÇÃO DO SERVIÇO NA ENGENHARIA CIVIL
// ============================================================================

const DISCIPLINE_DICTIONARY: Record<string, string[]> = {
  PINTURA: [
    "pintura", "tinta", "latex", "látex", "acrilica", "acrílica", "pva", "esmalte",
    "verniz", "selador", "massa corrida", "massa acrilica", "lixamento", "demao", "demão",
    "demaos", "demãos", "caiacao", "caiação", "textura", "grafiato", "epoxi", "epóxi", "repintura",
  ],
  HIDRAULICA: [
    "hidraulica", "hidráulica", "hidrossanitaria", "hidrossanitária", "agua fria", "água fria",
    "esgoto", "pluvial", "tubo", "tubulacao", "tubulação", "pvc", "soldavel", "soldável",
    "registro", "valvula", "válvula", "torneira", "sifao", "sifão", "caixa d'agua", "caixa dagua",
    "reservatorio", "reservatório", "vaso sanitario", "bacia sanitaria", "bacia sifonada",
    "lavatorio", "lavatório", "mictorio", "mictório", "pia", "cuba", "ralo", "joelho",
    "curva", "luva", "uniao", "união", "calha", "fossa", "sumidouro", "caixa de inspecao",
    "caixa de gordura", "castelo", "hidrometro", "hidrômetro", "chuveiro", "ducha", "engate",
  ],
  ELETRICA: [
    "eletrica", "elétrica", "eletrico", "elétrico", "cabo", "fio", "condutor", "flexivel",
    "eletroduto", "conduite", "conduíte", "condulete", "disjuntor", "quadro de distribuicao",
    "quadro eletrico", "tomada", "interruptor", "luminaria", "luminária", "lampada", "lâmpada",
    "led", "refletor", "aterramento", "haste", "cordoalha", "spda", "para-raios", "reator",
    "caixa octogonal", "caixa 4x2", "caixa 4x4", "cabos", "fios", "mm2", "mm²", "750v", "1kv",
    "subestacao", "transformador", "poste", " logica", "lógica", "rede", "telefone", "cftv",
  ],
  ESTRUTURA: [
    "concreto", "fck", "usinado", "bombeavel", "slump", "armacao", "armação", "aco", "aço",
    "ca-50", "ca50", "ca-60", "ca60", "vergalhao", "vergalhão", "forma", "fôrma", "compensado",
    "resinado", "plastificado", "madeirite", "escoramento", "pilar", "viga", "laje", "fundacao",
    "fundação", "sapata", "baldrame", "estaca", "broca", "radier", "bloco de coroamento",
    "graute", "tela soldada", "estrutura", "estrutural", "lancamento", "adensamento",
  ],
  ALVENARIA: [
    "alvenaria", "bloco", "tijolo", "ceramico", "cerâmico", "vedacao", "vedação", "divisoria",
    "divisória", "drywall", "gesso acartonado", "verga", "contraverga", "cobogo", "cobogó",
    "elemento vazado", "encunhamento", "parede de alvenaria", "furos", "9x19", "14x19",
  ],
  REVESTIMENTO: [
    "chapisco", "emboco", "emboço", "reboco", "massa unica", "massa única", "argamassa",
    "revestimento ceramico", "azulejo", "pastilha", "forro", "gesso", "forro de pvc",
    "forro mineral", "sanca", "moldura", "chapisco rolado", "tariscamento",
  ],
  PISOS: [
    "piso", "contrapiso", "regularizacao de base", "porcelanato", "ceramica para piso",
    "cimentado", "intertravado", "paver", "bloco sextavado", "meio-fio", "guia", "sarjeta",
    "rodape", "rodapé", "soleira", "peitoril", "granito", "marmore", "mármore", "vinilico",
    "vinílico", "laminado", "alta resistencia", "korodur", "granilite", "calcada", "calçada",
    "rejunte", "rejuntamento", "argamassa colante", "ac-i", "ac-ii", "ac-iii", "pei-",
  ],
  COBERTURA: [
    "cobertura", "telhado", "telha", "fibrocimento", "telha ceramica", "telha metalica",
    "termoacustica", "termoacústica", "galvalume", "sanduiche", "trama", "madeiramento",
    "tesoura", "terca", "terça", "caibro", "ripa", "cumeeira", "rufo", "contra-rufo",
    "estrutura metalica para cobertura", "policarbonato",
  ],
  IMPERMEABILIZACAO: [
    "impermeabilizacao", "impermeabilização", "manta asfaltica", "manta asfáltica",
    "emulsao", "emulsão", "hidrofugante", "polimerica", "polimérica", "cristalizante",
    "betuminosa", "primer", "sika", "viaplus", "impermeabilizante",
  ],
  ESQUADRIAS: [
    "esquadria", "porta", "janela", "aluminio", "alumínio", "vidro", "temperado",
    "fechadura", "dobradica", "dobradiça", "basculante", "maxim-ar", "veneziana",
    "grade", "portao", "portão", "corrimao", "corrimão", "guarda-corpo", "caixilho",
    "aduza", "batente", "alisar", "guarnicao", "guarnição", "ferragem",
  ],
  DEMOLICAO: [
    "demolicao", "demolição", "retirada", "remocao", "remoção", "arrancamento",
    "apicoamento", "desmontagem", "bota-fora", "entulho", "cacamba", "caçamba",
    "raspagem", "carga manual", "transporte de entulho", "destelhamento",
  ],
  TERRAPLENAGEM: [
    "escavacao", "escavação", "aterro", "reaterro", "compactacao", "compactação",
    "regularizacao do subleito", "vala", "movimento de terra", "terraplenagem",
    "limpeza do terreno", "capina", "rocada", "roçada", "destocamento", "raspagem da camada vegetal",
  ],
  PRELIMINARES: [
    "preliminares", "placa de obra", "tapume", "barracao", "barracão", "canteiro",
    "locacao da obra", "locação da obra", "mobilizacao", "mobilização", "desmobilizacao",
    "administracao local", "administração local", "engenheiro", "mestre de obras",
    "encarregado", "vigia", "limpeza final", "limpeza permanente", "andaime",
  ],
};

function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s.,/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectDiscipline(description: string, stageTitle?: string): string {
  const normDesc = normalizeText(description);
  const normStage = normalizeText(stageTitle || "");

  let bestDisc = "GERAL";
  let maxScore = 0;

  for (const [disc, keywords] of Object.entries(DISCIPLINE_DICTIONARY)) {
    let score = 0;
    for (const kw of keywords) {
      const normKw = normalizeText(kw);
      // Palavra na descrição pesa mais
      if (normDesc.includes(normKw)) {
        score += normKw.includes(" ") ? 4 : 2;
      }
      // Palavra no título da Etapa/Grupo dá contexto forte
      if (normStage && normStage.includes(normKw)) {
        score += 3;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestDisc = disc;
    }
  }

  return bestDisc;
}

// ============================================================================
// 3. PARSER DE NÚMEROS E UNIDADES BRASILEIRAS
// ============================================================================

export function parseBrazilianNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (val === null || val === undefined) return 0;
  let s = String(val).trim();
  if (!s) return 0;

  // Remove R$, %, espaços
  s = s.replace(/[R$%\s]/gi, "");

  // Se tiver ponto e vírgula (ex: 1.234,56 -> 1234.56)
  if (s.includes(".") && s.includes(",")) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }

  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

const VALID_UNITS = new Set([
  "M", "M2", "M²", "M3", "M³", "UN", "UND", "UNID", "KG", "T", "TON",
  "L", "CJ", "CONJ", "VB", "VERBA", "GL", "H", "HP", "MES", "MÊS",
  "DIA", "PAR", "PT", "PTO", "JG", "SC", "SACO", "ML", "KM", "HA", "M2XMES",
]);

export function normalizeUnit(u: string): string {
  const clean = (u || "")
    .toUpperCase()
    .trim()
    .replace("²", "2")
    .replace("³", "3")
    .replace(/\./g, "");
  if (["UND", "UNID", "UNIDADE", "PC", "PÇ", "PECA"].includes(clean)) return "UN";
  if (["CONJ", "CONJUNTO"].includes(clean)) return "CJ";
  if (["VERBA", "GLOBAL"].includes(clean)) return "VB";
  if (["ML", "METRO", "METROS"].includes(clean)) return "M";
  if (["PTO", "PONTO"].includes(clean)) return "PT";
  if (["MÊS", "MESES"].includes(clean)) return "MES";
  return clean || "UN";
}

function isLikelyUnit(val: any): boolean {
  if (val === null || val === undefined) return false;
  const s = String(val).trim().toUpperCase().replace(/\./g, "");
  if (!s || s.length > 8) return false;
  return VALID_UNITS.has(s) || VALID_UNITS.has(normalizeUnit(s));
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, Math.min(i + chunkSize, len)))
    );
  }
  return window.btoa(binary);
}

// ============================================================================
// 4. ESTUDO ESTRUTURAL 100% COMPLETO DA PLANILHA EXCEL
// ============================================================================

export function studySpreadsheetFromBuffer(
  buffer: ArrayBuffer,
  preferredSheet?: string,
  fileName: string = "Planilha.xlsx",
  fileSize: string = "0 KB"
): SpreadsheetStudy {
  const workbook = XLSX.read(buffer, { type: "array", cellFormula: true, cellStyles: true });
  const sheetNames = workbook.SheetNames;

  // 1. Escolhe a aba de orçamento
  let selectedSheet = preferredSheet && sheetNames.includes(preferredSheet) ? preferredSheet : sheetNames[0];
  if (!preferredSheet) {
    let bestSheetScore = -1;
    for (const name of sheetNames) {
      const nLow = normalizeText(name);
      let sScore = 0;
      if (nLow.includes("orcamento") || nLow.includes("planilha") || nLow.includes("sintetic")) sScore += 50;
      if (nLow.includes("analitic") || nLow.includes("composic")) sScore += 25;
      if (nLow.includes("capa") || nLow.includes("resumo") || nLow.includes("cronograma") || nLow.includes("bdi")) sScore -= 20;

      const wsTemp = workbook.Sheets[name];
      const rowsTemp: any[][] = XLSX.utils.sheet_to_json(wsTemp, { header: 1, defval: "" });
      sScore += Math.min(40, Math.floor(rowsTemp.length / 5));

      if (sScore > bestSheetScore) {
        bestSheetScore = sScore;
        selectedSheet = name;
      }
    }
  }

  const worksheet = workbook.Sheets[selectedSheet];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  const totalRows = rows.length;
  const totalCols = rows.reduce((max, r) => Math.max(max, r ? r.length : 0), 0);

  // 2. Detecção profunda da linha de cabeçalho (varre até a linha 80)
  let bestHeaderRow = 0; // 0-based
  let bestHeaderScore = 0;

  for (let r = 0; r < Math.min(rows.length, 80); r++) {
    const row = rows[r];
    if (!row) continue;
    const rowCells = row.map((c) => normalizeText(String(c || "")));
    let score = 0;

    if (rowCells.some((c) => c === "item" || c.includes("item"))) score += 2;
    if (rowCells.some((c) => c.includes("cod") || c.includes("ref"))) score += 2;
    if (rowCells.some((c) => c.includes("descri") || c.includes("discrimina") || c.includes("especifica") || c.includes("servic") || c.includes("composic"))) score += 5;
    if (rowCells.some((c) => c === "un" || c === "und" || c.includes("unid"))) score += 4;
    if (rowCells.some((c) => c === "qtd" || c === "qtde" || c.includes("quant"))) score += 5;
    if (rowCells.some((c) => c.includes("unit") || c.includes("preco") || c.includes("custo"))) score += 3;
    if (rowCells.some((c) => c.includes("total") || c.includes("valor"))) score += 2;

    if (score > bestHeaderScore) {
      bestHeaderScore = score;
      bestHeaderRow = r;
    }
  }

  // Combina a linha de cabeçalho com a linha imediatamente abaixo (caso seja cabeçalho mesclado em 2 linhas)
  const headerCells: string[] = [];
  for (let c = 0; c < totalCols; c++) {
    const h1 = normalizeText(String(rows[bestHeaderRow]?.[c] || ""));
    const h2 = bestHeaderScore >= 4 && rows[bestHeaderRow + 1] ? normalizeText(String(rows[bestHeaderRow + 1]?.[c] || "")) : "";
    // Só junta h2 se a linha de baixo também parecer cabeçalho (não tiver números de preço/quantidade)
    const isH2Header = h2 && (h2.includes("bdi") || h2.includes("sem") || h2.includes("com") || h2.includes("unit") || h2.includes("total") || h2.includes("quant"));
    headerCells[c] = isH2Header ? `${h1} ${h2}`.trim() : h1;
  }

  let colItem = -1;
  let colSource = -1;
  let colCode = -1;
  let colDesc = -1;
  let colUnit = -1;
  let colQty = -1;
  let colUnitPrice = -1;
  let colUnitPriceBdi = -1;
  let colTotal = -1;

  headerCells.forEach((cell, idx) => {
    if (!cell) return;
    if (colItem === -1 && (cell === "item" || cell.startsWith("item "))) colItem = idx;
    else if (colSource === -1 && (cell.includes("fonte") || cell.includes("banco") || cell.includes("base") || cell === "orgao")) colSource = idx;
    else if (colCode === -1 && (cell.includes("cod") || cell.includes("comp"))) colCode = idx;
    else if (colDesc === -1 && (cell.includes("descri") || cell.includes("discrimina") || cell.includes("especifica") || cell.includes("servic") || cell.includes("composic"))) colDesc = idx;
    else if (colUnit === -1 && (cell === "un" || cell === "und" || cell.includes("unid"))) colUnit = idx;
    else if (colQty === -1 && (cell === "qtd" || cell === "qtde" || cell.includes("quant"))) colQty = idx;
    else if (cell.includes("unit") || cell.includes("preco") || cell.includes("custo")) {
      if (colUnitPrice === -1) colUnitPrice = idx;
      else if (colUnitPriceBdi === -1 && (cell.includes("bdi") || idx > colUnitPrice)) colUnitPriceBdi = idx;
    } else if (cell.includes("total") || cell.includes("valor")) {
      colTotal = idx; // Pega a última coluna de total (que geralmente é o Total com BDI)
    }
  });

  // 3. Inferência estatística caso alguma coluna não tenha sido detectada pelo título
  const sampleStart = bestHeaderScore >= 4 ? bestHeaderRow + 1 : 0;
  if (colDesc === -1 || colUnit === -1 || colQty === -1) {
    const colStats = Array.from({ length: totalCols }, () => ({
      longTextCount: 0,
      unitCount: 0,
      numberCount: 0,
      itemPatternCount: 0,
    }));

    for (let r = sampleStart; r < Math.min(rows.length, sampleStart + 80); r++) {
      const row = rows[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const val = row[c];
        if (val === "" || val === null || val === undefined) continue;
        const s = String(val).trim();
        if (/^\d+(\.\d+)+$/.test(s)) colStats[c].itemPatternCount++;
        if (isLikelyUnit(s)) colStats[c].unitCount++;
        else if (typeof val === "number" || (/^[\d.,]+$/.test(s) && parseBrazilianNumber(s) > 0)) colStats[c].numberCount++;
        else if (s.length > 15 && isNaN(Number(s))) colStats[c].longTextCount++;
      }
    }

    if (colDesc === -1) {
      let maxLong = 0;
      colStats.forEach((st, idx) => {
        if (st.longTextCount > maxLong) {
          maxLong = st.longTextCount;
          colDesc = idx;
        }
      });
    }

    if (colUnit === -1) {
      let maxUnit = 0;
      colStats.forEach((st, idx) => {
        if (idx > colDesc && st.unitCount > maxUnit) {
          maxUnit = st.unitCount;
          colUnit = idx;
        }
      });
    }

    if (colItem === -1) {
      colStats.forEach((st, idx) => {
        if (idx < colDesc && st.itemPatternCount >= 3 && colItem === -1) colItem = idx;
      });
    }

    // Colunas numéricas após a coluna de Unidade (ou Descrição)
    const afterCol = colUnit !== -1 ? colUnit : colDesc;
    const numericColsAfter: number[] = [];
    colStats.forEach((st, idx) => {
      if (idx > afterCol && st.numberCount >= 2) numericColsAfter.push(idx);
    });

    if (colQty === -1 && numericColsAfter.length >= 1) colQty = numericColsAfter[0];
    if (colUnitPrice === -1 && numericColsAfter.length >= 2) colUnitPrice = numericColsAfter[1];
    if (colTotal === -1 && numericColsAfter.length >= 3) colTotal = numericColsAfter[numericColsAfter.length - 1];
  }

  // Defaults seguros caso a planilha tenha formato mínimo
  if (colDesc === -1) colDesc = 1;
  if (colUnit === -1) colUnit = colDesc + 1;
  if (colQty === -1) colQty = colUnit + 1;
  if (colUnitPrice === -1) colUnitPrice = colQty + 1;
  if (colTotal === -1) colTotal = colUnitPrice + 1;

  // 4. Varredura de 100% das linhas para identificar Etapas, Composições e TOTAL GERAL
  const stages: StageGroup[] = [];
  const compositions: ItemBase[] = [];
  let currentStage: StageGroup | null = null;

  let totalGeralValue = 0;
  let totalGeralLabel = "TOTAL GERAL DO ORÇAMENTO";
  let totalGeralRow = -1;
  let totalSemBdi = 0;
  let detectedBdi = 0;

  for (let r = sampleStart; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue;

    const rowJoined = normalizeText(row.map((c) => String(c || "")).join(" "));

    // Verifica se é linha de TOTAL GERAL / BDI no fechamento
    if (
      rowJoined.includes("total geral") ||
      rowJoined.includes("total do orcamento") ||
      rowJoined.includes("valor total da obra") ||
      rowJoined.includes("preco total") ||
      rowJoined.includes("total com bdi") ||
      (r > rows.length - 25 && (rowJoined.startsWith("total ") || rowJoined.includes(" total ")))
    ) {
      // Pega o maior número positivo nesta linha como o Total
      let maxNumInRow = 0;
      for (let c = 0; c < row.length; c++) {
        const n = parseBrazilianNumber(row[c]);
        if (n > maxNumInRow) maxNumInRow = n;
      }
      if (maxNumInRow > 0) {
        if (rowJoined.includes("sem bdi")) {
          totalSemBdi = maxNumInRow;
        } else if (maxNumInRow >= totalGeralValue) {
          totalGeralValue = maxNumInRow;
          totalGeralRow = r + 1; // 1-based
          const rawLabel = row.find((c) => normalizeText(String(c || "")).includes("total"));
          if (rawLabel) totalGeralLabel = String(rawLabel).trim().toUpperCase();
        }
      }
      continue;
    }

    if (rowJoined.includes("bdi") && !row[colUnit]) {
      for (let c = 0; c < row.length; c++) {
        const n = parseBrazilianNumber(row[c]);
        if (n > 5 && n < 60 && detectedBdi === 0) detectedBdi = n;
      }
    }

    const rawDesc = String(row[colDesc] || "").trim();
    const rawItem = colItem !== -1 ? String(row[colItem] || "").trim() : "";
    const rawCode = colCode !== -1 ? String(row[colCode] || "").trim() : "";
    const rawSource = colSource !== -1 ? String(row[colSource] || "").trim() : "";
    const rawUnit = colUnit !== -1 ? String(row[colUnit] || "").trim() : "";

    const qtyVal = colQty !== -1 ? parseBrazilianNumber(row[colQty]) : 0;
    const priceVal = colUnitPrice !== -1 ? parseBrazilianNumber(row[colUnitPrice]) : 0;
    const priceBdiVal = colUnitPriceBdi !== -1 ? parseBrazilianNumber(row[colUnitPriceBdi]) : 0;
    const totVal = colTotal !== -1 ? parseBrazilianNumber(row[colTotal]) : 0;

    // Ignora se repetir cabeçalho no meio da planilha
    if (normalizeText(rawDesc) === "descricao" || normalizeText(rawDesc).includes("descricao dos servicos")) {
      continue;
    }

    // Verifica se é uma Linha de Etapa / Grupo (ex: tem descrição e número de item como "1", "1.0", "2.0", mas não tem Unidade nem Preço Unitário)
    const hasValidUnit = isLikelyUnit(rawUnit) || (rawUnit.length >= 1 && rawUnit.length <= 6 && priceVal > 0);
    const isStageLine =
      rawDesc.length >= 3 &&
      !hasValidUnit &&
      priceVal === 0 &&
      priceBdiVal === 0 &&
      (rawItem !== "" || rawDesc === rawDesc.toUpperCase() || totVal > 0);

    if (isStageLine) {
      const stageDisc = detectDiscipline(rawDesc, rawDesc);
      currentStage = {
        id: `STG-${stages.length + 1}`,
        itemNumber: rawItem || `${stages.length + 1}.0`,
        title: rawDesc,
        discipline: stageDisc,
        rowIndex: r + 1,
        itemsCount: 0,
        subtotalValue: totVal,
      };
      stages.push(currentStage);
      continue;
    }

    // Verifica se é uma Linha de Composição / Serviço válida
    if (rawDesc.length >= 3 && (hasValidUnit || priceVal > 0 || qtyVal > 0 || rawCode !== "")) {
      const effectivePrice = priceBdiVal > 0 ? priceBdiVal : priceVal;
      const effectiveTotal = totVal > 0 ? totVal : Number((qtyVal * effectivePrice).toFixed(2));
      const disc = detectDiscipline(rawDesc, currentStage?.title);

      // Verifica se a célula de quantidade ou total possui fórmula no Excel
      const totalCellAddress = XLSX.utils.encode_cell({ r, c: colTotal });
      const cellObj = worksheet[totalCellAddress];
      const hasFormula = Boolean(cellObj && cellObj.f);

      const compItem: ItemBase = {
        id: rawCode || rawItem || `L-${r + 1}`,
        itemNumber: rawItem || `${compositions.length + 1}`,
        code: rawCode || rawItem || `COMP-${compositions.length + 1}`,
        source: rawSource || "BASE",
        description: rawDesc,
        unit: normalizeUnit(rawUnit),
        quantity: qtyVal,
        unit_price: effectivePrice,
        unit_price_bdi: priceBdiVal > 0 ? priceBdiVal : undefined,
        total_value: effectiveTotal,
        row_index: r + 1, // 1-based Excel row!
        stage_id: currentStage?.id,
        stage_title: currentStage?.title || "GERAL",
        discipline: disc,
        has_formula: hasFormula,
      };

      compositions.push(compItem);
      if (currentStage) {
        currentStage.itemsCount++;
      }
    }
  }

  const calculatedSum = compositions.reduce((acc, it) => acc + (it.total_value || 0), 0);
  if (totalGeralValue === 0 && calculatedSum > 0) {
    totalGeralValue = Number(calculatedSum.toFixed(2));
  }

  const qtyLetter = XLSX.utils.encode_col(colQty);
  const detectedColumns: DetectedColumns = {
    headerRow: bestHeaderRow + 1,
    colItem: colItem !== -1 ? colItem + 1 : 1,
    colCode: colCode !== -1 ? colCode + 1 : 2,
    colSource: colSource !== -1 ? colSource + 1 : 0,
    colDesc: colDesc + 1,
    colUnit: colUnit + 1,
    colQty: colQty + 1,
    colUnitPrice: colUnitPrice + 1,
    colPrice: colUnitPrice + 1,
    colUnitPriceBdi: colUnitPriceBdi !== -1 ? colUnitPriceBdi + 1 : 0,
    colTotal: colTotal + 1,
    qtyColLetter: qtyLetter,
    colQtyLetter: qtyLetter,
  };

  return {
    fileName,
    fileSize,
    sheetNames,
    selectedSheet,
    selectedSheetName: selectedSheet,
    totalRows,
    totalCols,
    detectedColumns,
    stages,
    compositions,
    items: compositions,
    totalSemBdi: totalSemBdi || calculatedSum,
    bdiPercentage: detectedBdi || 25.5,
    totalGeralValue,
    totalGeralLabel,
    totalGeralRow: totalGeralRow !== -1 ? totalGeralRow : totalRows,
  };
}

// ============================================================================
// 5. MOTOR DE COMPATIBILIZAÇÃO SEMÂNTICA E ALOCAÇÃO DE QUANTITATIVOS
// ============================================================================

const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos", "para", "por",
  "com", "sem", "ou", "e", "a", "o", "as", "os", "um", "uma", "tipo", "inclusive",
  "fornecimento", "instalacao", "execucao", "aplicacao", "manual", "mecanica", "af_",
]);

function extractTokens(text: string): string[] {
  return normalizeText(text)
    .split(/[\s,./()-]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function extractNumbers(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(",", "."));
}

export function calculateItemSimilarity(
  sourceItem: ItemBase,
  contractItem: ItemBase
): { score: number; reason: string } {
  // 1. Código idêntico (ex: ambos têm o mesmo código SINAPI 88489)
  const sCode = (sourceItem.code || "").replace(/\D/g, "");
  const cCode = (contractItem.code || "").replace(/\D/g, "");
  if (sCode.length >= 4 && sCode === cCode) {
    return {
      score: 99,
      reason: `Código de composição idêntico (${sourceItem.code})`,
    };
  }

  const sTokens = extractTokens(sourceItem.description);
  const cTokens = extractTokens(contractItem.description);
  if (sTokens.length === 0 || cTokens.length === 0) {
    return { score: 0, reason: "Sem termos comparáveis" };
  }

  // 2. Compatibilidade de Disciplina / Localização (Pintura, Hidráulica, Elétrica, etc.)
  const sDisc = sourceItem.discipline || detectDiscipline(sourceItem.description, sourceItem.stage_title);
  const cDisc = contractItem.discipline || detectDiscipline(contractItem.description, contractItem.stage_title);

  let disciplineScore = 0;
  if (sDisc !== "GERAL" && cDisc !== "GERAL") {
    if (sDisc === cDisc) {
      disciplineScore = 30; // Mesma disciplina de engenharia!
    } else {
      disciplineScore = -25; // Penaliza misturar disciplinas diferentes (ex: Pintura com Elétrica)
    }
  }

  // 3. Similaridade de Palavras-Chave e Radicais (Stemming em Português)
  let matchedWords = 0;
  let exactImportantMatches = 0;
  const matchedKeywordsList: string[] = [];

  sTokens.forEach((st) => {
    const stemS = st.length > 5 ? st.slice(0, 5) : st;
    const foundExact = cTokens.some((ct) => ct === st);
    const foundStem = !foundExact && st.length >= 4 && cTokens.some((ct) => ct.startsWith(stemS) || st.startsWith(ct.slice(0, 5)));

    if (foundExact) {
      matchedWords += 1.0;
      if (st.length >= 4) {
        exactImportantMatches++;
        if (matchedKeywordsList.length < 3) matchedKeywordsList.push(st);
      }
    } else if (foundStem) {
      matchedWords += 0.75;
      if (matchedKeywordsList.length < 3) matchedKeywordsList.push(st);
    }
  });

  // O primeiro substantivo técnico da descrição geralmente define o serviço (ex: "Pintura", "Tubo", "Cabo", "Concreto", "Alvenaria", "Piso", "Porta")
  const firstTokenMatch = sTokens[0] && cTokens.some((ct) => ct.startsWith(sTokens[0].slice(0, 4)));
  const firstTokenBonus = firstTokenMatch ? 15 : 0;

  const tokenRatio = matchedWords / Math.max(Math.min(sTokens.length, cTokens.length), 2);
  const textScore = Math.min(48, Math.round(tokenRatio * 48));

  // 4. Compatibilidade de Unidade de Medida (M2, M3, M, UN, KG)
  const sUnit = normalizeUnit(sourceItem.unit);
  const cUnit = normalizeUnit(contractItem.unit);
  const unitScore = sUnit === cUnit ? 15 : -5;

  // 5. Compatibilidade de Especificações Numéricas (ex: 25mm, 100mm, 30MPa, 2.5mm)
  const sNums = extractNumbers(sourceItem.description);
  const cNums = extractNumbers(contractItem.description);
  let numScore = 0;
  if (sNums.length > 0 && cNums.length > 0) {
    const commonNums = sNums.filter((n) => cNums.includes(n));
    if (commonNums.length > 0) numScore = 10;
  }

  const rawTotal = Math.max(5, Math.min(99, disciplineScore + textScore + firstTokenBonus + unitScore + numScore));

  const reasons: string[] = [];
  if (sDisc === cDisc && sDisc !== "GERAL") reasons.push(`Setor: ${sDisc}`);
  if (matchedKeywordsList.length > 0) reasons.push(`Termos: ${matchedKeywordsList.join(", ")}`);
  if (sUnit === cUnit) reasons.push(`Unid: ${sUnit}`);

  return {
    score: rawTotal,
    reason: reasons.join(" • ") || "Similaridade textual",
  };
}

/**
 * Executa o cruzamento completo entre a Planilha 1 (origem dos quantitativos)
 * e a Planilha Base do Contrato (destino onde os quantitativos são posicionados),
 * aplicando a estratégia escolhida:
 * - KEEP_QUANTITY: mantém exatamente o quantitativo da Planilha 1.
 * - KEEP_TOTAL_VALUE: após posicionar os quantitativos nas composições correspondentes,
 *   ajusta os quantitativos proporcionalmente para que o valor total final bata exatamente
 *   com o valor total do orçamento da Planilha 1 (ou targetTotalValue).
 */
export function buildCompatibilityMatrix(
  sheet1Items: ItemBase[],
  contractItems: ItemBase[],
  strategy: CalculationStrategy["mode"],
  targetBudgetTotal: number,
  contractBdiPercentage: number = 0
): ContractCompositionMatch[] {
  // Inicializa o mapa de composições da Planilha Base do Contrato
  const allocationMap = new Map<number, {
    allocatedSourceItems: ItemBase[];
    bestScore: number;
    bestReason: string;
  }>();

  contractItems.forEach((_, idx) => {
    allocationMap.set(idx, {
      allocatedSourceItems: [],
      bestScore: 0,
      bestReason: "",
    });
  });

  // PASSO 1: Para cada serviço da Planilha 1 (que tem quantitativo > 0),
  // encontra a melhor composição correspondente na Planilha Base do Contrato!
  sheet1Items.forEach((srcItem) => {
    if ((srcItem.quantity || 0) <= 0) return;

    let bestContractIdx = -1;
    let bestScore = -1;
    let bestReason = "";

    contractItems.forEach((cItem, cIdx) => {
      const { score, reason } = calculateItemSimilarity(srcItem, cItem);
      if (score > bestScore) {
        bestScore = score;
        bestContractIdx = cIdx;
        bestReason = reason;
      }
    });

    if (bestContractIdx !== -1 && bestScore >= 20) {
      const entry = allocationMap.get(bestContractIdx)!;
      entry.allocatedSourceItems.push(srcItem);
      if (bestScore > entry.bestScore) {
        entry.bestScore = bestScore;
        entry.bestReason = bestReason;
      }
    }
  });

  // PASSO 2: Monta a lista de todas as composições do Contrato Base com seus candidatos da Planilha 1
  const preliminaryMatches: ContractCompositionMatch[] = contractItems.map((cItem, cIdx) => {
    const alloc = allocationMap.get(cIdx)!;

    // Lista os top 5 candidatos da Planilha 1 para esta composição (caso o usuário queira trocar manualmente)
    const candidates: MatchCandidate[] = sheet1Items
      .map((sItem) => {
        const { score, reason } = calculateItemSimilarity(sItem, cItem);
        return {
          source_item_id: sItem.id,
          source_item_number: sItem.itemNumber,
          source_description: sItem.description,
          source_unit: sItem.unit,
          source_quantity: sItem.quantity,
          source_unit_price: sItem.unit_price,
          source_total_value: sItem.total_value,
          source_stage: sItem.stage_title,
          source_discipline: sItem.discipline,
          confidence_score: score,
          match_reason: reason,
        };
      })
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 6);

    // Soma os quantitativos dos itens da Planilha 1 alocados nesta composição da Planilha Base
    const baseQty = alloc.allocatedSourceItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
    const hasAllocation = alloc.allocatedSourceItems.length > 0 && baseQty > 0;

    return {
      contract_item: cItem,
      matched_source_items: alloc.allocatedSourceItems,
      best_candidate: hasAllocation
        ? {
            source_item_id: alloc.allocatedSourceItems.map((i) => i.id).join(" + "),
            source_description: alloc.allocatedSourceItems.map((i) => i.description).join(" | "),
            source_unit: alloc.allocatedSourceItems[0].unit,
            source_quantity: baseQty,
            source_unit_price: alloc.allocatedSourceItems[0].unit_price,
            source_total_value: alloc.allocatedSourceItems.reduce((s, i) => s + (i.total_value || 0), 0),
            source_stage: alloc.allocatedSourceItems[0].stage_title,
            source_discipline: alloc.allocatedSourceItems[0].discipline,
            confidence_score: alloc.bestScore,
            match_reason: alloc.bestReason,
          }
        : undefined,
      candidates,
      base_quantity_from_sheet1: Number(baseQty.toFixed(4)),
      final_injected_quantity: Number(baseQty.toFixed(2)),
      contract_unit_price: cItem.unit_price,
      calculated_total_value: Number((baseQty * cItem.unit_price).toFixed(2)),
      confidence_score: hasAllocation ? alloc.bestScore : 0,
      status: hasAllocation ? "MATCHED" : "ZEROED",
    };
  });

  // PASSO 3: Aplicar a estratégia de Quantitativo escolhida pelo usuário
  return applyCalculationStrategyToMatches(preliminaryMatches, strategy, targetBudgetTotal);
}

export function applyCalculationStrategyToMatches(
  matches: ContractCompositionMatch[],
  strategy: CalculationStrategy["mode"],
  targetBudgetTotal: number
): ContractCompositionMatch[] {
  if (strategy === "KEEP_QUANTITY") {
    // Mantém exatamente o quantitativo posicionado da Planilha 1
    return matches.map((m) => {
      const qty = Number(m.base_quantity_from_sheet1.toFixed(2));
      const tot = Number((qty * m.contract_unit_price).toFixed(2));
      return {
        ...m,
        final_injected_quantity: qty,
        calculated_total_value: tot,
        status: qty > 0 ? (m.status === "MANUAL_OVERRIDE" ? "MANUAL_OVERRIDE" : "MATCHED") : "ZEROED",
      };
    });
  }

  // Modo KEEP_TOTAL_VALUE:
  // Ajusta os quantitativos posicionados (aumentando ou diminuindo) para que a soma total
  // na Planilha Base do Contrato bata com o targetBudgetTotal (ex: os R$ 300.000,00 da Planilha 1)!
  const unscaledTotal = matches.reduce(
    (sum, m) => sum + m.base_quantity_from_sheet1 * m.contract_unit_price,
    0
  );

  if (unscaledTotal <= 0 || targetBudgetTotal <= 0) {
    return matches;
  }

  const scaleFactor = targetBudgetTotal / unscaledTotal;

  const adjusted = matches.map((m) => {
    if (m.base_quantity_from_sheet1 <= 0 || m.contract_unit_price <= 0) {
      return {
        ...m,
        final_injected_quantity: 0,
        calculated_total_value: 0,
        status: "ZEROED" as const,
      };
    }

    const scaledQty = Number((m.base_quantity_from_sheet1 * scaleFactor).toFixed(2));
    const finalQty = scaledQty > 0 ? scaledQty : 0.01;
    const calcTot = Number((finalQty * m.contract_unit_price).toFixed(2));

    return {
      ...m,
      final_injected_quantity: finalQty,
      calculated_total_value: calcTot,
      status: (m.status === "MANUAL_OVERRIDE" ? "MANUAL_OVERRIDE" : "MATCHED") as ContractCompositionMatch["status"],
    };
  });

  // Ajuste fino de arredondamento no item de menor preço unitário ou maior valor para chegar o mais próximo possível do alvo
  const currentSum = adjusted.reduce((s, m) => s + m.calculated_total_value, 0);
  const diff = targetBudgetTotal - currentSum;

  const activeIndices = adjusted
    .map((m, idx) => ({ m, idx }))
    .filter((x) => x.m.final_injected_quantity > 0 && x.m.contract_unit_price > 0)
    .sort((a, b) => b.m.calculated_total_value - a.m.calculated_total_value);

  if (activeIndices.length > 0 && Math.abs(diff) > 0.01) {
    const topIdx = activeIndices[0].idx;
    const item = adjusted[topIdx];
    const deltaQty = diff / item.contract_unit_price;
    const newQty = Number((item.final_injected_quantity + deltaQty).toFixed(4));
    if (newQty > 0) {
      adjusted[topIdx] = {
        ...item,
        final_injected_quantity: newQty,
        calculated_total_value: Number((newQty * item.contract_unit_price).toFixed(2)),
      };
    }
  }

  return adjusted;
}

// ============================================================================
// 6. DOWNLOAD INFALÍVEL DO ARQUIVO .XLSX VIA BLOB
// ============================================================================

export function triggerBase64ExcelDownload(base64Data: string, filename: string): void {
  const cleanB64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const binaryString = window.atob(cleanB64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBlobDownload(blob, filename);
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1500);
}

/**
 * Fallback local instantâneo caso o usuário esteja rodando offline ou sem Python local:
 * Clona o workbook original em memória preservando fórmulas e injeta unicamente a coluna de quantitativo.
 */
export function injectQuantitiesClientFallback(
  contractBase64: string | null,
  contractMeta: {
    contractName: string;
    contractNumber: string;
    organization: string;
    referenceBase: string;
    bdiPercent: number;
    budgetSheetName?: string;
    detectedColumns?: DetectedColumns;
  },
  compositionMatches: ContractCompositionMatch[],
  filename: string
): void {
  if (contractBase64 && contractBase64.length > 20) {
    const cleanB64 = contractBase64.includes(",") ? contractBase64.split(",")[1] : contractBase64;
    const wb = XLSX.read(cleanB64, {
      type: "base64",
      cellFormula: true,
      cellStyles: true,
      cellNF: true,
    });

    const sheetName =
      contractMeta.budgetSheetName && wb.SheetNames.includes(contractMeta.budgetSheetName)
        ? contractMeta.budgetSheetName
        : wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const colQtyOneBased = contractMeta.detectedColumns?.colQty || 4;
    const colQtyZeroBased = Math.max(0, colQtyOneBased - 1);

    compositionMatches.forEach((cm) => {
      const rowOneBased = cm.contract_item.row_index;
      if (rowOneBased && rowOneBased > 0) {
        const cellAddr = XLSX.utils.encode_cell({ r: rowOneBased - 1, c: colQtyZeroBased });
        const existingCell = ws[cellAddr] || { t: "n", v: 0 };
        ws[cellAddr] = {
          ...existingCell,
          t: "n",
          v: Number(cm.final_injected_quantity.toFixed(4)),
        };
        delete ws[cellAddr].f;
        delete ws[cellAddr].w;
      }
    });

    const outBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([outBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    triggerBlobDownload(blob, filename);
    return;
  }

  // Caso não haja binário prévio (ex: contrato demonstrativo inicial)
  const wb = XLSX.utils.book_new();
  const rows: (string | number)[][] = [
    [`PLANILHA ORÇAMENTÁRIA COMPATIBILIZADA — ${contractMeta.contractName}`],
    [
      `Nº Contrato: ${contractMeta.contractNumber} | Órgão/Cliente: ${contractMeta.organization} | Base: ${contractMeta.referenceBase} | BDI: ${contractMeta.bdiPercent}%`,
    ],
    [],
    ["ITEM", "CÓDIGO", "FONTE", "DESCRIÇÃO DA COMPOSIÇÃO / SERVIÇO", "UNID.", "QUANTITATIVO", "PREÇO UNIT. (R$)", "VALOR TOTAL (R$)"],
  ];

  compositionMatches.forEach((cm, idx) => {
    const c = cm.contract_item;
    rows.push([
      c.itemNumber || `${idx + 1}.0`,
      c.code,
      c.source || contractMeta.referenceBase,
      c.description,
      c.unit,
      Number(cm.final_injected_quantity.toFixed(4)),
      Number(cm.contract_unit_price.toFixed(2)),
      Number(cm.calculated_total_value.toFixed(2)),
    ]);
  });

  const grandTotal = compositionMatches.reduce((s, m) => s + m.calculated_total_value, 0);
  rows.push(["", "", "", "TOTAL GERAL DO ORÇAMENTO COMPATIBILIZADO", "", "", "", Number(grandTotal.toFixed(2))]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Orçamento Compatibilizado");
  const outBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([outBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBlobDownload(blob, filename);
}

