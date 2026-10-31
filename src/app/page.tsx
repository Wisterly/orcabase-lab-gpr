"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  UploadCloud,
  Sparkles,
  Download,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Settings,
  Plus,
  Check,
  Search,
  Layers,
  Edit3,
  X,
  Eye,
  Cpu,
  Scale,
  Calculator,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
} from "lucide-react";
import {
  ItemBase,
  ContractBaseCard,
  ContractCompositionMatch,
  CalculationStrategy,
  SpreadsheetStudy,
  CustomColumnKeywords,
  ExplicitColumnOverrides,
  PendingResolutionItem,
} from "../types";
import {
  studySpreadsheetFromBuffer,
  arrayBufferToBase64,
  saveContractBinary,
  getContractBinary,
  deleteContractBinary,
  buildCompatibilityMatrix,
  applyCalculationStrategyToMatches,
  triggerBase64ExcelDownload,
  triggerBlobDownload,
  injectQuantitiesPreservingOriginalWorkbook,
  colIndexToLetter,
  injectQuantitiesClientFallback,
  buildCompatOutputFileName,
  calculateItemSimilarity,
} from "../lib/excelEngine";

const STORAGE_KEY_CONTRACTS = "orcabase_gpr_contracts_v9";

const INITIAL_CONTRACTS: ContractBaseCard[] = [
  {
    id: "ct-default-1",
    contractName: "Manutenção Predial e Adequação Civil — Lote 01",
    contractNumber: "045/2026-GPR",
    organization: "Secretaria de Infraestrutura / GPR",
    bdiPercent: 24.5,
    referenceBase: "SINAPI / ORSE",
    updatedAt: "31/10/2026",
    fileName: "Planilha_Base_Contrato_045_2026.xlsx",
    budgetSheetName: "Orçamento",
    sheetNames: ["Orçamento"],
    totalGeralValue: 412850.0,
    totalGeralLabel: "TOTAL GERAL DO ORÇAMENTO",
    detectedColumns: {
      headerRow: 4,
      colItem: 1,
      colCode: 2,
      colSource: 3,
      colDesc: 4,
      colUnit: 5,
      colQty: 6,
      colUnitPrice: 7,
      colPrice: 7,
      colTotal: 8,
      qtyColLetter: "F",
      colQtyLetter: "F",
      descHeaderName: "DISCRIMINAÇÃO / COMPOSIÇÃO",
      unitHeaderName: "UNID.",
      qtyHeaderName: "QUANTITATIVO",
      priceHeaderName: "PREÇO UNITÁRIO",
      totalHeaderName: "VALOR TOTAL",
      codeHeaderName: "CÓDIGO",
    },
    stages: [
      { code: "1.0", title: "SERVIÇOS DE PINTURA E ACABAMENTOS", discipline: "PINTURA", rowIndex: 5, itemsCount: 2, subtotal: 45200 },
      { code: "2.0", title: "ESTRUTURA E CONCRETAGEM", discipline: "ESTRUTURA", rowIndex: 8, itemsCount: 3, subtotal: 198450 },
      { code: "3.0", title: "ALVENARIA, PISOS E REVESTIMENTOS", discipline: "REVESTIMENTO", rowIndex: 12, itemsCount: 2, subtotal: 94200 },
      { code: "4.0", title: "INSTALAÇÕES HIDRÁULICAS E ELÉTRICAS", discipline: "HIDRÁULICA", rowIndex: 15, itemsCount: 2, subtotal: 75000 },
    ],
    itemsCount: 9,
    items: [
      {
        id: "SINAPI-88489",
        itemNumber: "1.1",
        code: "88489",
        source: "SINAPI",
        description: "Pintura látex acrílica premium em paredes internas/externas, 2 demãos",
        unit: "M2",
        quantity: 1200,
        unit_price: 26.5,
        total_value: 31800,
        row_index: 6,
        stage_code: "1.0",
        stage_title: "SERVIÇOS DE PINTURA E ACABAMENTOS",
        discipline: "PINTURA",
      },
      {
        id: "SINAPI-88485",
        itemNumber: "1.2",
        code: "88485",
        source: "SINAPI",
        description: "Aplicação de fundo selador acrílico em paredes internas e externas",
        unit: "M2",
        quantity: 1200,
        unit_price: 11.16,
        total_value: 13400,
        row_index: 7,
        stage_code: "1.0",
        stage_title: "SERVIÇOS DE PINTURA E ACABAMENTOS",
        discipline: "PINTURA",
      },
      {
        id: "SINAPI-94965",
        itemNumber: "2.1",
        code: "94965",
        source: "SINAPI",
        description: "Concreto FCK 30MPa, traço 1:2,1:2,5 (em massa seca de cimento/areia/brita) — preparo mecânico e lançamento",
        unit: "M3",
        quantity: 210,
        unit_price: 540.2,
        total_value: 113442,
        row_index: 9,
        stage_code: "2.0",
        stage_title: "ESTRUTURA E CONCRETAGEM",
        discipline: "ESTRUTURA",
      },
      {
        id: "SINAPI-92762",
        itemNumber: "2.2",
        code: "92762",
        source: "SINAPI",
        description: "Armação de pilar ou viga de uma estrutura convencional de concreto armado utilizando aço CA-50 de 10,0 mm",
        unit: "KG",
        quantity: 4200,
        unit_price: 13.8,
        total_value: 57960,
        row_index: 10,
        stage_code: "2.0",
        stage_title: "ESTRUTURA E CONCRETAGEM",
        discipline: "ESTRUTURA",
      },
      {
        id: "SINAPI-92419",
        itemNumber: "2.3",
        code: "92419",
        source: "SINAPI",
        description: "Montagem e desmontagem de fôrma de viga, escada e pilar em chapa de madeira compensada resinada",
        unit: "M2",
        quantity: 290,
        unit_price: 93.26,
        total_value: 27048,
        row_index: 11,
        stage_code: "2.0",
        stage_title: "ESTRUTURA E CONCRETAGEM",
        discipline: "ESTRUTURA",
      },
      {
        id: "SINAPI-87495",
        itemNumber: "3.1",
        code: "87495",
        source: "SINAPI",
        description: "Alvenaria de vedação de blocos cerâmicos furados na horizontal de 9x19x19 cm (espessura 9 cm)",
        unit: "M2",
        quantity: 650,
        unit_price: 82.0,
        total_value: 53300,
        row_index: 13,
        stage_code: "3.0",
        stage_title: "ALVENARIA, PISOS E REVESTIMENTOS",
        discipline: "ALVENARIA",
      },
      {
        id: "SINAPI-87263",
        itemNumber: "3.2",
        code: "87263",
        source: "SINAPI",
        description: "Revestimento cerâmico para piso ou parede com placas tipo porcelanato 60x60 cm",
        unit: "M2",
        quantity: 320,
        unit_price: 127.81,
        total_value: 40900,
        row_index: 14,
        stage_code: "3.0",
        stage_title: "ALVENARIA, PISOS E REVESTIMENTOS",
        discipline: "PISOS",
      },
      {
        id: "SINAPI-89356",
        itemNumber: "4.1",
        code: "89356",
        source: "SINAPI",
        description: "Tubo PVC, série normal, esgoto predial, DN 100 mm, fornecido e instalado em ramal de descarga ou esgoto",
        unit: "M",
        quantity: 450,
        unit_price: 85.0,
        total_value: 38250,
        row_index: 16,
        stage_code: "4.0",
        stage_title: "INSTALAÇÕES HIDRÁULICAS E ELÉTRICAS",
        discipline: "HIDRÁULICA",
      },
      {
        id: "SINAPI-91926",
        itemNumber: "4.2",
        code: "91926",
        source: "SINAPI",
        description: "Cabo de cobre flexível isolado, 2,5 mm², anti-chama 450/750 V, para circuitos terminais elétricos — fornecido e instalado",
        unit: "M",
        quantity: 3500,
        unit_price: 10.5,
        total_value: 36750,
        row_index: 17,
        stage_code: "4.0",
        stage_title: "INSTALAÇÕES HIDRÁULICAS E ELÉTRICAS",
        discipline: "ELÉTRICA",
      },
    ],
  },
];

