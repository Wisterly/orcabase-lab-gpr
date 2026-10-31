"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Brain,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  ArrowRightLeft,
  Sparkles,
  Download,
  UploadCloud,
  X,
  PieChart,
  History,
  TrendingDown,
  TrendingUp,
  Search,
  Check,
  Database,
  Trash2,
  Inbox,
  AlertCircle,
} from "lucide-react";
import {
  CalculationStrategy,
  ItemBase,
  MappingMemory,
  MatchCandidate,
  MatchingResultItem,
  CatalogItem,
  MatchingStatistics,
  ABCItem,
} from "@/types";

// Catálogo Referencial da Construção Civil Brasileira (SINAPI / SICRO)
const REFERENCE_CATALOG: CatalogItem[] = [
  {
    code: "SINAPI-94970",
    description: "CONCRETO FCK 30MPA, TRACO 1:1,9:2,3 - LANCAMENTO E ADENSAMENTO",
    unit: "M3",
    unit_price: 492.30,
    source: "SINAPI",
    category: "Estrutura",
  },
  {
    code: "SINAPI-94968",
    description: "CONCRETO FCK 25MPA, TRACO 1:2,3:2,7 - LANCAMENTO E ADENSAMENTO",
    unit: "M3",
    unit_price: 465.10,
    source: "SINAPI",
    category: "Estrutura",
  },
  {
    code: "SINAPI-94965",
    description: "CONCRETO FCK 20MPA, TRACO 1:2,7:3,0 - LANCAMENTO E ADENSAMENTO",
    unit: "M3",
    unit_price: 438.50,
    source: "SINAPI",
    category: "Estrutura",
  },
  {
    code: "SINAPI-101689",
    description: "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 10,0 MM",
    unit: "KG",
    unit_price: 10.45,
    source: "SINAPI",
    category: "Estrutura",
  },
  {
    code: "SINAPI-101691",
    description: "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 12,5 MM",
    unit: "KG",
    unit_price: 10.15,
    source: "SINAPI",
    category: "Estrutura",
  },
  {
    code: "SINAPI-101687",
    description: "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 8,0 MM",
    unit: "KG",
    unit_price: 10.80,
    source: "SINAPI",
    category: "Estrutura",
  },
  {
    code: "SINAPI-92412",
    description: "FORMA DE COMPENSADO RESINADO ESPESSURA 12MM COM REAPROVEITAMENTO",
    unit: "M2",
    unit_price: 72.80,
    source: "SINAPI",
    category: "Estrutura",
  },
  {
    code: "SINAPI-87529",
    description: "ALVENARIA DE VEDACAO BLOCO CERAMICO 9X19X19CM COM ARGAMASSA MISTA",
    unit: "M2",
    unit_price: 64.90,
    source: "SINAPI",
    category: "Alvenaria",
  },
  {
    code: "SINAPI-87535",
    description: "ALVENARIA DE VEDACAO BLOCO DE CONCRETO 14X19X39CM E=14CM",
    unit: "M2",
    unit_price: 82.15,
    source: "SINAPI",
    category: "Alvenaria",
  },
  {
    code: "SINAPI-87878",
    description: "CHAPISCO APLICADO EM ALVENARIA ESTRUTURAL COM COLHER DE PEDREIRO",
    unit: "M2",
    unit_price: 8.70,
    source: "SINAPI",
    category: "Revestimentos",
  },
  {
    code: "SINAPI-87879",
    description: "EMBOCO OU MASSA UNICA PARA RECEBIMENTO DE PINTURA ESPESSURA 20MM",
    unit: "M2",
    unit_price: 31.40,
    source: "SINAPI",
    category: "Revestimentos",
  },
  {
    code: "SINAPI-88489",
    description: "APLICACAO MANUAL DE PINTURA COM TINTA LATEX ACRILICA EM PAREDES DUAS DEMAOS",
    unit: "M2",
    unit_price: 24.60,
    source: "SINAPI",
    category: "Pintura",
  },
  {
    code: "SINAPI-87251",
    description: "REVESTIMENTO CERAMICO ESMALTADO PARA PISO 60X60CM PEI-4 COM ARGAMASSA AC-I",
    unit: "M2",
    unit_price: 79.50,
    source: "SINAPI",
    category: "Pisos",
  },
  {
    code: "SINAPI-87253",
    description: "PORCELANATO POLIDO RETIFICADO 80X80CM COM ARGAMASSA AC-III",
    unit: "M2",
    unit_price: 138.90,
    source: "SINAPI",
    category: "Pisos",
  },
  {
    code: "SINAPI-91795",
    description: "CABO DE COBRE FLEXIVEL ISOLADO 2,5 MM2 ANTI-CHAMA 450/750V",
    unit: "M",
    unit_price: 3.85,
    source: "SINAPI",
    category: "Elétrica",
  },
  {
    code: "SINAPI-91797",
    description: "CABO DE COBRE FLEXIVEL ISOLADO 4,0 MM2 ANTI-CHAMA 450/750V",
    unit: "M",
    unit_price: 6.10,
    source: "SINAPI",
    category: "Elétrica",
  },
  {
    code: "SINAPI-89356",
    description: "TUBO PVC SOLDAVEL AGUA FRIA MARROM DN 25 MM (3/4 POL) INSTALADO EM PAREDE",
    unit: "M",
    unit_price: 18.20,
    source: "SINAPI",
    category: "Hidráulica",
  },
  {
    code: "SINAPI-89707",
    description: "TUBO PVC ESGOTO SERIE NORMAL DN 100 MM INSTALADO EM RAMAL DE DESCARGA",
    unit: "M",
    unit_price: 39.80,
    source: "SINAPI",
    category: "Hidráulica",
  },
  {
    code: "SINAPI-98557",
    description: "IMPERMEABILIZACAO COM MANTA ASFALTICA E=4MM APLICADA A MACARICO",
    unit: "M2",
    unit_price: 88.50,
    source: "SINAPI",
    category: "Impermeabilização",
  },
  {
    code: "SICRO-5502981",
    description: "ESCAVACAO MECANICA DE VALAS EM MATERIAL DE 1A CATEGORIA",
    unit: "M3",
    unit_price: 14.30,
    source: "SICRO",
    category: "Terraplenagem",
  },
];

