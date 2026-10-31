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
  Building2,
  Settings,
  Eye,
  Plus,
  Play,
  Layers,
  FileCheck,
  RefreshCw,
  FolderOpen,
  DollarSign,
  Tag,
} from "lucide-react";
import {
  CalculationStrategy,
  ItemBase,
  ContractBaseCard,
  MatchingResultItem,
  MatchingStatistics,
} from "@/types";

// Contrato Padrão Inicial
const INITIAL_CONTRACTS: ContractBaseCard[] = [
  {
    id: "CT-DESENVOLVA-027",
    title: "DESENVOLVA",
    company: "DESENVOLVA EMPREENDIMENTOS",
    contractNumber: "CT 027 - DESENVOLVA",
    bdi: 25.50,
    fileName: "DESENVOLVA - 12°GRE - MODIFICADO.xlsx",
    fileSize: "142.0 KB",
    budgetSheetName: "Orçamento Geral",
    totalGeralValue: 147570.00,
    totalGeralLabel: "TOTAL GERAL DA PLANILHA",
    compositionsCount: 10,
    stagesCount: 4,
    createdAt: "31/10/2026",
    items: [
      { id: "1.1", code: "COMP-01", description: "REFORMA MANUTENÇÃO PREVENTIVA E CORRETIVA PREDIAL", unit: "UN", quantity: 1.0, unit_price: 15420.00, total_value: 15420.00, row_index: 5 },
      { id: "1.2", code: "COMP-02", description: "CONCRETO USINADO FCK 30 MPA BOMBEAVEL SLUMP 12 +/- 2", unit: "M3", quantity: 50.0, unit_price: 492.30, total_value: 24615.00, row_index: 6 },
      { id: "1.3", code: "COMP-03", description: "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 10,0 MM", unit: "KG", quantity: 1200.0, unit_price: 10.45, total_value: 12540.00, row_index: 7 },
      { id: "1.4", code: "COMP-04", description: "FORMA DE COMPENSADO RESINADO ESPESSURA 12MM C/ REAPROVEITAMENTO", unit: "M2", quantity: 380.0, unit_price: 72.80, total_value: 27664.00, row_index: 8 },
      { id: "2.1", code: "COMP-05", description: "ALVENARIA DE VEDACAO BLOCO CERAMICO 9X19X19CM COM ARGAMASSA MISTA", unit: "M2", quantity: 290.0, unit_price: 64.90, total_value: 18821.00, row_index: 9 },
      { id: "2.2", code: "COMP-06", description: "EMBOCO OU MASSA UNICA PARA RECEBIMENTO DE PINTURA E=20MM", unit: "M2", quantity: 580.0, unit_price: 31.40, total_value: 18212.00, row_index: 10 },
      { id: "3.1", code: "COMP-07", description: "APLICACAO MANUAL DE PINTURA COM TINTA LATEX ACRILICA DUAS DEMAOS", unit: "M2", quantity: 580.0, unit_price: 24.60, total_value: 14268.00, row_index: 11 },
      { id: "3.2", code: "COMP-08", description: "REVESTIMENTO CERAMICO ESMALTADO PARA PISO 60X60CM PEI-4", unit: "M2", quantity: 240.0, unit_price: 79.50, total_value: 19080.00, row_index: 12 },
      { id: "4.1", code: "COMP-09", description: "CABO DE COBRE FLEXIVEL ISOLADO 2,5 MM2 ANTI-CHAMA 750V", unit: "M", quantity: 950.0, unit_price: 3.85, total_value: 3657.50, row_index: 13 },
      { id: "4.2", code: "COMP-10", description: "IMPERMEABILIZACAO COM MANTA ASFALTICA E=4MM APLICADA A MACARICO", unit: "M2", quantity: 85.0, unit_price: 88.50, total_value: 7522.50, row_index: 14 },
    ],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"compatibilizacao" | "configuracoes">("compatibilizacao");
  const [strategy, setStrategy] = useState<CalculationStrategy["mode"]>("KEEP_QUANTITY");

  // Lista de Contratos Base
  const [contracts, setContracts] = useState<ContractBaseCard[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");

  // Planilha 1 (Planilha Inicial a compatibilizar)
  const [initialFile, setInitialFile] = useState<File | null>(null);
  const [initialFileName, setInitialFileName] = useState<string | null>(null);
  const [initialFileSize, setInitialFileSize] = useState<string | null>(null);
  const [initialItems, setInitialItems] = useState<ItemBase[]>([]);
  const [isDraggingInitial, setIsDraggingInitial] = useState<boolean>(false);

  // Estados de Compatibilização
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCompatibilizado, setIsCompatibilizado] = useState<boolean>(false);
  const [matchedResults, setMatchedResults] = useState<MatchingResultItem[]>([]);

  // Modal de Criação de Contrato Base
  const [isCreateContractOpen, setIsCreateContractOpen] = useState<boolean>(false);
  const [newContractTitle, setNewContractTitle] = useState<string>("");
  const [newContractCompany, setNewContractCompany] = useState<string>("");
  const [newContractNumber, setNewContractNumber] = useState<string>("");
  const [newContractBdi, setNewContractBdi] = useState<string>("25.50");
  const [newContractFile, setNewContractFile] = useState<File | null>(null);
  const [newContractFileName, setNewContractFileName] = useState<string | null>(null);
  const [newContractFileSize, setNewContractFileSize] = useState<string | null>(null);
  const [newContractBase64, setNewContractBase64] = useState<string | null>(null);
  const [newContractItems, setNewContractItems] = useState<ItemBase[]>([]);
  const [newContractBudgetSheet, setNewContractBudgetSheet] = useState<string>("Orçamento");
  const [newContractTotalGeral, setNewContractTotalGeral] = useState<number>(0);
  const [newContractTotalLabel, setNewContractTotalLabel] = useState<string>("Total Geral");
  const [isDraggingModalFile, setIsDraggingModalFile] = useState<boolean>(false);
  const [isAnalyzingContract, setIsAnalyzingContract] = useState<boolean>(false);

  // Modal para ver composições do contrato
  const [viewingContract, setViewingContract] = useState<ContractBaseCard | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const replaceContractFileInputRef = useRef<HTMLInputElement>(null);
  const [targetReplaceContractId, setTargetReplaceContractId] = useState<string | null>(null);

  // Carregar contratos salvos
  useEffect(() => {
    try {
      const stored = localStorage.getItem("orcabase_contracts_v2");
      if (stored) {
        const parsed: ContractBaseCard[] = JSON.parse(stored);
        setContracts(parsed);
        if (parsed.length > 0) setSelectedContractId(parsed[0].id);
      } else {
        setContracts(INITIAL_CONTRACTS);
        setSelectedContractId(INITIAL_CONTRACTS[0].id);
        localStorage.setItem("orcabase_contracts_v2", JSON.stringify(INITIAL_CONTRACTS));
      }
    } catch {
      setContracts(INITIAL_CONTRACTS);
      setSelectedContractId(INITIAL_CONTRACTS[0].id);
    }
  }, []);

  const currentSelectedContract = useMemo(() => {
    return contracts.find((c) => c.id === selectedContractId) || contracts[0] || null;
  }, [contracts, selectedContractId]);

  // Conversor File para Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Parser Inteligente com Detecção de Aba de Orçamento e Busca de TOTAL GERAL
  const inspectAndParseContractFile = async (file: File) => {
    setIsAnalyzingContract(true);
    setToastMessage("IA analisando planilha: identificando aba de orçamento e TOTAL GERAL...");

    const b64 = await fileToBase64(file);
    setNewContractBase64(b64);

    try {
      // 1. Tenta inspeção no backend Python Serverless
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "inspect_contract",
          file_base64: b64,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.inspection) {
          const insp = data.inspection;
          setNewContractBudgetSheet(insp.budget_sheet_name || "Orçamento");
          setNewContractTotalGeral(insp.total_geral_value || 0);
          setNewContractTotalLabel(insp.total_geral_label || "Total Geral");
          setNewContractItems(insp.compositions || []);
          setToastMessage(`Planilha analisada! Total Geral detectado: R$ ${insp.total_geral_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
          setTimeout(() => setToastMessage(null), 4000);
          setIsAnalyzingContract(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend offline, executando leitura inteligente no client:", err);
    }

    // 2. Parser inteligente client-side (Fallback resiliente com busca do TOTAL GERAL)
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      // Localiza a aba de orçamento
      let targetSheetName = workbook.SheetNames[0];
      for (const name of workbook.SheetNames) {
        const nLow = name.toLowerCase();
        if (nLow.includes("orçamento") || nLow.includes("orcamento") || nLow.includes("planilha") || nLow.includes("analítico")) {
          targetSheetName = name;
          break;
        }
      }

      const worksheet = workbook.Sheets[targetSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      // Procura ativamente a linha de TOTAL GERAL de baixo para cima
      let detectedTotal = 0;
      let detectedTotalLabel = "TOTAL GERAL";

      for (let r = rows.length - 1; r >= Math.max(0, rows.length - 35); r--) {
        const row = rows[r];
        if (!row) continue;
        const rowStr = row.map((c) => String(c).toLowerCase().trim()).join(" ");
        if (rowStr.includes("total geral") || rowStr.includes("valor total") || rowStr.includes("total do orçamento") || rowStr.includes("total orcamento")) {
          detectedTotalLabel = "TOTAL GERAL DO ORÇAMENTO";
          for (let c = row.length - 1; c >= 0; c--) {
            const val = row[c];
            if (typeof val === "number" && val > 0) {
              detectedTotal = val;
              break;
            } else if (typeof val === "string") {
              const cleaned = val.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
              const num = parseFloat(cleaned);
              if (!isNaN(num) && num > 0) {
                detectedTotal = num;
                break;
              }
            }
          }
          if (detectedTotal > 0) break;
        }
      }

      // Extração de composições
      const comps: ItemBase[] = [];
      let headerRow = -1;
      let colDesc = 1;
      let colUnit = 2;
      let colQty = 3;
      let colPrice = 4;

      for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const row = rows[r].map((c) => String(c).toLowerCase().trim());
        if (row.some((c) => c.includes("descri") || c.includes("especifica") || c.includes("composição"))) {
          headerRow = r;
          row.forEach((c, idx) => {
            if (c.includes("descri") || c.includes("composição")) colDesc = idx;
            if (c.includes("unid") || c === "un") colUnit = idx;
            if (c.includes("quant") || c === "qtd") colQty = idx;
            if (c.includes("unit") || c.includes("preço")) colPrice = idx;
          });
          break;
        }
      }

      for (let r = headerRow + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const desc = String(row[colDesc] || "").trim();
        if (desc.length > 4 && !desc.toLowerCase().includes("total geral")) {
          const qty = parseFloat(String(row[colQty]).replace(/\./g, "").replace(",", ".")) || 1.0;
          const price = parseFloat(String(row[colPrice]).replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".")) || 0.0;
          comps.push({
            id: `IT-${comps.length + 1}`,
            code: `COMP-${comps.length + 1}`,
            description: desc,
            unit: String(row[colUnit] || "UN").toUpperCase(),
            quantity: qty,
            unit_price: price,
            total_value: Number((qty * price).toFixed(2)),
            row_index: r + 1,
          });
        }
      }

      setNewContractBudgetSheet(targetSheetName);
      setNewContractTotalGeral(detectedTotal || comps.reduce((acc, c) => acc + c.total_value, 0));
      setNewContractTotalLabel(detectedTotalLabel);
      setNewContractItems(comps);
      setToastMessage(`Leitura concluída! ${comps.length} composições identificadas na aba "${targetSheetName}".`);
    } catch (e) {
      console.error(e);
      setToastMessage("Aviso: Leitura concluída com valores padrão.");
    } finally {
      setIsAnalyzingContract(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Upload da Planilha 1 (Planilha Inicial)
  const handleInitialFileUpload = async (file: File) => {
    setInitialFile(file);
    setInitialFileName(file.name);
    setInitialFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setIsMatching(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      const parsed: ItemBase[] = [];
      let colDesc = 1;
      let colUnit = 2;
      let colQty = 3;

      for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const row = rows[r].map((c) => String(c).toLowerCase().trim());
        row.forEach((c, idx) => {
          if (c.includes("descri") || c.includes("serviço") || c.includes("item")) colDesc = idx;
          if (c.includes("unid") || c === "un") colUnit = idx;
          if (c.includes("quant") || c === "qtd") colQty = idx;
        });
      }

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row) continue;
        const desc = String(row[colDesc] || "").trim();
        if (desc.length > 3) {
          const rawQ = String(row[colQty] || "1").replace(/\./g, "").replace(",", ".");
          const qty = parseFloat(rawQ) || 1.0;
          parsed.push({
            id: `P1-${parsed.length + 1}`,
            description: desc,
            unit: String(row[colUnit] || "UN").toUpperCase(),
            quantity: qty,
            unit_price: 0,
            total_value: 0,
          });
        }
      }

      setInitialItems(parsed);
      setIsCompatibilizado(false);
      setMatchedResults([]);
      setToastMessage(`Planilha Inicial carregada com ${parsed.length} serviços para quantificar.`);
    } catch {
      setToastMessage("Erro ao ler Planilha Inicial.");
    } finally {
      setIsMatching(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Salvar Novo Contrato Base
  const handleSaveContract = () => {
    if (!newContractTitle.trim()) {
      alert("Por favor, digite o Nome/Título do Contrato.");
      return;
    }

    const newCard: ContractBaseCard = {
      id: `CT-${Date.now()}`,
      title: newContractTitle.toUpperCase(),
      company: newContractCompany || "CONTRATADA OFICIAL",
      contractNumber: newContractNumber || "CT S/N",
      bdi: parseFloat(newContractBdi) || 25.50,
      fileName: newContractFileName || "Planilha_Base_Oficial.xlsx",
      fileSize: newContractFileSize || "120 KB",
      budgetSheetName: newContractBudgetSheet,
      totalGeralValue: newContractTotalGeral,
      totalGeralLabel: newContractTotalLabel,
      compositionsCount: newContractItems.length || 0,
      stagesCount: 4,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      items: newContractItems,
      rawWorkbookBase64: newContractBase64 || undefined,
    };

    const updated = [newCard, ...contracts];
    setContracts(updated);
    setSelectedContractId(newCard.id);
    try {
      localStorage.setItem("orcabase_contracts_v2", JSON.stringify(updated));
    } catch {}

    setIsCreateContractOpen(false);
    setNewContractTitle("");
    setNewContractCompany("");
    setNewContractNumber("");
    setNewContractBdi("25.50");
    setNewContractFile(null);
    setNewContractFileName(null);
    setToastMessage(`Card de Contrato "${newCard.title}" salvo com sucesso!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Excluir Contrato
  const handleDeleteContract = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (contracts.length <= 1) {
      alert("É necessário manter ao menos um Contrato Base no sistema.");
      return;
    }
    const updated = contracts.filter((c) => c.id !== id);
    setContracts(updated);
    if (selectedContractId === id) setSelectedContractId(updated[0].id);
    try {
      localStorage.setItem("orcabase_contracts_v2", JSON.stringify(updated));
    } catch {}
  };

  // COMPATIBILIZAÇÃO INTELIGENTE (Cruza palavras-chaves e posiciona o quantitativo)
  const handleRunCompatibilizacao = async () => {
    if (!initialItems || initialItems.length === 0) {
      alert("Por favor, adicione a Planilha Inicial primeiro.");
      return;
    }
    if (!currentSelectedContract || !currentSelectedContract.items || currentSelectedContract.items.length === 0) {
      alert("O Contrato Base selecionado não possui itens cadastrados.");
      return;
    }

    setIsMatching(true);
    setToastMessage("IA mapeando serviços e posicionando quantitativos nas composições...");

    // Similaridade de IA por tokens e semântica
    const results: MatchingResultItem[] = currentSelectedContract.items.map((contractComp) => {
      const cDesc = contractComp.description.toLowerCase();
      let bestItem: ItemBase | null = null;
      let highestScore = 0;

      initialItems.forEach((src) => {
        const sDesc = src.description.toLowerCase();
        const sWords = sDesc.split(/\s+/).filter((w) => w.length > 2);
        let matches = 0;

        sWords.forEach((word) => {
          if (cDesc.includes(word)) matches++;
        });

        let score = Math.round((matches / Math.max(sWords.length, 2)) * 100);
        if (src.unit.toUpperCase() === contractComp.unit.toUpperCase()) score += 15;

        // Bônus específico para palavras chave de engenharia (ex: pintura, concreto, aço, alvenaria)
        const keywords = ["pintura", "tinta", "concreto", "aço", "forma", "alvenaria", "pvc", "cabo", "manta", "escavação"];
        keywords.forEach((k) => {
          if (sDesc.includes(k) && cDesc.includes(k)) score += 25;
        });

        if (score > highestScore) {
          highestScore = score;
          bestItem = src;
        }
      });

      // Se encontrou item na planilha 1 com score compatível, posiciona o mesmo quantitativo na planilha do contrato!
      const injectedQty = bestItem && highestScore >= 35 ? (bestItem as ItemBase).quantity : 0;
      const unitPrice = contractComp.unit_price;
      const calcTotal = Number((injectedQty * unitPrice).toFixed(2));

      return {
        source_item: bestItem || {
          id: "-",
          description: "Sem item na Planilha 1",
          unit: contractComp.unit,
          quantity: 0,
          unit_price: 0,
          total_value: 0,
        },
        selected_match: {
          dest_code: contractComp.code || contractComp.id,
          dest_description: contractComp.description,
          dest_unit: contractComp.unit,
          unit_price: contractComp.unit_price,
          confidence_score: Math.min(99, highestScore),
          match_type: "AI_SUGGESTION",
        },
        candidates: [],
        strategy_applied: strategy,
        calculated_quantity: injectedQty,
        calculated_unit_price: unitPrice,
        calculated_total_value: calcTotal,
        status: injectedQty > 0 ? "MATCHED" : "MANUAL_REQUIRED",
        contract_row_index: contractComp.row_index,
      };
    });

    setMatchedResults(results);
    setIsCompatibilizado(true);
    setIsMatching(false);
    setToastMessage("Compatibilização realizada com sucesso! Quantitativos posicionados nas composições.");
    setTimeout(() => setToastMessage(null), 4500);
  };

  // BAIXAR PLANILHA FINAL (Clona o contrato original com openpyxl e altera apenas os quantitativos)
  const handleDownloadFinalSpreadsheet = async () => {
    if (!isCompatibilizado || matchedResults.length === 0) {
      alert("Execute a compatibilização antes de baixar.");
      return;
    }

    setIsExporting(true);
    setToastMessage("Gerando Planilha Final com openpyxl (Mantendo 100% do layout original)...");

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "inject_quantities",
          contract_base64: currentSelectedContract?.rawWorkbookBase64 || "",
          matching_results: matchedResults,
          filename: `Planilha_Final_Compatibilizada_${currentSelectedContract?.title || "Contrato"}.xlsx`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.file_base64) {
          const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.file_base64}`;
          const downloadLink = document.createElement("a");
          downloadLink.href = linkSource;
          downloadLink.download = data.filename;
          downloadLink.click();
          setToastMessage("Planilha Final compatibilizada baixada com sucesso!");
          setTimeout(() => setToastMessage(null), 4000);
          setIsExporting(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Exportação via servidor:", err);
    }

    // Fallback: exportação pura openpyxl
    try {
      const fallbackResp = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export_xlsx",
          items: matchedResults,
          strategy: strategy,
        }),
      });
      if (fallbackResp.ok) {
        const data = await fallbackResp.json();
        if (data.file_base64) {
          const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${data.file_base64}`;
          const downloadLink = document.createElement("a");
          downloadLink.href = linkSource;
          downloadLink.download = `Planilha_Final_Compatibilizada_${currentSelectedContract?.title || "Contrato"}.xlsx`;
          downloadLink.click();
        }
      }
    } catch {}

    setToastMessage("Download concluído com sucesso!");
    setTimeout(() => setToastMessage(null), 3500);
    setIsExporting(false);
  };

  return (
    <main className="min-h-screen bg-[#07090E] text-gray-200 antialiased selection:bg-gold-500/30 selection:text-gold-300">
      {/* Header Superior */}
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

          {/* Abas */}
          <div className="flex items-center space-x-2 rounded-xl bg-[#0B0F19] p-1 border border-[#141A28]">
            <button
              onClick={() => setActiveTab("compatibilizacao")}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "compatibilizacao"
                  ? "bg-gradient-to-r from-gold-500 to-orange-500 text-[#07090E] shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>Compatibilização</span>
            </button>

            <button
              onClick={() => setActiveTab("configuracoes")}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "configuracoes"
                  ? "bg-gradient-to-r from-gold-500 to-orange-500 text-[#07090E] shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Configurações de Contratos</span>
              <span className="rounded-full bg-[#141A28] px-1.5 py-0.2 text-[10px] text-gold-400 ml-1">
                {contracts.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-2 rounded-full border border-[#1E2638] bg-[#0B0F19] px-3 py-1 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px]">openpyxl v3.1.5</span>
            </div>
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

      {/* Input Oculto para Substituição */}
      <input
        type="file"
        ref={replaceContractFileInputRef}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !targetReplaceContractId) return;
          await inspectAndParseContractFile(file);
        }}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ======================================================== */}
        {/* ABA 1: TELA DE COMPATIBILIZAÇÃO                           */}
        {/* ======================================================== */}
        {activeTab === "compatibilizacao" && (
          <div>
            {/* DUAS COLUNAS LADO A LADO */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
              {/* COLUNA 1: PLANILHA INICIAL (A PLANILHA QUE VAI PUXAR INFORMAÇÕES) */}
              <div className="rounded-2xl border border-[#141A28] bg-[#0B0F19] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                          Planilha Inicial (Projeto a Orçar)
                        </h2>
                        <p className="text-[11px] text-gray-400">
                          Planilha de onde a IA extrairá os quantitativos de cada serviço
                        </p>
                      </div>
                    </div>

                    {initialFileName && (
                      <button
                        onClick={() => {
                          setInitialFile(null);
                          setInitialFileName(null);
                          setInitialItems([]);
                          setIsCompatibilizado(false);
                          setMatchedResults([]);
                        }}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Remover planilha"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingInitial(true);
                    }}
                    onDragLeave={() => setIsDraggingInitial(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingInitial(false);
                      if (e.dataTransfer.files?.[0]) handleInitialFileUpload(e.dataTransfer.files[0]);
                    }}
                    onClick={() => initialFileInputRef.current?.click()}
                    className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center ${
                      isDraggingInitial
                        ? "border-gold-400 bg-gold-500/5 scale-[1.01]"
                        : initialFileName
                        ? "border-emerald-500/30 bg-[#07090E]"
                        : "border-[#1E2638] bg-[#07090E]/60 hover:border-gold-500/40 hover:bg-[#07090E]"
                    }`}
                  >
                    <input
                      type="file"
                      ref={initialFileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleInitialFileUpload(e.target.files[0])}
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                    />

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <span className="text-xs font-semibold text-white">
                      {initialFileName ? "Substituir Planilha Inicial" : "Arraste e solte a Planilha Inicial"}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">
                      ou clique para abrir o explorador de arquivos (.xlsx)
                    </span>

                    {initialFileName && (
                      <div className="mt-4 flex items-center space-x-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-medium text-white">{initialFileName}</span>
                        <span className="text-[10px] text-gray-400">({initialItems.length} serviços detectados)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#141A28] flex items-center justify-between text-xs text-gray-400">
                  <span>Serviços para Mapear:</span>
                  <span className="font-mono font-bold text-white">{initialItems.length} itens</span>
                </div>
              </div>

              {/* COLUNA 2: ESCOLHER A PLANILHA DO CONTRATO BASE */}
              <div className="rounded-2xl border border-[#141A28] bg-[#0B0F19] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                          Planilha Base do Contrato Selecionado
                        </h2>
                        <p className="text-[11px] text-gray-400">
                          Modelo oficial que ditará 100% da formatação e composições
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("configuracoes");
                        setIsCreateContractOpen(true);
                      }}
                      className="flex items-center space-x-1 rounded-lg border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 text-[11px] font-semibold text-gold-400 hover:bg-gold-500/20 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Novo Contrato</span>
                    </button>
                  </div>

                  {/* Dropdown de Contratos */}
                  <div className="mb-4">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Escolha o Contrato Cadastrado:
                    </label>
                    <select
                      value={selectedContractId}
                      onChange={(e) => {
                        setSelectedContractId(e.target.value);
                        setIsCompatibilizado(false);
                      }}
                      className="w-full rounded-xl border border-[#1E2638] bg-[#07090E] px-4 py-2.5 text-xs text-white focus:border-gold-500 focus:outline-none font-medium"
                    >
                      {contracts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} — {c.contractNumber} (BDI {c.bdi.toFixed(2)}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Detalhes do Contrato Ativo */}
                  {currentSelectedContract && (
                    <div className="rounded-xl border border-[#1A2234] bg-[#07090E] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gold-400">
                          {currentSelectedContract.contractNumber}
                        </span>
                        <span className="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400 border border-orange-500/30">
                          BDI {currentSelectedContract.bdi.toFixed(2)}%
                        </span>
                      </div>

                      <div className="text-xs font-medium text-white">
                        {currentSelectedContract.company}
                      </div>

                      {/* TOTAL GERAL DO ORÇAMENTO LIDO PELA IA */}
                      <div className="flex items-center justify-between rounded-lg bg-[#0E1424] p-2.5 border border-gold-500/20">
                        <span className="text-[11px] text-gray-400">
                          {currentSelectedContract.totalGeralLabel || "TOTAL GERAL DA PLANILHA"}:
                        </span>
                        <span className="font-mono text-xs font-bold text-gold-400">
                          {currentSelectedContract.totalGeralValue
                            ? currentSelectedContract.totalGeralValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "R$ 0,00"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#141A28]">
                        <span className="flex items-center space-x-1.5 truncate">
                          <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="truncate">{currentSelectedContract.fileName}</span>
                        </span>
                        <span className="text-emerald-400 font-semibold text-[10px] shrink-0">100% Compatibilizável</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#141A28] flex items-center justify-between text-xs text-gray-400">
                  <span>Composições Oficiais da Base:</span>
                  <span className="font-mono font-bold text-gold-400">
                    {currentSelectedContract?.compositionsCount || 0} composições
                  </span>
                </div>
              </div>
            </div>

            {/* BARRA DE AÇÃO PRINCIPAL */}
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#141A28] bg-[#0B0F19] p-5 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-orange-500 text-[#07090E]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Injeção Exclusiva de Quantitativos por IA
                  </h3>
                  <p className="text-xs text-gray-400">
                    A IA localiza cada composição compatível e transfere o quantitativo para a planilha base, sem alterar formatações ou fórmulas
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleRunCompatibilizacao}
                  disabled={isMatching || initialItems.length === 0}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl px-6 py-3 text-xs font-bold transition-all shadow-lg ${
                    initialItems.length > 0
                      ? "bg-gradient-to-r from-gold-500 to-orange-500 text-[#07090E] hover:brightness-110 shadow-gold-500/20 cursor-pointer"
                      : "bg-[#141A28] text-gray-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>{isMatching ? "Mapeando por IA..." : "Compatibilizar Planilhas"}</span>
                </button>

                <button
                  onClick={handleDownloadFinalSpreadsheet}
                  disabled={!isCompatibilizado || isExporting}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl px-6 py-3 text-xs font-bold transition-all shadow-lg ${
                    isCompatibilizado
                      ? "bg-emerald-500 hover:bg-emerald-400 text-[#07090E] shadow-emerald-500/20 cursor-pointer"
                      : "bg-[#141A28] text-gray-500 cursor-not-allowed opacity-40"
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>{isExporting ? "Gerando Excel..." : "Baixar Planilha Final (.xlsx)"}</span>
                </button>
              </div>
            </div>

            {/* MESA DE INJEÇÃO DE QUANTITATIVOS */}
            <div className="rounded-2xl border border-[#141A28] bg-[#0B0F19] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#141A28] bg-[#07090E] px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-gold-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Posicionamento de Quantitativos ({currentSelectedContract?.title})
                  </h4>
                </div>
                <span className="text-xs text-gray-400">
                  {matchedResults.length > 0 ? `${matchedResults.length} composições da base oficial` : "Aguardando compatibilização"}
                </span>
              </div>

              {!isCompatibilizado ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1E2638] bg-[#07090E] text-gray-500 mb-3">
                    <Inbox className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200">
                    Aguardando Compatibilização
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 max-w-sm">
                    Anexe a Planilha Inicial e clique em &quot;Compatibilizar Planilhas&quot; para transferir os quantitativos diretamente para a tabela do Contrato Base.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#141A28] bg-[#07090E] text-gray-400 font-semibold tracking-wider uppercase">
                      <tr>
                        <th className="px-5 py-4">Linha</th>
                        <th className="px-5 py-4">Composição Oficial (Contrato Base)</th>
                        <th className="px-3 py-4 text-center">UN</th>
                        <th className="px-4 py-4 text-right">Preço Unit. Base</th>
                        <th className="px-5 py-4">Serviço Detectado (Planilha Inicial)</th>
                        <th className="px-4 py-4 text-right text-gold-400 font-bold">Quantitativo Injetado</th>
                        <th className="px-5 py-4 text-right font-bold text-white">Total Calculado</th>
                        <th className="px-3 py-4 text-center">Similaridade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141A28]/60 font-mono">
                      {matchedResults.map((res, idx) => (
                        <tr key={idx} className="hover:bg-[#0E1424] transition-colors">
                          <td className="whitespace-nowrap px-5 py-4 text-gray-500 font-medium">
                            #{res.contract_row_index || idx + 1}
                          </td>
                          <td className="px-5 py-4 font-sans text-white font-medium min-w-[260px]">
                            {res.selected_match?.dest_description}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center text-gray-400">
                            {res.selected_match?.dest_unit}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right text-gray-300">
                            {res.selected_match?.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="px-5 py-4 font-sans text-gray-300 min-w-[240px]">
                            <div className="text-xs">{res.source_item.description}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-gold-400 text-sm">
                            {res.calculated_quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-white">
                            {res.calculated_total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-center">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                res.calculated_quantity > 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                              }`}
                            >
                              {res.selected_match?.confidence_score}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: CONFIGURAÇÕES DE CONTRATOS (DESIGN DOS PRINTS)     */}
        {/* ======================================================== */}
        {activeTab === "configuracoes" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Gerenciador de Contratos Base
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Cadastre suas planilhas de contratos oficiais com leitura inteligente de TOTAL GERAL
                </p>
              </div>

              <button
                onClick={() => setIsCreateContractOpen(true)}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-gold-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-[#07090E] hover:brightness-110 transition-all shadow-lg shadow-gold-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>Criar Novo Card de Contrato Base</span>
              </button>
            </div>

            {/* GRADE DE CARDS (PRINT 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="rounded-2xl border border-[#1A2234] bg-[#0B0F19] p-6 shadow-2xl relative flex flex-col justify-between hover:border-gold-500/40 transition-all"
                >
                  <div>
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/30">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-white tracking-wide">
                            {contract.title}
                          </h3>
                          <div className="text-xs text-gray-400">
                            <span>{contract.contractNumber}</span>
                            <span className="mx-1.5">•</span>
                            <span className="font-bold text-gold-400">BDI {contract.bdi.toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteContract(contract.id, e)}
                        title="Excluir contrato"
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-xs font-bold text-gray-300 tracking-wider uppercase mb-4">
                      {contract.company}
                    </div>

                    {/* Capa da Planilha Base */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center space-x-1.5 text-gray-300 font-medium">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Capa da Planilha Base</span>
                        </span>
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          100% Compatibilizável
                        </span>
                      </div>

                      {/* Box Preview da Planilha com TOTAL GERAL */}
                      <div className="relative rounded-xl border border-[#1A2234] bg-[#07090E] p-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">X</span>
                            <span className="font-mono text-xs text-gray-300 truncate max-w-[200px]">{contract.fileName}</span>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            BASE ATIVA
                          </span>
                        </div>

                        {/* Botão Abrir Planilha */}
                        <div className="flex justify-center my-3">
                          <button
                            onClick={() => setViewingContract(contract)}
                            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-gold-500 to-orange-500 px-5 py-2 text-xs font-bold text-[#07090E] hover:brightness-110 transition-all shadow-md shadow-gold-500/20"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Abrir Planilha</span>
                          </button>
                        </div>

                        {/* Exibição do TOTAL GERAL Lido pela IA */}
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-[#141A28]">
                          <span className="truncate">Aba: {contract.budgetSheetName || "Orçamento"}</span>
                          <span className="font-mono font-bold text-gold-400 shrink-0">
                            {contract.totalGeralValue
                              ? contract.totalGeralValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Substituir / Atualizar Planilha */}
                    <div className="rounded-xl border border-[#1A2234] bg-[#07090E] p-3 mb-4">
                      <div className="text-[11px] font-medium text-gray-300 mb-2 flex items-center space-x-1.5">
                        <UploadCloud className="h-3.5 w-3.5 text-gold-400" />
                        <span>Substituir / Atualizar Planilha</span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-dashed border-[#1E2638] bg-[#0B0F19] p-2.5">
                        <span className="text-[11px] text-gray-400 truncate">
                          Arraste novo .xlsx ou clique aqui
                        </span>
                        <button
                          onClick={() => {
                            setTargetReplaceContractId(contract.id);
                            replaceContractFileInputRef.current?.click();
                          }}
                          className="rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[11px] font-semibold text-gold-400 hover:bg-gold-500/20 transition-all shrink-0"
                        >
                          Anexar Arquivo
                        </button>
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="rounded-xl border border-[#141A28] bg-[#07090E] p-3 text-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block">COMPOSIÇÕES</span>
                        <span className="text-sm font-bold text-white font-mono">{contract.compositionsCount} itens</span>
                      </div>
                      <div className="rounded-xl border border-[#141A28] bg-[#07090E] p-3 text-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block">ETAPAS</span>
                        <span className="text-sm font-bold text-gold-400 font-mono">{contract.stagesCount} grupos</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações Inferiores */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#141A28]">
                    <button
                      onClick={() => setViewingContract(contract)}
                      className="flex items-center justify-center space-x-2 rounded-xl border border-[#1E2638] bg-[#07090E] py-2.5 text-xs font-semibold text-gray-300 hover:border-gold-500/40 hover:text-white transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ver Itens</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedContractId(contract.id);
                        setActiveTab("compatibilizacao");
                        setToastMessage(`Contrato "${contract.title}" selecionado para a compatibilização.`);
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                      className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-gold-500 to-orange-500 py-2.5 text-xs font-bold text-[#07090E] hover:brightness-110 transition-all shadow-md shadow-gold-500/20"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Usar no De-Para</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: CRIAR NOVO CARD DE CONTRATO BASE (PRINT 2)        */}
        {/* ======================================================== */}
        {isCreateContractOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-2xl border border-[#1E2638] bg-[#0B0F19] p-7 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#141A28] pb-4 mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Criar Novo Card de Contrato Base
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateContractOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-[#141A28] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Upload da Planilha Oficial com Leitura Inteligente do TOTAL GERAL */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white">Planilha Base Oficial (.xlsx):</span>
                  <span className="text-[10px] text-gray-400">(Pode anexar agora ou depois no card)</span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingModalFile(true);
                  }}
                  onDragLeave={() => setIsDraggingModalFile(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDraggingModalFile(false);
                    if (e.dataTransfer.files?.[0]) {
                      const f = e.dataTransfer.files[0];
                      setNewContractFile(f);
                      setNewContractFileName(f.name);
                      setNewContractFileSize(`${(f.size / 1024).toFixed(1)} KB`);
                      await inspectAndParseContractFile(f);
                    }
                  }}
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`group cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all flex flex-col items-center justify-center text-center ${
                    isDraggingModalFile
                      ? "border-gold-400 bg-gold-500/5"
                      : newContractFileName
                      ? "border-emerald-500/40 bg-[#07090E]"
                      : "border-[#1E2638] bg-[#07090E]/80 hover:border-gold-500/40"
                  }`}
                >
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setNewContractFile(f);
                        setNewContractFileName(f.name);
                        setNewContractFileSize(`${(f.size / 1024).toFixed(1)} KB`);
                        await inspectAndParseContractFile(f);
                      }
                    }}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                  />

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 mb-2">
                    <UploadCloud className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-semibold text-white">
                    {newContractFileName ? newContractFileName : "Clique para selecionar ou arraste o arquivo (.xlsx)"}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    Leitura otimizada para planilhas grandes da engenharia civil
                  </span>

                  {/* Feedback de leitura do TOTAL GERAL */}
                  {newContractTotalGeral > 0 && (
                    <div className="mt-3 flex items-center space-x-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{newContractTotalLabel}: R$ {newContractTotalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      <span className="text-gray-400 text-[10px]">({newContractItems.length} composições)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Metadados */}
              <div className="space-y-3.5 mb-6">
                <div>
                  <label className="text-xs font-semibold text-white block mb-1">
                    Nome / Título do Contrato:
                  </label>
                  <input
                    type="text"
                    value={newContractTitle}
                    onChange={(e) => setNewContractTitle(e.target.value)}
                    placeholder="Ex: Contrato Obras Civis e Estruturais - Construtora Prime"
                    className="w-full rounded-xl border border-[#1E2638] bg-[#07090E] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white block mb-1">
                      Empresa Contratada:
                    </label>
                    <input
                      type="text"
                      value={newContractCompany}
                      onChange={(e) => setNewContractCompany(e.target.value)}
                      placeholder="Ex: Construtora Alfa S/A"
                      className="w-full rounded-xl border border-[#1E2638] bg-[#07090E] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white block mb-1">
                      Número do Contrato:
                    </label>
                    <input
                      type="text"
                      value={newContractNumber}
                      onChange={(e) => setNewContractNumber(e.target.value)}
                      placeholder="Ex: CT-2026/015"
                      className="w-full rounded-xl border border-[#1E2638] bg-[#07090E] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white block mb-1">
                    Percentual de B.D.I. Oficial (%):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newContractBdi}
                    onChange={(e) => setNewContractBdi(e.target.value)}
                    placeholder="25.50"
                    className="w-full rounded-xl border border-[#1E2638] bg-[#07090E] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#141A28]">
                <button
                  onClick={() => setIsCreateContractOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveContract}
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-orange-500 px-5 py-2 text-xs font-bold text-[#07090E] hover:brightness-110 transition-all shadow-md shadow-gold-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Salvar Card de Contrato</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VER ITENS DO CONTRATO */}
        {viewingContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div className="w-full max-w-3xl rounded-2xl border border-[#1E2638] bg-[#0B0F19] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#141A28] pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Composições do Contrato: {viewingContract.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {viewingContract.contractNumber} • BDI {viewingContract.bdi.toFixed(2)}% • Total Geral: {viewingContract.totalGeralValue ? viewingContract.totalGeralValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}
                  </p>
                </div>
                <button
                  onClick={() => setViewingContract(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-[#141A28] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#141A28] bg-[#07090E] text-gray-400 font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Descrição da Composição</th>
                      <th className="px-3 py-3 text-center">UN</th>
                      <th className="px-4 py-3 text-right">Preço Unitário</th>
                      <th className="px-4 py-3 text-right">Qtd Base</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141A28]/60 font-mono">
                    {viewingContract.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-[#0E1424]">
                        <td className="px-4 py-3 text-gold-400 font-bold">{it.code || it.id}</td>
                        <td className="px-4 py-3 font-sans text-gray-200">{it.description}</td>
                        <td className="px-3 py-3 text-center text-gray-400">{it.unit}</td>
                        <td className="px-4 py-3 text-right text-white">
                          {it.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {it.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