export default function OrcaBaseDashboard() {
  // Navegação de Abas
  const [activeTab, setActiveTab] = useState<"WORKSPACE" | "SETTINGS">("WORKSPACE");

  // Contratos Base cadastrados nas Configurações
  const [contracts, setContracts] = useState<ContractBaseCard[]>(INITIAL_CONTRACTS);
  const [selectedContractId, setSelectedContractId] = useState<string>("ct-default-1");
  const [expandedContractStudyId, setExpandedContractStudyId] = useState<string | null>(null);

  // Planilha 1 (Origem dos Quantitativos)
  const [initialFileName, setInitialFileName] = useState<string | null>(null);
  const [sheet1RawBuffer, setSheet1RawBuffer] = useState<ArrayBuffer | null>(null);
  const [sheet1Study, setSheet1Study] = useState<SpreadsheetStudy | null>(null);
  const [isDraggingInitial, setIsDraggingInitial] = useState(false);

  // Estratégia de Quantitativo (As 2 opções solicitadas pelo usuário)
  const [calcStrategy, setCalcStrategy] = useState<CalculationStrategy["mode"]>("KEEP_TOTAL_VALUE");
  const [customTargetTotal, setCustomTargetTotal] = useState<string>("");

  // Matriz de Compatibilização (Todas as composições da Planilha Base do Contrato com os quantitativos posicionados)
  const [compositionMatches, setCompositionMatches] = useState<ContractCompositionMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filtros da Mesa de Alocação
  const [searchFilter, setSearchFilter] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("ALL");
  const [showOnlyMatched, setShowOnlyMatched] = useState<boolean>(false);
  const [activeResultTab, setActiveResultTab] = useState<"CONTRACT_VIEW" | "DIFFICULTY_VIEW">("CONTRACT_VIEW");

  // Modal de Troca Manual de Item da Planilha 1 para uma Composição do Contrato
  const [activeSwapContractIndex, setActiveSwapContractIndex] = useState<number | null>(null);
  const [swapModalSearch, setSwapModalSearch] = useState<string>("");

  // Modal de Resolução de Composição sem Similaridade Direta (Atenção Necessária)
  const [resolvingSourceItem, setResolvingSourceItem] = useState<ItemBase | null>(null);
  const [resolvingSearchText, setResolvingSearchText] = useState<string>("");

  // Modal de Criação de Novo Contrato na Aba Configurações
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [isInspectingContract, setIsInspectingContract] = useState(false);
  const [newContractName, setNewContractName] = useState("");
  const [newContractNumber, setNewContractNumber] = useState("");
  const [newContractOrg, setNewContractOrg] = useState("");
  const [newContractBdi, setNewContractBdi] = useState("24.50");
  const [newContractBaseRef, setNewContractBaseRef] = useState("SINAPI");
  const [newContractFileName, setNewContractFileName] = useState<string | null>(null);
  const [newContractBuffer, setNewContractBuffer] = useState<ArrayBuffer | null>(null);
  const [newContractStudy, setNewContractStudy] = useState<SpreadsheetStudy | null>(null);
  const [newContractStartRow, setNewContractStartRow] = useState<number | string>("");
  const [newContractEndRow, setNewContractEndRow] = useState<number | string>("");
  const [isDraggingContract, setIsDraggingContract] = useState(false);

  // Palavras-chave personalizadas no cadastro do contrato (busca por Nome da Coluna)
  const [customDescKeyword, setCustomDescKeyword] = useState(
    "Descrição, Composição, Discriminação, Especificação, Serviço"
  );
  const [customUnitKeyword, setCustomUnitKeyword] = useState("Unidade, Unid., Und, Un");
  const [customQtyKeyword, setCustomQtyKeyword] = useState(
    "Quantitativo, Quantidade, Quant., Qtd, Qtde"
  );
  const [customTotalKeyword, setCustomTotalKeyword] = useState(
    "Total Geral, Valor Total, Total do Orçamento"
  );

  // Estado de atualização de card existente na Aba Configurações
  const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);

  // Notificação Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const initialFileInputRef = useRef<HTMLInputElement>(null);
  const contractFileInputRef = useRef<HTMLInputElement>(null);
  const selectedContractQuickUploadRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  // Carrega contratos salvos no navegador
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTRACTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContracts(parsed);
          setSelectedContractId(parsed[0].id);
        }
      }
    } catch {
      // Ignora erro de parse
    }
  }, []);

  // Salva metadados e estudo completo dos contratos no localStorage (o binário pesado fica no IndexedDB)
  const persistContracts = (updated: ContractBaseCard[]) => {
    setContracts(updated);
    try {
      const lightCopy = updated.map((c) => {
        const copy = { ...c };
        delete copy.rawWorkbookBase64;
        return copy;
      });
      localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(lightCopy));
    } catch {
      // Mantém em memória
    }
  };

  const selectedContract = useMemo(
    () => contracts.find((c) => c.id === selectedContractId) || contracts[0],
    [contracts, selectedContractId]
  );

  // Valor Alvo Efetivo para o modo KEEP_TOTAL_VALUE
  const effectiveTargetTotal = useMemo(() => {
    const parsedCustom = parseFloat(customTargetTotal.replace(/\./g, "").replace(",", "."));
    if (!isNaN(parsedCustom) && parsedCustom > 0) {
      return parsedCustom;
    }
    return sheet1Study?.totalGeralValue || 0;
  }, [customTargetTotal, sheet1Study]);

  // ============================================================================
  // 1. LEITURA E ESTUDO 100% DA PLANILHA 1 PELOS NOMES DAS COLUNAS
  // ============================================================================
  const handleProcessSheet1File = async (
    file: File,
    preferredSheet?: string,
    overrides?: ExplicitColumnOverrides
  ) => {
    setInitialFileName(file.name);
    setIsProcessing(true);
    try {
      const buf = await file.arrayBuffer();
      setSheet1RawBuffer(buf);
      const study = studySpreadsheetFromBuffer(
        buf,
        preferredSheet,
        file.name,
        `${Math.round(file.size / 1024)} KB`,
        undefined,
        overrides
      );
      setSheet1Study(study);
      setCustomTargetTotal(
        study.totalGeralValue.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
      setCompositionMatches([]);
      showToast(
        `Planilha 1 lida pelos nomes das colunas: Composição ("${study.detectedColumns.descHeaderName}"), Quantitativo ("${study.detectedColumns.qtyHeaderName}") | ${study.items.length} itens!`
      );
    } catch (err) {
      console.error(err);
      showToast("Erro ao ler a Planilha 1. Verifique se é um arquivo Excel (.xlsx/.xls) válido.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeSheet1TabOrColumns = (
    newSheetName?: string,
    overrides?: ExplicitColumnOverrides
  ) => {
    if (!sheet1RawBuffer) return;
    const targetSheet = newSheetName || sheet1Study?.selectedSheetName;
    const study = studySpreadsheetFromBuffer(
      sheet1RawBuffer,
      targetSheet,
      initialFileName || "Planilha_1.xlsx",
      "0 KB",
      undefined,
      overrides
    );
    setSheet1Study(study);
    setCustomTargetTotal(
      study.totalGeralValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
    setCompositionMatches([]);
    showToast(
      `Colunas remapeadas por nome: Composição="${study.detectedColumns.descHeaderName}", Quantitativo="${study.detectedColumns.qtyHeaderName}" (${study.items.length} serviços).`
    );
  };

  // ============================================================================
  // 2. LEITURA E ESTUDO 100% DA PLANILHA 2 (CONTRATO BASE NAS CONFIGURAÇÕES) POR NOME DE COLUNA
  // ============================================================================
  const buildCustomKeywordsObject = (): CustomColumnKeywords => ({
    descKeyword: customDescKeyword.split(",")[0]?.trim() || "",
    unitKeyword: customUnitKeyword.split(",")[0]?.trim() || "",
    qtyKeyword: customQtyKeyword.split(",")[0]?.trim() || "",
    totalKeyword: customTotalKeyword.split(",")[0]?.trim() || "",
  });

  const inspectNewContractModalFile = async (
    file: File,
    preferredSheet?: string,
    overrides?: ExplicitColumnOverrides
  ) => {
    setIsInspectingContract(true);
    setNewContractFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      setNewContractBuffer(buf);
      const study = studySpreadsheetFromBuffer(
        buf,
        preferredSheet,
        file.name,
        `${Math.round(file.size / 1024)} KB`,
        buildCustomKeywordsObject(),
        overrides
      );
      setNewContractStudy(study);
      setNewContractStartRow(study.detectedColumns.startRow || 2);
      setNewContractEndRow(study.detectedColumns.endRow || study.items.length + 10);
      showToast(
        `Colunas localizadas por nome: Composição="${study.detectedColumns.descHeaderName}" | Quantitativo="${study.detectedColumns.qtyHeaderName}" | Unidade="${study.detectedColumns.unitHeaderName}" (${study.items.length} composições filtradas)`
      );
    } catch (err) {
      console.error(err);
      showToast("Não foi possível analisar a planilha anexada.");
    } finally {
      setIsInspectingContract(false);
    }
  };

  const handleChangeNewContractModalTabOrCols = (
    sheetName?: string,
    overrides?: ExplicitColumnOverrides
  ) => {
    if (!newContractBuffer) return;
    const targetSheet = sheetName || newContractStudy?.selectedSheetName;
    const study = studySpreadsheetFromBuffer(
      newContractBuffer,
      targetSheet,
      newContractFileName || "Contrato.xlsx",
      "0 KB",
      buildCustomKeywordsObject(),
      overrides
    );
    setNewContractStudy(study);
    showToast(
      `Mapeamento atualizado pelo nome da coluna: Quantitativo="${study.detectedColumns.qtyHeaderName}", Composição="${study.detectedColumns.descHeaderName}" (${study.items.length} itens)`
    );
  };

  // Atualiza planilha direto num Card existente na aba Configurações
  const handleUpdateExistingContractCardFile = async (contractId: string, file: File) => {
    setUpdatingCardId(contractId);
    try {
      const buf = await file.arrayBuffer();
      const b64 = arrayBufferToBase64(buf);
      const study = studySpreadsheetFromBuffer(
        buf,
        undefined,
        file.name,
        `${Math.round(file.size / 1024)} KB`,
        buildCustomKeywordsObject()
      );

      await saveContractBinary(contractId, b64);

      const updatedList = contracts.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          fileName: file.name,
          updatedAt: new Date().toLocaleDateString("pt-BR"),
          sheetNames: study.sheetNames,
          budgetSheetName: study.selectedSheetName,
          totalGeralValue: study.totalGeralValue,
          totalGeralLabel: study.totalGeralLabel,
          detectedColumns: study.detectedColumns,
          stages: study.stages,
          itemsCount: study.items.length,
          items: study.items,
        };
      });

      persistContracts(updatedList);
      setExpandedContractStudyId(contractId);
      if (selectedContractId === contractId) {
        setCompositionMatches([]);
      }
      showToast(
        `Planilha "${file.name}" lida pelos nomes das colunas: Quantitativo="${study.detectedColumns.qtyHeaderName}", Composição="${study.detectedColumns.descHeaderName}" (${study.items.length} composições)!`
      );
    } catch (err) {
      console.error(err);
      showToast("Erro ao processar a planilha no contrato.");
    } finally {
      setUpdatingCardId(null);
    }
  };

  // Permite trocar a aba ou o nome da coluna de Quantitativo/Composição/Unidade em um Card já salvo
  const handleRemapExistingContractCard = async (
    contractId: string,
    newSheetName?: string,
    overrides?: ExplicitColumnOverrides
  ) => {
    setUpdatingCardId(contractId);
    try {
      const b64 = await getContractBinary(contractId);
      if (!b64) {
        showToast("Anexe o arquivo .xlsx neste card para alternar abas ou colunas pelo nome.");
        return;
      }
      const binaryString = window.atob(b64.includes(",") ? b64.split(",")[1] : b64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const currentCard = contracts.find((c) => c.id === contractId);
      const currentOverrides: ExplicitColumnOverrides = {
        colDesc: overrides?.colDesc || currentCard?.detectedColumns?.colDesc,
        colUnit: overrides?.colUnit || currentCard?.detectedColumns?.colUnit,
        colQty: overrides?.colQty || currentCard?.detectedColumns?.colQty,
        colPrice: overrides?.colPrice || currentCard?.detectedColumns?.colPrice,
        colTotal: overrides?.colTotal || currentCard?.detectedColumns?.colTotal,
        startRow: overrides?.startRow || currentCard?.detectedColumns?.startRow,
        endRow: overrides?.endRow || currentCard?.detectedColumns?.endRow,
      };

      const study = studySpreadsheetFromBuffer(
        bytes.buffer,
        newSheetName || currentCard?.budgetSheetName,
        currentCard?.fileName || "Contrato.xlsx",
        "0 KB",
        buildCustomKeywordsObject(),
        newSheetName ? undefined : currentOverrides
      );

      const updatedList = contracts.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          budgetSheetName: study.selectedSheetName,
          startRow: study.detectedColumns.startRow,
          endRow: study.detectedColumns.endRow,
          totalGeralValue: study.totalGeralValue,
          totalGeralLabel: study.totalGeralLabel,
          detectedColumns: study.detectedColumns,
          stages: study.stages,
          itemsCount: study.items.length,
          items: study.items,
        };
      });
      persistContracts(updatedList);
      if (selectedContractId === contractId) {
        setCompositionMatches([]);
      }
      showToast(
        `Colunas atualizadas pelo nome: Quantitativo="${study.detectedColumns.qtyHeaderName}", Composição="${study.detectedColumns.descHeaderName}" (${study.items.length} composições).`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingCardId(null);
    }
  };

  // Ajusta o intervalo de linhas inicial e final das composições com código em um contrato
  const handleUpdateContractRowRange = async (
    contractId: string,
    startRow: number,
    endRow: number
  ) => {
    if (!startRow || !endRow || endRow < startRow) {
      showToast("A Linha Final deve ser maior ou igual à Linha Inicial.");
      return;
    }
    setUpdatingCardId(contractId);
    try {
      const b64 = await getContractBinary(contractId);
      const currentCard = contracts.find((c) => c.id === contractId);

      if (!b64) {
        const updatedList = contracts.map((c) => {
          if (c.id !== contractId) return c;
          const filtered = (c.items || []).filter((it) => {
            const r = it.row_index || 0;
            return r >= startRow && r <= endRow;
          });
          return {
            ...c,
            startRow,
            endRow,
            detectedColumns: {
              ...c.detectedColumns!,
              startRow,
              endRow,
            },
            itemsCount: filtered.length,
            items: filtered,
          };
        });
        persistContracts(updatedList);
        if (selectedContractId === contractId) {
          setCompositionMatches([]);
        }
        showToast(`Intervalo atualizado: Linhas ${startRow} a ${endRow} selecionadas!`);
        return;
      }

      const binaryString = window.atob(b64.includes(",") ? b64.split(",")[1] : b64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const currentOverrides: ExplicitColumnOverrides = {
        colDesc: currentCard?.detectedColumns?.colDesc,
        colUnit: currentCard?.detectedColumns?.colUnit,
        colQty: currentCard?.detectedColumns?.colQty,
        colPrice: currentCard?.detectedColumns?.colPrice,
        colTotal: currentCard?.detectedColumns?.colTotal,
        colCode: currentCard?.detectedColumns?.colCode,
        colSource: currentCard?.detectedColumns?.colSource,
        startRow,
        endRow,
      };

      const study = studySpreadsheetFromBuffer(
        bytes.buffer,
        currentCard?.budgetSheetName,
        currentCard?.fileName || "Contrato.xlsx",
        "0 KB",
        buildCustomKeywordsObject(),
        currentOverrides
      );

      const updatedList = contracts.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          startRow,
          endRow,
          detectedColumns: study.detectedColumns,
          stages: study.stages,
          itemsCount: study.items.length,
          items: study.items,
        };
      });

      persistContracts(updatedList);
      if (selectedContractId === contractId) {
        setCompositionMatches([]);
      }
      showToast(
        `Intervalo atualizado com sucesso! ${study.items.length} composições com código filtradas entre a Linha ${startRow} e Linha ${endRow}.`
      );
    } catch (e) {
      console.error(e);
      showToast("Erro ao filtrar o intervalo de composições.");
    } finally {
      setUpdatingCardId(null);
    }
  };

  const handleSaveNewContract = async () => {
    if (!newContractName.trim() || !newContractNumber.trim()) {
      showToast("Preencha o Nome do Contrato e o Número do Contrato.");
      return;
    }
    if (!newContractStudy || newContractStudy.items.length === 0) {
      showToast("Anexe uma planilha orçamentária válida (.xlsx) para criar o Contrato Base.");
      return;
    }

    const newId = `ct-${Date.now()}`;
    if (newContractBuffer) {
      const b64 = arrayBufferToBase64(newContractBuffer);
      await saveContractBinary(newId, b64);
    }

    const finalStartRow = Number(newContractStartRow) || newContractStudy.detectedColumns?.startRow;
    const finalEndRow = Number(newContractEndRow) || newContractStudy.detectedColumns?.endRow;

    const newCard: ContractBaseCard = {
      id: newId,
      contractName: newContractName.trim(),
      contractNumber: newContractNumber.trim(),
      organization: newContractOrg.trim() || "GPR / Engenharia",
      bdiPercent: parseFloat(newContractBdi) || 0,
      referenceBase: newContractBaseRef.trim() || "SINAPI",
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      fileName: newContractFileName || "Planilha_Base.xlsx",
      sheetNames: newContractStudy.sheetNames,
      budgetSheetName: newContractStudy.selectedSheetName,
      startRow: finalStartRow,
      endRow: finalEndRow,
      totalGeralValue: newContractStudy.totalGeralValue,
      totalGeralLabel: newContractStudy.totalGeralLabel,
      detectedColumns: {
        ...newContractStudy.detectedColumns,
        startRow: finalStartRow,
        endRow: finalEndRow,
      },
      customKeywords: buildCustomKeywordsObject(),
      stages: newContractStudy.stages,
      itemsCount: newContractStudy.items.length,
      items: newContractStudy.items,
    };

    const updated = [newCard, ...contracts];
    persistContracts(updated);
    setSelectedContractId(newCard.id);

    setNewContractName("");
    setNewContractNumber("");
    setNewContractOrg("");
    setNewContractFileName(null);
    setNewContractBuffer(null);
    setNewContractStudy(null);
    setIsAddingContract(false);
    showToast(
      `Contrato "${newCard.contractNumber}" salvo! Ajuste será feito na coluna de nome "${newCard.detectedColumns?.qtyHeaderName}".`
    );
  };

  const handleDeleteContract = async (id: string) => {
    if (contracts.length <= 1) {
      showToast("O sistema precisa manter pelo menos 1 Contrato Base cadastrado.");
      return;
    }
    await deleteContractBinary(id);
    const updated = contracts.filter((c) => c.id !== id);
    persistContracts(updated);
    if (selectedContractId === id) {
      setSelectedContractId(updated[0].id);
    }
    showToast("Contrato Base removido.");
  };

  // ============================================================================
  // 3. MOTOR DE COMPATIBILIZAÇÃO E POSICIONAMENTO DE QUANTITATIVOS
  // ============================================================================
  const runCompatibilityEngine = (
    overrideStrategy?: CalculationStrategy["mode"],
    overrideTargetTotal?: number
  ) => {
    if (!sheet1Study || sheet1Study.items.length === 0) {
      showToast("Anexe primeiro a Planilha 1 (Planilha Inicial) para extrair os quantitativos.");
      return;
    }
    if (!selectedContract || selectedContract.items.length === 0) {
      showToast("Selecione um Contrato Base válido com composições.");
      return;
    }

    setIsProcessing(true);
    const modeToUse = overrideStrategy || calcStrategy;
    const targetToUse =
      overrideTargetTotal !== undefined ? overrideTargetTotal : effectiveTargetTotal;

    setTimeout(() => {
      const matrix = buildCompatibilityMatrix(
        sheet1Study.items,
        selectedContract.items,
        modeToUse,
        targetToUse,
        selectedContract.bdiPercent
      );
      setCompositionMatches(matrix);
      setIsProcessing(false);

      const matchedCount = matrix.filter((m) => m.final_injected_quantity > 0).length;
      const finalSum = matrix.reduce((s, m) => s + m.calculated_total_value, 0);
      showToast(
        `Compatibilização concluída! ${matchedCount} composições receberam quantitativos na coluna "${
          selectedContract.detectedColumns?.qtyHeaderName || "QUANTITATIVO"
        }" | Novo Total: R$ ${finalSum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      );
    }, 250);
  };

  const handleSelectStrategyMode = (newMode: CalculationStrategy["mode"]) => {
    setCalcStrategy(newMode);
    if (compositionMatches.length > 0) {
      const updated = applyCalculationStrategyToMatches(
        compositionMatches,
        newMode,
        effectiveTargetTotal
      );
      setCompositionMatches(updated);
    }
  };

  const handleApplyCustomTargetTotal = () => {
    if (compositionMatches.length > 0 && calcStrategy === "KEEP_TOTAL_VALUE") {
      const updated = applyCalculationStrategyToMatches(
        compositionMatches,
        "KEEP_TOTAL_VALUE",
        effectiveTargetTotal
      );
      setCompositionMatches(updated);
      showToast(
        `Quantitativos reescalonados para atingir o Valor Final de R$ ${effectiveTargetTotal.toLocaleString(
          "pt-BR",
          { minimumFractionDigits: 2 }
        )}!`
      );
    }
  };

  const handleManualQuantityChange = (contractIdx: number, rawVal: string) => {
    const num = parseFloat(rawVal.replace(",", "."));
    const validQty = isNaN(num) || num < 0 ? 0 : num;

    setCompositionMatches((prev) =>
      prev.map((m, idx) => {
        if (idx !== contractIdx) return m;
        return {
          ...m,
          final_injected_quantity: validQty,
          calculated_total_value: Number((validQty * m.contract_unit_price).toFixed(2)),
          status: validQty > 0 ? "MANUAL_OVERRIDE" : "ZEROED",
        };
      })
    );
  };

  const handleManualAssignSourceItem = (contractIdx: number, sourceItem: ItemBase | null) => {
    setCompositionMatches((prev) => {
      const updated = prev.map((m, idx) => {
        if (idx !== contractIdx) return m;
        if (!sourceItem) {
          return {
            ...m,
            matched_source_items: [],
            best_candidate: undefined,
            base_quantity_from_sheet1: 0,
            final_injected_quantity: 0,
            calculated_total_value: 0,
            confidence_score: 0,
            status: "ZEROED" as const,
          };
        }

        const baseQty = sourceItem.quantity || 0;
        return {
          ...m,
          matched_source_items: [sourceItem],
          best_candidate: {
            source_item_id: sourceItem.id,
            source_item_number: sourceItem.itemNumber,
            source_description: sourceItem.description,
            source_unit: sourceItem.unit,
            source_quantity: baseQty,
            source_unit_price: sourceItem.unit_price,
            source_total_value: sourceItem.total_value,
            source_stage: sourceItem.stage_title,
            source_discipline: sourceItem.discipline,
            confidence_score: 100,
            match_reason: "Vínculo manual selecionado pelo orçamentista",
          },
          base_quantity_from_sheet1: baseQty,
          final_injected_quantity: baseQty,
          calculated_total_value: Number((baseQty * m.contract_unit_price).toFixed(2)),
          confidence_score: 100,
          status: "MANUAL_OVERRIDE" as const,
        };
      });

      return applyCalculationStrategyToMatches(updated, calcStrategy, effectiveTargetTotal);
    });
    setActiveSwapContractIndex(null);
    showToast("Alocação de quantitativo atualizada com sucesso!");
  };

  // Aloca diretamente um item com dificuldade da Planilha 1 em uma composição escolhida pelo usuário no Contrato Base
  const handleAssignUnmatchedSourceToContract = (
    sourceItem: ItemBase,
    targetContractItem: ItemBase
  ) => {
    setCompositionMatches((prev) => {
      const targetIdx = prev.findIndex(
        (m) =>
          m.contract_item.id === targetContractItem.id ||
          (m.contract_item.code === targetContractItem.code &&
            m.contract_item.row_index === targetContractItem.row_index)
      );

      if (targetIdx === -1) return prev;

      const updated = prev.map((m, idx) => {
        if (idx === targetIdx) {
          const currentSources = [
            ...m.matched_source_items.filter((it) => it.id !== sourceItem.id),
            sourceItem,
          ];
          const newBaseQty = currentSources.reduce((s, it) => s + (it.quantity || 0), 0);
          return {
            ...m,
            matched_source_items: currentSources,
            best_candidate: {
              source_item_id: currentSources.map((i) => i.id).join(" + "),
              source_item_number: sourceItem.itemNumber,
              source_description: currentSources.map((i) => i.description).join(" | "),
              source_unit: sourceItem.unit,
              source_quantity: newBaseQty,
              source_unit_price: sourceItem.unit_price,
              source_total_value: currentSources.reduce((s, i) => s + (i.total_value || 0), 0),
              source_stage: sourceItem.stage_title,
              source_discipline: sourceItem.discipline,
              confidence_score: 100,
              match_reason: `Alocado manualmente pelo orçamentista para "${sourceItem.description}"`,
            },
            base_quantity_from_sheet1: newBaseQty,
            final_injected_quantity: newBaseQty,
            calculated_total_value: Number((newBaseQty * m.contract_unit_price).toFixed(2)),
            confidence_score: 100,
            status: "MANUAL_OVERRIDE" as const,
          };
        }

        const hadSource = m.matched_source_items.some((it) => it.id === sourceItem.id);
        if (hadSource) {
          const filteredSources = m.matched_source_items.filter((it) => it.id !== sourceItem.id);
          const newBaseQty = filteredSources.reduce((s, it) => s + (it.quantity || 0), 0);
          return {
            ...m,
            matched_source_items: filteredSources,
            base_quantity_from_sheet1: newBaseQty,
            final_injected_quantity: newBaseQty,
            calculated_total_value: Number((newBaseQty * m.contract_unit_price).toFixed(2)),
            status: newBaseQty > 0 ? m.status : ("ZEROED" as const),
          };
        }

        return m;
      });

      return applyCalculationStrategyToMatches(updated, calcStrategy, effectiveTargetTotal);
    });

    setResolvingSourceItem(null);
    setResolvingSearchText("");
    showToast(
      `Quantitativo de ${sourceItem.quantity} ${sourceItem.unit} alocado em "${targetContractItem.description.slice(0, 36)}..."!`
    );
  };

  // Nome oficial do arquivo final baixado conforme a regra estrita do usuário:
  // [Nome da Planilha 1 sem extensão] ([Nome do Contrato Escolhido]).xlsx
  const outputCompatFilename = useMemo(() => {
    return buildCompatOutputFileName(
      initialFileName,
      selectedContract?.contractName || "",
      selectedContract?.contractNumber
    );
  }, [initialFileName, selectedContract]);

  // ============================================================================
  // 4. DOWNLOAD INFALÍVEL DA PLANILHA FINAL COMPATIBILIZADA (.XLSX)
  // Preserva 100% rigorosamente do layout, fontes, larguras de colunas, alturas e fórmulas da Planilha Base original!
  // ============================================================================
  const handleDownloadFinalSpreadsheet = async () => {
    if (compositionMatches.length === 0 || !selectedContract) {
      showToast("Execute a compatibilização antes de baixar a Planilha Final.");
      return;
    }

    setIsDownloading(true);
    const outputFilename = outputCompatFilename;

    try {
      let contractBase64 = await getContractBinary(selectedContract.id);
      if (!contractBase64 && selectedContract.rawWorkbookBase64) {
        contractBase64 = selectedContract.rawWorkbookBase64;
      }

      // 1. CLONAGEM CIRÚRGICA 100% FIEL NO ARQUIVO .XLSX ORIGINAL (JSZip OpenXML)
      // Modifica EXCLUSIVAMENTE o número da célula de quantitativo mantendo 100% de layout, estilos, larguras e fórmulas intactos
      if (contractBase64 && contractBase64.length > 50) {
        const colQtyOneBased = selectedContract.detectedColumns?.colQty || 6;
        const colQtyLetter = colIndexToLetter(colQtyOneBased);

        const outBlob = await injectQuantitiesPreservingOriginalWorkbook(contractBase64, {
          budgetSheetName: selectedContract.budgetSheetName,
          colQtyOneBased,
          colQtyLetter,
          compositionMatches: compositionMatches
            .filter((cm) => cm.contract_item.row_index && cm.contract_item.row_index > 0)
            .map((cm) => ({
              contract_row_index: cm.contract_item.row_index,
              final_injected_quantity: cm.final_injected_quantity,
            })),
        });

        triggerBlobDownload(outBlob, outputFilename);
        showToast(
          `Download concluído! "${outputFilename}" gerada mantendo 100% da formatação e layout originais do Contrato Base!`
        );
        setIsDownloading(false);
        return;
      }

      // Caso o contrato atual seja fictício de demonstração inicial e não possua arquivo .xlsx bruto:
      showToast(
        "Dica: Para preservar o layout exato da sua empresa, anexe o arquivo .xlsx original deste contrato no botão abaixo!"
      );

      injectQuantitiesClientFallback(
        contractBase64,
        {
          contractName: selectedContract.contractName,
          contractNumber: selectedContract.contractNumber,
          organization: selectedContract.organization,
          referenceBase: selectedContract.referenceBase,
          bdiPercent: selectedContract.bdiPercent,
          budgetSheetName: selectedContract.budgetSheetName,
          detectedColumns: selectedContract.detectedColumns,
        },
        compositionMatches,
        outputFilename
      );
      showToast(`Download concluído! "${outputFilename}" baixada com sucesso.`);
    } catch (error) {
      console.error("Erro na geração da planilha compatibilizada:", error);
      showToast("Não foi possível gerar a planilha com a formatação original. Verifique o console.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Totais calculados para exibição
  const totalSheet1Value = sheet1Study?.totalGeralValue || 0;
  const totalCompatibleValue = useMemo(
    () => compositionMatches.reduce((acc, m) => acc + m.calculated_total_value, 0),
    [compositionMatches]
  );
  const activeCompositionsCount = useMemo(
    () => compositionMatches.filter((m) => m.final_injected_quantity > 0).length,
    [compositionMatches]
  );

  // Lista de disciplinas presentes no Contrato Base
  const availableDisciplines = useMemo(() => {
    const set = new Set<string>();
    selectedContract?.items.forEach((it) => {
      if (it.discipline) set.add(it.discipline);
    });
    return Array.from(set);
  }, [selectedContract]);

  // Serviços da Planilha 1 com quantidade física > 0
  const sourceItemsWithQty = useMemo(() => {
    return (sheet1Study?.items || []).filter((it) => (it.quantity || 0) > 0);
  }, [sheet1Study]);

  // Status de alocação de cada serviço da Planilha 1 e Taxa de Compatibilização (%)
  const sourceAllocationStatus = useMemo(() => {
    if (!sheet1Study || sourceItemsWithQty.length === 0) {
      return {
        items: [],
        matchedCount: 0,
        totalCount: 0,
        percentage: 0,
        pendingItems: [],
      };
    }

    const items = sourceItemsWithQty.map((sItem) => {
      const matchInContract = compositionMatches.find(
        (m) =>
          m.final_injected_quantity > 0 &&
          (m.matched_source_items.some((it) => it.id === sItem.id) ||
            m.best_candidate?.source_item_id?.includes(sItem.id))
      );

      const suggestedMatches = (selectedContract?.items || [])
        .map((c) => {
          const sim = calculateItemSimilarity(sItem, c);
          return { contractItem: c, score: sim.score, reason: sim.reason };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      const isResolved = Boolean(
        matchInContract &&
          (matchInContract.confidence_score >= 40 || matchInContract.status === "MANUAL_OVERRIDE")
      );

      return {
        sourceItem: sItem,
        isResolved,
        allocatedContractItem: matchInContract?.contract_item,
        confidenceScore: matchInContract
          ? matchInContract.confidence_score
          : (suggestedMatches[0]?.score || 0),
        suggestedMatches,
      };
    });

    const matchedCount = items.filter((it) => it.isResolved).length;
    const totalCount = items.length;
    const percentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;
    const pendingItems = items.filter((it) => !it.isResolved);

    return {
      items,
      matchedCount,
      totalCount,
      percentage,
      pendingItems,
    };
  }, [sheet1Study, sourceItemsWithQty, compositionMatches, selectedContract]);

  // Filtro da Mesa de Alocação
  const filteredMatches = useMemo(() => {
    return compositionMatches
      .map((m, originalIndex) => ({ m, originalIndex }))
      .filter(({ m }) => {
        if (showOnlyMatched && m.final_injected_quantity <= 0) return false;
        if (disciplineFilter !== "ALL" && m.contract_item.discipline !== disciplineFilter) {
          return false;
        }
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return (
          m.contract_item.description.toLowerCase().includes(q) ||
          m.contract_item.code.toLowerCase().includes(q) ||
          (m.contract_item.stage_title || "").toLowerCase().includes(q) ||
          (m.best_candidate?.source_description || "").toLowerCase().includes(q)
        );
      });
  }, [compositionMatches, showOnlyMatched, disciplineFilter, searchFilter]);

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F3F4F6] flex flex-col selection:bg-[#F97316] selection:text-black font-sans">
      {/* Notificação Toast Flutuante */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#111622] border border-[#D4AF37]/50 text-xs font-semibold text-white shadow-[0_15px_35px_rgba(0,0,0,0.85)] max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Topbar Minimalista Luxury */}
      <header className="border-b border-[#1E2436] bg-[#0B0F19]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F97316] p-[1px] shadow-[0_0_25px_rgba(249,115,22,0.25)]">
              <div className="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-lg tracking-tight text-white">OrçaBase</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30 font-semibold">
                  LAB • GPR
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Busca Inteligente por Nome de Coluna & Alocação de Quantitativos
              </p>
            </div>
          </div>

          {/* Navegação Principal */}
          <div className="flex items-center gap-2 bg-[#111622] p-1.5 rounded-xl border border-[#1E2436]">
            <button
              onClick={() => setActiveTab("WORKSPACE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "WORKSPACE"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              Área de Compatibilização (2 Planilhas)
            </button>
            <button
              onClick={() => setActiveTab("SETTINGS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "SETTINGS"
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              Configurações (Contratos Base)
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  activeTab === "SETTINGS" ? "bg-black/20 text-black" : "bg-[#1E2436] text-[#D4AF37]"
                }`}
              >
                {contracts.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {activeTab === "WORKSPACE" ? (
          <>
            {/* =====================================================================
                PASSO 1: ÁREA DE TRABALHO DUPLA — ESTUDO DAS DUAS PLANILHAS POR NOME DE COLUNA
               ===================================================================== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* CARD ESQUERDO: PLANILHA 1 (ORIGEM DOS QUANTITATIVOS E VALOR DO ORÇAMENTO) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingInitial(true);
                }}
                onDragLeave={() => setIsDraggingInitial(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingInitial(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessSheet1File(file);
                }}
                className={`lg:col-span-6 relative rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden ${
                  isDraggingInitial
                    ? "border-[#F97316] bg-[#F97316]/10 shadow-[0_0_40px_rgba(249,115,22,0.2)]"
                    : sheet1Study
                    ? "border-[#D4AF37]/50 bg-[#0B0F19]"
                    : "border-[#1E2436] hover:border-[#F97316]/60 bg-[#0B0F19]/90"
                }`}
              >
                <input
                  ref={initialFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessSheet1File(file);
                    e.target.value = "";
                  }}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#F97316] font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                      Planilha 1 • Origem dos Quantitativos
                    </span>
                    {sheet1Study && (
                      <button
                        onClick={() => initialFileInputRef.current?.click()}
                        className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Trocar Planilha 1
                      </button>
                    )}
                  </div>

                  {!sheet1Study ? (
                    <div
                      onClick={() => initialFileInputRef.current?.click()}
                      className="py-10 px-4 border-2 border-dashed border-[#1E2436] hover:border-[#F97316]/50 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#141A28] border border-[#26304A] flex items-center justify-center mb-4">
                        <UploadCloud className="w-7 h-7 text-[#F97316]" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">
                        Anexar Planilha Inicial (Planilha 1)
                      </h3>
                      <p className="text-xs text-[#9CA3AF] max-w-sm">
                        Arraste seu arquivo <span className="text-white font-medium">.XLSX</span> ou clique para abrir. O sistema procura automaticamente pelas colunas de nome{" "}
                        <strong className="text-[#D4AF37]">
                          Descrição/Composição/Discriminação
                        </strong>
                        , <strong className="text-[#D4AF37]">Unidade</strong>,{" "}
                        <strong className="text-[#D4AF37]">Quantitativo</strong> e{" "}
                        <strong className="text-[#D4AF37]">Total Geral</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 bg-[#111622] p-3.5 rounded-xl border border-[#1E2436]">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileSpreadsheet className="w-8 h-8 text-[#D4AF37] shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">
                              {initialFileName}
                            </h4>
                            <p className="text-[11px] text-[#9CA3AF]">
                              Colunas identificadas pelo{" "}
                              <strong className="text-emerald-400">Nome no Cabeçalho</strong>
                            </p>
                          </div>
                        </div>

                        {sheet1Study.sheetNames.length > 1 && (
                          <select
                            value={sheet1Study.selectedSheetName}
                            onChange={(e) => handleChangeSheet1TabOrColumns(e.target.value)}
                            className="bg-[#07090E] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                            title="Escolher aba da Planilha 1"
                          >
                            {sheet1Study.sheetNames.map((sn) => (
                              <option key={sn} value={sn}>
                                Aba: {sn}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Nomes das Colunas Encontradas na Planilha 1 (Permite trocar pelo nome se necessário) */}
                      <div className="bg-[#07090E] border border-[#1E2436] rounded-xl p-3 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#D4AF37] block font-semibold">
                          Colunas Localizadas por Nome na Planilha 1:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-[#9CA3AF] block mb-1">
                              Composição / Descrição:
                            </label>
                            <select
                              value={sheet1Study.detectedColumns.colDesc}
                              onChange={(e) =>
                                handleChangeSheet1TabOrColumns(undefined, {
                                  colDesc: Number(e.target.value),
                                  colUnit: sheet1Study.detectedColumns.colUnit,
                                  colQty: sheet1Study.detectedColumns.colQty,
                                })
                              }
                              className="w-full bg-[#111622] border border-[#26304A] rounded-lg px-2 py-1 text-[11px] text-white font-semibold"
                            >
                              {(sheet1Study.detectedColumns.allNamedColumns || []).map((col) => (
                                <option key={col.colIndex} value={col.colIndex}>
                                  {col.headerTitle}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#9CA3AF] block mb-1">
                              Unidade:
                            </label>
                            <select
                              value={sheet1Study.detectedColumns.colUnit}
                              onChange={(e) =>
                                handleChangeSheet1TabOrColumns(undefined, {
                                  colDesc: sheet1Study.detectedColumns.colDesc,
                                  colUnit: Number(e.target.value),
                                  colQty: sheet1Study.detectedColumns.colQty,
                                })
                              }
                              className="w-full bg-[#111622] border border-[#26304A] rounded-lg px-2 py-1 text-[11px] text-white font-semibold"
                            >
                              {(sheet1Study.detectedColumns.allNamedColumns || []).map((col) => (
                                <option key={col.colIndex} value={col.colIndex}>
                                  {col.headerTitle}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-emerald-400 block mb-1 font-semibold">
                              Quantitativo:
                            </label>
                            <select
                              value={sheet1Study.detectedColumns.colQty}
                              onChange={(e) =>
                                handleChangeSheet1TabOrColumns(undefined, {
                                  colDesc: sheet1Study.detectedColumns.colDesc,
                                  colUnit: sheet1Study.detectedColumns.colUnit,
                                  colQty: Number(e.target.value),
                                })
                              }
                              className="w-full bg-[#111622] border border-emerald-500/40 rounded-lg px-2 py-1 text-[11px] text-emerald-400 font-bold"
                            >
                              {(sheet1Study.detectedColumns.allNamedColumns || []).map((col) => (
                                <option key={col.colIndex} value={col.colIndex}>
                                  {col.headerTitle}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Métricas do Estudo da Planilha 1 */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-[#111622] border border-[#1E2436] rounded-xl p-3">
                          <span className="text-[10px] text-[#9CA3AF] uppercase block">
                            Serviços Lidos
                          </span>
                          <span className="text-base font-bold text-white font-mono">
                            {sheet1Study.items.length} itens
                          </span>
                        </div>
                        <div className="bg-[#111622] border border-[#1E2436] rounded-xl p-3">
                          <span className="text-[10px] text-[#9CA3AF] uppercase block">
                            Etapas / Grupos
                          </span>
                          <span className="text-base font-bold text-[#F97316] font-mono">
                            {sheet1Study.stages.length} etapas
                          </span>
                        </div>
                        <div className="bg-[#111622] border border-[#D4AF37]/40 rounded-xl p-3">
                          <span className="text-[10px] text-[#D4AF37] uppercase block font-semibold">
                            Valor Total (Planilha 1)
                          </span>
                          <span className="text-sm font-bold text-[#D4AF37] font-mono">
                            R${" "}
                            {sheet1Study.totalGeralValue.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E2436] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                  <span>Leitura guiada pelos nomes das colunas</span>
                  <span className="text-[#D4AF37] font-mono">100% Lido em Memória</span>
                </div>
              </div>

              {/* CARD DIREITO: PLANILHA 2 (CONTRATO BASE DESTINO — ONDE OS QUANTITATIVOS SERÃO POSICIONADOS) */}
              <div className="lg:col-span-6 rounded-2xl border border-[#1E2436] bg-[#0B0F19]/90 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                      Planilha 2 • Contrato Base (Molde Destino)
                    </span>
                    <button
                      onClick={() => setActiveTab("SETTINGS")}
                      className="text-xs text-[#F97316] hover:text-[#D4AF37] transition-colors flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Configurar / Cadastrar Contratos
                    </button>
                  </div>

                  {/* Seletor de Contrato */}
                  <div className="mb-4">
                    <label className="text-xs text-[#9CA3AF] block mb-1.5">
                      Escolha o Contrato Base que receberá os quantitativos:
                    </label>
                    <select
                      value={selectedContractId}
                      onChange={(e) => {
                        setSelectedContractId(e.target.value);
                        setCompositionMatches([]);
                      }}
                      className="w-full bg-[#111622] border border-[#26304A] focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none transition-colors cursor-pointer"
                    >
                      {contracts.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.contractNumber}] {c.contractName} — ({c.itemsCount} composições)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedContract && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-[#111622] border border-[#1E2436] rounded-xl p-3">
                          <span className="text-[10px] text-[#9CA3AF] uppercase block">
                            Coluna de Composição
                          </span>
                          <span className="text-xs font-bold text-white font-mono truncate block">
                            &ldquo;{selectedContract.detectedColumns?.descHeaderName || "DISCRIMINAÇÃO"}&rdquo;
                          </span>
                        </div>
                        <div className="bg-[#111622] border border-emerald-500/30 rounded-xl p-3">
                          <span className="text-[10px] text-emerald-400 uppercase block font-semibold">
                            Coluna de Quantitativo
                          </span>
                          <span className="text-xs font-bold text-emerald-400 font-mono truncate block">
                            &ldquo;{selectedContract.detectedColumns?.qtyHeaderName || "QUANTITATIVO"}&rdquo;
                          </span>
                        </div>
                        <div className="bg-[#111622] border border-[#1E2436] rounded-xl p-3">
                          <span className="text-[10px] text-[#9CA3AF] uppercase block">
                            Valor Total do Contrato
                          </span>
                          <span className="text-xs font-bold text-[#D4AF37] font-mono">
                            R${" "}
                            {(selectedContract.totalGeralValue || 0).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#07090E]/90 border border-[#1E2436] rounded-xl p-3">
                        <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mb-1.5">
                          <span>
                            Arquivo:{" "}
                            <strong className="text-white">
                              {selectedContract.fileName || "Modelo Padrão"}
                            </strong>{" "}
                            • Unidade:{" "}
                            <strong className="text-[#D4AF37]">
                              &ldquo;{selectedContract.detectedColumns?.unitHeaderName || "UNID."}&rdquo;
                            </strong>
                          </span>
                          <span className="text-emerald-400 font-mono text-[10px]">
                            {selectedContract.itemsCount} composições
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                          {(selectedContract.stages || []).map((st, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#141A28] border border-[#26304A] text-gray-300"
                            >
                              <strong className="text-[#D4AF37]">{st.discipline}:</strong>{" "}
                              {st.title.slice(0, 32)} ({st.itemsCount})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Indicador do Intervalo de Linhas das Composições com Código */}
                      <div className="bg-[#111622] border border-[#26304A] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-[#9CA3AF]">
                            Intervalo Ativo com Código:
                          </span>
                          <strong className="text-white font-mono">
                            Linhas {selectedContract.detectedColumns?.startRow || selectedContract.startRow || 1} até {selectedContract.detectedColumns?.endRow || selectedContract.endRow || selectedContract.itemsCount}
                          </strong>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {selectedContract.itemsCount} composições
                        </span>
                      </div>

                      {/* Botão de Ação Rápida: Anexar / Substituir a Planilha Base (.xlsx) deste Contrato */}
                      <div>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          ref={selectedContractQuickUploadRef}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && selectedContract) {
                              await handleUpdateExistingContractCardFile(selectedContract.id, file);
                            }
                            e.target.value = "";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => selectedContractQuickUploadRef.current?.click()}
                          disabled={updatingCardId === selectedContract.id}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#111622] hover:bg-[#141A28] border border-[#26304A] hover:border-[#D4AF37] text-xs text-[#D4AF37] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                          {updatingCardId === selectedContract.id
                            ? "Gravando Planilha Base..."
                            : selectedContract.fileName
                            ? `Substituir Planilha Base (.xlsx): ${selectedContract.fileName}`
                            : "Anexar Planilha Base (.xlsx) deste Contrato"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E2436] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                  <span>
                    O ajuste será feito na coluna de nome{" "}
                    <strong className="text-emerald-400">
                      &ldquo;{selectedContract?.detectedColumns?.qtyHeaderName || "QUANTITATIVO"}&rdquo;
                    </strong>
                  </span>
                  <span className="text-emerald-400 font-mono">Clone Fiel .XLSX</span>
                </div>
              </div>
            </section>

            {/* =====================================================================
                PASSO 2: ESCOLHA DO MODO DE QUANTITATIVO (OS 2 BOTÕES SEM CONFLITO)
                + BOTÕES DE COMPATIBILIZAR E BAIXAR PLANILHA FINAL
               ===================================================================== */}
            <section className="rounded-2xl border border-[#1E2436] bg-[#0B0F19] p-6 shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E2436] pb-5">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] block mb-1">
                    Regra de Posicionamento e Ajuste na Coluna &ldquo;
                    {selectedContract?.detectedColumns?.qtyHeaderName || "QUANTITATIVO"}&rdquo;
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Como deseja aplicar os quantitativos da Planilha 1 na Planilha Base do Contrato?
                  </h3>
                </div>

                {calcStrategy === "KEEP_TOTAL_VALUE" && (
                  <div className="flex items-center gap-2 bg-[#111622] px-3.5 py-2 rounded-xl border border-[#D4AF37]/50">
                    <Calculator className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs text-[#9CA3AF]">Valor Final Alvo (R$):</span>
                    <input
                      type="text"
                      value={customTargetTotal}
                      onChange={(e) => setCustomTargetTotal(e.target.value)}
                      onBlur={handleApplyCustomTargetTotal}
                      placeholder="Ex: 300.000,00"
                      className="w-32 bg-[#07090E] border border-[#26304A] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-[#D4AF37] focus:border-[#F97316] focus:outline-none text-right"
                    />
                    <button
                      onClick={handleApplyCustomTargetTotal}
                      className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-semibold cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
              </div>

              {/* Os 2 Botões de Escolha Didáticos e Independentes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSelectStrategyMode("KEEP_TOTAL_VALUE")}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    calcStrategy === "KEEP_TOTAL_VALUE"
                      ? "bg-[#141A28] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                      : "bg-[#07090E]/60 border-[#1E2436] hover:border-[#26304A]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      calcStrategy === "KEEP_TOTAL_VALUE"
                        ? "bg-gradient-to-br from-[#D4AF37] to-[#F97316] text-black"
                        : "bg-[#111622] text-[#9CA3AF]"
                    }`}
                  >
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        Opção 1: Manter o Valor Final do Orçamento
                      </span>
                      {calcStrategy === "KEEP_TOTAL_VALUE" && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                      Posiciona cada serviço na composição correta do Contrato Base e{" "}
                      <strong className="text-white">
                        aumenta ou diminui proporcionalmente os quantitativos
                      </strong>{" "}
                      para que o Valor Total Final da planilha compatibilizada bata com o valor da Planilha 1 (
                      <span className="text-[#D4AF37] font-mono">
                        R${" "}
                        {effectiveTargetTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      ).
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectStrategyMode("KEEP_QUANTITY")}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    calcStrategy === "KEEP_QUANTITY"
                      ? "bg-[#141A28] border-[#F97316] shadow-[0_0_25px_rgba(249,115,22,0.15)]"
                      : "bg-[#07090E]/60 border-[#1E2436] hover:border-[#26304A]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      calcStrategy === "KEEP_QUANTITY"
                        ? "bg-gradient-to-br from-[#F97316] to-[#D4AF37] text-black"
                        : "bg-[#111622] text-[#9CA3AF]"
                    }`}
                  >
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        Opção 2: Manter o Quantitativo Exato da Planilha 1
                      </span>
                      {calcStrategy === "KEEP_QUANTITY" && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40">
                          Selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                      Coloca na composição correspondente da Planilha Base{" "}
                      <strong className="text-white">
                        exatamente a mesma quantidade física (m², m³, kg, un)
                      </strong>{" "}
                      vinda da Planilha 1, permitindo que o Valor Total final varie conforme os preços unitários do Contrato Base.
                    </p>
                  </div>
                </button>
              </div>

              {/* Barra de Ação Principal */}
              <div className="pt-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <button
                  onClick={() => runCompatibilityEngine()}
                  disabled={!sheet1Study || isProcessing}
                  className={`px-7 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    sheet1Study && !isProcessing
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#F97316] to-[#D4AF37] text-black shadow-[0_0_30px_rgba(249,115,22,0.35)] hover:scale-[1.01]"
                      : "bg-[#141A28] text-[#6B7280] border border-[#1E2436] cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Estudando Planilhas e Alocando Quantitativos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Compatibilizar Planilha 1 com Contrato Base
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {compositionMatches.length > 0 && (
                  <div className="flex flex-wrap items-center gap-6 bg-[#111622] px-5 py-3 rounded-xl border border-[#1E2436]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block">
                        Composições Ativadas
                      </span>
                      <span className="text-sm font-bold text-white font-mono">
                        {activeCompositionsCount} de {compositionMatches.length} linhas
                      </span>
                    </div>
                    <div className="h-7 w-[1px] bg-[#1E2436]" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block">
                        Total Planilha 1
                      </span>
                      <span className="text-sm font-bold text-gray-300 font-mono">
                        R${" "}
                        {totalSheet1Value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="h-7 w-[1px] bg-[#1E2436]" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#D4AF37] block font-semibold">
                        Novo Total na Planilha Base
                      </span>
                      <span className="text-base font-bold text-[#D4AF37] font-mono">
                        R${" "}
                        {totalCompatibleValue.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDownloadFinalSpreadsheet}
                  disabled={compositionMatches.length === 0 || isDownloading}
                  className={`px-7 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer ${
                    compositionMatches.length > 0 && !isDownloading
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.01]"
                      : "bg-[#141A28] text-[#6B7280] border border-[#1E2436] cursor-not-allowed"
                  }`}
                >
                  <Download className="w-5 h-5" />
                  {isDownloading
                    ? "Gerando Cópia do Contrato (.XLSX)..."
                    : "Baixar Planilha Final (.XLSX)"}
                </button>
              </div>

              {/* BARRA SUPERIOR DE TAXA DE COMPATIBILIZAÇÃO E NOMENCLATURA OFICIAL DA CÓPIA */}
              {compositionMatches.length > 0 && (
                <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-4 border-t border-[#1E2436]/80">
                  {/* Taxa de Compatibilização (%) com Barra Visual */}
                  <div className="lg:col-span-5 bg-[#111622] border border-[#1E2436] rounded-xl p-4 flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Taxa de Compatibilização:
                      </span>
                      <span
                        className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg border ${
                          sourceAllocationStatus.percentage >= 85
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : sourceAllocationStatus.percentage >= 60
                            ? "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30"
                            : "bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30"
                        }`}
                      >
                        {sourceAllocationStatus.percentage}% Concluído
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#07090E] overflow-hidden border border-[#1E2436]">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F97316] to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${sourceAllocationStatus.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span>
                        <strong className="text-white">{sourceAllocationStatus.matchedCount}</strong> de{" "}
                        <strong className="text-white">{sourceAllocationStatus.totalCount}</strong> serviços alocados
                      </span>
                      {sourceAllocationStatus.pendingItems.length > 0 ? (
                        <button
                          onClick={() => setActiveResultTab("DIFFICULTY_VIEW")}
                          className="text-[#F97316] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          ⚠️ {sourceAllocationStatus.pendingItems.length} sem similaridade direta
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% dos serviços alocados
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nomenclatura Oficial do Arquivo Final (Salvar Como) */}
                  <div className="lg:col-span-7 bg-[#111622] border border-[#1E2436] rounded-xl p-4 flex flex-col justify-between space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5 font-semibold">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" /> Cópia Salvar Como • Nome do Arquivo Final:
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Layout 100% Idêntico ao Contrato
                      </span>
                    </div>
                    <div className="bg-[#07090E] border border-[#26304A] rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-mono font-bold text-white truncate" title={outputCompatFilename}>
                        {outputCompatFilename}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF]">
                      Copia a planilha do contrato <strong className="text-white">{selectedContract.contractName}</strong>, renomeia com o nome da Planilha 1 + <strong className="text-[#D4AF37]">({selectedContract.contractName})</strong> e ajusta unicamente os quantitativos.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* =====================================================================
                PASSO 3: MESA INTERATIVA DE ALOCAÇÃO DE QUANTITATIVOS
               ===================================================================== */}
            {compositionMatches.length > 0 && (
              <section className="rounded-2xl border border-[#1E2436] bg-[#0B0F19] overflow-hidden shadow-2xl">
                {/* Abas Superiores de Alternância entre Visão Geral e Itens com Dificuldade */}
                <div className="p-6 border-b border-[#1E2436] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveResultTab("CONTRACT_VIEW")}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeResultTab === "CONTRACT_VIEW"
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-[#111622] text-[#9CA3AF] hover:text-white border border-[#1E2436]"
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      Planilha Base do Contrato ({compositionMatches.length} composições)
                    </button>

                    <button
                      onClick={() => setActiveResultTab("DIFFICULTY_VIEW")}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        activeResultTab === "DIFFICULTY_VIEW"
                          ? "bg-[#F97316] text-black shadow-[0_0_20px_rgba(249,115,22,0.35)]"
                          : "bg-[#111622] text-[#9CA3AF] hover:text-white border border-[#1E2436]"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Composições sem Similaridade Direta / Atenção
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          sourceAllocationStatus.pendingItems.length > 0
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {sourceAllocationStatus.pendingItems.length}
                      </span>
                    </button>
                  </div>

                  {/* Controles de Filtro (somente ativos na visão geral) */}
                  {activeResultTab === "CONTRACT_VIEW" && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => setShowOnlyMatched(!showOnlyMatched)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          showOnlyMatched
                            ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                            : "bg-[#111622] border-[#26304A] text-[#9CA3AF] hover:text-white"
                        }`}
                      >
                        {showOnlyMatched
                          ? `Exibindo Ativas (${activeCompositionsCount})`
                          : `Todas as Composições (${compositionMatches.length})`}
                      </button>

                      <select
                        value={disciplineFilter}
                        onChange={(e) => setDisciplineFilter(e.target.value)}
                        className="bg-[#111622] border border-[#26304A] rounded-xl px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value="ALL">Todos os Setores / Disciplinas</option>
                        {availableDisciplines.map((d) => (
                          <option key={d} value={d}>
                            Setor: {d}
                          </option>
                        ))}
                      </select>

                      <div className="relative w-64">
                        <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          placeholder="Buscar composição ou etapa..."
                          className="w-full bg-[#111622] border border-[#26304A] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* CONTEÚDO DA ABA 1: VISÃO GERAL DA PLANILHA BASE DO CONTRATO */}
                {activeResultTab === "CONTRACT_VIEW" && (
                  <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-[#080B12] border-b border-[#1E2436] text-[10px] font-mono uppercase text-[#9CA3AF]">
                        <tr>
                          <th className="py-3.5 px-4">Linha / Setor</th>
                          <th className="py-3.5 px-4">
                            {selectedContract.detectedColumns?.descHeaderName || "Composição / Descrição"} (Base)
                          </th>
                          <th className="py-3.5 px-4">Serviço Alocado da Planilha 1 (Origem)</th>
                          <th className="py-3.5 px-4 text-right">Qtd. Planilha 1</th>
                          <th className="py-3.5 px-4 text-right text-emerald-400">
                            {selectedContract.detectedColumns?.qtyHeaderName || "QUANTITATIVO"} (Injetado)
                          </th>
                          <th className="py-3.5 px-4 text-right">Preço Unit. Base</th>
                          <th className="py-3.5 px-4 text-right text-[#D4AF37]">Novo Subtotal</th>
                          <th className="py-3.5 px-4 text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2436] text-xs">
                        {filteredMatches.map(({ m, originalIndex }) => {
                          const cItem = m.contract_item;
                          const hasMatch = m.final_injected_quantity > 0;
                          return (
                            <tr
                              key={`${cItem.id}_${originalIndex}`}
                              className={`transition-colors ${
                                hasMatch
                                  ? "bg-[#111622]/60 hover:bg-[#141A28]"
                                  : "bg-[#07090E]/40 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <span className="font-mono text-[11px] text-[#D4AF37] font-bold">
                                    Linha {cItem.row_index || originalIndex + 1} • Item{" "}
                                    {cItem.itemNumber || cItem.code}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#141A28] border border-[#26304A] text-[#F97316] font-mono w-fit">
                                    {cItem.discipline || "GERAL"}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs">
                                <div className="font-semibold text-white leading-snug">
                                  {cItem.description}
                                </div>
                                <div className="text-[10px] text-[#9CA3AF] font-mono mt-1">
                                  Cód: {cItem.code} • Unid:{" "}
                                  <strong className="text-white">{cItem.unit}</strong>
                                  {cItem.stage_title ? ` • Etapa: ${cItem.stage_title}` : ""}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs">
                                {m.best_candidate ? (
                                  <div>
                                    <div className="text-gray-200 font-medium leading-snug">
                                      {m.best_candidate.source_description}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        {m.confidence_score}% • {m.best_candidate.match_reason}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-[#6B7280] italic">
                                    Nenhum quantitativo alocado (ficará 0,00)
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono text-[#9CA3AF]">
                                {m.base_quantity_from_sheet1 > 0
                                  ? `${m.base_quantity_from_sheet1.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })} ${m.best_candidate?.source_unit || cItem.unit}`
                                  : "—"}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={m.final_injected_quantity}
                                    onChange={(e) =>
                                      handleManualQuantityChange(originalIndex, e.target.value)
                                    }
                                    className={`w-24 text-right font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                                      hasMatch
                                        ? "bg-[#07090E] border-emerald-500/50 text-emerald-400 focus:border-[#D4AF37]"
                                        : "bg-[#07090E] border-[#1E2436] text-[#6B7280]"
                                    }`}
                                  />
                                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                                    {cItem.unit}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono text-gray-300">
                                R${" "}
                                {m.contract_unit_price.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D4AF37]">
                                R${" "}
                                {m.calculated_total_value.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => {
                                    setActiveSwapContractIndex(originalIndex);
                                    setSwapModalSearch("");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#141A28] hover:bg-[#1E2436] border border-[#26304A] text-[11px] text-[#D4AF37] font-medium inline-flex items-center gap-1 cursor-pointer"
                                  title="Escolher qual serviço da Planilha 1 vai para esta composição"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Vincular
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* CONTEÚDO DA ABA 2: COMPOSIÇÕES SEM SIMILARIDADE DIRETA / ATENÇÃO NECESSÁRIA */}
                {activeResultTab === "DIFFICULTY_VIEW" && (
                  <div className="p-6 space-y-4">
                    <div className="bg-[#111622] border border-[#F97316]/40 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-[#F97316]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Composições da Planilha 1 sem Similaridade Direta no Contrato ({selectedContract.contractName})
                        </h3>
                        <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">
                          Estes serviços da sua Planilha Inicial não encontraram uma composição com nome 100% idêntico no Contrato Base. Para cada um deles, você pode clicar em uma das sugestões mais próximas abaixo ou clicar em <strong>&ldquo;Escolher Outra Composição no Contrato&rdquo;</strong> para apontar a melhor composição onde o quantitativo deve ser inserido.
                        </p>
                      </div>
                    </div>

                    {sourceAllocationStatus.pendingItems.length === 0 ? (
                      <div className="py-12 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center flex flex-col items-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                        <h4 className="text-base font-bold text-white">
                          Parabéns! 100% dos serviços foram compatibilizados
                        </h4>
                        <p className="text-xs text-[#9CA3AF] mt-1 max-w-md">
                          Todos os serviços da Planilha 1 possuem composições correspondentes definidas na Planilha Base. Você já pode baixar o arquivo final compatibilizado com precisão total.
                        </p>
                        <button
                          onClick={handleDownloadFinalSpreadsheet}
                          className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Baixar Planilha Final ({outputCompatFilename})
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sourceAllocationStatus.pendingItems.map((pending, pIdx) => {
                          const sItem = pending.sourceItem;
                          return (
                            <div
                              key={`${sItem.id}_${pIdx}`}
                              className="rounded-xl border border-[#1E2436] bg-[#111622] p-5 space-y-4 hover:border-[#D4AF37]/50 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2436] pb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30 font-semibold">
                                      Item {sItem.itemNumber || pIdx + 1} • {sItem.discipline || "GERAL"}
                                    </span>
                                    {sItem.stage_title && (
                                      <span className="text-[11px] text-[#9CA3AF]">
                                        Etapa: {sItem.stage_title}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-bold text-white leading-snug">
                                    {sItem.description}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 bg-[#07090E] px-4 py-2 rounded-xl border border-[#26304A]">
                                  <div>
                                    <span className="text-[10px] text-[#9CA3AF] uppercase block">
                                      Quantitativo Original
                                    </span>
                                    <span className="text-sm font-bold text-emerald-400 font-mono">
                                      {sItem.quantity.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}{" "}
                                      {sItem.unit}
                                    </span>
                                  </div>
                                  <div className="h-6 w-[1px] bg-[#1E2436]" />
                                  <div>
                                    <span className="text-[10px] text-[#9CA3AF] uppercase block">
                                      Total Origem
                                    </span>
                                    <span className="text-xs font-bold text-gray-300 font-mono">
                                      R${" "}
                                      {sItem.total_value.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Sugestões de Composições mais Próximas no Contrato Base */}
                              <div className="space-y-2">
                                <span className="text-[11px] font-mono uppercase text-[#D4AF37] block font-semibold">
                                  Composições Similares Sugeridas no Contrato Base ({selectedContract.contractName}):
                                </span>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  {pending.suggestedMatches.map((sug, sIdx) => (
                                    <button
                                      key={`${sug.contractItem.id}_${sIdx}`}
                                      onClick={() =>
                                        handleAssignUnmatchedSourceToContract(sItem, sug.contractItem)
                                      }
                                      className="text-left p-3 rounded-xl border border-[#26304A] hover:border-emerald-500/60 bg-[#07090E] transition-all cursor-pointer flex flex-col justify-between group"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141A28] text-gray-300">
                                            Cód: {sug.contractItem.code} • Linha {sug.contractItem.row_index}
                                          </span>
                                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                                            {sug.score}% similar
                                          </span>
                                        </div>
                                        <div className="text-xs font-semibold text-white group-hover:text-emerald-300 leading-snug">
                                          {sug.contractItem.description}
                                        </div>
                                      </div>

                                      <div className="mt-2.5 pt-2 border-t border-[#1E2436] flex items-center justify-between text-[11px]">
                                        <span className="font-mono text-gray-400">
                                          {sug.contractItem.unit} • R$ {sug.contractItem.unit_price.toFixed(2)}
                                        </span>
                                        <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-1">
                                          <Check className="w-3.5 h-3.5" />
                                          Alocar {sItem.quantity} {sItem.unit} Aqui
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>

                                <div className="pt-2 flex justify-end">
                                  <button
                                    onClick={() => {
                                      setResolvingSourceItem(sItem);
                                      setResolvingSearchText("");
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[#141A28] hover:bg-[#1E2436] border border-[#26304A] text-xs text-[#D4AF37] font-semibold flex items-center gap-2 cursor-pointer"
                                  >
                                    <Search className="w-3.5 h-3.5" />
                                    Buscar Outra Composição no Contrato Base...
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          /* =====================================================================
             ABA DE CONFIGURAÇÕES: GESTÃO DE CONTRATOS BASE COM BUSCA PELO NOME DAS COLUNAS
             ===================================================================== */
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2436] pb-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#F97316] block mb-1">
                  Identificação Inteligente por Nome de Coluna (Quantitativo, Composição, Discriminação, Unidade)
                </span>
                <h2 className="text-xl font-bold text-white">
                  Configurações de Contratos Base (Planilhas Destino)
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  O sistema procura automaticamente na planilha pelos nomes das colunas (<strong className="text-white">Quantitativo / Quant. / Qtd</strong>, <strong className="text-white">Descrição / Composição / Discriminação</strong>, <strong className="text-white">Unidade / Unid.</strong> e <strong className="text-white">Total Geral</strong>), independentemente da posição em que estejam. Você também pode confirmar ou escolher pelo nome exato abaixo.
                </p>
              </div>
              <button
                onClick={() => setIsAddingContract(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:opacity-95 cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                Novo Contrato Base
              </button>
            </div>

            {/* Modal/Card de Criação de Novo Contrato Base */}
            {isAddingContract && (
              <div className="rounded-2xl border border-[#D4AF37]/50 bg-[#0B0F19] p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2436] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Cadastrar Novo Contrato Base (Leitura Guiada pelo Nome das Colunas)
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddingContract(false)}
                    className="text-xs text-[#9CA3AF] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Fechar
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Dados do Contrato + Nomes das Colunas */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs text-[#9CA3AF] block mb-1.5">
                          Objeto / Nome do Contrato *
                        </label>
                        <input
                          type="text"
                          value={newContractName}
                          onChange={(e) => setNewContractName(e.target.value)}
                          placeholder="Ex: Reforma e Manutenção Predial — Lote 02"
                          className="w-full bg-[#111622] border border-[#26304A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#9CA3AF] block mb-1.5">
                          Número do Contrato *
                        </label>
                        <input
                          type="text"
                          value={newContractNumber}
                          onChange={(e) => setNewContractNumber(e.target.value)}
                          placeholder="Ex: 089/2026-GPR"
                          className="w-full bg-[#111622] border border-[#26304A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#9CA3AF] block mb-1.5">
                          Órgão / Contratante
                        </label>
                        <input
                          type="text"
                          value={newContractOrg}
                          onChange={(e) => setNewContractOrg(e.target.value)}
                          placeholder="Ex: Prefeitura / GPR"
                          className="w-full bg-[#111622] border border-[#26304A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#9CA3AF] block mb-1.5">BDI (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newContractBdi}
                          onChange={(e) => setNewContractBdi(e.target.value)}
                          className="w-full bg-[#111622] border border-[#26304A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#9CA3AF] block mb-1.5">
                          Fonte / Base Oficial
                        </label>
                        <input
                          type="text"
                          value={newContractBaseRef}
                          onChange={(e) => setNewContractBaseRef(e.target.value)}
                          placeholder="Ex: SINAPI / ORSE"
                          className="w-full bg-[#111622] border border-[#26304A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* Caixa de Palavras-Chave de Nomes de Colunas para Busca Inteligente */}
                    <div className="bg-[#111622] border border-[#26304A] rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                        <Tag className="w-4 h-4" />
                        Nomes / Palavras-Chave que o Sistema Procura nas Colunas da Planilha:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-emerald-400 block mb-1 font-semibold">
                            Nome da Coluna de Quantitativo:
                          </label>
                          <input
                            type="text"
                            value={customQtyKeyword}
                            onChange={(e) => setCustomQtyKeyword(e.target.value)}
                            className="w-full bg-[#07090E] border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-[11px] text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#9CA3AF] block mb-1">
                            Nome da Coluna de Composição / Serviço:
                          </label>
                          <input
                            type="text"
                            value={customDescKeyword}
                            onChange={(e) => setCustomDescKeyword(e.target.value)}
                            className="w-full bg-[#07090E] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-[11px] text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#9CA3AF] block mb-1">
                            Nome da Coluna de Unidade:
                          </label>
                          <input
                            type="text"
                            value={customUnitKeyword}
                            onChange={(e) => setCustomUnitKeyword(e.target.value)}
                            className="w-full bg-[#07090E] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-[11px] text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#9CA3AF] block mb-1">
                            Nome do Total do Orçamento:
                          </label>
                          <input
                            type="text"
                            value={customTotalKeyword}
                            onChange={(e) => setCustomTotalKeyword(e.target.value)}
                            className="w-full bg-[#07090E] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-[11px] text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dropzone de Upload e Seleção pelo Nome Real das Colunas Lidas */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingContract(true);
                      }}
                      onDragLeave={() => setIsDraggingContract(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingContract(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) inspectNewContractModalFile(file);
                      }}
                      onClick={() => contractFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[175px] ${
                        isDraggingContract
                          ? "border-[#F97316] bg-[#F97316]/10"
                          : newContractStudy
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-[#26304A] hover:border-[#D4AF37]/60 bg-[#111622]/60"
                      }`}
                    >
                      <input
                        ref={contractFileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) inspectNewContractModalFile(file);
                          e.target.value = "";
                        }}
                      />
                      <UploadCloud
                        className={`w-9 h-9 mb-2 ${
                          newContractStudy ? "text-emerald-400" : "text-[#D4AF37]"
                        }`}
                      />
                      {isInspectingContract ? (
                        <p className="text-xs text-[#D4AF37] font-semibold animate-pulse">
                          Procurando colunas pelo nome (Quantitativo, Composição, Discriminação, Unidade)...
                        </p>
                      ) : newContractStudy ? (
                        <div className="space-y-2 w-full">
                          <p className="text-xs font-bold text-white">{newContractFileName}</p>
                          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-[#141A28] text-emerald-400 font-mono">
                              {newContractStudy.items.length} composições lidas
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#141A28] text-[#F97316] font-mono">
                              {newContractStudy.stages.length} etapas
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#141A28] text-[#D4AF37] font-mono font-bold">
                              Total: R${" "}
                              {newContractStudy.totalGeralValue.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-white">
                            Arraste a Planilha do Contrato (.XLSX) ou clique aqui
                          </p>
                          <p className="text-[11px] text-[#9CA3AF] mt-1">
                            O sistema encontrará automaticamente as colunas pelo nome escrito no cabeçalho
                          </p>
                        </>
                      )}
                    </div>

                    {/* Seletores por Nome Real de Coluna assim que a planilha é anexada */}
                    {newContractStudy && (
                      <div className="bg-[#111622] border border-[#26304A] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            Colunas Identificadas pelo Nome na Planilha (Clique se quiser alterar):
                          </span>
                          {newContractStudy.sheetNames.length > 1 && (
                            <select
                              value={newContractStudy.selectedSheetName}
                              onChange={(e) => handleChangeNewContractModalTabOrCols(e.target.value)}
                              className="bg-[#07090E] border border-[#26304A] rounded-lg px-2 py-1 text-xs text-[#D4AF37]"
                            >
                              {newContractStudy.sheetNames.map((sn) => (
                                <option key={sn} value={sn}>
                                  Aba: {sn}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[10px] text-emerald-400 block mb-1 font-bold">
                              Coluna de Quantitativo (Onde ajustará):
                            </label>
                            <select
                              value={newContractStudy.detectedColumns.colQty}
                              onChange={(e) =>
                                handleChangeNewContractModalTabOrCols(undefined, {
                                  colDesc: newContractStudy.detectedColumns.colDesc,
                                  colUnit: newContractStudy.detectedColumns.colUnit,
                                  colQty: Number(e.target.value),
                                  colPrice: newContractStudy.detectedColumns.colPrice,
                                  colTotal: newContractStudy.detectedColumns.colTotal,
                                })
                              }
                              className="w-full bg-[#07090E] border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold"
                            >
                              {(newContractStudy.detectedColumns.allNamedColumns || []).map(
                                (col) => (
                                  <option key={col.colIndex} value={col.colIndex}>
                                    Nome: &ldquo;{col.headerTitle}&rdquo;{" "}
                                    {col.sampleValue ? `(Ex: ${col.sampleValue})` : ""}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#D4AF37] block mb-1 font-bold">
                              Coluna de Composição / Discriminação:
                            </label>
                            <select
                              value={newContractStudy.detectedColumns.colDesc}
                              onChange={(e) =>
                                handleChangeNewContractModalTabOrCols(undefined, {
                                  colDesc: Number(e.target.value),
                                  colUnit: newContractStudy.detectedColumns.colUnit,
                                  colQty: newContractStudy.detectedColumns.colQty,
                                  colPrice: newContractStudy.detectedColumns.colPrice,
                                  colTotal: newContractStudy.detectedColumns.colTotal,
                                })
                              }
                              className="w-full bg-[#07090E] border border-[#D4AF37]/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                            >
                              {(newContractStudy.detectedColumns.allNamedColumns || []).map(
                                (col) => (
                                  <option key={col.colIndex} value={col.colIndex}>
                                    Nome: &ldquo;{col.headerTitle}&rdquo;{" "}
                                    {col.sampleValue ? `(Ex: ${col.sampleValue})` : ""}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#9CA3AF] block mb-1">
                              Coluna de Unidade:
                            </label>
                            <select
                              value={newContractStudy.detectedColumns.colUnit}
                              onChange={(e) =>
                                handleChangeNewContractModalTabOrCols(undefined, {
                                  colDesc: newContractStudy.detectedColumns.colDesc,
                                  colUnit: Number(e.target.value),
                                  colQty: newContractStudy.detectedColumns.colQty,
                                  colPrice: newContractStudy.detectedColumns.colPrice,
                                  colTotal: newContractStudy.detectedColumns.colTotal,
                                })
                              }
                              className="w-full bg-[#07090E] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-xs text-white"
                            >
                              {(newContractStudy.detectedColumns.allNamedColumns || []).map(
                                (col) => (
                                  <option key={col.colIndex} value={col.colIndex}>
                                    Nome: &ldquo;{col.headerTitle}&rdquo;{" "}
                                    {col.sampleValue ? `(Ex: ${col.sampleValue})` : ""}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#9CA3AF] block mb-1">
                              Coluna de Preço Unitário:
                            </label>
                            <select
                              value={newContractStudy.detectedColumns.colPrice}
                              onChange={(e) =>
                                handleChangeNewContractModalTabOrCols(undefined, {
                                  colDesc: newContractStudy.detectedColumns.colDesc,
                                  colUnit: newContractStudy.detectedColumns.colUnit,
                                  colQty: newContractStudy.detectedColumns.colQty,
                                  colPrice: Number(e.target.value),
                                  colTotal: newContractStudy.detectedColumns.colTotal,
                                })
                              }
                              className="w-full bg-[#07090E] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-xs text-white"
                            >
                              {(newContractStudy.detectedColumns.allNamedColumns || []).map(
                                (col) => (
                                  <option key={col.colIndex} value={col.colIndex}>
                                    Nome: &ldquo;{col.headerTitle}&rdquo;{" "}
                                    {col.sampleValue ? `(Ex: ${col.sampleValue})` : ""}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        {/* Intervalo de Linhas das Composições no Novo Contrato */}
                        <div className="pt-3 border-t border-[#26304A] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                              Intervalo Exclusivo das Composições (com Código e Banco):
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                              {newContractStudy.items.length} itens filtrados
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-[10px] text-[#9CA3AF] block mb-1">
                                Linha Inicial das Composições:
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={newContractStartRow}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setNewContractStartRow(val);
                                  handleChangeNewContractModalTabOrCols(undefined, {
                                    startRow: val,
                                    endRow: Number(newContractEndRow) || undefined,
                                  });
                                }}
                                className="w-full bg-[#07090E] border border-[#26304A] focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#9CA3AF] block mb-1">
                                Linha Final das Composições:
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={newContractEndRow}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setNewContractEndRow(val);
                                  handleChangeNewContractModalTabOrCols(undefined, {
                                    startRow: Number(newContractStartRow) || undefined,
                                    endRow: val,
                                  });
                                }}
                                className="w-full bg-[#07090E] border border-[#26304A] focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-[#9CA3AF]">
                            O sistema filtrará unicamente as linhas que possuem Código e Banco entre a Linha {newContractStartRow || 1} e a Linha {newContractEndRow || 100}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-[#1E2436]">
                  <button
                    onClick={() => setIsAddingContract(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#26304A] text-xs text-[#9CA3AF] hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNewContract}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Salvar Contrato Base
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Cards de Contratos Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contracts.map((c) => {
                const isSelected = c.id === selectedContractId;
                const isExpanded = expandedContractStudyId === c.id;
                const isUpdatingThis = updatingCardId === c.id;
                const namedCols = c.detectedColumns?.allNamedColumns || [];

                return (
                  <div
                    key={c.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleUpdateExistingContractCardFile(c.id, file);
                    }}
                    className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-[#D4AF37] bg-[#0B0F19] shadow-[0_0_30px_rgba(212,175,55,0.12)]"
                        : "border-[#1E2436] bg-[#0B0F19]/70 hover:border-[#26304A]"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30 font-semibold">
                            Contrato Nº {c.contractNumber}
                          </span>
                          <h3 className="text-base font-bold text-white mt-2 leading-snug">
                            {c.contractName}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDeleteContract(c.id)}
                          className="p-2 rounded-lg text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Excluir Contrato Base"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Resumo dos Nomes das Colunas Encontradas neste Contrato */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 p-3.5 rounded-xl bg-[#111622] border border-[#1E2436] text-xs">
                        <div>
                          <span className="text-[#9CA3AF] block text-[10px]">
                            Coluna Composição
                          </span>
                          <span
                            className="text-white font-bold font-mono truncate block"
                            title={c.detectedColumns?.descHeaderName || "DISCRIMINAÇÃO"}
                          >
                            &ldquo;{c.detectedColumns?.descHeaderName || "DISCRIMINAÇÃO"}&rdquo;
                          </span>
                        </div>
                        <div>
                          <span className="text-emerald-400 block text-[10px] font-semibold">
                            Coluna Quantitativo
                          </span>
                          <span
                            className="text-emerald-400 font-bold font-mono truncate block"
                            title={c.detectedColumns?.qtyHeaderName || "QUANTITATIVO"}
                          >
                            &ldquo;{c.detectedColumns?.qtyHeaderName || "QUANTITATIVO"}&rdquo;
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF] block text-[10px]">Composições</span>
                          <span className="text-[#F97316] font-bold font-mono">
                            {c.itemsCount} itens
                          </span>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF] block text-[10px]">Total Geral Lido</span>
                          <span className="text-[#D4AF37] font-bold font-mono">
                            R${" "}
                            {(c.totalGeralValue || 0).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Se a planilha já foi carregada e tem lista de colunas nomeadas, permite ajustar pelo nome diretamente no Card */}
                      {namedCols.length > 0 && (
                        <div className="mb-3 p-3 rounded-xl bg-[#111622]/90 border border-[#26304A] space-y-2">
                          <span className="text-[10px] font-mono uppercase text-[#D4AF37] block font-semibold">
                            Confirmar / Alterar Colunas pelo Nome Lido na Planilha:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-emerald-400 block mb-0.5 font-semibold">
                                Coluna Quantitativo:
                              </label>
                              <select
                                value={c.detectedColumns?.colQty}
                                onChange={(e) =>
                                  handleRemapExistingContractCard(c.id, undefined, {
                                    colQty: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#07090E] border border-emerald-500/40 rounded-lg px-2 py-1 text-[11px] text-emerald-400 font-bold"
                              >
                                {namedCols.map((col) => (
                                  <option key={col.colIndex} value={col.colIndex}>
                                    {col.headerTitle}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-[#9CA3AF] block mb-0.5">
                                Coluna Composição:
                              </label>
                              <select
                                value={c.detectedColumns?.colDesc}
                                onChange={(e) =>
                                  handleRemapExistingContractCard(c.id, undefined, {
                                    colDesc: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#07090E] border border-[#26304A] rounded-lg px-2 py-1 text-[11px] text-white"
                              >
                                {namedCols.map((col) => (
                                  <option key={col.colIndex} value={col.colIndex}>
                                    {col.headerTitle}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-[#9CA3AF] block mb-0.5">
                                Coluna Unidade:
                              </label>
                              <select
                                value={c.detectedColumns?.colUnit}
                                onChange={(e) =>
                                  handleRemapExistingContractCard(c.id, undefined, {
                                    colUnit: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#07090E] border border-[#26304A] rounded-lg px-2 py-1 text-[11px] text-white"
                              >
                                {namedCols.map((col) => (
                                  <option key={col.colIndex} value={col.colIndex}>
                                    {col.headerTitle}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Seletor de Aba se a planilha tiver mais de uma aba */}
                      {c.sheetNames && c.sheetNames.length > 1 && (
                        <div className="mb-3 flex items-center justify-between bg-[#111622] px-3 py-2 rounded-xl border border-[#26304A] text-xs">
                          <span className="text-[#9CA3AF]">Aba ativa do Contrato:</span>
                          <select
                            value={c.budgetSheetName}
                            onChange={(e) =>
                              handleRemapExistingContractCard(c.id, e.target.value)
                            }
                            className="bg-[#07090E] border border-[#26304A] rounded-lg px-2 py-1 text-xs text-[#D4AF37] font-semibold"
                          >
                            {c.sheetNames.map((sn) => (
                              <option key={sn} value={sn}>
                                {sn}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Intervalo Exclusivo das Linhas com Composições (Linha Inicial e Linha Final) */}
                      <div className="mb-3 p-3.5 rounded-xl bg-[#07090E] border border-[#D4AF37]/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Intervalo de Linhas das Composições (com Código e Banco):
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {c.itemsCount} itens com código
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-end">
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-[#9CA3AF] block mb-1">
                              Linha Inicial das Composições:
                            </label>
                            <input
                              type="number"
                              min={1}
                              defaultValue={c.detectedColumns?.startRow || c.startRow || 2}
                              id={`start-row-${c.id}`}
                              className="w-full bg-[#111622] border border-[#26304A] focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-[#9CA3AF] block mb-1">
                              Linha Final das Composições:
                            </label>
                            <input
                              type="number"
                              min={1}
                              defaultValue={c.detectedColumns?.endRow || c.endRow || 100}
                              id={`end-row-${c.id}`}
                              className="w-full bg-[#111622] border border-[#26304A] focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <button
                              type="button"
                              onClick={() => {
                                const sInput = document.getElementById(`start-row-${c.id}`) as HTMLInputElement;
                                const eInput = document.getElementById(`end-row-${c.id}`) as HTMLInputElement;
                                const sVal = parseInt(sInput?.value || "1", 10);
                                const eVal = parseInt(eInput?.value || "100", 10);
                                handleUpdateContractRowRange(c.id, sVal, eVal);
                              }}
                              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black font-bold text-xs cursor-pointer hover:opacity-95 transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                            >
                              Filtrar Intervalo
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
                          O sistema filtra estritamente as linhas que possuem <strong>Código de Composição</strong> e <strong>Banco</strong> entre as linhas indicadas. Apenas essas linhas receberão injeção na coluna de quantitativo.
                        </p>
                      </div>

                      {/* Dropzone / Botão para Substituir ou Atualizar a Planilha dentro do próprio Card */}
                      <label className="mb-3 flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-[#26304A] hover:border-[#D4AF37] bg-[#07090E]/70 cursor-pointer transition-colors text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileSpreadsheet className="w-4 h-4 text-[#D4AF37] shrink-0" />
                          <span className="text-gray-300 truncate">
                            {isUpdatingThis
                              ? "Procurando colunas pelo nome na planilha..."
                              : c.fileName || "Planilha_Base.xlsx"}
                          </span>
                        </div>
                        <span className="text-[#F97316] font-semibold shrink-0 ml-2">
                          Substituir / Anexar .XLSX
                        </span>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpdateExistingContractCardFile(c.id, file);
                            e.target.value = "";
                          }}
                        />
                      </label>

                      {/* Botão para Inspecionar o Estudo Completo das Composições do Card */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedContractStudyId(isExpanded ? null : c.id)
                        }
                        className="w-full py-2 px-3 rounded-xl bg-[#111622] hover:bg-[#141A28] border border-[#1E2436] text-xs text-[#D4AF37] font-medium flex items-center justify-between cursor-pointer mb-3"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5" />
                          Inspecionar Estudo Completo ({c.itemsCount} composições e etapas)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mb-4 bg-[#07090E] border border-[#1E2436] rounded-xl p-3 max-h-64 overflow-y-auto space-y-2">
                          <div className="text-[10px] font-mono text-[#9CA3AF] pb-2 border-b border-[#1E2436]">
                            Cabeçalho na Linha {c.detectedColumns?.headerRow || 1} • Coluna de Quantitativo:{" "}
                            <strong className="text-emerald-400">
                              &ldquo;{c.detectedColumns?.qtyHeaderName || "QUANTITATIVO"}&rdquo;
                            </strong>{" "}
                            • Coluna de Composição:{" "}
                            <strong className="text-white">
                              &ldquo;{c.detectedColumns?.descHeaderName || "DISCRIMINAÇÃO"}&rdquo;
                            </strong>
                          </div>
                          {c.items.slice(0, 80).map((it, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] py-1.5 border-b border-[#1E2436]/60 flex items-start justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="text-[#F97316] font-mono text-[10px] mr-1.5">
                                  [L{it.row_index || idx + 1} • {it.source || "SINAPI"} {it.code || "S/C"}]
                                </span>
                                <span className="text-gray-200">{it.description}</span>
                              </div>
                              <div className="text-right font-mono shrink-0 text-[10px] text-[#D4AF37]">
                                {it.unit} • R$ {it.unit_price.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedContractId(c.id);
                        setActiveTab("WORKSPACE");
                        showToast(`Contrato "${c.contractNumber}" selecionado para compatibilização!`);
                      }}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40"
                          : "bg-[#141A28] hover:bg-[#1E2436] text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isSelected
                        ? "Contrato Selecionado Atualmente (Ir para Compatibilização)"
                        : "Usar este Contrato na Compatibilização"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* =====================================================================
          MODAL DE VÍNCULO MANUAL DE ITEM DA PLANILHA 1 PARA A COMPOSIÇÃO DO CONTRATO
         ===================================================================== */}
      {activeSwapContractIndex !== null && compositionMatches[activeSwapContractIndex] && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-[#D4AF37]/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-[#1E2436] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F97316]">
                  Alocação Manual de Quantitativo
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Composição Destino:{" "}
                  {compositionMatches[activeSwapContractIndex].contract_item.description}
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Unidade no Contrato:{" "}
                  <strong className="text-white">
                    {compositionMatches[activeSwapContractIndex].contract_item.unit}
                  </strong>{" "}
                  • Preço Unitário: R${" "}
                  {compositionMatches[activeSwapContractIndex].contract_unit_price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setActiveSwapContractIndex(null)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={swapModalSearch}
                onChange={(e) => setSwapModalSearch(e.target.value)}
                placeholder="Filtrar serviços da Planilha 1 por palavra-chave ou setor..."
                className="w-full bg-[#111622] border border-[#26304A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <button
                onClick={() => handleManualAssignSourceItem(activeSwapContractIndex, null)}
                className="w-full text-left p-3 rounded-xl border border-[#26304A] hover:border-red-500/50 bg-[#111622]/50 text-xs text-red-400 font-semibold cursor-pointer"
              >
                Zerar quantitativo desta composição (Não alocar nenhum item da Planilha 1)
              </button>

              {(sheet1Study?.items || [])
                .filter((it) => {
                  if (!swapModalSearch.trim()) return true;
                  const q = swapModalSearch.toLowerCase();
                  return (
                    it.description.toLowerCase().includes(q) ||
                    (it.discipline || "").toLowerCase().includes(q) ||
                    (it.stage_title || "").toLowerCase().includes(q)
                  );
                })
                .map((sItem) => (
                  <button
                    key={sItem.id}
                    onClick={() => handleManualAssignSourceItem(activeSwapContractIndex, sItem)}
                    className="w-full text-left p-3.5 rounded-xl border border-[#1E2436] hover:border-[#D4AF37] bg-[#111622] transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141A28] text-[#F97316]">
                          {sItem.discipline || "GERAL"}
                        </span>
                        {sItem.stage_title && (
                          <span className="text-[10px] text-[#9CA3AF] truncate">
                            {sItem.stage_title}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-white">{sItem.description}</div>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <div className="text-xs font-bold text-emerald-400">
                        Qtd: {sItem.quantity} {sItem.unit}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        Total Origem: R$ {sItem.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DE RESOLUÇÃO INTERATIVA PARA COMPOSIÇÃO COM DIFICULDADE (ATENÇÃO NECESSÁRIA)
         ===================================================================== */}
      {resolvingSourceItem !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-[#F97316]/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-[#1E2436] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F97316] font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#F97316]" />
                  Atenção Necessária • Selecionar Composição no Contrato Base
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Item da Planilha 1: {resolvingSourceItem.description}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#9CA3AF]">
                  <span>
                    Quantitativo a Alocar:{" "}
                    <strong className="text-emerald-400 font-mono text-xs">
                      {resolvingSourceItem.quantity} {resolvingSourceItem.unit}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Etapa Origem:{" "}
                    <strong className="text-gray-300">
                      {resolvingSourceItem.stage_title || resolvingSourceItem.discipline || "GERAL"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Valor na Planilha 1:{" "}
                    <strong className="text-[#D4AF37] font-mono">
                      R$ {resolvingSourceItem.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setResolvingSourceItem(null);
                  setResolvingSearchText("");
                }}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#141A28] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={resolvingSearchText}
                onChange={(e) => setResolvingSearchText(e.target.value)}
                placeholder="Pesquisar por código ou descrição na Planilha Base do Contrato..."
                className="w-full bg-[#111622] border border-[#26304A] focus:border-[#F97316] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(compositionMatches.length > 0
                ? compositionMatches.map((m) => m.contract_item)
                : selectedContract?.items || []
              )
                .filter((cItem) => {
                  if (!resolvingSearchText.trim()) return true;
                  const q = resolvingSearchText.toLowerCase();
                  return (
                    cItem.description.toLowerCase().includes(q) ||
                    (cItem.code || "").toLowerCase().includes(q) ||
                    (cItem.discipline || "").toLowerCase().includes(q) ||
                    (cItem.stage_title || "").toLowerCase().includes(q)
                  );
                })
                .slice(0, 100)
                .map((compItem) => (
                  <button
                    key={`${compItem.id}_${compItem.row_index}`}
                    onClick={() => handleAssignUnmatchedSourceToContract(resolvingSourceItem, compItem)}
                    className="w-full text-left p-3.5 rounded-xl border border-[#1E2436] hover:border-emerald-500/60 bg-[#111622] hover:bg-[#141A28] transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#07090E] text-gray-300">
                          Cód: {compItem.code || "S/C"} • L{compItem.row_index}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141A28] text-[#F97316]">
                          {compItem.discipline || "GERAL"}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                        {compItem.description}
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-white">
                        {compItem.unit} • R$ {compItem.unit_price.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 group-hover:underline flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Alocar {resolvingSourceItem.quantity} {resolvingSourceItem.unit}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
