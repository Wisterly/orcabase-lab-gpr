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
  CheckCircle2,
} from "lucide-react";
import {
  DescritivoStage,
  DescritivoItem,
  MemorialMetadata,
  ChatMessage,
  generateLocalSeniorDescription,
  queryGeminiSeniorEngineer,
  generateMemorialPDF,
  generateMemorialWordDoc,
  getMemorialPDFBlobUrl,
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
  // 1. ESTADO DOS DADOS DO MEMORIAL (Conforme Referência Visual)
  // --------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    propertyId: initialSchoolName || "Lote 05 – Quadra B",
    municipio: initialCity ? initialCity.split(" - ")[0] : "Florianópolis",
    uf: initialCity && initialCity.includes("-") ? initialCity.split("-")[1].trim() : "SC",
    areaM2: "525,00",
    perimeterM: "96,40",
    datumSystem: "SIRGAS2000",
    finalidade: "Desmembramento",
  });

  // Metadados sincronizados para o gerador de PDF
  const metadata: MemorialMetadata = useMemo(
    () => ({
      projectName: initialProjectName || `${formData.finalidade} — ${formData.propertyId}`,
      schoolName: formData.propertyId,
      city: formData.municipio,
      gre: initialGre || "SEDUC / GPR",
      organization: "Governo do Estado — Secretaria da Educação / GPR",
      objectDescription: `Elaboração de Memorial Descritivo para ${formData.finalidade}`,
      engineerName: "Engenheiro Responsável Técnico",
      creaNumber: "CREA nº 12345/D",
      dateStr: new Date().toLocaleDateString("pt-BR"),
      propertyId: formData.propertyId,
      uf: formData.uf,
      areaM2: formData.areaM2,
      perimeterM: formData.perimeterM,
      datumSystem: formData.datumSystem,
      purpose: formData.finalidade,
    }),
    [formData, initialProjectName, initialGre]
  );

  // --------------------------------------------------------------------------
  // 2. ETAPAS E ITENS TÉCNICOS DO MEMORIAL
  // --------------------------------------------------------------------------
  const [stages, setStages] = useState<DescritivoStage[]>([
    {
      id: "stg-1",
      stageCode: "1.0",
      title: "IDENTIFICAÇÃO E DELIMITAÇÃO DO IMÓVEL",
      items: [
        {
          id: "it-1-1",
          itemNumber: "1.1",
          description:
            "O presente memorial descritivo refere-se ao imóvel identificado como Lote 05 da Quadra B, situado no município de Florianópolis/SC, cadastrado sob a matrícula imobiliária com perímetro total georreferenciado.",
        },
        {
          id: "it-1-2",
          itemNumber: "1.2",
          description:
            "A área total delimitada é de 525,00 m² (quinhentos e vinte e cinco metros quadrados), com perímetro total de 96,40 m (noventa e seis metros e quarenta centímetros), projetada no sistema geodésico SIRGAS2000.",
        },
      ],
    },
    {
      id: "stg-2",
      stageCode: "2.0",
      title: "CONFRONTAÇÕES E DESCRIÇÃO PERIMÉTRICA DOS VÉRTICES",
      items: [
        {
          id: "it-2-1",
          itemNumber: "2.1",
          description:
            "Inicia-se a descrição no vértice V-01 de coordenadas UTM (N: 6.945.120,00m e E: 742.310,00m); deste segue confrontando com o alinhamento da via pública com azimute de 85°15'00\" e distância de 15,00m até o vértice V-02.",
        },
        {
          id: "it-2-2",
          itemNumber: "2.2",
          description:
            "Do vértice V-02 deflete à direita confrontando com o Lote 06 com azimute de 175°15'00\" e distância de 35,00m até o vértice V-03; deste segue aos fundos confrontando com o Lote 12 com distância de 15,00m até o vértice V-04.",
        },
        {
          id: "it-2-3",
          itemNumber: "2.3",
          description:
            "Do vértice V-04 deflete no sentido norte confrontando com o Lote 04 com distância de 35,00m até o vértice inicial V-01, fechando assim o polígono perimétrico.",
        },
      ],
    },
    {
      id: "stg-3",
      stageCode: "3.0",
      title: "SERVIÇOS DE MANUTENÇÃO E ADEQUAÇÃO PREDIAL",
      items: [
        {
          id: "it-3-1",
          itemNumber: "3.1",
          description:
            "Execução de nova calçada perimetral de proteção em concreto simples desempenado e sarrafeado, fck ≥ 20 MPa, espessura e=7cm, sobre lastro de brita compactado com caimento para escoamento pluvial.",
        },
        {
          id: "it-3-2",
          itemNumber: "3.2",
          description:
            "Revisão e retelhamento geral com substituição de telhas cerâmicas quebradas visando erradicação total de goteiras e infiltrações, com aplicação de pintura acrílica impermeabilizante.",
        },
      ],
    },
  ]);

  // --------------------------------------------------------------------------
  // 3. ESTADO DO CHAT (Idêntico ao Diálogo da Referência)
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

