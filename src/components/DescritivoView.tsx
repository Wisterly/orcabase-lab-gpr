"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BrainCircuit,
  Bot,
  User,
  Mic,
  MicOff,
  Send,
  Sparkles,
  FileText,
  Download,
  Eye,
  Paperclip,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  Info,
  X,
  Key,
  ShieldCheck,
  RefreshCw,
  FileCode,
  Copy,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  Percent,
  RotateCw,
  FileSpreadsheet,
} from "lucide-react";
import {
  DescritivoStage,
  DescritivoItem,
  MemorialMetadata,
  ChatMessage,
  generateLocalSeniorDescription,
  queryGeminiSeniorEngineer,
  queryOpenAISeniorEngineer,
  parseStagesFromPlainText,
  generateMemorialPDF,
  generateMemorialWordDoc,
  getMemorialPDFBlobUrl,
  formatStagesToSpreadsheetText,
  getAutomaticDates,
  AutomaticDates,
} from "@/lib/descritivoAI";
import {
  injectMemorialIntoExcelTemplate,
  generateDefaultMemorialTemplate,
  getStoredCustomTemplate,
} from "@/lib/memorialExcelEngine";

interface DescritivoViewProps {
  initialSchoolName?: string;
  initialProjectName?: string;
  initialCity?: string;
  initialGre?: string;
  showToast: (msg: string) => void;
}

export default function DescritivoView({
  initialSchoolName,
  initialProjectName,
  initialCity,
  initialGre,
  showToast,
}: DescritivoViewProps) {
  // --------------------------------------------------------------------------
  // 1. GERAÇÃO AUTOMÁTICA DE DATAS (Mês/Ano Atual e Data Extensa com Dia da Semana)
  // --------------------------------------------------------------------------
  const autoDates = useMemo(() => getAutomaticDates(), []);

  // --------------------------------------------------------------------------
  // 2. ESTADO DOS DADOS DO MEMORIAL (Escola, Município, BDI, GRE e Datas)
  // --------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    schoolName: initialSchoolName || "CETI FADE III",
    municipio: initialCity ? initialCity.split(" - ")[0] : "Cajazeiras do Piauí",
    uf: initialCity && initialCity.includes("-") ? initialCity.split("-")[1].trim() : "PI",
    bdiPercent: "24,50%",
    gre: initialGre || "12ª GRE",
    finalidade: "Reforma e Manutenção da Unidade Escolar",
    mesAnoRef: autoDates.mesAnoRef, // Ex: "Novembro de 2026"
    dataExtensa: autoDates.dataExtensa, // Ex: "Domingo, 15 de novembro de 2026"
    engineerName: "Engenheiro Responsável Técnico",
    creaNumber: "CREA-PI nº 12345/D",
  });

  // Função para recalcular e atualizar datas automaticamente a qualquer momento
  const handleRefreshDates = () => {
    const fresh = getAutomaticDates();
    setFormData((prev) => ({
      ...prev,
      mesAnoRef: fresh.mesAnoRef,
      dataExtensa: fresh.dataExtensa,
    }));
    showToast(`Datas atualizadas automaticamente: ${fresh.dataExtensa}`);
  };

  // Metadados sincronizados para o gerador de PDF e Word
  const metadata: MemorialMetadata = useMemo(
    () => ({
      projectName: initialProjectName || `${formData.finalidade} — ${formData.schoolName}`,
      schoolName: formData.schoolName,
      city: formData.municipio,
      gre: formData.gre,
      organization: "Governo do Estado do Piauí — Secretaria da Educação / GPR",
      objectDescription: `Elaboração de Memorial Descritivo para ${formData.finalidade}`,
      engineerName: formData.engineerName,
      creaNumber: formData.creaNumber,
      dateStr: autoDates.dataNumerica,
      bdiPercent: formData.bdiPercent,
      mesAnoRef: formData.mesAnoRef,
      dataExtensa: formData.dataExtensa,
      propertyId: formData.schoolName,
      uf: formData.uf,
      purpose: formData.finalidade,
    }),
    [formData, initialProjectName, autoDates.dataNumerica]
  );

  // --------------------------------------------------------------------------
  // 2. ETAPAS E ITENS TÉCNICOS (Padrão Oficial SEDUC-PI: CETI FADE III)
  // --------------------------------------------------------------------------
  const [stages, setStages] = useState<DescritivoStage[]>([
    {
      id: "stg-init-1",
      stageCode: "1",
      title: "COBERTURA",
      items: [
        {
          id: "it-init-1-1",
          itemNumber: "1",
          description:
            "Executar substituição e retelhamento pontual na cobertura do pátio para correção de infiltrações e alinhamento do telhado.",
        },
      ],
    },
    {
      id: "stg-init-2",
      stageCode: "2",
      title: "BANHEIROS",
      items: [
        {
          id: "it-init-2-1",
          itemNumber: "1",
          description:
            "Executar substituição de vasos sanitários convencionais por modelos com caixa acoplada, incluindo conexões e engates flexíveis.",
        },
        {
          id: "it-init-2-2",
          itemNumber: "2",
          description:
            "Executar aplicação de revestimento cerâmico nas paredes dos banheiros com assentamento e rejuntamento.",
        },
        {
          id: "it-init-2-3",
          itemNumber: "3",
          description:
            "Executar teste de estanqueidade e funcionamento das instalações hidráulicas.",
        },
      ],
    },
    {
      id: "stg-init-3",
      stageCode: "3",
      title: "CALÇADAS",
      items: [
        {
          id: "it-init-3-1",
          itemNumber: "1",
          description:
            "Executar construção e recomposição de calçadas em concreto desempenado no entorno da unidade escolar, com regularização da base e juntas de dilatação.",
        },
      ],
    },
    {
      id: "stg-init-4",
      stageCode: "4",
      title: "PISOS E REVESTIMENTOS",
      items: [
        {
          id: "it-init-4-1",
          itemNumber: "1",
          description:
            "Executar regularização e recomposição de piso nos ambientes indicados para nivelamento da superfície.",
        },
      ],
    },
    {
      id: "stg-init-5",
      stageCode: "5",
      title: "PINTURA",
      items: [
        {
          id: "it-init-5-1",
          itemNumber: "1",
          description:
            "Executar pintura acrílica nas superfícies das áreas solicitadas da unidade escolar, com preparo de base, emassamento pontual e aplicação de duas demãos.",
        },
      ],
    },
  ]);

  // --------------------------------------------------------------------------
  // 3. ESTADO DO CHAT (Mensagem de Acolhimento Inicial Limpa)
  // --------------------------------------------------------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: `Olá! Sou o Assistente Técnico Especialista em Infraestrutura Escolar da SEDUC/GPR.

