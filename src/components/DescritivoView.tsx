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
    schoolName: initialSchoolName || "CETI Dep. Francisco Antônio Paes Landim Neto",
    municipio: initialCity ? initialCity.split(" - ")[0] : "São João do Piauí",
    uf: initialCity && initialCity.includes("-") ? initialCity.split("-")[1].trim() : "PI",
    bdiPercent: "24,50%",
    gre: initialGre || "12ª GRE",
    finalidade: "Reforma e Manutenção da Unidade Escolar",
    mesAnoRef: autoDates.mesAnoRef, // Ex: "Novembro de 2026"
    dataExtensa: autoDates.dataExtensa, // Ex: "Domingo, 8 de novembro de 2026"
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
  // 2. ETAPAS E ITENS TÉCNICOS (Padrão Oficial do SUPER PROMPT: Títulos em CAIXA ALTA sem numeração)
  // --------------------------------------------------------------------------
  const [stages, setStages] = useState<DescritivoStage[]>([
    {
      id: "stg-forros",
      stageCode: "1",
      title: "FORROS",
      items: [
        {
          id: "it-forros-1",
          itemNumber: "1",
          description: "Executar instalação de forro em todas as salas de aula da unidade escolar.",
        },
        {
          id: "it-forros-2",
          itemNumber: "2",
          description: "Executar substituição dos trechos de forro danificados ou comprometidos.",
        },
      ],
    },
    {
      id: "stg-eletrica",
      stageCode: "2",
      title: "ELÉTRICA",
      items: [
        {
          id: "it-el-1",
          itemNumber: "1",
          description:
            "Executar revisão geral das instalações elétricas da unidade escolar, incluindo tomadas, interruptores e iluminação, com reparo ou substituição dos componentes danificados.",
        },
        {
          id: "it-el-2",
          itemNumber: "2",
          description: "Executar instalação de luminárias do tipo slim nos novos ambientes que receberão forro.",
        },
        {
          id: "it-el-3",
          itemNumber: "3",
          description: "Executar adequação dos quadros de distribuição de circuitos com instalação de proteção termomagnética e DR.",
        },
      ],
    },
    {
      id: "stg-cobertura",
      stageCode: "3",
      title: "COBERTURA",
      items: [
        {
          id: "it-cob-1",
          itemNumber: "1",
          description: "Executar retelhamento da unidade escolar, com substituição das telhas quebradas e correção das goteiras.",
        },
        {
          id: "it-cob-2",
          itemNumber: "2",
          description: "Executar revisão da estrutura da cobertura, com recuperação dos trechos comprometidos.",
        },
      ],
    },
    {
      id: "stg-banheiros",
      stageCode: "4",
      title: "BANHEIROS",
      items: [
        {
          id: "it-ban-1",
          itemNumber: "1",
          description: "Executar revisão geral das instalações hidrossanitárias dos banheiros.",
        },
        {
          id: "it-ban-2",
          itemNumber: "2",
          description: "Executar substituição das torneiras danificadas, com adequação dos pontos hidráulicos, quando necessário.",
        },
        {
          id: "it-ban-3",
          itemNumber: "3",
          description: "Executar desobstrução e revisão dos vasos sanitários dos banheiros.",
        },
      ],
    },
  ]);

  // --------------------------------------------------------------------------
  // 3. ESTADO DO CHAT (Conforme Diálogo de Referência e Regras do Super Prompt)
  // --------------------------------------------------------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-user-1",
      sender: "user",
      text: "Quero elaborar um memorial descritivo de um terreno urbano. Tenho a matrícula, a planta e as coordenadas. Pode me orientar?",
      timestamp: "10:24",
    },
    {
      id: "msg-ai-1",
      sender: "assistant",
      text: `Claro! Vou te ajudar a gerar o memorial descritivo no padrão técnico.

Para começar, confirme (ou preencho ao lado) os dados principais do imóvel:
• Identificação do imóvel (ex.: Lote, Quadra, Loteamento)
• Município/UF
• Área (m²)
• Perímetro (m)
• Sistema de referência / Datum (ex.: SIRGAS2000)
• Descrição dos vértices (coordenadas, confrontações e distâncias)

Você pode me enviar os documentos (planta, matrícula, etc.) aqui no chat ou informar os dados no formulário ao lado. Como prefere seguir?`,
      timestamp: "10:24",
    },
    {
      id: "msg-user-2",
      sender: "user",
      text: "Perfeito. Já preenchi os dados ao lado. Pode gerar o memorial descritivo?",
      timestamp: "10:27",
    },
    {
      id: "msg-ai-2",
      sender: "assistant",
      text: `### FORROS
Executar instalação de forro em todas as salas de aula da unidade escolar.
Executar substituição dos trechos de forro danificados ou comprometidos.

### ELÉTRICA
Executar revisão geral das instalações elétricas da unidade escolar, incluindo tomadas, interruptores e iluminação, com reparo ou substituição dos componentes danificados.
Executar instalação de luminárias do tipo slim nos novos ambientes que receberão forro.

### COBERTURA
Executar retelhamento da unidade escolar, com substituição das telhas quebradas e correção das goteiras.

### BANHEIROS
Executar revisão geral das instalações hidrossanitárias dos banheiros.
Executar substituição das torneiras danificadas, com adequação dos pontos hidráulicos.`,
      timestamp: "10:27",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isListeningAudio, setIsListeningAudio] = useState(false);

  // Estados dos Motores de IA (OpenAI / ChatGPT, Gemini e Local)
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [selectedAiProvider, setSelectedAiProvider] = useState<"openai" | "gemini" | "local">("openai");
  const [modalActiveTab, setModalActiveTab] = useState<"openai" | "gemini" | "local">("openai");
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
  const totalPages = 4;
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Feedbacks de Like/Dislike nas respostas
  const [feedbackState, setFeedbackState] = useState<Record<string, "up" | "down">>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Carrega chaves e preferências de IA salvas no localStorage
  useEffect(() => {
    try {
      const savedOpenAiKey = localStorage.getItem("orcabase_openai_api_key");
      const savedOpenAiModel = localStorage.getItem("orcabase_openai_model");
      const savedGeminiKey = localStorage.getItem("orcabase_gemini_api_key");
      const savedProvider = localStorage.getItem("orcabase_ai_provider") as "openai" | "gemini" | "local" | null;

      if (savedOpenAiKey) setOpenaiApiKey(savedOpenAiKey);
      if (savedOpenAiModel) setOpenaiModel(savedOpenAiModel);
      if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);

      if (savedProvider) {
        setSelectedAiProvider(savedProvider);
        setModalActiveTab(savedProvider);
      } else if (savedOpenAiKey) {
        setSelectedAiProvider("openai");
        setModalActiveTab("openai");
      } else if (savedGeminiKey) {
        setSelectedAiProvider("gemini");
        setModalActiveTab("gemini");
      } else {
        setSelectedAiProvider("openai");
        setModalActiveTab("openai");
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

      if (selectedAiProvider === "openai" && openaiApiKey) {
        // Envia para o ChatGPT / OpenAI orientado pela Especificação Técnica Oficial
        const result = await queryOpenAISeniorEngineer(text, openaiApiKey, metadata, stages, openaiModel);
        aiResponseText = result.textResponse;
        newStages = result.stages;
      } else if (selectedAiProvider === "gemini" && geminiApiKey) {
        // Envia para o Google Gemini
        const result = await queryGeminiSeniorEngineer(text, geminiApiKey, metadata, stages);
        aiResponseText = result.textResponse;
        newStages = result.stages;
      } else if (openaiApiKey) {
        // Fallback direto para OpenAI se houver chave configurada
        const result = await queryOpenAISeniorEngineer(text, openaiApiKey, metadata, stages, openaiModel);
        aiResponseText = result.textResponse;
        newStages = result.stages;
      } else if (geminiApiKey) {
        // Fallback para Gemini se houver chave
        const result = await queryGeminiSeniorEngineer(text, geminiApiKey, metadata, stages);
        aiResponseText = result.textResponse;
        newStages = result.stages;
      } else {
        // Processa via Motor Sênior Local da Engenharia de Infraestrutura Escolar
        newStages = generateLocalSeniorDescription(text, stages);
        aiResponseText = formatStagesToSpreadsheetText(newStages);
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
          <div key={idx} className="mt-3.5 mb-1.5 first:mt-0">
            <span className="inline-block px-2 py-0.5 rounded bg-[#ffaa2c]/15 border border-[#ffaa2c]/40 text-[#ffaa2c] font-black text-xs tracking-wider uppercase">
              {titleText}
            </span>
          </div>
        );
      }

      // Renderiza marcadores com bolinhas laranjas se houver
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa2c] shrink-0 mt-2 shadow-[0_0_6px_rgba(255,170,44,0.6)]" />
            <span className="text-gray-200 text-xs sm:text-[13px] leading-relaxed">
              {trimmed.replace(/^[\s•\-\*]+\s*/, "")}
            </span>
          </div>
        );
      }

      // Linhas normais de serviços (cada serviço em uma linha independente)
      if (trimmed.length > 0) {
        return (
          <p key={idx} className="text-gray-200 text-xs sm:text-[13px] leading-relaxed my-0.5">
            {trimmed}
          </p>
        );
      }

      return <div key={idx} className="h-1" />;
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
            {/* -------------------------------------------------------------------- */}
      {/* GRID PRINCIPAL EM 3 CARDS LADO A LADO                                */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch w-full">
        {/* ================================================================== */}
        {/* CARD 1 (ESQUERDA): CHAT DO ASSISTENTE IA                           */}
        {/* ================================================================== */}
        <section className="lg:col-span-6 rounded-2xl border border-[#232b3d] bg-[#0c0f17] flex flex-col h-[720px] shadow-2xl overflow-hidden">
          {/* Header do Chat */}
          <div className="p-4 sm:p-5 border-b border-[#1f2637] bg-[#0f131e] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white tracking-tight truncate">
                  Assistente OrçaBase.lab
                </h2>
                <p className="text-xs text-[#9ca3af] truncate">
                  Especialista em memoriais descritivos (GPR)
                </p>
              </div>
            </div>

            {/* Pill de Seleção de Modelo no Canto Direito */}
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="px-3 py-1.5 rounded-lg border border-[#2d374d] bg-[#141926] hover:bg-[#1a2133] hover:border-[#ffaa2c]/60 text-xs text-gray-300 flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm"
              title="Clique para configurar o ChatGPT (OpenAI) ou motor de IA"
            >
              {openaiApiKey ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-300">
                    ChatGPT · {openaiModel === "gpt-4o" ? "GPT-4o" : "GPT-4o Mini"}
                  </span>
                </>
              ) : geminiApiKey ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="font-semibold text-blue-300">Google Gemini</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-medium text-gray-300">Motor Sênior Local</span>
                </>
              )}
              <Key className="w-3.5 h-3.5 text-[#ffaa2c]" />
            </button>
          </div>

          {/* Área de Mensagens do Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-2">
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
                    <div className="w-8 h-8 rounded-full bg-[#141926] border border-[#ffaa2c]/70 flex items-center justify-center text-[#ffaa2c] shrink-0 shadow-[0_0_8px_rgba(255,170,44,0.2)]">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Bolha de Mensagem */}
                  <div className={`max-w-[88%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-1.5 mb-1 text-[10px] text-[#9ca3af] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="font-semibold text-gray-300">
                        {isUser ? "Você" : "OrçaBase.lab"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl shadow-lg ${
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
                            className="text-[10px] text-gray-400 hover:text-[#ffaa2c] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copiar texto puro para o Excel"
                          >
                            <Copy className="w-3 h-3" /> Copiar para Excel
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => showToast("Feedback positivo registrado!")}
                              className="p-1 hover:text-green-400 transition-colors cursor-pointer"
                              title="Resposta útil"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast("Feedback negativo registrado.")}
                              className="p-1 hover:text-red-400 transition-colors cursor-pointer"
                              title="Precisa melhorar"
                            >
                              <ThumbsDown className="w-3 h-3" />
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
                <div className="p-3 rounded-2xl bg-[#141924] border border-[#232c3f] text-xs text-[#ffaa2c] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffaa2c] animate-ping" />
                  Elaborando memorial descritivo conforme o Super Prompt...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Envio Inferior */}
          <div className="p-3 bg-[#0f131e] border-t border-[#1f2637] space-y-2 shrink-0">
            {selectedFileName && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#141926] border border-[#263146] text-xs text-gray-300">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-3.5 h-3.5 text-[#ffaa2c] shrink-0" />
                  <span className="truncate">{selectedFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFileName(null)}
                  className="text-gray-400 hover:text-white ml-2 cursor-pointer"
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
                className="w-10 h-10 rounded-xl border border-[#2d3952] bg-[#141926] hover:bg-[#1a2233] hover:border-[#ffaa2c]/60 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
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
                  placeholder="Digite sua mensagem ou descreva os serviços..."
                  className="w-full h-10 bg-[#0a0d14] border border-[#232c3f] rounded-xl px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffaa2c] transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleToggleVoiceRecording}
                title={isListeningAudio ? "Parar gravação de voz" : "Gravar áudio (falar)"}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isListeningAudio
                    ? "bg-red-500 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "border-[#2d3952] bg-[#141926] hover:bg-[#1a2233] hover:border-[#ffaa2c]/60 text-gray-300 hover:text-white"
                }`}
              >
                {isListeningAudio ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !selectedFileName}
                className="w-10 h-10 rounded-xl bg-[#ff861c] hover:bg-[#ff981f] text-black font-bold flex items-center justify-center transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* CARD 2 (MEIO): DADOS DO MEMORIAL                                   */}
        {/* ================================================================== */}
        <section className="lg:col-span-3 rounded-2xl border border-[#232b3d] bg-[#0c0f17] flex flex-col h-[720px] shadow-2xl overflow-hidden">
          {/* Header do Card 2 */}
          <div className="p-4 sm:p-5 border-b border-[#1f2637] bg-[#0f131e] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Dados do Memorial
                </h3>
                <p className="text-xs text-[#9ca3af]">
                  Identificação da unidade escolar, BDI e datas
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo com rolagem suave */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs pr-2">
            {/* Linha 1: Nome da Escola */}
            <div>
              <label className="block text-[11px] text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#ffaa2c]" />
                Nome da Escola (Unidade Escolar) <span className="text-[#ffaa2c]">*</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="Ex: CETI Deputado Francisco Antônio Paes Landim Neto"
                className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c] transition-colors"
              />
            </div>

            {/* Linha 2: Município, UF e BDI (%) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6">
                <label className="block text-[11px] text-gray-300 font-medium mb-1">
                  Município <span className="text-[#ffaa2c]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  placeholder="Ex: São João do Piauí"
                  className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c] transition-colors"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-gray-300 font-medium mb-1">
                  UF <span className="text-[#ffaa2c]">*</span>
                </label>
                <select
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                  className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-2 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
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
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-gray-300 font-semibold mb-1 truncate text-[#ffaa2c]">
                  BDI da Obra (%) <span className="text-[#ffaa2c]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bdiPercent}
                  onChange={(e) => setFormData({ ...formData, bdiPercent: e.target.value })}
                  placeholder="Ex: 24,50%"
                  className="w-full h-9 bg-[#0b0e14] border border-[#ffaa2c]/50 rounded-lg px-2.5 text-xs text-[#ffaa2c] font-bold focus:outline-none focus:border-[#ffaa2c]"
                />
              </div>
            </div>

            {/* Linha 3: GRE / Regional e Finalidade / Objeto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-300 font-medium mb-1">
                  GRE / Regional <span className="text-[#ffaa2c]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.gre}
                  onChange={(e) => setFormData({ ...formData, gre: e.target.value })}
                  placeholder="Ex: 12ª GRE"
                  className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-300 font-medium mb-1">
                  Finalidade / Objeto <span className="text-[#ffaa2c]">*</span>
                </label>
                <select
                  value={formData.finalidade}
                  onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                  className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
                >
                  <option value="Reforma e Manutenção da Unidade Escolar" className="bg-[#111622]">Reforma e Manutenção da Unidade Escolar</option>
                  <option value="Adequação e Modernização de Infraestrutura" className="bg-[#111622]">Adequação e Modernização de Infraestrutura</option>
                  <option value="Manutenção Preventiva e Corretiva" className="bg-[#111622]">Manutenção Preventiva e Corretiva</option>
                  <option value="Reforma da Cobertura e Instalações" className="bg-[#111622]">Reforma da Cobertura e Instalações</option>
                  <option value="Ampliação e Adequação de Acessibilidade" className="bg-[#111622]">Ampliação e Adequação de Acessibilidade</option>
                </select>
              </div>
            </div>

            {/* Linha 4: Painel de Datas Atualizadas Automaticamente */}
            <div className="p-3.5 rounded-xl border border-[#ffaa2c]/30 bg-gradient-to-br from-[#121722] to-[#0c0f16] space-y-2.5 shadow-md">
              <div className="flex items-center justify-between gap-2 border-b border-[#232d40] pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#ffaa2c]/10 border border-[#ffaa2c]/40 flex items-center justify-center text-[#ffaa2c]">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-white tracking-tight flex items-center gap-1.5">
                      Datas do Memorial & Planilha
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                        Automático
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshDates}
                  className="px-2 py-1 rounded-md border border-[#2b3850] bg-[#161c28] hover:bg-[#1f283a] hover:border-[#ffaa2c]/50 text-[10px] text-gray-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                  title="Sincronizar datas com o momento atual"
                >
                  <RotateCw className="w-3 h-3 text-[#ffaa2c]" />
                  <span>Atualizar</span>
                </button>
              </div>

              <div className="space-y-2">
                {/* Data 1: Mês Atual e Ano Atual */}
                <div className="p-2.5 rounded-lg bg-[#0a0d13] border border-[#1f2637]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Mês e Ano Atual (Planilha Base)
                    </label>
                    <Calendar className="w-3 h-3 text-[#ffaa2c]" />
                  </div>
                  <input
                    type="text"
                    value={formData.mesAnoRef}
                    onChange={(e) => setFormData({ ...formData, mesAnoRef: e.target.value })}
                    className="w-full bg-transparent text-xs sm:text-[13px] font-bold text-white focus:outline-none focus:border-b focus:border-[#ffaa2c]"
                    title="Mês e ano atualizados automaticamente pelo sistema"
                  />
                  <p className="text-[9px] text-[#9ca3af] mt-0.5">
                    Exibido na planilha orçamentária e no cabeçalho
                  </p>
                </div>

                {/* Data 2: Data Extensa com Dia da Semana */}
                <div className="p-2.5 rounded-lg bg-[#0a0d13] border border-[#1f2637]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Data Extensa com Dia da Semana
                    </label>
                    <Clock className="w-3 h-3 text-[#ffaa2c]" />
                  </div>
                  <input
                    type="text"
                    value={formData.dataExtensa}
                    onChange={(e) => setFormData({ ...formData, dataExtensa: e.target.value })}
                    className="w-full bg-transparent text-xs sm:text-[13px] font-bold text-white focus:outline-none focus:border-b focus:border-[#ffaa2c]"
                    title="Dia da semana, dia, mês e ano atualizados automaticamente pelo sistema"
                  />
                  <p className="text-[9px] text-[#9ca3af] mt-0.5">
                    Exibido no fechamento oficial e assinaturas
                  </p>
                </div>
              </div>
            </div>

            {/* Linha 5: Responsável Técnico */}
            <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#1f2637] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#ffaa2c] font-bold block">
                Responsável Técnico
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Engenheiro:</label>
                  <input
                    type="text"
                    value={formData.engineerName}
                    onChange={(e) => setFormData({ ...formData, engineerName: e.target.value })}
                    className="w-full bg-[#111622] border border-[#263146] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">CREA / CAU:</label>
                  <input
                    type="text"
                    value={formData.creaNumber}
                    onChange={(e) => setFormData({ ...formData, creaNumber: e.target.value })}
                    className="w-full bg-[#111622] border border-[#263146] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé do Card 2 */}
          <div className="p-3 bg-[#0a0d13] border-t border-[#1e2535] flex items-center justify-between text-[11px] text-gray-400 shrink-0">
            <span>SEDUC / GPR</span>
            <span className="text-emerald-400 font-mono font-semibold">Dados Sincronizados</span>
          </div>
        </section>

        {/* ================================================================== */}
        {/* CARD 3 (DIREITA): VISUALIZADOR DE MEMORIAL (PDF)                   */}
        {/* ================================================================== */}
        <section className="lg:col-span-3 rounded-2xl border border-[#232b3d] bg-[#0c0f17] flex flex-col h-[720px] shadow-2xl overflow-hidden">
          {/* Header do Card 3 */}
          <div className="p-4 sm:p-5 border-b border-[#1f2637] bg-[#0f131e] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Visualizador do Memorial
                </h3>
                <p className="text-xs text-[#9ca3af]">
                  Pré-visualização da folha A4 oficial
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVisualizarPDF}
              className="p-2 rounded-lg bg-[#141926] border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Expandir em Tela Cheia"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Visualização com Controles e Folha A4 */}
          <div className="flex-1 p-4 flex flex-col items-center justify-between bg-[#090b10] relative overflow-hidden">
            {/* Controles Laterais Flutuantes (Zoom / Fullscreen) */}
            <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 140))}
                className="w-7 h-7 rounded-lg bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 75))}
                className="w-7 h-7 rounded-lg bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleVisualizarPDF}
                className="w-7 h-7 rounded-lg bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer z-20"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Seta Direita de Paginação */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer z-20"
              title="Próxima Página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Folha A4 Realista do PDF */}
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
              className="w-full max-w-[315px] sm:max-w-[340px] aspect-[1/1.38] bg-white text-slate-900 rounded-sm shadow-[0_15px_35px_rgba(0,0,0,0.6)] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-transform duration-200 select-none my-auto"
            >
              {/* Cabeçalho da Folha */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[10px] text-slate-800 tracking-tight">
                      OrçaBase.Lab <span className="text-[#e65c00]">- GPR</span>
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-[8px] font-bold text-white tracking-widest uppercase">
                    PDF
                  </span>
                </div>

                <h4 className="text-center font-bold text-[10px] text-slate-900 tracking-tight mb-2 uppercase">
                  MEMORIAL DESCRITIVO
                </h4>

                {currentPage === 1 && (
                  <div className="space-y-1.5 text-[7px] text-slate-600 leading-tight">
                    <div className="bg-slate-100 p-1.5 rounded border border-slate-200 space-y-0.5 mb-2 text-[6.5px]">
                      <p className="font-bold text-slate-800 truncate">
                        Unidade: {formData.schoolName}
                      </p>
                      <div className="flex justify-between text-slate-700">
                        <span>Local: {formData.municipio} - {formData.uf}</span>
                        <span className="font-bold text-[#e65c00]">BDI: {formData.bdiPercent}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Ref: {formData.mesAnoRef}</span>
                        <span>GRE: {formData.gre}</span>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 uppercase">FORROS</p>
                    <p className="line-clamp-2">
                      Executar instalação de forro em todas as salas de aula da unidade escolar.
                    </p>
                    <p className="font-bold text-slate-800 uppercase mt-1">ELÉTRICA</p>
                    <p className="line-clamp-2">
                      Executar revisão geral das instalações elétricas da unidade escolar, incluindo tomadas, interruptores e iluminação.
                    </p>
                    <p className="line-clamp-2">
                      Executar instalação de luminárias do tipo slim nos novos ambientes que receberão forro.
                    </p>
                  </div>
                )}

                {currentPage === 2 && (
                  <div className="space-y-1.5 text-[7px] text-slate-600 leading-tight">
                    <p className="font-bold text-slate-800 uppercase">COBERTURA</p>
                    <p className="line-clamp-3">
                      Executar retelhamento da unidade escolar, com substituição das telhas quebradas e correção das goteiras.
                    </p>
                    <p className="font-bold text-slate-800 uppercase mt-1">BANHEIROS</p>
                    <p className="line-clamp-3">
                      Executar revisão geral das instalações hidrossanitárias dos banheiros da unidade escolar.
                    </p>
                  </div>
                )}

                {currentPage >= 3 && (
                  <div className="space-y-1.5 text-[7px] text-slate-600 leading-tight">
                    <p className="font-bold text-slate-800 uppercase">RECEBIMENTO E CONCLUSÃO</p>
                    <p className="line-clamp-2">
                      Vistoria conclusiva da equipe de engenharia fiscal para ateste final de conformidade da intervenção predial e escolar.
                    </p>
                    <p className="text-center italic text-[6px] text-slate-500 pt-1">
                      {formData.municipio} - {formData.uf}, {formData.dataExtensa}.
                    </p>
                    <div className="pt-2 flex justify-between gap-2 border-t border-slate-200 mt-2 text-[6px] text-center">
                      <div className="flex-1">
                        <div className="border-b border-slate-400 mb-0.5" />
                        <p className="font-bold">Engenheiro Responsável</p>
                        <p className="text-slate-400">{formData.creaNumber}</p>
                      </div>
                      <div className="flex-1">
                        <div className="border-b border-slate-400 mb-0.5" />
                        <p className="font-bold">Fiscal Contratante</p>
                        <p className="text-slate-400">SEDUC / GPR</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Onda/Curva Laranja no Rodapé da Folha */}
              <div className="w-full h-2 bg-gradient-to-r from-[#ffaa2c] via-[#f97316] to-[#cb5606] rounded-b -mx-5 -mb-5" />
            </div>

            {/* Badge de Paginação no Rodapé */}
            <div className="px-3 py-1 rounded-full bg-[#151a26] border border-[#2a3449] text-xs font-semibold text-gray-300 shadow">
              {currentPage} de {totalPages}
            </div>
          </div>
        </section>
      </div>

      {/* ==================================================================== */}
      {/* BARRA DE AÇÕES DO PDF (EMBAIXO DE TODOS OS 3 CARDS, LARGURA TOTAL)   */}
      {/* ==================================================================== */}
      <section className="w-full rounded-2xl border border-[#232b3d] bg-[#0c0f17] p-4 sm:p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Identificação da Barra */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
            <Sparkles className="w-5 h-5 text-[#ffaa2c]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Ações do Memorial Descritivo Oficial
              <span className="px-2 py-0.5 rounded-full bg-[#ffaa2c]/15 border border-[#ffaa2c]/40 text-[#ffaa2c] text-[10px] font-bold uppercase tracking-wider">
                SEDUC / GPR
              </span>
            </h3>
            <p className="text-xs text-[#9ca3af]">
              Gere com a IA, visualize em tela cheia, copie diretamente para o Excel ou baixe em PDF e Word.
            </p>
          </div>
        </div>

        {/* Grupo de Botões Alinhados */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Botão Copiar para Excel */}
          <button
            type="button"
            onClick={handleCopyForExcel}
            className="px-3.5 py-2.5 rounded-xl border border-[#2d3952] bg-[#141926] hover:bg-[#1b2336] hover:border-[#ffaa2c]/60 text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
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
            className="px-3.5 py-2.5 rounded-xl border border-[#2d3952] bg-[#141926] hover:bg-[#1b2336] hover:border-blue-400/60 text-xs font-semibold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Exportar documento editável para Microsoft Word"
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Exportar Word (.DOC)</span>
          </button>

          {/* Botão Visualizar em Tela Cheia */}
          <button
            type="button"
            onClick={handleVisualizarPDF}
            className="px-3.5 py-2.5 rounded-xl border border-white/20 bg-[#121622] hover:bg-[#1a2030] hover:border-[#ffaa2c] text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Abrir visualização em tela cheia"
          >
            <Eye className="w-4 h-4 text-[#ffaa2c]" />
            <span>Visualizar em Tela Cheia</span>
          </button>

          {/* Botão Principal: Baixar PDF Oficial */}
          <button
            type="button"
            onClick={handleBaixarPDF}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffaa2c] via-[#f97316] to-[#cb5606] hover:brightness-110 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,170,44,0.35)] transition-all cursor-pointer"
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

            {/* Conteúdo Renderizado do Memorial em Alta Definição */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#090b10] flex justify-center">
              <div className="w-full max-w-2xl bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-12 space-y-6 text-xs leading-relaxed">
                {/* Cabeçalho A4 */}
                <div className="text-center border-b-2 border-[#d4af37] pb-4">
                  <p className="font-extrabold text-[13px] text-slate-900 uppercase">
                    GOVERNO DO ESTADO — SECRETARIA DA EDUCAÇÃO
                  </p>
                  <p className="text-[11px] font-bold text-[#e65c00] uppercase">
                    SUPERINTENDÊNCIA DE ENGENHARIA E INFRAESTRUTURA ESCOLAR / GPR
                  </p>
                  <div className="mt-3 py-1.5 px-4 bg-slate-900 text-[#ffaa2c] font-black text-sm rounded uppercase">
                    MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS
                  </div>
                </div>

                {/* Quadro de Identificação */}
                <div className="p-3.5 bg-slate-100 rounded border border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-700">UNIDADE ESCOLAR: </span>
                    <span className="text-slate-900 font-semibold">{formData.schoolName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">MUNICÍPIO / UF: </span>
                    <span className="text-slate-900">{formData.municipio} - {formData.uf}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">BDI APLICADO (%): </span>
                    <span className="text-[#e65c00] font-bold">{formData.bdiPercent}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">MÊS / ANO REF.: </span>
                    <span className="text-slate-900 font-medium">{formData.mesAnoRef}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">GRE / REGIONAL: </span>
                    <span className="text-slate-900">{formData.gre}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">FINALIDADE: </span>
                    <span className="text-slate-900">{formData.finalidade}</span>
                  </div>
                </div>

                {/* Etapas e Itens Técnicos (Padrão Oficial: Título em CAIXA ALTA sem numeração, cada serviço em uma linha) */}
                <div className="space-y-5">
                  {stages.map((stg) => (
                    <div key={stg.id} className="space-y-2">
                      <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 border-l-4 border-[#ffaa2c] text-xs uppercase">
                        {stg.title.toUpperCase()}
                      </div>
                      <div className="space-y-1.5 pl-2">
                        {stg.items.map((it) => (
                          <div key={it.id} className="text-slate-800 text-[11px] leading-relaxed">
                            {it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data e Local por extenso com Dia da Semana e Assinaturas */}
                <div className="pt-6 text-center">
                  <p className="italic text-slate-600 text-[11px] mb-6">
                    {formData.municipio} - {formData.uf}, {formData.dataExtensa}.
                  </p>
                  <div className="grid grid-cols-2 gap-8 text-[10px]">
                    <div>
                      <div className="border-b border-slate-400 mb-1" />
                      <p className="font-bold text-slate-900">{formData.engineerName}</p>
                      <p className="text-slate-500">{formData.creaNumber}</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 mb-1" />
                      <p className="font-bold text-slate-900">Fiscal de Obras / Órgão Contratante</p>
                      <p className="text-slate-500">SEDUC / GPR</p>
                    </div>
                  </div>
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