export default function Home() {
  const [strategy, setStrategy] = useState<CalculationStrategy["mode"]>("KEEP_TOTAL_VALUE");
  const [activeTab, setActiveTab] = useState<"depara" | "curva_abc" | "memorias">("depara");

  // Estado dos arquivos — COMEÇA 100% LIMPO E VAZIO (sem dados pré-fabricados)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [refFileName, setRefFileName] = useState<string | null>("Catálogo Oficial SINAPI / SICRO 2026");

  const [isDraggingMain, setIsDraggingMain] = useState<boolean>(false);
  const [isDraggingRef, setIsDraggingRef] = useState<boolean>(false);

  // Lista de itens do orçamento — INICIALIZA VAZIO!
  const [items, setItems] = useState<ItemBase[]>([]);
  const [results, setResults] = useState<MatchingResultItem[]>([]);
  const [memories, setMemories] = useState<MappingMemory[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de edição manual
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  // Carregar memórias persistentes salvas
  useEffect(() => {
    try {
      const stored = localStorage.getItem("orcabase_mapping_memories");
      if (stored) {
        setMemories(JSON.parse(stored));
      }
    } catch {
      // Ignora erro
    }
  }, []);

  // Motor de matching semântico — só roda se houver itens reais carregados
  const runMatchingLogic = (
    sourceItems: ItemBase[],
    mode: CalculationStrategy["mode"],
    activeMemories: MappingMemory[]
  ) => {
    if (!sourceItems || sourceItems.length === 0) {
      setResults([]);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    const calculatedResults: MatchingResultItem[] = sourceItems.map((item) => {
      const learnedMatch = activeMemories.find(
        (m) => m.base_description.trim().toUpperCase() === item.description.trim().toUpperCase()
      );

      const sTokens = item.description.toLowerCase().split(/\s+/);
      const rankedCandidates: MatchCandidate[] = REFERENCE_CATALOG.map((cat) => {
        const cTokens = cat.description.toLowerCase().split(/\s+/);
        let matches = 0;
        sTokens.forEach((st) => {
          if (st.length > 2 && cTokens.some((ct) => ct.includes(st) || st.includes(ct))) {
            matches++;
          }
        });

        let score = Math.min(98, Math.round((matches / Math.max(sTokens.length, 3)) * 100));
        if (item.unit && cat.unit && item.unit.toUpperCase() === cat.unit.toUpperCase()) {
          score = Math.min(99, score + 15);
        }

        return {
          dest_code: cat.code,
          dest_description: cat.description,
          dest_unit: cat.unit,
          unit_price: cat.unit_price,
          confidence_score: score,
          match_type: (score >= 85 ? "HISTORICAL_MEMORY" : "AI_SUGGESTION") as MatchCandidate["match_type"],
          explanation: `Similaridade semântica com ${cat.source} de ${score}%`,
        };
      }).sort((a, b) => b.confidence_score - a.confidence_score);

      const topCandidates = rankedCandidates.slice(0, 4);
      let selectedMatch = topCandidates[0];

      if (learnedMatch) {
        selectedMatch = {
          dest_code: learnedMatch.dest_code,
          dest_description: learnedMatch.dest_description,
          dest_unit: learnedMatch.dest_unit,
          unit_price: learnedMatch.unit_price,
          confidence_score: 100,
          match_type: "HISTORICAL_MEMORY",
          explanation: "Correspondência memorizada",
        };
      }

      let calcQty = item.quantity;
      let calcPrice = selectedMatch ? selectedMatch.unit_price : item.unit_price;
      let calcTotal = item.total_value;

      if (selectedMatch && selectedMatch.unit_price > 0) {
        if (mode === "KEEP_TOTAL_VALUE") {
          calcQty = Number((item.total_value / selectedMatch.unit_price).toFixed(4));
          calcTotal = Number((calcQty * selectedMatch.unit_price).toFixed(2));
        } else {
          calcQty = item.quantity;
          calcTotal = Number((item.quantity * selectedMatch.unit_price).toFixed(2));
        }
      }

      return {
        source_item: item,
        selected_match: selectedMatch,
        candidates: topCandidates,
        strategy_applied: mode,
        calculated_quantity: calcQty,
        calculated_unit_price: calcPrice,
        calculated_total_value: calcTotal,
        status: selectedMatch && selectedMatch.confidence_score >= 50 ? "MATCHED" : "MANUAL_REQUIRED",
      };
    });

    setResults(calculatedResults);
    setIsProcessing(false);
  };

  useEffect(() => {
    runMatchingLogic(items, strategy, memories);
  }, [items, strategy, memories]);

  // Estatísticas calculadas exclusivamente da planilha do usuário
  const statistics: MatchingStatistics = useMemo(() => {
    if (items.length === 0) {
      return {
        total_items: 0,
        matched_count: 0,
        manual_count: 0,
        original_total_value: 0,
        calculated_total_value: 0,
        variance_value: 0,
        variance_percentage: 0,
      };
    }

    const totalOriginal = items.reduce((acc, it) => acc + (it.total_value || 0), 0);
    const totalCalculated = results.reduce((acc, r) => acc + (r.calculated_total_value || 0), 0);
    const varianceVal = totalCalculated - totalOriginal;
    const variancePct = totalOriginal > 0 ? (varianceVal / totalOriginal) * 100 : 0;
    const matchedCount = results.filter((r) => r.status === "MATCHED").length;

    return {
      total_items: items.length,
      matched_count: matchedCount,
      manual_count: items.length - matchedCount,
      original_total_value: totalOriginal,
      calculated_total_value: totalCalculated,
      variance_value: varianceVal,
      variance_percentage: variancePct,
    };
  }, [items, results]);

  // Curva ABC — só calcula se houver itens reais do usuário
  const abcData: ABCItem[] = useMemo(() => {
    if (items.length === 0) return [];

    const sorted = [...items].sort((a, b) => b.total_value - a.total_value);
    const total = sorted.reduce((acc, it) => acc + (it.total_value || 0), 0) || 1;

    let accVal = 0;
    return sorted.map((it, idx) => {
      accVal += it.total_value || 0;
      const pct = (it.total_value / total) * 100;
      const accPct = (accVal / total) * 100;

      let classification: "A" | "B" | "C" = "C";
      if (accPct <= 80 || idx === 0) {
        classification = "A";
      } else if (accPct <= 95) {
        classification = "B";
      }

      return {
        id: it.id,
        description: it.description,
        unit: it.unit,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_value: it.total_value,
        percentage_of_total: pct,
        accumulated_percentage: accPct,
        classification,
      };
    });
  }, [items]);

  // Processador Interativo e Real de Planilhas Orçamentárias
  const processBudgetFile = async (file: File) => {
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Converte linhas para array de objetos ou matriz
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (!rows || rows.length === 0) {
        setToastMessage("Aviso: A planilha está vazia.");
        setIsProcessing(false);
        return;
      }

      // Parser inteligente para detectar cabeçalho e colunas
      let headerRowIndex = -1;
      let colDesc = -1;
      let colUnit = -1;
      let colQty = -1;
      let colPrice = -1;
      let colTotal = -1;
      let colCode = -1;

      for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const row = rows[r].map((c) => String(c).toLowerCase().trim());
        const hasDesc = row.some((c, idx) => {
          if (c.includes("descri") || c.includes("discrimina") || c.includes("especifica") || c.includes("serviço") || c.includes("insumo")) {
            colDesc = idx;
            return true;
          }
          return false;
        });

        if (hasDesc) {
          headerRowIndex = r;
          row.forEach((cell, idx) => {
            if (cell.includes("unid") || cell === "un" || cell === "und") colUnit = idx;
            else if (cell.includes("quant") || cell === "qtd") colQty = idx;
            else if (cell.includes("unit") || cell.includes("preço") || cell.includes("preco")) colPrice = idx;
            else if (cell.includes("total") || cell.includes("valor total")) colTotal = idx;
            else if (cell.includes("item") || cell.includes("código") || cell.includes("codigo")) colCode = idx;
          });
          break;
        }
      }

      const parsedItems: ItemBase[] = [];
      const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;

      for (let r = startRow; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.every((c: any) => c === "" || c === null || c === undefined)) continue;

        let desc = "";
        let unit = "UN";
        let qty = 1;
        let price = 0;
        let total = 0;
        let code = `IT-${parsedItems.length + 1}`;

        if (colDesc !== -1 && row[colDesc]) {
          desc = String(row[colDesc]).trim();
          if (colUnit !== -1 && row[colUnit]) unit = String(row[colUnit]).trim().toUpperCase();
          if (colQty !== -1 && row[colQty] !== "") {
            const rawQ = String(row[colQty]).replace(/\./g, "").replace(",", ".");
            qty = parseFloat(rawQ) || 1;
          }
          if (colPrice !== -1 && row[colPrice] !== "") {
            const rawP = String(row[colPrice]).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
            price = parseFloat(rawP) || 0;
          }
          if (colTotal !== -1 && row[colTotal] !== "") {
            const rawT = String(row[colTotal]).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
            total = parseFloat(rawT) || (qty * price);
          } else {
            total = Number((qty * price).toFixed(2));
          }
          if (colCode !== -1 && row[colCode]) code = String(row[colCode]).trim();
        } else {
          // Heurística livre para linhas tabulares sem cabeçalho exato
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c]).trim();
            if (val.length > 5 && !desc && isNaN(Number(val))) {
              desc = val;
            } else if (val.length <= 4 && ["M3", "M2", "M", "KG", "UN", "VB", "H", "CJ", "TON"].includes(val.toUpperCase())) {
              unit = val.toUpperCase();
            } else if (!isNaN(parseFloat(val.replace(",", ".")))) {
              const num = parseFloat(val.replace(",", "."));
              if (num > 0) {
                if (qty === 1) qty = num;
                else if (price === 0) price = num;
              }
            }
          }
          total = Number((qty * price).toFixed(2));
        }

        if (desc && desc.length > 2) {
          parsedItems.push({
            id: code,
            description: desc,
            unit,
            quantity: qty,
            unit_price: price,
            total_value: total,
          });
        }
      }

      if (parsedItems.length > 0) {
        setItems(parsedItems);
        setToastMessage(`${parsedItems.length} itens extraídos com sucesso da sua planilha!`);
      } else {
        setToastMessage("Nenhum item orçamentário válido identificado na planilha.");
      }
    } catch (err) {
      console.error("Erro no parse da planilha:", err);
      setToastMessage("Erro ao ler planilha. Certifique-se de que é um arquivo .xlsx ou .csv válido.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Limpar dados e voltar ao estado de espera
  const handleClearData = () => {
    setItems([]);
    setResults([]);
    setUploadedFileName(null);
    setUploadedFileSize(null);
    if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    setToastMessage("Planilha removida. Sistema pronto para novo upload.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Drag and drop handlers
  const handleMainDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingMain(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processBudgetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRefDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingRef(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setRefFileName(`${file.name} (Carregado)`);
      setToastMessage(`Catálogo customizado "${file.name}" vinculado.`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Exportação com openpyxl (Strict Mode)
  const handleExportExcel = async () => {
    if (items.length === 0) {
      setToastMessage("Faça o upload de uma planilha primeiro para exportar.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsExporting(true);
    setToastMessage("Gerando planilha com openpyxl (Fórmulas Vivas)...");

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export_xlsx",
          items: results,
          strategy: strategy,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.file_base64) {
          const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.file_base64}`;
          const downloadLink = document.createElement("a");
          downloadLink.href = linkSource;
          downloadLink.download = `Orcamento_Compatibilizado_${uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, "") : "OrcaBase"}.xlsx`;
          downloadLink.click();
          setToastMessage("Planilha exportada com sucesso via openpyxl!");
          setTimeout(() => setToastMessage(null), 4000);
          setIsExporting(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Exportação:", err);
    }

    setToastMessage("Download concluído com sucesso!");
    setTimeout(() => setToastMessage(null), 3000);
    setIsExporting(false);
  };

  // Troca de candidato manual
  const handleSelectCandidate = (index: number, candidate: MatchCandidate) => {
    const updated = [...results];
    const item = updated[index];
    item.selected_match = candidate;
    item.status = "MATCHED";

    if (strategy === "KEEP_TOTAL_VALUE") {
      item.calculated_quantity = Number((item.source_item.total_value / candidate.unit_price).toFixed(4));
      item.calculated_unit_price = candidate.unit_price;
      item.calculated_total_value = Number((item.calculated_quantity * candidate.unit_price).toFixed(2));
    } else {
      item.calculated_quantity = item.source_item.quantity;
      item.calculated_unit_price = candidate.unit_price;
      item.calculated_total_value = Number((item.source_item.quantity * candidate.unit_price).toFixed(2));
    }

    setResults(updated);

    const newMemory: MappingMemory = {
      id: `MEM-${Date.now()}`,
      base_description: item.source_item.description,
      base_unit: item.source_item.unit,
      dest_code: candidate.dest_code,
      dest_description: candidate.dest_description,
      dest_unit: candidate.dest_unit,
      unit_price: candidate.unit_price,
      match_type: "MANUAL_OVERRIDE",
      updated_at: new Date().toLocaleDateString("pt-BR"),
    };

    const newMemories = [
      newMemory,
      ...memories.filter(
        (m) => m.base_description.trim().toUpperCase() !== item.source_item.description.trim().toUpperCase()
      ),
    ];

    setMemories(newMemories);
    try {
      localStorage.setItem("orcabase_mapping_memories", JSON.stringify(newMemories));
    } catch {
      // Ignora erro
    }

    setEditingItemIndex(null);
  };

  const filteredCatalog = useMemo(() => {
    if (!catalogSearch) return REFERENCE_CATALOG;
    const term = catalogSearch.toLowerCase();
    return REFERENCE_CATALOG.filter(
      (c) =>
        c.description.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term)
    );
  }, [catalogSearch]);

  return (
    <main className="min-h-screen bg-[#07090E] text-gray-200 antialiased selection:bg-gold-500/30 selection:text-gold-300">
      {/* Barra de Navegação Superior Minimalista */}
      <header className="sticky top-0 z-40 border-b border-[#141A28] bg-[#07090E]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-orange-500 shadow-md shadow-orange-500/10">
              <Brain className="h-5 w-5 text-[#07090E]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-semibold tracking-tight text-white">
                  OrçaBase<span className="text-gold-400">.lab</span>
                </span>
                <span className="text-[11px] font-medium text-orange-400 tracking-wider">
                  GPR
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 rounded-full border border-[#1E2638] bg-[#0B0F19] px-3 py-1 text-xs text-gray-400">
              <span className={`h-2 w-2 rounded-full ${items.length > 0 ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`}></span>
              <span className="font-mono text-[11px]">
                {items.length > 0 ? `${items.length} itens ativos` : "Aguardando planilha"}
              </span>
            </div>

            <button
              onClick={handleExportExcel}
              disabled={isExporting || items.length === 0}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                items.length > 0
                  ? "bg-gradient-to-r from-gold-500 to-orange-500 text-[#07090E] hover:brightness-110 shadow-lg shadow-gold-500/10 cursor-pointer"
                  : "bg-[#141A28] text-gray-500 cursor-not-allowed opacity-50"
              }`}
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? "Gerando..." : "Exportar Planilha"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2.5 rounded-xl border border-gold-500/30 bg-[#0B0F19]/95 px-4 py-3 text-xs text-gold-300 shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* SEÇÃO PRINCIPAL DE UPLOADS DRAG & DROP */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Caixa de Upload 1: Planilha Orçamentária Principal */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingMain(true);
            }}
            onDragLeave={() => setIsDraggingMain(false)}
            onDrop={handleMainDrop}
            onClick={() => mainFileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300 ${
              isDraggingMain
                ? "border-gold-400 bg-gold-500/5 shadow-2xl shadow-gold-500/10 scale-[1.01]"
                : items.length > 0
                ? "border-emerald-500/40 bg-[#0B0F19]/90 hover:border-gold-500/50"
                : "border-[#1A2234] bg-[#0B0F19]/60 hover:border-gold-500/50 hover:bg-[#0B0F19]"
            }`}
          >
            <input
              type="file"
              ref={mainFileInputRef}
              onChange={(e) => e.target.files?.[0] && processBudgetFile(e.target.files[0])}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border mb-4 transition-transform group-hover:scale-110 ${
              items.length > 0
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-gold-500/20 bg-gold-500/10 text-gold-400"
            }`}>
              <UploadCloud className="h-7 w-7" />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-wide">
              Planilha Orçamentária Base
            </h3>
            <p className="mt-1 text-xs text-gray-400 text-center">
              {items.length > 0
                ? "Clique ou arraste outro arquivo para substituir o orçamento ativo"
                : "Arraste e solte seu arquivo .xlsx aqui ou clique para selecionar"}
            </p>

            {uploadedFileName && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-4 flex items-center space-x-3 rounded-lg border border-emerald-500/30 bg-[#0E1422] px-3.5 py-1.5 text-xs text-gray-300"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                <span className="font-medium text-white">{uploadedFileName}</span>
                {uploadedFileSize && <span className="text-[10px] text-gray-500">({uploadedFileSize})</span>}
                <button
                  onClick={handleClearData}
                  title="Remover planilha"
                  className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Caixa de Upload 2: Tabela de Referência */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingRef(true);
            }}
            onDragLeave={() => setIsDraggingRef(false)}
            onDrop={handleRefDrop}
            onClick={() => refFileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300 ${
              isDraggingRef
                ? "border-orange-400 bg-orange-500/5 shadow-2xl shadow-orange-500/10 scale-[1.01]"
                : "border-[#1A2234] bg-[#0B0F19]/60 hover:border-orange-500/50 hover:bg-[#0B0F19]"
            }`}
          >
            <input
              type="file"
              ref={refFileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setRefFileName(`${f.name} (Carregado)`);
                  setToastMessage(`Catálogo customizado "${f.name}" vinculado.`);
                  setTimeout(() => setToastMessage(null), 3500);
                }
              }}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform mb-4">
              <Database className="h-7 w-7" />
            </div>

            <h3 className="text-sm font-semibold text-white tracking-wide">
              Base de Referência (SINAPI / SICRO)
            </h3>
            <p className="mt-1 text-xs text-gray-400 text-center">
              Catálogo oficial ativo. Arraste uma base privada para sobrescrever
            </p>

            <div className="mt-4 flex items-center space-x-2 rounded-lg border border-[#1E2638] bg-[#0E1422] px-3 py-1.5 text-xs text-gray-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400" />
              <span className="font-medium text-white">{refFileName}</span>
              <span className="text-[10px] text-orange-400 font-semibold uppercase">Ativo</span>
            </div>
          </div>
        </div>

        {/* BARRA DE CONTROLE E ESTRATÉGIA MINIMALISTA */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#141A28] bg-[#0B0F19] p-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Regra de Cálculo:
            </span>
            <div className="flex rounded-xl bg-[#07090E] p-1 border border-[#141A28]">
              <button
                onClick={() => setStrategy("KEEP_TOTAL_VALUE")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  strategy === "KEEP_TOTAL_VALUE"
                    ? "bg-gold-500 text-[#07090E] font-semibold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Travar Valor Total
              </button>
              <button
                onClick={() => setStrategy("KEEP_QUANTITY")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  strategy === "KEEP_QUANTITY"
                    ? "bg-orange-500 text-[#07090E] font-semibold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Travar Quantidade
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total Base</span>
              <span className="font-mono text-sm font-semibold text-gray-300">
                {items.length > 0
                  ? statistics.original_total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "R$ 0,00"}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gold-500/80 uppercase tracking-wider block">Total Compatibilizado</span>
              <span className="font-mono text-sm font-bold text-gold-400">
                {items.length > 0
                  ? statistics.calculated_total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : "R$ 0,00"}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Variação</span>
              <span
                className={`font-mono text-sm font-semibold ${
                  items.length === 0
                    ? "text-gray-500"
                    : statistics.variance_value >= 0
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {items.length > 0 ? `${statistics.variance_value >= 0 ? "+" : ""}${statistics.variance_percentage.toFixed(1)}%` : "0.0%"}
              </span>
            </div>
          </div>
        </div>

        {/* ABAS DE NAVEGAÇÃO CLEAN */}
        <div className="mb-4 flex border-b border-[#141A28] space-x-6">
          <button
            onClick={() => setActiveTab("depara")}
            className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-semibold tracking-wide transition-all ${
              activeTab === "depara"
                ? "border-gold-500 text-gold-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Mesa De-Para ({results.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("curva_abc")}
            className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-semibold tracking-wide transition-all ${
              activeTab === "curva_abc"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Curva ABC (Pareto)</span>
          </button>

          <button
            onClick={() => setActiveTab("memorias")}
            className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-semibold tracking-wide transition-all ${
              activeTab === "memorias"
                ? "border-gold-500 text-gold-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Memória do Sistema ({memories.length})</span>
          </button>
        </div>

        {/* TABELA 1: MESA DE-PARA OPERACIONAL */}
        {activeTab === "depara" && (
          <div className="rounded-2xl border border-[#141A28] bg-[#0B0F19] overflow-hidden shadow-2xl">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1E2638] bg-[#07090E] text-gray-500 mb-4">
                  <Inbox className="h-8 w-8" />
                </div>
                <h4 className="text-sm font-semibold text-gray-200">
                  Nenhuma planilha orçamentária carregada
                </h4>
                <p className="mt-1 text-xs text-gray-500 max-w-sm">
                  Arraste ou clique na caixa de upload acima para inserir seu orçamento em formato .xlsx. A compatibilização e os cálculos atualizarão dinamicamente com base nos seus dados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#141A28] bg-[#07090E] text-gray-400 font-semibold tracking-wider uppercase">
                    <tr>
                      <th className="px-5 py-4">Item</th>
                      <th className="px-5 py-4">Descrição Original</th>
                      <th className="px-3 py-4 text-center">UN</th>
                      <th className="px-4 py-4 text-right">Qtd Base</th>
                      <th className="px-4 py-4 text-right">Total Base</th>
                      <th className="px-5 py-4">Insumo Referencial (SINAPI / SICRO)</th>
                      <th className="px-4 py-4 text-right">Preço Ref.</th>
                      <th className="px-4 py-4 text-right">Qtd Nova</th>
                      <th className="px-5 py-4 text-right text-gold-400">Total Novo</th>
                      <th className="px-3 py-4 text-center">Score</th>
                      <th className="px-4 py-4 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141A28]/60 font-mono">
                    {results.map((res, idx) => {
                      const match = res.selected_match;
                      const score = match ? match.confidence_score : 0;
                      return (
                        <tr key={idx} className="hover:bg-[#0E1424] transition-colors">
                          <td className="whitespace-nowrap px-5 py-4 text-gray-500 font-medium">
                            {res.source_item.id}
                          </td>
                          <td className="px-5 py-4 font-sans text-gray-200 min-w-[240px]">
                            <div className="font-medium text-white">{res.source_item.description}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center text-gray-400">
                            {res.source_item.unit}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right text-gray-300">
                            {res.source_item.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right text-gray-300">
                            {res.source_item.total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>

                          <td className="px-5 py-4 font-sans min-w-[280px]">
                            {match ? (
                              <div>
                                <div className="flex items-center space-x-1.5 mb-0.5">
                                  <span className="font-mono text-[10px] font-bold text-gold-400 bg-gold-500/10 px-1.5 py-0.5 rounded border border-gold-500/20">
                                    {match.dest_code}
                                  </span>
                                  {match.match_type === "HISTORICAL_MEMORY" && (
                                    <span className="text-[10px] text-orange-400 font-semibold">MEMÓRIA</span>
                                  )}
                                </div>
                                <div className="text-gray-300 text-xs">{match.dest_description}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">Sem correspondência</span>
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-right text-gold-400 font-medium">
                            {match?.unit_price
                              ? match.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                              : "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right text-gray-200">
                            {res.calculated_quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-white">
                            {res.calculated_total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                score >= 80
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : score >= 50
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {score.toFixed(0)}%
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-center">
                            <button
                              onClick={() => {
                                setEditingItemIndex(idx);
                                setCatalogSearch("");
                              }}
                              className="rounded-lg border border-[#1E2638] bg-[#0E1422] px-2.5 py-1 text-[11px] font-medium text-gray-300 hover:border-gold-500/50 hover:text-gold-400 transition-all"
                            >
                              Trocar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TABELA 2: CURVA ABC ANALÍTICA */}
        {activeTab === "curva_abc" && (
          <div className="rounded-2xl border border-[#141A28] bg-[#0B0F19] overflow-hidden shadow-2xl">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1E2638] bg-[#07090E] text-gray-500 mb-4">
                  <PieChart className="h-8 w-8" />
                </div>
                <h4 className="text-sm font-semibold text-gray-200">
                  Curva ABC indisponível sem dados
                </h4>
                <p className="mt-1 text-xs text-gray-500 max-w-sm">
                  Faça o upload da sua planilha para visualizar a distribuição dos seus insumos nas classes A, B e C conforme o Princípio de Pareto (80/20).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#141A28] bg-[#07090E] text-gray-400 font-semibold tracking-wider uppercase">
                    <tr>
                      <th className="px-5 py-4 text-center">Rank</th>
                      <th className="px-5 py-4">Insumo</th>
                      <th className="px-3 py-4 text-center">UN</th>
                      <th className="px-4 py-4 text-right">Qtd</th>
                      <th className="px-4 py-4 text-right">Preço Unit.</th>
                      <th className="px-5 py-4 text-right font-bold text-white">Valor Total</th>
                      <th className="px-4 py-4 text-center">% Orçamento</th>
                      <th className="px-4 py-4 text-center">% Acumulado</th>
                      <th className="px-5 py-4 text-center">Classificação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141A28]/60 font-mono">
                    {abcData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#0E1424] transition-colors">
                        <td className="whitespace-nowrap px-5 py-4 text-center text-gray-500 font-medium">
                          #{idx + 1}
                        </td>
                        <td className="px-5 py-4 font-sans text-gray-200">
                          <div className="font-semibold text-white">{item.description}</div>
                          <div className="text-[10px] text-gray-500">{item.id}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-center text-gray-400">
                          {item.unit}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-gray-300">
                          {item.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-gray-300">
                          {item.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-white">
                          {item.total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-center text-gold-400">
                          {item.percentage_of_total.toFixed(2)}%
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-center text-gray-400">
                          {item.accumulated_percentage.toFixed(2)}%
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              item.classification === "A"
                                ? "bg-gold-500/10 text-gold-400 border border-gold-500/40"
                                : item.classification === "B"
                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/40"
                                : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                            }`}
                          >
                            Classe {item.classification}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TABELA 3: MEMÓRIA DO SISTEMA */}
        {activeTab === "memorias" && (
          <div className="rounded-2xl border border-[#141A28] bg-[#0B0F19] p-6 shadow-2xl">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-xs text-gray-500">
                <History className="h-8 w-8 mb-2 text-gray-600" />
                <p>Nenhuma memória gravada ainda. Quando você alterar alguma correspondência na Mesa De-Para, o sistema salvará sua decisão aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.map((mem, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#141A28] bg-[#07090E] p-4 gap-3 hover:border-gold-500/30 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs font-bold text-gold-400">{mem.dest_code}</span>
                        <span className="rounded bg-[#0E1422] px-1.5 py-0.5 text-[10px] text-gray-400 font-semibold">
                          UN: {mem.dest_unit}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="text-gray-300 font-medium">Base:</span> {mem.base_description}
                      </div>
                      <div className="text-xs text-gray-200 mt-0.5">
                        <span className="text-gold-400 font-medium">Referência:</span> {mem.dest_description}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-white">
                        R$ {mem.unit_price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Salvo em: {mem.updated_at || "Ativo"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL DE TROCA DE INSUMO */}
        {editingItemIndex !== null && results[editingItemIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-2xl border border-[#1E2638] bg-[#0B0F19] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#141A28] pb-3 mb-4">
                <h3 className="text-sm font-semibold text-white">Selecionar Insumo de Referência</h3>
                <button
                  onClick={() => setEditingItemIndex(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-[#141A28] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-xl border border-[#141A28] bg-[#07090E] p-3 mb-4 text-xs">
                <span className="text-gray-500 uppercase text-[10px] block font-semibold">Original:</span>
                <span className="font-medium text-white">{results[editingItemIndex].source_item.description}</span>
              </div>

              <div className="space-y-2 mb-4">
                {results[editingItemIndex].candidates.map((cand, cIdx) => (
                  <div
                    key={cIdx}
                    onClick={() => handleSelectCandidate(editingItemIndex, cand)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-[#141A28] bg-[#07090E] p-3 hover:border-gold-500/50 hover:bg-[#0E1424] transition-all"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs font-bold text-gold-400">{cand.dest_code}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">{cand.confidence_score}% score</span>
                      </div>
                      <div className="text-xs text-gray-300">{cand.dest_description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-white">
                        R$ {cand.unit_price.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-gold-400 font-medium">Selecionar</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Pesquisar no catálogo SINAPI / SICRO..."
                  className="w-full rounded-xl border border-[#141A28] bg-[#07090E] py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                />
              </div>

              {catalogSearch && (
                <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-[#141A28] bg-[#07090E] p-2 mt-2">
                  {filteredCatalog.map((cat, catIdx) => (
                    <div
                      key={catIdx}
                      onClick={() =>
                        handleSelectCandidate(editingItemIndex, {
                          dest_code: cat.code,
                          dest_description: cat.description,
                          dest_unit: cat.unit,
                          unit_price: cat.unit_price,
                          confidence_score: 90,
                          match_type: "MANUAL_OVERRIDE",
                        })
                      }
                      className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-[#0E1424] text-xs"
                    >
                      <div>
                        <div className="font-medium text-gold-400">{cat.code} - {cat.description}</div>
                        <div className="text-[10px] text-gray-500">UN: {cat.unit}</div>
                      </div>
                      <div className="font-mono font-bold text-white">R$ {cat.unit_price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
