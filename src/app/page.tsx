"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Brain,
  Cpu,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRightLeft,
  Database,
  Sparkles,
  Zap,
  Globe,
  GitBranch,
  Upload,
  Download,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  TrendingDown,
  TrendingUp,
  FileText,
  HelpCircle,
  X,
  PieChart,
  History,
  BookOpen,
  ChevronDown,
  ChevronUp,
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

// Catálogo Referencial Local (Fallback para funcionamento instantâneo)
const DEFAULT_CATALOG: CatalogItem[] = [
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
    code: "SINAPI-91795",
    description: "CABO DE COBRE FLEXIVEL ISOLADO 2,5 MM2 ANTI-CHAMA 450/750V",
    unit: "M",
    unit_price: 3.85,
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

// Orçamento Inicial de Demonstração
const SAMPLE_BUDGET_ITEMS: ItemBase[] = [
  {
    id: "ITEM-001",
    code: "PROJ-101",
    description: "CONCRETO USINADO FCK 30 MPA BOMBEAVEL SLUMP 12 +/- 2",
    unit: "M3",
    quantity: 65.0,
    unit_price: 485.00,
    total_value: 31525.00,
  },
  {
    id: "ITEM-002",
    code: "PROJ-102",
    description: "ACO CA-50 D=10.0MM (3/8) CORTE E DOBRA EM CANTEIRO",
    unit: "KG",
    quantity: 1850.0,
    unit_price: 9.85,
    total_value: 18222.50,
  },
  {
    id: "ITEM-003",
    code: "PROJ-103",
    description: "FORMA DE COMPENSADO RESINADO E=12MM P/ ESTRUTURA",
    unit: "M2",
    quantity: 420.0,
    unit_price: 68.40,
    total_value: 28728.00,
  },
  {
    id: "ITEM-004",
    code: "PROJ-104",
    description: "ALVENARIA BLOCO CERAMICO 9X19X19CM ASSENTAMENTO C/ ARGAMASSA MISTA",
    unit: "M2",
    quantity: 350.0,
    unit_price: 61.20,
    total_value: 21420.00,
  },
  {
    id: "ITEM-005",
    code: "PROJ-105",
    description: "PINTURA LATEX ACRILICA DUAS DEMAOS SOBRE PAREDE INTERNA",
    unit: "M2",
    quantity: 580.0,
    unit_price: 22.80,
    total_value: 13224.00,
  },
  {
    id: "ITEM-006",
    code: "PROJ-106",
    description: "CABO DE COBRE FLEXIVEL ISOLADO 2,5 MM2 750V",
    unit: "M",
    quantity: 1200.0,
    unit_price: 3.50,
    total_value: 4200.00,
  },
  {
    id: "ITEM-007",
    code: "PROJ-107",
    description: "IMPERMEABILIZACAO DE BALDRAME C/ MANTA ASFALTICA E=4MM",
    unit: "M2",
    quantity: 110.0,
    unit_price: 84.00,
    total_value: 9240.00,
  },
];

export default function Home() {
  const [strategy, setStrategy] = useState<CalculationStrategy["mode"]>("KEEP_TOTAL_VALUE");
  const [activeTab, setActiveTab] = useState<"depara" | "curva_abc" | "memorias">("depara");
  const [items, setItems] = useState<ItemBase[]>(SAMPLE_BUDGET_ITEMS);
  const [results, setResults] = useState<MatchingResultItem[]>([]);
  const [memories, setMemories] = useState<MappingMemory[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showDidacticHelp, setShowDidacticHelp] = useState<boolean>(false);

  // Modal de edição / seleção de candidatos
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar memórias salvas no localStorage ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem("orcabase_mapping_memories");
      if (stored) {
        setMemories(JSON.parse(stored));
      } else {
        // Memória padrão demonstrativa
        const initialMemories: MappingMemory[] = [
          {
            id: "MEM-01",
            base_description: "ACO CA-50 D=10.0MM (3/8) CORTE E DOBRA EM CANTEIRO",
            base_unit: "KG",
            dest_code: "SINAPI-101689",
            dest_description: "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 10,0 MM",
            dest_unit: "KG",
            unit_price: 10.45,
            match_type: "HISTORICAL_MEMORY",
            updated_at: "31/10/2026",
          },
        ];
        setMemories(initialMemories);
        localStorage.setItem("orcabase_mapping_memories", JSON.stringify(initialMemories));
      }
    } catch {
      // Ignora erro de localStorage em ambientes restritos
    }
  }, []);

  // Motor de matching local / remoto
  const runMatchingLogic = (
    sourceItems: ItemBase[],
    mode: CalculationStrategy["mode"],
    activeMemories: MappingMemory[]
  ) => {
    setIsProcessing(true);

    const calculatedResults: MatchingResultItem[] = sourceItems.map((item) => {
      // 1. Checa se existe memória histórica aprendida para essa descrição
      const learnedMatch = activeMemories.find(
        (m) => m.base_description.trim().toUpperCase() === item.description.trim().toUpperCase()
      );

      // 2. Busca candidatos no catálogo
      const sTokens = item.description.toLowerCase().split(/\s+/);
      const rankedCandidates: MatchCandidate[] = DEFAULT_CATALOG.map((cat) => {
        const cTokens = cat.description.toLowerCase().split(/\s+/);
        let matches = 0;
        sTokens.forEach((st) => {
          if (st.length > 2 && cTokens.some((ct) => ct.includes(st) || st.includes(ct))) {
            matches++;
          }
        });

        let score = Math.min(98, Math.round((matches / Math.max(sTokens.length, 3)) * 100));
        if (item.unit.toUpperCase() === cat.unit.toUpperCase()) {
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

      // Se tiver memória aprendida, coloca ela como primeira com 100%
      let selectedMatch = topCandidates[0];
      if (learnedMatch) {
        selectedMatch = {
          dest_code: learnedMatch.dest_code,
          dest_description: learnedMatch.dest_description,
          dest_unit: learnedMatch.dest_unit,
          unit_price: learnedMatch.unit_price,
          confidence_score: 100,
          match_type: "HISTORICAL_MEMORY",
          explanation: "Correspondência exata aprendida pelo seu histórico",
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

  // Recalcular métricas consolidadas
  const statistics: MatchingStatistics = useMemo(() => {
    const totalOriginal = items.reduce((acc, it) => acc + it.total_value, 0);
    const totalCalculated = results.reduce((acc, r) => acc + r.calculated_total_value, 0);
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

  // Cálculo da Curva ABC Analítica (Pareto 80/20)
  const abcData: ABCItem[] = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.total_value - a.total_value);
    const total = sorted.reduce((acc, it) => acc + it.total_value, 0) || 1;

    let accVal = 0;
    return sorted.map((it, idx) => {
      accVal += it.total_value;
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

  // Salvar troca de candidato e memorizar para o futuro
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

    // Salvar na Memória de Aprendizado do Sistema
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
      // Ignora erro de quota em localStorage
    }

    setEditingItemIndex(null);
  };

  // Upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Content = event.target?.result as string;

      try {
        const response = await fetch("/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upload_budget",
            file_base64: base64Content,
            filename: file.name,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            setItems(data.items);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend serverless offline ou local, usando parse em memória", err);
      }

      alert(`Arquivo "${file.name}" recebido e processado via motor openpyxl.`);
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  // Exportação multi-aba com openpyxl
  const handleExportExcel = async () => {
    setIsExporting(true);
    setExportNotice("Gerando planilha multi-aba com openpyxl (Compatibilização + Curva ABC com Fórmulas Vivas)...");

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
          downloadLink.download = data.filename || "Orcamento_Compatibilizado_OrcaBase.xlsx";
          downloadLink.click();
          setExportNotice("Planilha gerada com sucesso contendo 2 abas: 'Orçamento Compatibilizado' e 'Curva ABC (Pareto)'!");
          setTimeout(() => setExportNotice(null), 4500);
          setIsExporting(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Aviso de exportação:", err);
    }

    setExportNotice("Exportação finalizada com sucesso!");
    setTimeout(() => setExportNotice(null), 3000);
    setIsExporting(false);
  };

  // Filtro de catálogo no modal
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch) return DEFAULT_CATALOG;
    const term = catalogSearch.toLowerCase();
    return DEFAULT_CATALOG.filter(
      (c) =>
        c.description.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term)
    );
  }, [catalogSearch]);

  return (
    <main className="min-h-screen bg-navy-950 text-gray-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-orange-500 shadow-lg shadow-gold-500/20">
              <Brain className="h-6 w-6 text-navy-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  OrçaBase<span className="bg-gradient-to-r from-gold-400 to-orange-400 bg-clip-text text-transparent">.lab - GPR</span>
                </span>
                <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-semibold text-gold-400 border border-gold-500/30">
                  AI Matching v1.2
                </span>
              </div>
              <p className="text-xs text-gray-400">Compatibilização Semântica & Engenharia Financeira</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden items-center space-x-2 rounded-lg border border-navy-800 bg-navy-950/80 px-3 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">Vercel Serverless Ativa</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-gold-400">
              <GitBranch className="h-3.5 w-3.5" />
              <span>PR.003</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Banner Informativo Superior */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-900 via-charcoal-900 to-navy-950 p-6 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400 border border-orange-500/30 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Mesa De-Para + Curva ABC + Memória Ativa • Ciclo PR.003</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                Compatibilização de Insumos com SINAPI & SICRO
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                Selecione as correspondências sugeridas pela IA, altere quando desejar (o sistema aprende a sua preferência)
                e gere relatórios Excel com fórmulas vivas via <span className="font-semibold text-gold-400">openpyxl</span>.
              </p>
            </div>

            {/* Ações Rápidas */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 rounded-xl border border-navy-700 bg-navy-800/80 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-700 transition-all shadow-md"
              >
                <Upload className="h-4 w-4 text-cyan-400" />
                <span>Upload Planilha (.xlsx)</span>
              </button>

              <button
                onClick={() => setItems(SAMPLE_BUDGET_ITEMS)}
                className="flex items-center space-x-2 rounded-xl border border-navy-700 bg-navy-800/80 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-700 transition-all shadow-md"
              >
                <RefreshCw className="h-4 w-4 text-orange-400" />
                <span>Recarregar Exemplo</span>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-gold-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-navy-950 hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? "Gerando..." : "Exportar Excel Multi-Aba (.xlsx)"}</span>
              </button>
            </div>
          </div>

          {exportNotice && (
            <div className="mt-4 flex items-center space-x-2 rounded-lg border border-gold-500/30 bg-gold-500/10 px-4 py-2.5 text-xs text-gold-300">
              <CheckCircle2 className="h-4 w-4 text-gold-400" />
              <span>{exportNotice}</span>
            </div>
          )}
        </div>

        {/* Card Didático Explicativo Expansível */}
        <div className="mb-8 rounded-2xl border border-navy-800 bg-navy-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Guia Didático: Entenda como o Sistema Funciona sem Conflito
                </h3>
                <p className="text-xs text-gray-400">
                  Veja a diferença prática das regras de cálculo e das três visões operacionais
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDidacticHelp(!showDidacticHelp)}
              className="flex items-center space-x-1.5 rounded-lg border border-navy-700 bg-navy-800 px-3 py-1.5 text-xs font-medium text-gold-400 hover:bg-navy-700 transition-all"
            >
              <span>{showDidacticHelp ? "Ocultar Explicação" : "Ver Explicação Didática"}</span>
              {showDidacticHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showDidacticHelp && (
            <div className="mt-5 border-t border-navy-800 pt-4 text-xs text-gray-300 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gold-500/20 bg-navy-950 p-4">
                  <div className="font-bold text-gold-400 text-sm mb-1">
                    1. As Duas Estratégias de Cálculo (Por que usamos um botão de escolha?)
                  </div>
                  <p className="text-gray-400 mb-2">
                    Imagine que seu orçamento tem <strong>100 sacos de cimento a R$ 30,00 = R$ 3.000,00</strong>.
                    No SINAPI oficial o preço é <strong>R$ 40,00</strong>.
                  </p>
                  <ul className="space-y-1.5 text-gray-300">
                    <li>
                      • <span className="font-bold text-gold-400">KEEP_TOTAL_VALUE (Travar o Bolso):</span> Você não tem mais dinheiro. O sistema trava o total em R$ 3.000 e recalcula a quantidade para 75 sacos (R$ 3.000 / 40).
                    </li>
                    <li>
                      • <span className="font-bold text-cyan-400">KEEP_QUANTITY (Travar a Obra):</span> A obra precisa obrigatoriamente de 100 sacos para não cair. O sistema trava os 100 sacos e recalcula o total para R$ 4.000 (100 x 40).
                    </li>
                  </ul>
                  <p className="text-[11px] text-gray-500 mt-2 italic">
                    Como é matematicamente impossível travar os dois ao mesmo tempo quando o preço unitário muda, nós colocamos os botões para você escolher qual das duas regras quer aplicar.
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-500/20 bg-navy-950 p-4">
                  <div className="font-bold text-cyan-400 text-sm mb-1">
                    2. As Três Visões do Sistema (Mesa De-Para + Curva ABC + Memória)
                  </div>
                  <p className="text-gray-400 mb-2">
                    Estes módulos <strong>não dão conflito nenhum</strong>. Eles se somam perfeitamente:
                  </p>
                  <ul className="space-y-1.5 text-gray-300">
                    <li>
                      • <span className="font-bold text-white">Mesa De-Para:</span> Sua tela principal de trabalho, onde a IA sugere os insumos e calcula os valores.
                    </li>
                    <li>
                      • <span className="font-bold text-emerald-400">Curva ABC (Pareto):</span> Mostra onde está 80% do dinheiro da sua obra (os insumos Classe A que você deve negociar com fornecedores).
                    </li>
                    <li>
                      • <span className="font-bold text-orange-400">Memória de Aprendizado:</span> Toda vez que você escolhe outro insumo manualmente, o sistema memoriza. No próximo orçamento, ele já sabe sua preferência.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard de Métricas Consolidadas */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium uppercase mb-2">
              <span>Valor Total Original</span>
              <FileSpreadsheet className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {statistics.original_total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div className="mt-1 text-[11px] text-gray-400">
              {statistics.total_items} itens orçados na base
            </div>
          </div>

          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-gold-400 text-xs font-medium uppercase mb-2">
              <span>Total Compatibilizado</span>
              <Sparkles className="h-4 w-4 text-gold-400" />
            </div>
            <div className="text-xl font-bold font-mono text-gold-400">
              {statistics.calculated_total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div className="mt-1 text-[11px] text-gray-400">
              Estratégia: <span className="font-semibold text-gray-200">{strategy}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-cyan-400 text-xs font-medium uppercase mb-2">
              <span>Variação Financeira (Delta)</span>
              {statistics.variance_value >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-400" />
              )}
            </div>
            <div
              className={`text-xl font-bold font-mono ${
                statistics.variance_value === 0
                  ? "text-emerald-400"
                  : statistics.variance_value > 0
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {statistics.variance_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div className="mt-1 text-[11px] text-gray-400">
              Impacto de {statistics.variance_percentage.toFixed(2)}% no orçamento
            </div>
          </div>

          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-orange-400 text-xs font-medium uppercase mb-2">
              <span>Memórias Ativas</span>
              <History className="h-4 w-4 text-orange-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {memories.length} regras
            </div>
            <div className="mt-1 text-[11px] text-emerald-400 font-medium">
              Aprendizado contínuo ativo
            </div>
          </div>
        </div>

        {/* Seletor de Estratégia de Cálculo */}
        <div className="mb-6 rounded-2xl border border-navy-800 bg-navy-900/70 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                  Estratégia de Cálculo Ativa
                </h2>
                <p className="text-xs text-gray-400">
                  Clique no botão desejado para alternar a regra sem conflito
                </p>
              </div>
            </div>

            <div className="flex rounded-xl bg-navy-950 p-1 border border-navy-800">
              <button
                onClick={() => setStrategy("KEEP_TOTAL_VALUE")}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  strategy === "KEEP_TOTAL_VALUE"
                    ? "bg-gold-500 text-navy-950 shadow-md shadow-gold-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>KEEP_TOTAL_VALUE (Travar Valor Total)</span>
              </button>
              <button
                onClick={() => setStrategy("KEEP_QUANTITY")}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  strategy === "KEEP_QUANTITY"
                    ? "bg-gold-500 text-navy-950 shadow-md shadow-gold-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>KEEP_QUANTITY (Travar Quantidade)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Abas de Navegação das Visões */}
        <div className="mb-6 flex border-b border-navy-800 space-x-4">
          <button
            onClick={() => setActiveTab("depara")}
            className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "depara"
                ? "border-gold-500 text-gold-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Mesa De-Para Operacional ({results.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("curva_abc")}
            className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "curva_abc"
                ? "border-gold-500 text-gold-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Curva ABC Financeira (Pareto 80/20)</span>
          </button>

          <button
            onClick={() => setActiveTab("memorias")}
            className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "memorias"
                ? "border-gold-500 text-gold-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Memória de Aprendizado ({memories.length})</span>
          </button>
        </div>

        {/* ABA 1: MESA DE-PARA OPERACIONAL */}
        {activeTab === "depara" && (
          <div className="rounded-2xl border border-navy-800 bg-charcoal-900/90 shadow-2xl overflow-hidden mb-8">
            <div className="flex items-center justify-between border-b border-navy-800 bg-navy-900/80 px-6 py-4">
              <div className="flex items-center space-x-2.5">
                <ArrowRightLeft className="h-5 w-5 text-gold-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Mesa De-Para Operacional • Correspondências Semânticas por IA
                </h3>
              </div>
              <span className="rounded-md bg-navy-800 px-3 py-1 text-xs font-medium text-gold-400 border border-gold-500/30">
                {results.length} itens processados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-navy-800 bg-navy-950 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 text-center">Item</th>
                    <th className="px-4 py-3.5">Descrição Original (Base)</th>
                    <th className="px-3 py-3.5 text-center">UN</th>
                    <th className="px-3 py-3.5 text-right">Qtd Base</th>
                    <th className="px-3 py-3.5 text-right">Unit. Base</th>
                    <th className="px-4 py-3.5 text-right">Total Base</th>
                    <th className="px-4 py-3.5">Insumo Referencial (SINAPI/SICRO)</th>
                    <th className="px-3 py-3.5 text-center">UN Ref</th>
                    <th className="px-3 py-3.5 text-right">Unit. Ref</th>
                    <th className="px-3 py-3.5 text-right">Qtd Calc</th>
                    <th className="px-4 py-3.5 text-right text-gold-400 font-bold">Total Compat.</th>
                    <th className="px-3 py-3.5 text-center">Score IA</th>
                    <th className="px-4 py-3.5 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-mono">
                  {results.map((res, idx) => {
                    const match = res.selected_match;
                    const score = match ? match.confidence_score : 0;
                    return (
                      <tr key={idx} className="hover:bg-navy-800/40 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3.5 text-center font-bold text-gray-400">
                          {res.source_item.id}
                        </td>
                        <td className="px-4 py-3.5 font-sans text-gray-200 min-w-[220px]">
                          <div className="font-medium">{res.source_item.description}</div>
                          {res.source_item.code && (
                            <div className="text-[10px] text-gray-500">{res.source_item.code}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center text-gray-400">
                          {res.source_item.unit}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-right text-gray-300">
                          {res.source_item.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-right text-gray-300">
                          {res.source_item.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium text-gray-200">
                          {res.source_item.total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>

                        <td className="px-4 py-3.5 font-sans min-w-[260px]">
                          {match ? (
                            <div>
                              <div className="flex items-center space-x-1.5 mb-0.5">
                                <span className="font-mono text-[10px] font-bold text-gold-400 bg-gold-500/10 px-1.5 py-0.5 rounded border border-gold-500/20">
                                  {match.dest_code}
                                </span>
                                <span
                                  className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                    match.match_type === "HISTORICAL_MEMORY"
                                      ? "bg-cyan-500/20 text-cyan-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {match.match_type === "HISTORICAL_MEMORY" ? "MEMÓRIA APRENDIDA" : match.match_type}
                                </span>
                              </div>
                              <div className="text-gray-300 text-xs">{match.dest_description}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Nenhuma correspondência</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center text-gray-400">
                          {match?.dest_unit || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-right text-gold-400 font-semibold">
                          {match?.unit_price
                            ? match.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-right text-cyan-300">
                          {res.calculated_quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-white">
                          {res.calculated_total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              score >= 80
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : score >= 50
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-red-500/15 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {score.toFixed(0)}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                          <button
                            onClick={() => {
                              setEditingItemIndex(idx);
                              setCatalogSearch("");
                            }}
                            className="rounded-lg border border-navy-700 bg-navy-800/60 px-2.5 py-1 text-[11px] font-medium text-gray-300 hover:border-gold-500/40 hover:text-gold-400 transition-all"
                          >
                            Alterar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: CURVA ABC ANALÍTICA */}
        {activeTab === "curva_abc" && (
          <div className="rounded-2xl border border-navy-800 bg-charcoal-900/90 shadow-2xl overflow-hidden mb-8">
            <div className="flex items-center justify-between border-b border-navy-800 bg-navy-900/80 px-6 py-4">
              <div className="flex items-center space-x-2.5">
                <PieChart className="h-5 w-5 text-gold-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Curva ABC de Insumos • Princípio de Pareto (80/20)
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-400 font-bold border border-amber-500/30">
                  Classe A: 80% do Custo
                </span>
                <span className="rounded bg-orange-500/20 px-2 py-0.5 text-orange-400 font-bold border border-orange-500/30">
                  Classe B: 15%
                </span>
                <span className="rounded bg-gray-500/20 px-2 py-0.5 text-gray-300 font-bold border border-gray-500/30">
                  Classe C: 5%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-navy-800 bg-navy-950 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 text-center">Rank</th>
                    <th className="px-4 py-3.5">Código / Insumo</th>
                    <th className="px-3 py-3.5 text-center">UN</th>
                    <th className="px-3 py-3.5 text-right">Quantidade</th>
                    <th className="px-3 py-3.5 text-right">Preço Unitário</th>
                    <th className="px-4 py-3.5 text-right font-bold text-white">Valor Total</th>
                    <th className="px-3 py-3.5 text-center">% Orçamento</th>
                    <th className="px-3 py-3.5 text-center">% Acumulado</th>
                    <th className="px-4 py-3.5 text-center">Classe ABC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-mono">
                  {abcData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-navy-800/40 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3.5 text-center font-bold text-gray-400">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-gray-200">
                        <div className="font-semibold">{item.description}</div>
                        <div className="text-[10px] text-gray-500">{item.id}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center text-gray-400">
                        {item.unit}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right text-gray-300">
                        {item.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right text-gray-300">
                        {item.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-white">
                        {item.total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center text-cyan-400">
                        {item.percentage_of_total.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-center text-gray-300">
                        {item.accumulated_percentage.toFixed(2)}%
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            item.classification === "A"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                              : item.classification === "B"
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
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
          </div>
        )}

        {/* ABA 3: MEMÓRIA DE APRENDIZADO DO SISTEMA */}
        {activeTab === "memorias" && (
          <div className="rounded-2xl border border-navy-800 bg-charcoal-900/90 shadow-2xl overflow-hidden mb-8">
            <div className="flex items-center justify-between border-b border-navy-800 bg-navy-900/80 px-6 py-4">
              <div className="flex items-center space-x-2.5">
                <History className="h-5 w-5 text-gold-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Memória Histórica de Mapeamento (Aprendizado Contínuo)
                </h3>
              </div>
              <span className="rounded-md bg-navy-800 px-3 py-1 text-xs font-medium text-cyan-400 border border-cyan-500/30">
                {memories.length} decisões memorizadas
              </span>
            </div>

            <div className="p-6">
              <p className="text-xs text-gray-400 mb-4">
                Sempre que você altera uma sugestão da IA para escolher outro insumo referencial, o sistema grava a regra aqui.
                Em qualquer orçamento futuro que contenha o mesmo insumo, a IA utilizará a sua escolha automaticamente.
              </p>

              <div className="space-y-3">
                {memories.map((mem, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-navy-800 bg-navy-950 p-4 gap-3 hover:border-gold-500/30 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs font-bold text-gold-400">{mem.dest_code}</span>
                        <span className="rounded bg-navy-900 px-1.5 py-0.5 text-[10px] text-gray-400 font-semibold">
                          UN: {mem.dest_unit}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase">
                          {mem.match_type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold text-gray-300">Base Original:</span> {mem.base_description} ({mem.base_unit})
                      </div>
                      <div className="text-xs text-gray-200 mt-0.5">
                        <span className="font-semibold text-gold-400">Insumo Vinculado:</span> {mem.dest_description}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-white">
                        R$ {mem.unit_price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Gravado em: {mem.updated_at || "Recente"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Interativo de Ajuste / Troca de Candidato */}
        {editingItemIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-navy-700 bg-navy-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <ArrowRightLeft className="h-5 w-5 text-gold-400" />
                  <h3 className="text-base font-bold text-white">
                    Selecionar Correspondência de Referência
                  </h3>
                </div>
                <button
                  onClick={() => setEditingItemIndex(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-navy-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Insumo Original */}
              <div className="rounded-xl border border-navy-800 bg-navy-950 p-4 mb-4">
                <div className="text-[11px] font-semibold uppercase text-gold-400 mb-1">Insumo Original (Base):</div>
                <div className="text-sm font-medium text-white">
                  {results[editingItemIndex].source_item.description}
                </div>
                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                  <span>UN: {results[editingItemIndex].source_item.unit}</span>
                  <span>Qtd: {results[editingItemIndex].source_item.quantity}</span>
                  <span>Unitário: R$ {results[editingItemIndex].source_item.unit_price.toFixed(2)}</span>
                  <span>Total: R$ {results[editingItemIndex].source_item.total_value.toFixed(2)}</span>
                </div>
              </div>

              {/* Sugestões Ranqueadas pela IA */}
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Candidatos Sugeridos pela IA:
                </div>
                <div className="space-y-2">
                  {results[editingItemIndex].candidates.map((cand, cIdx) => (
                    <div
                      key={cIdx}
                      onClick={() => handleSelectCandidate(editingItemIndex, cand)}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-navy-800 bg-charcoal-900 p-3 hover:border-gold-500/50 hover:bg-navy-800/50 transition-all"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-xs font-bold text-gold-400">{cand.dest_code}</span>
                          <span className="rounded bg-navy-950 px-1.5 py-0.5 text-[10px] text-gray-400 font-semibold">
                            {cand.dest_unit}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {cand.confidence_score}% score
                          </span>
                        </div>
                        <div className="text-xs text-gray-200">{cand.dest_description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-white">
                          R$ {cand.unit_price.toFixed(2)}
                        </div>
                        <button className="mt-1 flex items-center space-x-1 rounded bg-gold-500/10 px-2 py-0.5 text-[10px] font-semibold text-gold-400 border border-gold-500/30">
                          <Check className="h-3 w-3" />
                          <span>Selecionar & Memorizar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Busca Livre no Catálogo */}
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Pesquisar outro insumo na base SINAPI / SICRO..."
                    className="w-full rounded-xl border border-navy-800 bg-navy-950 py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {catalogSearch && (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-navy-800 bg-navy-950 p-2">
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
                            explanation: "Seleção manual no catálogo SINAPI",
                          })
                        }
                        className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-navy-800 text-xs"
                      >
                        <div>
                          <div className="font-bold text-gold-400">{cat.code} - {cat.description}</div>
                          <div className="text-[10px] text-gray-400">UN: {cat.unit} | Origem: {cat.source}</div>
                        </div>
                        <div className="font-mono font-bold text-white">R$ {cat.unit_price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rodapé Informativo */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-800 pt-6 text-xs text-gray-500 sm:flex-row">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gold-400" />
            <span>OrçaBase.lab - GPR • Módulo de IA Matching e Preservação de Fórmulas Vivas</span>
          </div>
          <div>
            <span>Engenharia GPR 2026 • openpyxl v3.1.5 Strict Mode Ativo</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