Para começar, confirme (ou preencha ao lado) os dados principais do imóvel:
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
      text: "Ótimo! Com os dados informados, gerei o memorial descritivo em PDF no padrão oficial da SEDUC. O arquivo está disponível para visualização e download na área de visualização ao lado.",
      timestamp: "10:27",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isListeningAudio, setIsListeningAudio] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
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

  // Carrega chave do Gemini do localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("orcabase_gemini_api_key");
      if (savedKey) setGeminiApiKey(savedKey);
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
        showToast("Escutando... Descreva a obra ou dados do imóvel.");
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

  // Envio de Mensagem no Chat
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

      if (geminiApiKey) {
        const result = await queryGeminiSeniorEngineer(text, geminiApiKey, metadata, stages);
        aiResponseText = result.textResponse;
        newStages = result.stages;
      } else {
        newStages = generateLocalSeniorDescription(text, stages);
        aiResponseText = `Com base nas informações enviadas, estruturei as especificações técnicas no padrão oficial da engenharia civil institucional:\n\nForam geradas/atualizadas ${newStages.length} etapas técnicas prontas para compor o Memorial Descritivo.\n\nVocê pode conferir a pré-visualização do PDF ao lado ou ajustar qualquer campo do formulário.`;
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
      showToast("Memorial Descritivo atualizado com sucesso!");
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
    showToast("Gerando memorial descritivo no padrão oficial...");

    setTimeout(() => {
      const generated = generateLocalSeniorDescription(
        `Imóvel: ${formData.propertyId}, Município: ${formData.municipio}/${formData.uf}, Área: ${formData.areaM2} m², Perímetro: ${formData.perimeterM} m, Finalidade: ${formData.finalidade}`,
        stages
      );
      setStages(generated);
      setIsProcessingAI(false);

      const currentTime = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-gen-${Date.now()}`,
          sender: "assistant",
          text: `Ótimo! Com os dados informados para "${formData.propertyId}" em ${formData.municipio}/${formData.uf}, o memorial descritivo em PDF foi gerado no padrão oficial da SEDUC com sucesso. O documento está pronto para visualização e download ao lado.`,
          timestamp: currentTime,
        },
      ]);

      showToast("Memorial Descritivo gerado com sucesso!");
    }, 600);
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

  // Salvar Chave do Gemini
  const handleSaveApiKey = () => {
    try {
      localStorage.setItem("orcabase_gemini_api_key", geminiApiKey);
      setShowApiKeyModal(false);
      showToast(geminiApiKey ? "Chave do Google Gemini salva com sucesso!" : "Motor Sênior Local ativado.");
    } catch (e) {
      setShowApiKeyModal(false);
    }
  };

  // Formatação de linhas com bullet points laranjas nas respostas da IA
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-2 h-2 rounded-full bg-[#ffaa2c] shrink-0 mt-1.5 shadow-[0_0_6px_rgba(255,170,44,0.6)]" />
            <span className="text-gray-200 text-xs sm:text-[13px] leading-relaxed">
              {trimmed.substring(1).trim()}
            </span>
          </div>
        );
      }
      return (
        <p key={idx} className="text-gray-200 text-xs sm:text-[13px] leading-relaxed my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* -------------------------------------------------------------------- */}
      {/* GRID PRINCIPAL EM 2 COLUNAS (CHAT À ESQUERDA + PAINÉIS À DIREITA)    */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================== */}
        {/* COLUNA ESQUERDA: ASSISTENTE VIRTUAL (CHAT)                         */}
        {/* ================================================================== */}
        <section className="lg:col-span-7 rounded-2xl border border-[#232b3d] bg-[#0c0f17] flex flex-col h-[740px] shadow-2xl overflow-hidden">
          {/* Header do Chat */}
          <div className="p-4 sm:p-5 border-b border-[#1f2637] bg-[#0f131e] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#ffaa2c]/10 border border-[#ffaa2c]/60 flex items-center justify-center text-[#ffaa2c] shadow-[0_0_12px_rgba(255,170,44,0.25)] shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
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
              className="px-3 py-1.5 rounded-lg border border-[#2d374d] bg-[#141926] hover:bg-[#1a2133] hover:border-[#ffaa2c]/60 text-xs text-gray-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Clique para configurar o motor de IA"
            >
              <span className="font-medium">
                {geminiApiKey ? "Modelo 4 · Gemini" : "Modelo 4 · Chat"}
              </span>
              <Info className="w-3.5 h-3.5 text-[#ffaa2c]" />
            </button>
          </div>

          {/* Área de Mensagens do Chat */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 pr-2">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {isUser ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ffaa2c] to-[#f97316] flex items-center justify-center text-black font-bold shrink-0 shadow-md">
                      <User className="w-5 h-5 text-black" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#141926] border border-[#ffaa2c]/70 flex items-center justify-center text-[#ffaa2c] shrink-0 shadow-[0_0_8px_rgba(255,170,44,0.2)]">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  {/* Bolha de Mensagem */}
                  <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    {/* Header da Mensagem (Nome + Horário) */}
                    <div className={`flex items-center gap-2 mb-1 text-[11px] text-[#9ca3af] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="font-semibold text-gray-300">
                        {isUser ? "Você" : "OrçaBase.lab (IA)"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Conteúdo do Balão */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl shadow-lg ${
                        isUser
                          ? "bg-[#1d2433] border border-[#2d3952] rounded-tr-xs"
                          : "bg-[#141924] border border-[#232c3f] rounded-tl-xs"
                      }`}
                    >
                      {renderMessageContent(msg.text)}

                      {/* Botões de Like / Dislike na resposta da IA */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#1f2637] text-gray-400">
                          <button
                            type="button"
                            onClick={() =>
                              setFeedbackState((prev) => ({
                                ...prev,
                                [msg.id]: "up",
                              }))
                            }
                            className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${
                              feedbackState[msg.id] === "up" ? "text-[#ffaa2c]" : ""
                            }`}
                            title="Resposta útil"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFeedbackState((prev) => ({
                                ...prev,
                                [msg.id]: "down",
                              }))
                            }
                            className={`p-1 rounded hover:text-white transition-colors cursor-pointer ${
                              feedbackState[msg.id] === "down" ? "text-red-400" : ""
                            }`}
                            title="Resposta precisa de ajustes"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isProcessingAI && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141924] border border-[#ffaa2c]/30 text-xs text-[#ffaa2c] animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>O Assistente OrçaBase está redigindo o memorial técnico com vocabulário de engenharia...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Entrada de Mensagem (Rodapé do Chat) */}
          <div className="p-3 sm:p-4 border-t border-[#1f2637] bg-[#0f131e] shrink-0">
            {selectedFileName && (
              <div className="mb-2 px-3 py-1 rounded-md bg-[#1a2133] border border-[#2d3952] text-xs text-gray-300 flex items-center justify-between">
                <span className="truncate">📎 Anexo: {selectedFileName}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFileName(null)}
                  className="text-gray-400 hover:text-white text-xs ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Input file oculto */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFileName(e.target.files[0].name);
                    showToast(`Arquivo "${e.target.files[0].name}" pronto para envio.`);
                  }
                }}
              />

              {/* Botão de Anexo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar planta, matrícula ou memorial (PDF/Imagem)"
                className="w-10 h-10 rounded-xl border border-[#2d3952] bg-[#141926] hover:bg-[#1a2233] hover:border-[#ffaa2c]/60 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Campo de Texto */}
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
                  placeholder="Digite sua mensagem..."
                  className="w-full h-11 bg-[#0a0d14] border border-[#232c3f] rounded-xl px-4 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ffaa2c] transition-colors"
                />
              </div>

              {/* Botão de Gravação de Áudio */}
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

              {/* Botão de Envio */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !selectedFileName}
                className="w-11 h-10 rounded-xl bg-[#ff861c] hover:bg-[#ff981f] text-black font-bold flex items-center justify-center transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* COLUNA DIREITA: OS 3 CARDS DA REFERÊNCIA                           */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* ---------------------------------------------------------------- */}
          {/* CARD 1: DADOS DO MEMORIAL                                        */}
          {/* ---------------------------------------------------------------- */}
          <section className="rounded-2xl border border-[#232b3d] bg-[#0c0f17] shadow-xl overflow-hidden transition-all">
            <header
              onClick={() => setIsDadosOpen(!isDadosOpen)}
              className="p-4 bg-[#0f131e] border-b border-[#1f2637] flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#ffaa2c] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Dados do Memorial
                  </h3>
                  <p className="text-[11px] text-[#9ca3af]">
                    Preencha ou edite as informações do imóvel
                  </p>
                </div>
              </div>
              <button type="button" className="text-gray-400 hover:text-white">
                {isDadosOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </header>

            {isDadosOpen && (
              <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                {/* Linha 1: Identificação e Município */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1">
                      Identificação do imóvel <span className="text-[#ffaa2c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.propertyId}
                      onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                      placeholder="Ex: Lote 05 – Quadra B"
                      className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1">
                      Município <span className="text-[#ffaa2c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.municipio}
                      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                      placeholder="Ex: Florianópolis"
                      className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c] transition-colors"
                    />
                  </div>
                </div>

                {/* Linha 2: UF, Área e Perímetro */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1">
                      UF <span className="text-[#ffaa2c]">*</span>
                    </label>
                    <select
                      value={formData.uf}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                      className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-2 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
                    >
                      {["SC", "PI", "MA", "CE", "BA", "PE", "SP", "RJ", "MG", "PR", "RS", "GO", "DF"].map(
                        (uf) => (
                          <option key={uf} value={uf} className="bg-[#111622] text-white">
                            {uf}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1 truncate">
                      Área (m²) <span className="text-[#ffaa2c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.areaM2}
                      onChange={(e) => setFormData({ ...formData, areaM2: e.target.value })}
                      className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-2.5 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1 truncate">
                      Perímetro (m) <span className="text-[#ffaa2c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.perimeterM}
                      onChange={(e) => setFormData({ ...formData, perimeterM: e.target.value })}
                      className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-2.5 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
                    />
                  </div>
                </div>

                {/* Linha 3: Sistema de Referência e Finalidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1">
                      Sistema de referência / Datum <span className="text-[#ffaa2c]">*</span>
                    </label>
                    <select
                      value={formData.datumSystem}
                      onChange={(e) => setFormData({ ...formData, datumSystem: e.target.value })}
                      className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
                    >
                      <option value="SIRGAS2000" className="bg-[#111622]">SIRGAS2000</option>
                      <option value="SAD69" className="bg-[#111622]">SAD69</option>
                      <option value="WGS84" className="bg-[#111622]">WGS84</option>
                      <option value="Córrego Alegre" className="bg-[#111622]">Córrego Alegre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1">
                      Finalidade
                    </label>
                    <select
                      value={formData.finalidade}
                      onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })}
                      className="w-full h-9 bg-[#0b0e14] border border-[#263146] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
                    >
                      <option value="Desmembramento" className="bg-[#111622]">Desmembramento</option>
                      <option value="Reforma e Manutenção Predial" className="bg-[#111622]">Reforma e Manutenção Predial</option>
                      <option value="Regularização Fundiária" className="bg-[#111622]">Regularização Fundiária</option>
                      <option value="Usucapião" className="bg-[#111622]">Usucapião</option>
                      <option value="Adequação e Ampliação" className="bg-[#111622]">Adequação e Ampliação</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* CARD 2: VISUALIZAÇÃO DO MEMORIAL DESCRITIVO (PDF)                */}
          {/* ---------------------------------------------------------------- */}
          <section className="rounded-2xl border border-[#232b3d] bg-[#0c0f17] shadow-xl overflow-hidden transition-all">
            <header
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="p-4 bg-[#0f131e] border-b border-[#1f2637] flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#ffaa2c] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Visualização do Memorial Descritivo (PDF)
                  </h3>
                  <p className="text-[11px] text-[#9ca3af]">
                    Pré-visualização do memorial descritivo gerado
                  </p>
                </div>
              </div>
              <button type="button" className="text-gray-400 hover:text-white">
                {isPreviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </header>

            {isPreviewOpen && (
              <div className="p-4 sm:p-5 flex flex-col items-center bg-[#090b10] relative">
                {/* Controles Laterais Flutuantes (Zoom / Fullscreen) */}
                <div className="absolute top-6 right-6 flex flex-col gap-1.5 z-20">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(z + 15, 140))}
                    className="w-8 h-8 rounded-lg bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(z - 15, 75))}
                    className="w-8 h-8 rounded-lg bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                    title="Diminuir Zoom"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleVisualizarPDF}
                    className="w-8 h-8 rounded-lg bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                    title="Visualizar em Tela Cheia"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Seta Esquerda de Paginação */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer z-20"
                  title="Página Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Seta Direita de Paginação */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#151a26]/90 border border-[#2a3449] hover:border-[#ffaa2c] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer z-20"
                  title="Próxima Página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Folha A4 Realista do PDF */}
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
                  className="w-full max-w-[280px] sm:max-w-[310px] aspect-[1/1.38] bg-white text-slate-900 rounded-sm shadow-[0_15px_35px_rgba(0,0,0,0.6)] p-5 flex flex-col justify-between relative overflow-hidden transition-transform duration-200 select-none"
                >
                  {/* Cabeçalho da Folha */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[10px] text-slate-800 tracking-tight">
                          OrçaBase.Lab <span className="text-[#e65c00]">- GPR</span>
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-[8px] font-bold text-white tracking-widest uppercase">
                        PDF
                      </span>
                    </div>

                    <h4 className="text-center font-bold text-[11px] text-slate-900 tracking-tight mb-2">
                      MEMORIAL DESCRITIVO
                    </h4>

                    {/* Simulação/Conteúdo de Linhas de Texto */}
                    {currentPage === 1 && (
                      <div className="space-y-1.5 text-[7px] text-slate-600 leading-tight">
                        <div className="bg-slate-100 p-1 rounded border border-slate-200 space-y-0.5 mb-2">
                          <p className="font-bold text-slate-800">
                            Imóvel: {formData.propertyId}
                          </p>
                          <p>Local: {formData.municipio} / {formData.uf}</p>
                          <p>Área: {formData.areaM2} m² | Perímetro: {formData.perimeterM} m</p>
                          <p>Datum: {formData.datumSystem}</p>
                        </div>
                        <p className="font-bold text-slate-800 uppercase">1.0 DISPOSIÇÕES GERAIS</p>
                        <p className="line-clamp-2">
                          Fixa as diretrizes técnicas e normas executivas para a realização dos serviços em estrita observância às normas técnicas vigentes.
                        </p>
                        <p className="font-bold text-slate-800 uppercase mt-1">2.0 DESCRIÇÃO PERIMÉTRICA</p>
                        <p className="line-clamp-3">
                          Inicia-se no vértice V-01 seguindo com azimute e distâncias perimétricas confrontando com o logradouro e propriedades adjacentes.
                        </p>
                      </div>
                    )}

                    {currentPage === 2 && (
                      <div className="space-y-1.5 text-[7px] text-slate-600 leading-tight">
                        <p className="font-bold text-slate-800 uppercase">3.0 ESPECIFICAÇÕES DOS SERVIÇOS</p>
                        <p className="line-clamp-3">
                          3.1 Demolição e recuperação pontual de trechos de calçada, com aplicação de concreto fck ≥ 20 MPa desempenado e lastro de brita.
                        </p>
                        <p className="line-clamp-3">
                          3.2 Revisão estrutural na cobertura, substituição de telhas danificadas e alinhamento de tramas de sustentação.
                        </p>
                      </div>
                    )}

                    {currentPage >= 3 && (
                      <div className="space-y-2 text-[7px] text-slate-600 leading-tight">
                        <p className="font-bold text-slate-800 uppercase">RECEBIMENTO E CONCLUSÃO</p>
                        <p className="line-clamp-2">
                          Vistoria conclusiva da equipe técnica para ateste final de conformidade da intervenção predial e topográfica.
                        </p>
                        <div className="pt-4 flex justify-between gap-2 border-t border-slate-200 mt-4 text-[6px] text-center">
                          <div className="flex-1">
                            <div className="border-b border-slate-400 mb-0.5" />
                            <p className="font-bold">Engenheiro Responsável</p>
                          </div>
                          <div className="flex-1">
                            <div className="border-b border-slate-400 mb-0.5" />
                            <p className="font-bold">Fiscal Contratante</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Onda/Curva Laranja no Rodapé da Folha */}
                  <div className="w-full h-2.5 bg-gradient-to-r from-[#ffaa2c] via-[#f97316] to-[#cb5606] rounded-b -mx-5 -mb-5" />
                </div>

                {/* Badge de Paginação no Rodapé */}
                <div className="mt-4 px-3 py-1 rounded-full bg-[#151a26] border border-[#2a3449] text-xs font-semibold text-gray-300 shadow">
                  {currentPage} de {totalPages}
                </div>
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* CARD 3: AÇÕES DO PDF                                             */}
          {/* ---------------------------------------------------------------- */}
          <section className="rounded-2xl border border-[#232b3d] bg-[#0c0f17] shadow-xl overflow-hidden transition-all">
            <header
              onClick={() => setIsAcoesOpen(!isAcoesOpen)}
              className="p-4 bg-[#0f131e] border-b border-[#1f2637] flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#ffaa2c] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Ações do PDF
                  </h3>
                  <p className="text-[11px] text-[#9ca3af]">
                    Gere, visualize e baixe o memorial descritivo.
                  </p>
                </div>
              </div>
              <button type="button" className="text-gray-400 hover:text-white">
                {isAcoesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </header>

            {isAcoesOpen && (
              <div className="p-4 sm:p-5 flex flex-col gap-2.5">
                {/* 1. Botão Principal: Gerar Memorial (Destaque Laranja/Âmbar) */}
                <button
                  type="button"
                  onClick={handleGerarMemorial}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ffaa2c] to-[#e65c00] hover:from-[#ffb648] hover:to-[#f0680a] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,170,44,0.35)] transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-black fill-black" />
                  <span>Gerar Memorial</span>
                </button>

                {/* Linha com Botões Secundários: Visualizar PDF e Baixar PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleVisualizarPDF}
                    className="py-2.5 px-4 rounded-xl border border-white/20 bg-[#121622] hover:bg-[#1a2030] hover:border-[#ffaa2c] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#ffaa2c]" />
                    <span>Visualizar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBaixarPDF}
                    className="py-2.5 px-4 rounded-xl border border-white/20 bg-[#121622] hover:bg-[#1a2030] hover:border-[#ffaa2c] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#ffaa2c]" />
                    <span>Baixar PDF</span>
                  </button>
                </div>

                {/* Opção adicional para exportação em Word */}
                <button
                  type="button"
                  onClick={() => {
                    generateMemorialWordDoc(metadata, stages);
                    showToast("Download do Memorial (.DOC Word) iniciado!");
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-[#232b3d] bg-transparent hover:bg-[#141924] text-[11px] text-gray-400 hover:text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>Exportar cópia editável para Microsoft Word (.DOC)</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

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
                    Memorial Descritivo Oficial — {formData.propertyId}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {formData.municipio} / {formData.uf} • {formData.finalidade}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
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
                  <p className="text-[11px] font-bold text-[#e65c00]">
                    SUPERINTENDÊNCIA DE ENGENHARIA E INFRAESTRUTURA / GPR
                  </p>
                  <div className="mt-3 py-1.5 px-4 bg-slate-900 text-[#ffaa2c] font-black text-sm rounded">
                    MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS
                  </div>
                </div>

                {/* Quadro de Identificação */}
                <div className="p-3 bg-slate-100 rounded border border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-700">IDENTIFICAÇÃO / IMÓVEL: </span>
                    <span className="text-slate-900">{formData.propertyId}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">MUNICÍPIO / UF: </span>
                    <span className="text-slate-900">{formData.municipio} / {formData.uf}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">ÁREA / PERÍMETRO: </span>
                    <span className="text-slate-900">{formData.areaM2} m² / {formData.perimeterM} m</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">DATUM / SISTEMA: </span>
                    <span className="text-slate-900">{formData.datumSystem}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-700">FINALIDADE: </span>
                    <span className="text-slate-900">{formData.finalidade}</span>
                  </div>
                </div>

                {/* Etapas e Itens */}
                <div className="space-y-5">
                  {stages.map((stg) => (
                    <div key={stg.id} className="space-y-2">
                      <div className="bg-slate-200 px-3 py-1 font-bold text-slate-900 border-l-4 border-[#ffaa2c] text-xs">
                        {stg.stageCode} — {stg.title}
                      </div>
                      <div className="space-y-2 pl-2">
                        {stg.items.map((it) => (
                          <div key={it.id} className="text-justify text-slate-700">
                            <span className="font-bold text-slate-900">{it.itemNumber} </span>
                            <span>{it.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assinaturas */}
                <div className="pt-8 grid grid-cols-2 gap-6 text-center text-[10px]">
                  <div>
                    <div className="border-b border-slate-400 mb-1" />
                    <p className="font-bold text-slate-900">Engenheiro Responsável Técnico</p>
                    <p className="text-slate-500">CREA nº 12345/D</p>
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
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: CONFIGURAÇÃO DE CHAVE GOOGLE GEMINI API                       */}
      {/* -------------------------------------------------------------------- */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c0f17] border border-[#232b3d] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2637]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Key className="w-4 h-4 text-[#ffaa2c]" />
                <span>Configurar Google Gemini API</span>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              O <strong>Assistente OrçaBase.lab</strong> utiliza por padrão o <strong>Motor Sênior Local</strong> institucional. Caso queira ativar modelos generativos como Gemini 1.5 Flash ou Gemini 2.5, insira sua chave da API abaixo:
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-gray-300">
                Chave da API (Gemini):
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full h-10 bg-[#0a0d14] border border-[#232c3f] rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-[#ffaa2c]"
              />
              <span className="block text-[11px] text-gray-500">
                A chave é gravada com segurança no seu próprio navegador e nunca sai do seu dispositivo.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setGeminiApiKey("");
                  localStorage.removeItem("orcabase_gemini_api_key");
                  setShowApiKeyModal(false);
                  showToast("Motor Sênior Local reativado.");
                }}
                className="px-4 py-2 rounded-xl border border-[#2d3952] text-xs text-gray-300 hover:text-white cursor-pointer"
              >
                Usar Motor Local
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-[#ff861c] hover:bg-[#ff981f] text-black font-bold text-xs cursor-pointer transition-all"
              >
                Salvar Chave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