Estou pronto para raciocinar e estruturar o seu memorial descritivo sob medida para as suas necessidades.
Envie uma mensagem de texto ou grave um áudio com os serviços que você deseja executar (por exemplo: *"novas calçadas, recuperação de piso quebrado e eliminação de goteiras no telhado"*).

Irei interpretar as demandas, aplicar a padronização oficial de engenharia e gerar os títulos e itens executivos exclusivamente para o que você solicitar, com saída pronta para o Excel e emissão de PDF oficial!`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Iniciar Novo Memorial do Zero (Limpar Contexto)
  const handleResetNewMemorial = () => {
    setStages([]);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: `Novo memorial descritivo iniciado! O escopo anterior foi limpo.\n\nDescreva em áudio ou texto os serviços específicos que deseja executar nesta unidade escolar.`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setCurrentPage(1);
    showToast("✨ Novo memorial iniciado do zero!");
  };

  const [inputText, setInputText] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isListeningAudio, setIsListeningAudio] = useState(false);

  // Estados dos Motores de IA (OpenAI / ChatGPT, Gemini 2.5 Flash e Local)
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [selectedAiProvider, setSelectedAiProvider] = useState<"openai" | "gemini" | "local">("gemini");
  const [modalActiveTab, setModalActiveTab] = useState<"openai" | "gemini" | "local">("gemini");
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [showApiKeyPassword, setShowApiKeyPassword] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Estados de Colapso dos Painéis da Direita
  const [isDadosOpen, setIsDadosOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isAcoesOpen, setIsAcoesOpen] = useState(true);

  // Estados do Visualizador de PDF
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(stages.length / 2));
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Feedbacks de Like/Dislike nas respostas
  const [feedbackState, setFeedbackState] = useState<Record<string, "up" | "down">>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Carrega chaves e preferências de IA salvas no localStorage (Padrão Oficial: Gemini API)
  useEffect(() => {
    try {
      const savedOpenAiKey = localStorage.getItem("orcabase_openai_api_key");
      const savedOpenAiModel = localStorage.getItem("orcabase_openai_model");
      const savedGeminiKey = localStorage.getItem("orcabase_gemini_api_key");
      const savedProvider = localStorage.getItem("orcabase_ai_provider") as "openai" | "gemini" | "local" | null;
      const geminiEnforced = localStorage.getItem("orcabase_gemini_pr051_enforced");

      if (savedOpenAiKey) setOpenaiApiKey(savedOpenAiKey);
      if (savedOpenAiModel) setOpenaiModel(savedOpenAiModel);
      if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);

      if (!geminiEnforced || savedProvider === "local" || !savedProvider) {
        setSelectedAiProvider("gemini");
        setModalActiveTab("gemini");
        localStorage.setItem("orcabase_ai_provider", "gemini");
        localStorage.setItem("orcabase_gemini_pr051_enforced", "true");
      } else if (savedProvider === "openai" && savedOpenAiKey) {
        setSelectedAiProvider("openai");
        setModalActiveTab("openai");
      } else {
        setSelectedAiProvider("gemini");
        setModalActiveTab("gemini");
      }
    } catch (e) {
      // Ignora erro de acesso ao localStorage
    }
  }, []);

  // Rola para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Transcrição de Voz (Web Speech API)
  const handleToggleVoiceRecording = () => {
    if (isListeningAudio) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListeningAudio(false);
      showToast("Gravação de voz finalizada.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListeningAudio(true);
        showToast("Escutando... Descreva os serviços ou correções.");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setIsListeningAudio(false);
      };

      recognition.onend = () => {
        setIsListeningAudio(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Falha ao iniciar SpeechRecognition:", err);
      setIsListeningAudio(false);
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  // Envio de Mensagem no Chat (Respeitando a Regra de Ouro: Reapresentar Todo o Descritivo Atualizado)
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !selectedFileName) return;

    const currentTime = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: selectedFileName ? `${text}\n📎 Arquivo anexado: ${selectedFileName}` : text,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSelectedFileName(null);
    setIsProcessingAI(true);

    try {
      let aiResponseText = "";
      let newStages: DescritivoStage[] = [];

      // Se os itens atuais forem apenas o placeholder inicial de demonstração (stg-init-*),
      // a 1ª mensagem do usuário inicia o memorial real dele; a partir daí, TODAS as mensagens
      // acumulam/adicionam automaticamente no memorial atual e SÓ zeram ao clicar no botão "Novo Memorial".
      const isInitialDemoPlaceholder =
        stages.length > 0 && stages.every((s) => s.id.startsWith("stg-init-"));
      const activeStages = isInitialDemoPlaceholder ? [] : stages;

      if (selectedAiProvider === "openai" && openaiApiKey) {
        // Envia para o ChatGPT / OpenAI orientado pela Especificação Técnica Oficial
        const result = await queryOpenAISeniorEngineer(text, openaiApiKey, metadata, activeStages, openaiModel);
        aiResponseText = result.textResponse;
        newStages = result.stages;
      } else {
        // Padrão Principal: Envia para a API do Google Gemini via Backend (/api/gemini + system_prompt_seduc.md)
        const result = await queryGeminiSeniorEngineer(text, geminiApiKey, metadata, activeStages);
        aiResponseText = result.textResponse;
        newStages = result.stages;
      }

      setStages(newStages);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      showToast("Descritivo completo atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao processar com IA:", err);
      showToast("Erro ao processar demanda com a IA.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Ação do Botão Principal "Gerar Memorial"
  const handleGerarMemorial = () => {
    setIsProcessingAI(true);
    showToast("Gerando memorial descritivo conforme diretrizes do Super Prompt...");

    setTimeout(() => {
      const generated = generateLocalSeniorDescription(
        `Escola: ${formData.schoolName}, Município: ${formData.municipio}/${formData.uf}, BDI: ${formData.bdiPercent}, GRE: ${formData.gre}, Finalidade: ${formData.finalidade}, Referência: ${formData.mesAnoRef}, Data: ${formData.dataExtensa}`,
        stages
      );
      setStages(generated);
      setIsProcessingAI(false);

      const currentTime = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const fullOutput = formatStagesToSpreadsheetText(generated);

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-gen-${Date.now()}`,
          sender: "assistant",
          text: fullOutput,
          timestamp: currentTime,
        },
      ]);

      showToast("Memorial Descritivo gerado no padrão oficial!");
    }, 500);
  };

  // Ação de Copiar para Excel (Linha por linha, sem marcadores)
  const handleCopyForExcel = () => {
    try {
      const text = formatStagesToSpreadsheetText(stages);
      navigator.clipboard.writeText(text);
      showToast("Descritivo copiado! Pronto para colar diretamente nas células do Excel.");
    } catch (e) {
      showToast("Falha ao copiar para a área de transferência.");
    }
  };

  // Ação de Baixar Memorial Descritivo em Planilha Excel (.xlsx) com substituição de tags "= AQUI"
  const handleBaixarExcelMemorial = async () => {
    try {
      showToast("Gerando planilha Excel oficial (DESCRITIVO MODELO.xlsx)...");

      // Carrega planilha base (`DESCRITIVO MODELO.xlsx` ou personalizada enviada nas Configurações)
      const stored = await getStoredCustomTemplate();
      let excelBytes: Uint8Array;

      const injectionParams = {
        schoolName: formData.schoolName,
        municipio: formData.municipio,
        uf: formData.uf,
        bdiPercent: formData.bdiPercent,
        mesAnoRef: formData.mesAnoRef,
        dataExtensa: formData.dataExtensa,
        stages: stages,
      };

      if (stored && stored.buffer) {
        excelBytes = await injectMemorialIntoExcelTemplate(stored.buffer, injectionParams);
      } else {
        excelBytes = await generateDefaultMemorialTemplate(injectionParams);
      }

      // Criação do arquivo para download no navegador
      const blob = new Blob([excelBytes.buffer as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeSchool = formData.schoolName.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 35);
      a.href = url;
      a.download = `DESCRITIVO_${safeSchool || "ESCOLAR"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Planilha Excel (.xlsx) baixada com sucesso no padrão DESCRITIVO MODELO!");
    } catch (err: any) {
      console.error("Erro ao gerar Excel do memorial:", err);
      showToast(`Erro ao gerar planilha Excel: ${err?.message || "falha na injeção"}`);
    }
  };

  // Ação do Botão "Visualizar PDF"
  const handleVisualizarPDF = () => {
    setIsFullscreenPreview(true);
    showToast("Abrindo visualização ampliada do Memorial Descritivo.");
  };

  // Ação do Botão "Baixar PDF"
  const handleBaixarPDF = () => {
    try {
      generateMemorialPDF(metadata, stages);
      showToast("Download do Memorial Descritivo (PDF) iniciado!");
    } catch (e) {
      console.error("Erro ao baixar PDF:", e);
      showToast("Falha ao gerar o arquivo PDF.");
    }
  };

  // Salvar Chaves e Preferências de IA (OpenAI / Gemini / Local)
  const handleSaveAiConfig = () => {
    try {
      if (openaiApiKey.trim()) {
        localStorage.setItem("orcabase_openai_api_key", openaiApiKey.trim());
      } else {
        localStorage.removeItem("orcabase_openai_api_key");
      }
      localStorage.setItem("orcabase_openai_model", openaiModel);

      if (geminiApiKey.trim()) {
        localStorage.setItem("orcabase_gemini_api_key", geminiApiKey.trim());
      } else {
        localStorage.removeItem("orcabase_gemini_api_key");
      }

      localStorage.setItem("orcabase_ai_provider", modalActiveTab);
      setSelectedAiProvider(modalActiveTab);
      setShowApiKeyModal(false);

      if (modalActiveTab === "openai" && openaiApiKey.trim()) {
        const modelLabel = openaiModel === "gpt-4o" ? "GPT-4o" : "GPT-4o Mini";
        showToast(`ChatGPT (${modelLabel}) ativado com sucesso!`);
      } else if (modalActiveTab === "gemini" && geminiApiKey.trim()) {
        showToast("Google Gemini API ativado com sucesso!");
      } else {
        showToast("Motor Sênior Local ativado com sucesso.");
      }
    } catch (e) {
      setShowApiKeyModal(false);
    }
  };

  // Testar conexão direta com a OpenAI
  const handleTestOpenAi = async () => {
    const key = openaiApiKey.trim();
    if (!key) {
      showToast("Insira a chave da OpenAI (sk-...) para testar.");
      return;
    }
    setIsTestingApiKey(true);
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        showToast("✅ Conexão com a OpenAI confirmada com sucesso!");
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`❌ Falha na OpenAI: ${err?.error?.message || "Verifique a chave informada."}`);
      }
    } catch (err: any) {
      showToast(`❌ Erro ao conectar com a OpenAI: ${err.message}`);
    } finally {
      setIsTestingApiKey(false);
    }
  };

  // Renderização estilizada das mensagens no chat respeitando o padrão ### GRUPO
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Renderiza Títulos de Grupos (### FORROS, ### ELÉTRICA, etc.)
      if (trimmed.startsWith("###")) {
        const titleText = trimmed.replace(/^###\s*/, "").toUpperCase();
        return (
          <div key={idx} className="mt-3 mb-1.5 first:mt-0">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#ffaa2c]/15 border border-[#ffaa2c]/50 text-[#ffaa2c] font-black text-xs tracking-wider uppercase shadow-sm">
              {titleText}
            </span>
          </div>
        );
      }

      // Renderiza marcadores com bolinhas laranjas se houver
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa2c] shrink-0 mt-1.5 shadow-[0_0_8px_rgba(255,170,44,0.7)]" />
            <span className="text-gray-100 text-xs sm:text-[13px] leading-relaxed">
              {trimmed.replace(/^[\s•\-\*]+\s*/, "")}
            </span>
          </div>
        );
      }

      // Linhas normais de serviços (cada serviço em uma linha independente)
      if (trimmed.length > 0) {
        return (
          <p key={idx} className="text-gray-100 text-xs sm:text-[13px] leading-relaxed my-0.5">
            {trimmed}
          </p>
        );
      }

      return <div key={idx} className="h-1" />;
    });
  };

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* -------------------------------------------------------------------- */}
      {/* GRID PRINCIPAL EM 3 CARDS LADO A LADO (COMPACTO — CABE EM 1 PÁGINA)  */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full">
        {/* ================================================================== */}
        {/* CARD 1 (ESQUERDA): CHAT DO ASSISTENTE IA                           */}
        {/* ================================================================== */}
        <section className="lg:col-span-6 rounded-2xl border border-[#232b3d] bg-[#0c0f17] flex flex-col h-[520px] lg:h-[calc(100vh-250px)] lg:min-h-[480px] lg:max-h-[580px] shadow-2xl overflow-hidden">
          {/* Header do Chat */}
          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#1f2637] bg-[#0f131e] flex items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-[15px] font-bold text-white tracking-tight truncate">
                  Assistente OrçaBase.lab
                </h2>
                <p className="text-[11px] text-[#9ca3af] truncate">
                  Especialista em memoriais descritivos de engenharia escolar (SEDUC / GPR)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetNewMemorial}
                className="px-2.5 py-1.5 rounded-lg border border-[#2d374d] bg-[#141926] hover:bg-[#1a2133] hover:border-[#ffaa2c]/60 text-xs text-gray-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-semibold"
                title="Limpar e iniciar um novo memorial do zero"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#ffaa2c]" />
                <span className="hidden sm:inline font-semibold">Novo Memorial</span>
              </button>

              {/* Pill de Seleção de Modelo no Canto Direito */}
              <button
                type="button"
                onClick={() => setShowApiKeyModal(true)}
                className="px-2.5 py-1.5 rounded-lg border border-[#2d374d] bg-[#141926] hover:bg-[#1a2133] hover:border-[#ffaa2c]/60 text-xs text-gray-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-semibold"
                title="Clique para configurar o ChatGPT (OpenAI) ou motor de IA"
              >
                {openaiApiKey ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-emerald-300">
                      ChatGPT · {openaiModel === "gpt-4o" ? "GPT-4o" : "GPT-4o Mini"}
                    </span>
                  </>
                ) : geminiApiKey ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="font-bold text-blue-300">Google Gemini</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-semibold text-gray-300">Motor Sênior Local</span>
                  </>
                )}
                <Key className="w-3.5 h-3.5 text-[#ffaa2c]" />
              </button>
            </div>
          </div>

          {/* Área de Mensagens do Chat */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 pr-2">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ffaa2c] to-[#f97316] flex items-center justify-center text-black font-bold shrink-0 shadow-md">
                      <User className="w-4 h-4 text-black" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#141926] border border-[#ffaa2c]/70 flex items-center justify-center text-[#ffaa2c] shrink-0 shadow-[0_0_8px_rgba(255,170,44,0.25)]">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Bolha de Mensagem */}
                  <div className={`max-w-[88%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-1.5 mb-1 text-[11px] text-[#9ca3af] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="font-bold text-gray-200">
                        {isUser ? "Você" : "OrçaBase.lab"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl shadow-lg text-xs sm:text-[13px] leading-relaxed ${
                        isUser
                          ? "bg-[#1d2433] border border-[#2d3952] rounded-tr-xs"
                          : "bg-[#141924] border border-[#232c3f] rounded-tl-xs"
                      }`}
                    >
                      {renderMessageContent(msg.text)}

                      {!isUser && (
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1f2637] text-gray-400">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text.replace(/###\s*/g, ""));
                              showToast("Texto copiado para a área de transferência!");
                            }}
                            className="text-[11px] font-semibold text-gray-300 hover:text-[#ffaa2c] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copiar texto puro para o Excel"
                          >
                            <Copy className="w-3 h-3" /> Copiar para Excel
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => showToast("Feedback positivo registrado!")}
                              className="p-1 hover:text-green-400 transition-colors cursor-pointer rounded-md hover:bg-white/5"
                              title="Resposta útil"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast("Feedback negativo registrado.")}
                              className="p-1 hover:text-red-400 transition-colors cursor-pointer rounded-md hover:bg-white/5"
                              title="Precisa melhorar"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isProcessingAI && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#141926] border border-[#ffaa2c]/70 flex items-center justify-center text-[#ffaa2c] shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-[#141924] border border-[#232c3f] text-xs text-[#ffaa2c] font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffaa2c] animate-ping" />
                  Elaborando memorial descritivo conforme o Super Prompt...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Envio Inferior */}
          <div className="p-2.5 sm:p-3 bg-[#0f131e] border-t border-[#1f2637] space-y-2 shrink-0">
            {selectedFileName && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#141926] border border-[#263146] text-xs text-gray-300">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Paperclip className="w-3.5 h-3.5 text-[#ffaa2c] shrink-0" />
                  <span className="truncate font-medium">{selectedFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFileName(null)}
                  className="text-gray-400 hover:text-white ml-2 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf,.docx,.doc,.xlsx"
                onChange={handleFileAttachment}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar arquivo de texto ou referência"
                className="w-10 h-10 rounded-xl border border-[#2d3952] bg-[#141926] hover:bg-[#1a2233] hover:border-[#ffaa2c]/60 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Digite sua mensagem ou descreva os serviços que deseja..."
                  className="w-full h-10 bg-[#0a0d14] border border-[#232c3f] rounded-xl px-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffaa2c] transition-colors shadow-inner font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleToggleVoiceRecording}
                title={isListeningAudio ? "Parar gravação de voz" : "Gravar áudio (falar)"}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm ${
                  isListeningAudio
                    ? "bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "border-[#2d3952] bg-[#141926] hover:bg-[#1a2233] hover:border-[#ffaa2c]/60 text-gray-300 hover:text-white"
                }`}
              >
                {isListeningAudio ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#ffaa2c]" />}
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !selectedFileName}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#ffaa2c] to-[#cb5606] hover:brightness-110 text-black font-extrabold flex items-center justify-center transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* CARD 2 (MEIO): DADOS DO MEMORIAL                                   */}
        {/* ================================================================== */}
        <section className="lg:col-span-3 rounded-2xl border border-[#232b3d] bg-[#0c0f17] flex flex-col h-[520px] lg:h-[calc(100vh-250px)] lg:min-h-[480px] lg:max-h-[580px] shadow-2xl overflow-hidden">
          {/* Header do Card 2 */}
          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#1f2637] bg-[#0f131e] flex items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
                  Dados do Memorial
                </h3>
                <p className="text-[11px] text-[#9ca3af]">
                  Dados variáveis injetados na Planilha Base (.xlsx)
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo com rolagem suave */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs pr-2">
            {/* Campo 1: Nome da Escola */}
            <div className="space-y-1.5">
              <label className="block text-xs text-gray-200 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#ffaa2c]" />
                Nome da Escola (Unidade Escolar) <span className="text-[#ffaa2c]">*</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="Ex: CETI Deputado Francisco Antônio Paes Landim Neto"
                className="w-full h-10 bg-[#0b0e14] border border-[#263146] focus:border-[#ffaa2c] rounded-xl px-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors shadow-inner font-semibold"
              />
              <p className="text-[11px] text-gray-400">
                Substitui a tag <code className="text-[#ffaa2c] font-mono font-bold">ESCOLA = AQUI</code> no Excel.
              </p>
            </div>

            {/* Linha 2: Município, UF e BDI (%) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="block text-xs text-gray-200 font-bold">
                  Município <span className="text-[#ffaa2c]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  placeholder="Ex: São João do Piauí"
                  className="w-full h-10 bg-[#0b0e14] border border-[#263146] focus:border-[#ffaa2c] rounded-xl px-3 text-xs sm:text-sm text-white focus:outline-none transition-colors font-semibold"
                />
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs text-gray-200 font-bold">
                  UF <span className="text-[#ffaa2c]">*</span>
                </label>
                <select
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                  className="w-full h-10 bg-[#0b0e14] border border-[#263146] focus:border-[#ffaa2c] rounded-xl px-2.5 text-xs sm:text-sm text-white focus:outline-none font-bold"
                >
                  {["PI", "MA", "CE", "BA", "PE", "RN", "PB", "SP", "RJ", "MG", "PR", "SC", "RS", "GO", "DF"].map(
                    (uf) => (
                      <option key={uf} value={uf} className="bg-[#111622] text-white">
                        {uf}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="sm:col-span-4 space-y-1.5">
                <label className="block text-xs text-gray-200 font-bold truncate text-[#ffaa2c]">
                  BDI da Obra (%) <span className="text-[#ffaa2c]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bdiPercent}
                  onChange={(e) => setFormData({ ...formData, bdiPercent: e.target.value })}
                  placeholder="Ex: 24,50%"
                  className="w-full h-10 bg-[#0b0e14] border border-[#ffaa2c]/50 focus:border-[#ffaa2c] rounded-xl px-3 text-xs sm:text-sm text-[#ffaa2c] font-black focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* CARD 3 (DIREITA): VISUALIZADOR DE MEMORIAL (PDF)                   */}
        {/* ================================================================== */}
        <section className="lg:col-span-3 rounded-2xl border border-[#232b3d] bg-[#0c0f17] flex flex-col h-[520px] lg:h-[calc(100vh-250px)] lg:min-h-[480px] lg:max-h-[580px] shadow-2xl overflow-hidden">
          {/* Header do Card 3 */}
          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-[#1f2637] bg-[#0f131e] flex items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
                  Visualizador do Memorial
                </h3>
                <p className="text-[11px] text-[#9ca3af]">
                  Pré-visualização da folha A4 oficial
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVisualizarPDF}
              className="p-2 rounded-lg bg-[#141926] border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Expandir em Tela Cheia"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Visualização com Controles e Folha A4 */}
          <div className="flex-1 p-3 flex flex-col items-center justify-between bg-[#090b10] relative overflow-hidden">
            {/* Controles Laterais Flutuantes (Zoom / Fullscreen) */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 140))}
                className="w-7.5 h-7.5 rounded-lg bg-[#151a26]/95 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-200 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 75))}
                className="w-7.5 h-7.5 rounded-lg bg-[#151a26]/95 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-200 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleVisualizarPDF}
                className="w-7.5 h-7.5 rounded-lg bg-[#151a26]/95 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-200 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="Visualizar em Tela Cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Seta Esquerda de Paginação */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#151a26]/95 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-200 hover:text-white flex items-center justify-center transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer z-20"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Seta Direita de Paginação */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#151a26]/95 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-200 hover:text-white flex items-center justify-center transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer z-20"
              title="Próxima Página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Folha A4 Fiel à Planilha Base (DESCRITIVO MODELO.xlsx) */}
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
              className="w-full max-w-[255px] sm:max-w-[275px] aspect-[1/1.38] bg-white text-slate-900 rounded-sm shadow-[0_20px_45px_rgba(0,0,0,0.65)] p-2 sm:p-2.5 flex flex-col justify-between relative overflow-hidden transition-transform duration-200 select-none my-auto border border-slate-300"
            >
              {/* Topo e Corpo Fiel ao DESCRITIVO MODELO.xlsx */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Bloco Superior (Linhas 2 a 9 da Planilha Base) */}
                <div className="border border-slate-900 text-[5.2px] leading-[1.15] bg-white text-black">
                  {/* Linhas 2 a 5: Cabeçalho Branco + Brasão Governo do Piauí / SEDUC */}
                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-9 border-r border-slate-900">
                      <div className="bg-white text-black font-extrabold text-center py-0.5 px-1 border-b border-slate-900 uppercase truncate text-[5.8px]">
                        PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - {(formData.schoolName || "CETI FADE III").toUpperCase()}
                      </div>
                      <div className="bg-white text-black font-normal text-center py-0.5 border-b border-slate-900 uppercase">
                        GOVERNO DO ESTADO DO PIAUÍ
                      </div>
                      <div className="bg-white text-black font-normal text-center py-0.5 border-b border-slate-900 uppercase">
                        SECRETARIA DE ESTADO DA EDUCAÇÃO - SEDUC
                      </div>
                      <div className="bg-white text-black font-normal text-center py-0.5 uppercase">
                        UNIDADE DE GESTÃO DA REDE FÍSICA - UGERF
                      </div>
                    </div>
                    <div className="col-span-3 bg-white flex items-center justify-center p-0.5">
                      <img
                        src="/seduc-ugerf-header.png"
                        alt="SEDUC-PI"
                        className="max-h-9 w-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Linha 6: OBJETO + L.S. (MENSAL) */}
                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-2 font-bold text-right pr-1 py-0.5 border-r border-slate-900">OBJETO:</div>
                    <div className="col-span-7 px-1 py-0.5 border-r border-slate-900 truncate">
                      MANUTENÇÃO PREDIAL DAS UNIDADES ESCOLARES DA REDE ESTADUAL
                    </div>
                    <div className="col-span-2 text-right pr-0.5 py-0.5 border-r border-slate-900 text-[4.8px]">L.S.(M)=</div>
                    <div className="col-span-1 text-right pr-0.5 py-0.5 text-[4.8px]">70,90%</div>
                  </div>

                  {/* Linha 7: DATA + DATA BASE + L.S. (HORISTA) */}
                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-2 font-bold text-right pr-1 py-0.5 border-r border-slate-900">DATA:</div>
                    <div className="col-span-3 px-1 py-0.5 border-r border-slate-900 uppercase truncate">
                      {(formData.mesAnoRef || "").replace(/\s+de\s+/i, ", ").toUpperCase()}
                    </div>
                    <div className="col-span-4 px-0.5 py-0.5 border-r border-slate-900 font-bold text-center truncate text-[4.6px]">
                      DATA BASE: SINAPI_PI │ SEINFRA_CE │ ORSE_SE
                    </div>
                    <div className="col-span-2 text-right pr-0.5 py-0.5 border-r border-slate-900 text-[4.8px]">L.S.(H)=</div>
                    <div className="col-span-1 text-right pr-0.5 py-0.5 text-[4.8px]">113,05%</div>
                  </div>

                  {/* Linha 8: UNIDADE + BDI (DIF) */}
                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-2 font-bold text-right pr-1 py-0.5 border-r border-slate-900">UNIDADE.:</div>
                    <div className="col-span-7 px-1 py-0.5 border-r border-slate-900 uppercase truncate">
                      {(formData.schoolName || "").toUpperCase()}
                    </div>
                    <div className="col-span-2 text-right pr-0.5 py-0.5 border-r border-slate-900 text-[4.8px]">BDI(DIF)=</div>
                    <div className="col-span-1 text-right pr-0.5 py-0.5 text-[4.8px]">0,00%</div>
                  </div>

                  {/* Linha 9: MUNICÍPIO + BDI */}
                  <div className="grid grid-cols-12 border-b border-slate-900">
                    <div className="col-span-2 font-bold text-right pr-1 py-0.5 border-r border-slate-900">MUNICÍPIO:</div>
                    <div className="col-span-7 px-1 py-0.5 border-r border-slate-900 uppercase truncate">
                      {(formData.municipio || "").toUpperCase()}
                    </div>
                    <div className="col-span-2 text-right pr-0.5 py-0.5 border-r border-slate-900 text-[4.8px]">BDI=</div>
                    <div className="col-span-1 text-right pr-0.5 py-0.5 text-[4.8px]">
                      {formData.bdiPercent}
                    </div>
                  </div>
                </div>

                {/* Linha 11: Faixa Cinza MEMORIAL DESCRITIVO */}
                <div className="mt-1 border border-slate-900 bg-[#D9D9D9] text-center font-extrabold text-[6.5px] text-black py-0.5 uppercase">
                  MEMORIAL DESCRITIVO
                </div>

                {/* Linha 13: SERVIÇOS - NOME DA ESCOLA */}
                <div className="mt-1 border border-slate-900 bg-white text-center font-extrabold text-[6px] text-black py-0.5 px-1 uppercase truncate">
                  SERVIÇOS - {(formData.schoolName || "").toUpperCase()}
                </div>

                {/* Moldura Externa Espessa (B15:I36) + Caixa Interna Contínua (C17:H34) */}
                <div className="mt-1 flex-1 border-[1.5px] border-black flex flex-col justify-between overflow-hidden bg-white">
                  <div className="flex-1 px-2 py-1.5 overflow-hidden flex flex-col">
                    <div className="flex-1 border border-black px-1.5 py-1 overflow-hidden">
                      {stages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-1 text-slate-400">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                          <strong className="text-[7px] font-bold text-slate-700 uppercase">
                            Planilha Base Vinculada
                          </strong>
                          <p className="text-[6px] text-slate-500 leading-tight">
                            Descreva os serviços no chat ao lado para preenchimento automático.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 overflow-hidden">
                          {stages.map((stg, idx) => {
                            const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
                            return (
                              <div key={stg.id} className="space-y-0.5">
                                <div className="text-center font-extrabold text-[6px] text-[#FF0000] uppercase">
                                  {idx + 1}. {cleanTitle}
                                </div>
                                <div className="space-y-0.5">
                                  {stg.items.map((it) => (
                                    <p key={it.id} className="text-[5.2px] text-black leading-[1.15]">
                                      {it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim()}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-1 border-t border-black w-full shrink-0" />
                </div>

                {/* Linha 37: Data Extensa com Dia da Semana no Rodapé da Planilha Base */}
                <div className="pt-0.5 text-center font-bold text-[5.5px] text-black lowercase">
                  {(formData.dataExtensa || "").toLowerCase()}
                </div>
              </div>
            </div>

            {/* Badge de Paginação no Rodapé */}
            <div className="px-3 py-1 rounded-full bg-[#151a26] border border-[#2a3449] text-xs font-bold text-gray-200 shadow">
              {currentPage} de {totalPages}
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================================== */}
      {/* BARRA DE AÇÕES DO PDF (EMBAIXO DE TODOS OS 3 CARDS, LARGURA TOTAL)   */}
      {/* ==================================================================== */}
      <section className="w-full rounded-2xl border border-[#232b3d] bg-[#0c0f17] px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-3.5">
        {/* Identificação da Barra */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-[#ffaa2c]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight flex items-center gap-2">
              Ações do Memorial Descritivo Oficial
              <span className="px-2 py-0.5 rounded-full bg-[#ffaa2c]/15 border border-[#ffaa2c]/40 text-[#ffaa2c] text-[10px] font-bold uppercase tracking-wider">
                SEDUC / GPR
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#9ca3af]">
              Gere com a IA, visualize em tela cheia, copie diretamente para o Excel ou baixe em PDF e Word.
            </p>
          </div>
        </div>

        {/* Grupo de Botões Alinhados */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {/* Botão Baixar Memorial (.xlsx) */}
          <button
            type="button"
            onClick={handleBaixarExcelMemorial}
            className="px-3.5 py-2 rounded-xl border border-emerald-500/50 bg-[#101b17] hover:bg-[#152721] hover:border-emerald-400 text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Baixar Memorial Descritivo formatado em Planilha Excel (.xlsx) com substituição das tags = AQUI"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Baixar Memorial (.xlsx)</span>
          </button>

          {/* Botão Copiar para Excel */}
          <button
            type="button"
            onClick={handleCopyForExcel}
            className="px-3.5 py-2 rounded-xl border border-[#2d3952] bg-[#141926] hover:bg-[#1b2336] hover:border-[#ffaa2c]/60 text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Copiar texto puro (1 item por linha) para o Excel"
          >
            <Copy className="w-4 h-4 text-[#ffaa2c]" />
            <span>Copiar para Excel</span>
          </button>

          {/* Botão Exportar Word (.DOC) */}
          <button
            type="button"
            onClick={() => {
              generateMemorialWordDoc(metadata, stages);
              showToast("Download do Memorial (.DOC Word) iniciado!");
            }}
            className="px-3.5 py-2 rounded-xl border border-[#2d3952] bg-[#141926] hover:bg-[#1b2336] hover:border-blue-400/60 text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Exportar documento editável para Microsoft Word"
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Exportar Word (.DOC)</span>
          </button>

          {/* Botão Visualizar em Tela Cheia */}
          <button
            type="button"
            onClick={handleVisualizarPDF}
            className="px-3.5 py-2 rounded-xl border border-white/20 bg-[#121622] hover:bg-[#1a2030] hover:border-[#ffaa2c] text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Abrir visualização em tela cheia"
          >
            <Eye className="w-4 h-4 text-[#ffaa2c]" />
            <span>Visualizar em Tela Cheia</span>
          </button>

          {/* Botão Principal: Baixar PDF Oficial */}
          <button
            type="button"
            onClick={handleBaixarPDF}
            className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#ffaa2c] via-[#f97316] to-[#cb5606] hover:brightness-110 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,170,44,0.35)] transition-all cursor-pointer"
            title="Baixar arquivo PDF executivo"
          >
            <Download className="w-4 h-4 text-black" />
            <span>Baixar PDF Oficial</span>
          </button>
        </div>
      </section>


      {/* -------------------------------------------------------------------- */}
      {/* MODAL: VISUALIZADOR DE PDF EM TELA CHEIA                             */}
      {/* -------------------------------------------------------------------- */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0c0f17] border border-[#232b3d] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="p-4 border-b border-[#1f2637] flex items-center justify-between bg-[#0f131e]">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#ffaa2c]" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Memorial Descritivo Oficial — {formData.schoolName}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {formData.municipio} - {formData.uf} • BDI: {formData.bdiPercent} • Ref: {formData.mesAnoRef}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBaixarExcelMemorial}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-[#101b17] hover:bg-[#152721] text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Baixar Memorial Descritivo em Planilha Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handleCopyForExcel}
                  className="px-3 py-1.5 rounded-lg border border-[#2d3952] bg-[#141926] text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#ffaa2c]" /> Copiar Excel
                </button>
                <button
                  type="button"
                  onClick={handleBaixarPDF}
                  className="px-3.5 py-1.5 rounded-lg bg-[#ff861c] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#ff981f] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(false)}
                  className="w-8 h-8 rounded-lg bg-[#141926] border border-[#2d3952] hover:text-white flex items-center justify-center text-gray-400 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conteúdo Renderizado em Alta Definição Fiel ao DESCRITIVO MODELO.xlsx */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#090b10] flex justify-center">
              <div className="w-full max-w-3xl bg-white text-slate-900 rounded-sm shadow-2xl p-6 sm:p-8 space-y-3 text-xs leading-relaxed border border-slate-300">
                {/* Bloco de Cabeçalho e Metadados (Linhas 2 a 9 da Planilha Base) */}
                <div className="border border-black text-[11px] bg-white text-black">
                  <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-9 border-r border-black">
                      <div className="bg-white text-black font-extrabold text-center py-1.5 px-2 border-b border-black uppercase text-xs sm:text-sm">
                        PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - {(formData.schoolName || "CETI FADE III").toUpperCase()}
                      </div>
                      <div className="bg-white text-black font-normal text-center py-1 border-b border-black uppercase">
                        GOVERNO DO ESTADO DO PIAUÍ
                      </div>
                      <div className="bg-white text-black font-normal text-center py-1 border-b border-black uppercase">
                        SECRETARIA DE ESTADO DA EDUCAÇÃO - SEDUC
                      </div>
                      <div className="bg-white text-black font-normal text-center py-1 uppercase">
                        UNIDADE DE GESTÃO DA REDE FÍSICA - UGERF
                      </div>
                    </div>
                    <div className="col-span-3 bg-white flex items-center justify-center p-2">
                      <img
                        src="/seduc-ugerf-header.png"
                        alt="Governo do Piauí / SEDUC"
                        className="max-h-20 w-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Linha 6: OBJETO */}
                  <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-2 font-bold text-right pr-2 py-1 border-r border-black">OBJETO:</div>
                    <div className="col-span-7 px-2 py-1 border-r border-black">
                      MANUTENÇÃO PREDIAL DAS UNIDADES ESCOLARES DA REDE ESTADUAL
                    </div>
                    <div className="col-span-2 text-right pr-2 py-1 border-r border-black text-[10px]">L.S. (MENSAL)=</div>
                    <div className="col-span-1 text-right pr-2 py-1 text-[10px]">70,90%</div>
                  </div>

                  {/* Linha 7: DATA + DATA BASE */}
                  <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-2 font-bold text-right pr-2 py-1 border-r border-black">DATA:</div>
                    <div className="col-span-3 px-2 py-1 border-r border-black uppercase">
                      {(formData.mesAnoRef || "").replace(/\s+de\s+/i, ", ").toUpperCase()}
                    </div>
                    <div className="col-span-4 px-2 py-1 border-r border-black font-bold text-center text-[10px]">
                      DATA BASE: SINAPI_PI │ SEINFRA_CE │ ORSE_SE
                    </div>
                    <div className="col-span-2 text-right pr-2 py-1 border-r border-black text-[10px]">L.S. (HORISTA)=</div>
                    <div className="col-span-1 text-right pr-2 py-1 text-[10px]">113,05%</div>
                  </div>

                  {/* Linha 8: UNIDADE */}
                  <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-2 font-bold text-right pr-2 py-1 border-r border-black">UNIDADE.:</div>
                    <div className="col-span-7 px-2 py-1 border-r border-black uppercase">
                      {(formData.schoolName || "").toUpperCase()}
                    </div>
                    <div className="col-span-2 text-right pr-2 py-1 border-r border-black text-[10px]">BDI (DIF)=</div>
                    <div className="col-span-1 text-right pr-2 py-1 text-[10px]">0,00%</div>
                  </div>

                  {/* Linha 9: MUNICÍPIO + BDI */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 font-bold text-right pr-2 py-1 border-r border-black">MUNICÍPIO:</div>
                    <div className="col-span-7 px-2 py-1 border-r border-black uppercase">
                      {(formData.municipio || "").toUpperCase()}
                    </div>
                    <div className="col-span-2 text-right pr-2 py-1 border-r border-black text-[10px]">BDI=</div>
                    <div className="col-span-1 text-right pr-2 py-1 text-[10px]">
                      {formData.bdiPercent}
                    </div>
                  </div>
                </div>

                {/* Linha 11: MEMORIAL DESCRITIVO */}
                <div className="border border-black bg-[#D9D9D9] py-2 text-center font-extrabold text-sm text-black uppercase">
                  MEMORIAL DESCRITIVO
                </div>

                {/* Linha 13: SERVIÇOS - NOME DA ESCOLA */}
                <div className="border border-black bg-white py-1.5 text-center font-extrabold text-xs text-black uppercase">
                  SERVIÇOS - {(formData.schoolName || "").toUpperCase()}
                </div>

                {/* Moldura Externa Espessa (B15:I36) + Caixa Interna Contínua (C17:H34) */}
                <div className="border-2 border-black bg-white flex flex-col">
                  <div className="px-6 py-4">
                    <div className="border border-black px-4 py-3 space-y-5">
                      {stages.map((stg, idx) => {
                        const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
                        return (
                          <div key={stg.id} className="space-y-2">
                            <div className="text-center font-extrabold text-xs text-[#FF0000] uppercase">
                              {idx + 1}. {cleanTitle}
                            </div>
                            <div className="space-y-1">
                              {stg.items.map((it) => (
                                <div key={it.id} className="text-black text-xs leading-snug">
                                  {it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim()}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="h-3 border-t border-black w-full" />
                </div>

                {/* Linha 37: Data Extensa com Dia da Semana no Rodapé */}
                <div className="pt-0.5 text-center font-bold text-xs text-black lowercase">
                  {(formData.dataExtensa || "").toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: CONFIGURAÇÃO DE IA (OPENAI / CHATGPT, GEMINI OU MOTOR LOCAL) */}
      {/* -------------------------------------------------------------------- */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c0f17] border border-[#232b3d] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header do Modal */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2637]">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <div className="w-8 h-8 rounded-lg bg-[#ffaa2c]/15 border border-[#ffaa2c]/40 flex items-center justify-center text-[#ffaa2c]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Motor de IA do Assistente</span>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#1f2637]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas de Seleção de Motor */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#090b10] border border-[#1f2637] mb-5">
              <button
                type="button"
                onClick={() => setModalActiveTab("openai")}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalActiveTab === "openai"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md font-black"
                    : "text-gray-400 hover:text-white hover:bg-[#141926]"
                }`}
              >
                <span>OpenAI / ChatGPT</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-black/30 text-white font-mono uppercase">
                  Top
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab("gemini")}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalActiveTab === "gemini"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md font-black"
                    : "text-gray-400 hover:text-white hover:bg-[#141926]"
                }`}
              >
                <span>Google Gemini</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab("local")}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalActiveTab === "local"
                    ? "bg-gradient-to-r from-[#ffaa2c] to-[#cb5606] text-black shadow-md font-black"
                    : "text-gray-400 hover:text-white hover:bg-[#141926]"
                }`}
              >
                <span>Motor Local</span>
              </button>
            </div>

            {/* Conteúdo da Aba OPENAI (CHATGPT) */}
            {modalActiveTab === "openai" && (
              <div className="space-y-4 mb-6">
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-gray-300 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ChatGPT Estruturado na Especificação Técnica de Engenharia
                  </p>
                  <p className="text-[11px] text-gray-300">
                    O assistente utiliza a API oficial da OpenAI com as diretrizes da SEDUC/GPR: títulos em CAIXA ALTA, regra de ouro de <strong>ELÉTRICA</strong> unificada, descrições em linha única sem marcadores, pronto para colar no Excel e gerar o PDF oficial.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      Chave da API da OpenAI (API Key):
                    </label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Obter chave OpenAI ↗
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKeyPassword ? "text" : "password"}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-proj-... ou sk-..."
                      className="w-full h-10 bg-[#0a0d14] border border-[#232c3f] rounded-xl px-3.5 pr-10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeyPassword(!showApiKeyPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                      title={showApiKeyPassword ? "Ocultar chave" : "Mostrar chave"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="block text-[10px] text-gray-500">
                    Sua chave é armazenada de forma segura e local no seu navegador.
                  </span>
                </div>

                {/* Seleção do Modelo OpenAI */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Modelo do ChatGPT:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex flex-col gap-0.5 transition-all ${
                        openaiModel === "gpt-4o-mini"
                          ? "border-emerald-500 bg-emerald-950/30 text-white"
                          : "border-[#232c3f] bg-[#0a0d14] text-gray-400 hover:border-[#35435e]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="openai_model"
                        value="gpt-4o-mini"
                        checked={openaiModel === "gpt-4o-mini"}
                        onChange={() => setOpenaiModel("gpt-4o-mini")}
                        className="hidden"
                      />
                      <strong className="text-xs font-bold text-emerald-300">GPT-4o Mini</strong>
                      <span className="text-[10px] text-gray-400">Rápido, inteligente e de altíssimo custo-benefício</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex flex-col gap-0.5 transition-all ${
                        openaiModel === "gpt-4o"
                          ? "border-emerald-500 bg-emerald-950/30 text-white"
                          : "border-[#232c3f] bg-[#0a0d14] text-gray-400 hover:border-[#35435e]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="openai_model"
                        value="gpt-4o"
                        checked={openaiModel === "gpt-4o"}
                        onChange={() => setOpenaiModel("gpt-4o")}
                        className="hidden"
                      />
                      <strong className="text-xs font-bold text-emerald-300">GPT-4o (Flagship)</strong>
                      <span className="text-[10px] text-gray-400">Inteligência analítica máxima e raciocínio profundo</span>
                    </label>
                  </div>
                </div>

                {/* Botão de Teste */}
                <button
                  type="button"
                  onClick={handleTestOpenAi}
                  disabled={isTestingApiKey || !openaiApiKey.trim()}
                  className="w-full py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isTestingApiKey ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testando conexão com a OpenAI...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Testar Conexão com OpenAI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Conteúdo da Aba GEMINI */}
            {modalActiveTab === "gemini" && (
              <div className="space-y-4 mb-6">
                <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-gray-300 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Google Gemini 1.5 Flash
                  </p>
                  <p className="text-[11px] text-gray-300">
                    Conexão direta com a API do Google Gemini, configurada com o Super Prompt oficial para geração rápida e estruturada.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-blue-400" />
                      Chave da API (Gemini):
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Obter chave Gemini ↗
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full h-10 bg-[#0a0d14] border border-[#232c3f] rounded-xl px-3.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="block text-[10px] text-gray-500">
                    Armazenada exclusivamente no seu navegador local.
                  </span>
                </div>
              </div>
            )}

            {/* Conteúdo da Aba MOTOR LOCAL */}
            {modalActiveTab === "local" && (
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/30 text-xs text-gray-300 leading-relaxed space-y-2">
                  <p className="font-bold text-[#ffaa2c] flex items-center gap-1.5 text-sm">
                    <Bot className="w-4 h-4" />
                    Motor Sênior Local da Engenharia
                  </p>
                  <p className="text-xs text-gray-300">
                    Opera de forma 100% autônoma e offline, utilizando o motor ontológico embutido da infraestrutura escolar:
                  </p>
                  <ul className="space-y-1 text-[11px] text-gray-400 list-disc pl-4">
                    <li>Não requer nenhuma chave de API ou conexão de internet externa;</li>
                    <li>Aplica a regra absoluta de <strong>ELÉTRICA</strong> como grupo único;</li>
                    <li>Gera saídas em linhas limpas para cópia direta no Excel;</li>
                    <li>Produz folhas A4 reais em PDF e Word (.DOC).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Rodapé com Ações */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1f2637]">
              <button
                type="button"
                onClick={() => {
                  setOpenaiApiKey("");
                  setGeminiApiKey("");
                  localStorage.removeItem("orcabase_openai_api_key");
                  localStorage.removeItem("orcabase_gemini_api_key");
                  setSelectedAiProvider("local");
                  setShowApiKeyModal(false);
                  showToast("Chaves removidas. Motor Local reativado.");
                }}
                className="px-3.5 py-2 rounded-xl border border-[#2d3952] hover:bg-[#1a2233] text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                Limpar Chaves
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#2d3952] hover:bg-[#1a2233] text-xs text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveAiConfig}
                  className={`px-5 py-2 rounded-xl text-black font-black text-xs transition-all shadow-lg cursor-pointer ${
                    modalActiveTab === "openai"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400"
                      : modalActiveTab === "gemini"
                      ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                      : "bg-gradient-to-r from-[#ffaa2c] to-[#f97316]"
                  }`}
                >
                  Salvar e Ativar {modalActiveTab === "openai" ? "ChatGPT" : modalActiveTab === "gemini" ? "Gemini" : "Motor Local"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
