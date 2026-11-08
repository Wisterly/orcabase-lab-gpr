"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BrainCircuit,
  Mic,
  MicOff,
  Send,
  Sparkles,
  FileText,
  Download,
  FileCode,
  Copy,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Building2,
  MapPin,
  UserCheck,
  Calendar,
  Layers,
  Key,
  ShieldCheck,
  Volume2,
  FileUp,
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
  // Metadados do Memorial
  const [metadata, setMetadata] = useState<MemorialMetadata>({
    projectName: initialProjectName || "12ª GRE - CETI DEP. FRANCISCO ANTONIO PAES LANDIM NETO",
    schoolName: initialSchoolName || "CETI FADE III",
    city: initialCity || "São João do Piauí - PI",
    gre: initialGre || "12ª GRE",
    organization: "Secretaria de Estado da Educação - SEDUC / GPR",
    objectDescription: "Reforma, Manutenção Predial e Adequação Geral",
    engineerName: "Engenheiro Responsável Técnico",
    creaNumber: "CREA-PI nº 12345/D",
    dateStr: new Date().toLocaleDateString("pt-BR"),
  });

  // Etapas e Itens do Memorial Descritivo
  const [stages, setStages] = useState<DescritivoStage[]>([
    {
      id: "stg-init-1",
      stageCode: "1.0",
      title: "SERVIÇOS PRELIMINARES E MOBILIZAÇÃO",
      items: [
        {
          id: "it-init-1-1",
          itemNumber: "1.1",
          description:
            "Mobilização de equipe técnica, ferramentas e equipamentos de proteção individual (EPI) necessários para a execução dos serviços em conformidade com as normas regulamentadoras NR-18 e NR-35.",
        },
        {
          id: "it-init-1-2",
          itemNumber: "1.2",
          description:
            "Fornecimento e instalação de placa indicativa de obra em chapa galvanizada com estrutura de madeira conforme padrão oficial.",
        },
      ],
    },
    {
      id: "stg-init-2",
      stageCode: "2.0",
      title: "COBERTURA, ESTRUTURA E RETELHAMENTO",
      items: [
        {
          id: "it-init-2-1",
          itemNumber: "2.1",
          description:
            "Revisão minuciosa em toda a estrutura de cobertura existente, incluindo reaperto de tirantes e substituição de peças de madeira danificadas (terças, caibros e ripas) por ação de cupins ou intempéries.",
        },
        {
          id: "it-init-2-2",
          itemNumber: "2.2",
          description:
            "Execução de retelhamento geral com substituição de telhas cerâmicas quebradas visando erradicação total de goteiras e infiltrações nas salas de aula.",
        },
      ],
    },
    {
      id: "stg-init-3",
      stageCode: "3.0",
      title: "PAVIMENTAÇÃO, CALÇADAS E ACESSIBILIDADE",
      items: [
        {
          id: "it-init-3-1",
          itemNumber: "3.1",
          description:
            "Execução de nova calçada perimetral de proteção em concreto simples desempenado, fck ≥ 20 MPa, espessura e=7cm, sobre lastro de brita compactado com caimento para escoamento pluvial.",
        },
        {
          id: "it-init-3-2",
          itemNumber: "3.2",
          description:
            "Demolição e recomposição pontual de trechos de calçadas danificadas ou fissuradas junto às alvenarias da escola.",
        },
      ],
    },
  ]);

  // Mensagens do Chat com a IA
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Olá, Engenheiro! Sou o seu Assistente Sênior de Especificações Técnicas. Você pode digitar ou gravar um áudio descrevendo de forma simples as intervenções que deseja realizar (ex: 'fazer nova calçada, pintar as salas, revisar o telhado e instalar nova caixa d'água'). Eu organizarei tudo em Títulos e Itens com redação técnica oficial de engenharia!",
      timestamp: "Agora",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isListeningAudio, setIsListeningAudio] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Carrega chave do Gemini do localStorage se salva
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("orcabase_gemini_api_key");
      if (savedKey) setGeminiApiKey(savedKey);
    } catch {}
  }, []);

  // Rola chat para o final a cada nova mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessingAI]);

  // Inicializa o reconhecimento de fala (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "pt-BR";

        recognition.onstart = () => {
          setIsListeningAudio(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
            showToast("Áudio transcrito com sucesso!");
          }
          setIsListeningAudio(false);
        };

        recognition.onerror = (event: any) => {
          console.warn("Erro no reconhecimento de voz:", event.error);
          setIsListeningAudio(false);
          if (event.error === "not-allowed") {
            showToast("Acesso ao microfone negado no navegador.");
          }
        };

        recognition.onend = () => {
          setIsListeningAudio(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [showToast]);

  const handleToggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      showToast("Seu navegador não possui suporte direto a Speech Recognition.");
      return;
    }

    if (isListeningAudio) {
      recognitionRef.current.stop();
      setIsListeningAudio(false);
    } else {
      try {
        recognitionRef.current.start();
        showToast("Microfone ativado! Fale os serviços que deseja executar...");
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    try {
      localStorage.setItem("orcabase_gemini_api_key", key);
      showToast("Chave da API salva com sucesso!");
    } catch {}
    setShowApiKeyModal(false);
  };

  // Envio de demanda para a IA
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isProcessingAI) return;

    setInputText("");

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessingAI(true);

    try {
      let resultText = "";
      let newStages: DescritivoStage[] = [];

      if (geminiApiKey.trim()) {
        const aiResponse = await queryGeminiSeniorEngineer(prompt, geminiApiKey, metadata, stages);
        resultText = aiResponse.textResponse;
        newStages = aiResponse.stages;
      } else {
        newStages = generateLocalSeniorDescription(prompt, stages);
        resultText = `Estruturei as especificações técnicas da sua demanda com base na ontologia da engenharia civil institucional:\n\nForam geradas ${newStages.length} etapas técnicas prontas para compor o Memorial Descritivo.`;
      }

      // Adiciona as novas etapas sem duplicar títulos já existentes
      setStages((prev) => {
        const merged = [...prev];
        newStages.forEach((nstg) => {
          const existingIdx = merged.findIndex(
            (s) => s.title.trim().toUpperCase() === nstg.title.trim().toUpperCase()
          );
          if (existingIdx >= 0) {
            // Mescla os itens
            merged[existingIdx].items = [...merged[existingIdx].items, ...nstg.items];
          } else {
            // Renumera o código da etapa
            const nextCode = `${merged.length + 1}.0`;
            const renumberedItems = nstg.items.map((it, idx) => ({
              ...it,
              itemNumber: `${merged.length + 1}.${idx + 1}`,
            }));
            merged.push({
              ...nstg,
              stageCode: nextCode,
              items: renumberedItems,
            });
          }
        });
        return merged;
      });

      const assistantMsg: ChatMessage = {
        id: `msg-ast-${Date.now()}`,
        sender: "assistant",
        text: resultText,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        generatedStages: newStages,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      showToast("Memorial Descritivo atualizado com novos títulos e itens técnicos!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao processar demanda com a IA.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Funções de Edição do Memorial
  const handleUpdateItemDescription = (stageId: string, itemId: string, newText: string) => {
    setStages((prev) =>
      prev.map((stg) => {
        if (stg.id !== stageId) return stg;
        return {
          ...stg,
          items: stg.items.map((it) => (it.id === itemId ? { ...it, description: newText } : it)),
        };
      })
    );
  };

  const handleUpdateStageTitle = (stageId: string, newTitle: string) => {
    setStages((prev) =>
      prev.map((stg) => (stg.id === stageId ? { ...stg, title: newTitle.toUpperCase() } : stg))
    );
  };

  const handleDeleteItem = (stageId: string, itemId: string) => {
    setStages((prev) =>
      prev.map((stg) => {
        if (stg.id !== stageId) return stg;
        const filtered = stg.items.filter((it) => it.id !== itemId);
        return {
          ...stg,
          items: filtered.map((it, idx) => ({
            ...it,
            itemNumber: `${stg.stageCode.split(".")[0]}.${idx + 1}`,
          })),
        };
      })
    );
  };

  const handleDeleteStage = (stageId: string) => {
    setStages((prev) => {
      const filtered = prev.filter((stg) => stg.id !== stageId);
      return filtered.map((stg, sIdx) => {
        const newCode = `${sIdx + 1}.0`;
        return {
          ...stg,
          stageCode: newCode,
          items: stg.items.map((it, iIdx) => ({
            ...it,
            itemNumber: `${sIdx + 1}.${iIdx + 1}`,
          })),
        };
      });
    });
  };

  const handleAddNewItemToStage = (stageId: string) => {
    setStages((prev) =>
      prev.map((stg) => {
        if (stg.id !== stageId) return stg;
        const nextNum = `${stg.stageCode.split(".")[0]}.${stg.items.length + 1}`;
        const newItem: DescritivoItem = {
          id: `it-manual-${Date.now()}`,
          itemNumber: nextNum,
          description: "Execução de serviços especializados conforme determinação da fiscalização.",
        };
        return {
          ...stg,
          items: [...stg.items, newItem],
        };
      })
    );
  };

  const handleAddNewStage = () => {
    const nextCode = `${stages.length + 1}.0`;
    const newStage: DescritivoStage = {
      id: `stg-manual-${Date.now()}`,
      stageCode: nextCode,
      title: "NOVA ETAPA CONSTRUTIVA",
      items: [
        {
          id: `it-manual-${Date.now()}-1`,
          itemNumber: `${stages.length + 1}.1`,
          description: "Descrever detalhadamente a especificação técnica do serviço...",
        },
      ],
    };
    setStages([...stages, newStage]);
  };

  const handleCopyFormattedText = () => {
    let fullText = `MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS\n`;
    fullText += `OBRA: ${metadata.schoolName} (${metadata.projectName})\n`;
    fullText += `LOCAL: ${metadata.city} | ${metadata.gre}\n`;
    fullText += `OBJETO: ${metadata.objectDescription}\n\n`;

    stages.forEach((stg) => {
      fullText += `\n${stg.stageCode} — ${stg.title}\n`;
      stg.items.forEach((it) => {
        fullText += `${it.itemNumber} ${it.description}\n`;
      });
    });

    navigator.clipboard.writeText(fullText);
    showToast("Texto completo do Memorial copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. CABEÇALHO DO PROJETO E METADADOS */}
      <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#0B0F19] p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2436] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F97316] flex items-center justify-center text-black font-bold shadow-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Memorial Descritivo & Caderno de Encargos
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  IA Engenharia Sênior
                </span>
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Gere descritivos técnicos de obras por voz ou texto e exporte em PDF Oficial e Word
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="px-3.5 py-1.5 rounded-xl border border-[#26304A] bg-[#111622] text-[#D4AF37] hover:border-[#D4AF37] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              {geminiApiKey ? "API Gemini Ativa" : "Configurar Gemini API"}
            </button>
            <button
              onClick={() => generateMemorialPDF(metadata, stages)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" /> Baixar PDF Oficial
            </button>
            <button
              onClick={() => generateMemorialWordDoc(metadata, stages)}
              className="px-3.5 py-2 rounded-xl bg-[#141A28] border border-[#26304A] text-gray-200 hover:text-white hover:border-[#D4AF37] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-blue-400" /> Baixar Word (.DOC)
            </button>
          </div>
        </div>

        {/* Grade de Informações da Obra (Editáveis) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-[#9CA3AF] block mb-1 font-mono uppercase">
              Escola / Unidade:
            </label>
            <input
              type="text"
              value={metadata.schoolName}
              onChange={(e) => setMetadata({ ...metadata, schoolName: e.target.value })}
              className="w-full bg-[#111622] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#9CA3AF] block mb-1 font-mono uppercase">
              Município / Local:
            </label>
            <input
              type="text"
              value={metadata.city}
              onChange={(e) => setMetadata({ ...metadata, city: e.target.value })}
              className="w-full bg-[#111622] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#9CA3AF] block mb-1 font-mono uppercase">
              GRE / Órgão:
            </label>
            <input
              type="text"
              value={metadata.gre}
              onChange={(e) => setMetadata({ ...metadata, gre: e.target.value })}
              className="w-full bg-[#111622] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#9CA3AF] block mb-1 font-mono uppercase">
              Engenheiro / CREA:
            </label>
            <input
              type="text"
              value={metadata.engineerName}
              onChange={(e) => setMetadata({ ...metadata, engineerName: e.target.value })}
              className="w-full bg-[#111622] border border-[#26304A] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL SPLIT: CHAT IA (ESQUERDA) + EDITOR DO MEMORIAL (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: CHAT COM IA SÊNIOR */}
        <div className="lg:col-span-5 rounded-2xl border border-[#1E2436] bg-[#07090E] p-4 flex flex-col h-[700px] shadow-2xl">
          {/* Cabeçalho do Chat */}
          <div className="flex items-center justify-between border-b border-[#1E2436] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Engenheiro Sênior IA</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Pronto para estruturar demandas
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#9CA3AF] bg-[#111622] px-2 py-0.5 rounded border border-[#1E2436]">
              {geminiApiKey ? "Gemini 1.5 Flash" : "Motor Local Sênior"}
            </span>
          </div>

          {/* Sugestões Rápidas de Comandos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {[
              "Fazer nova calçada e recuperar danificadas",
              "Revisão no telhado e troca de telhas",
              "Pintura geral interna de todas as salas",
              "Instalar nova caixa d'água e barrilete",
              "Revisão elétrica e iluminação LED",
            ].map((sug, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSendMessage(sug)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#111622] border border-[#26304A] hover:border-[#D4AF37] text-[10px] text-gray-300 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                + {sug}
              </button>
            ))}
          </div>

          {/* Área de Mensagens do Chat */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3.5 shadow-md ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black font-semibold rounded-br-xs"
                      : "bg-[#111622] border border-[#1E2436] text-gray-200 rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] font-mono text-[#6B7280] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {isProcessingAI && (
              <div className="flex items-center gap-2 text-xs text-[#D4AF37] animate-pulse p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Estruturando especificações técnicas com vocabulário de engenharia...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Entrada de Texto e Botão de Microfone de Voz */}
          <div className="pt-3 border-t border-[#1E2436] space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVoiceRecording}
                title={isListeningAudio ? "Parar gravação" : "Falar por áudio"}
                className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isListeningAudio
                    ? "bg-red-500 border-red-400 text-white animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "bg-[#111622] border-[#26304A] text-[#D4AF37] hover:border-[#D4AF37]"
                }`}
              >
                {isListeningAudio ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isListeningAudio
                      ? "Escutando sua voz... fale os serviços..."
                      : "Digite ou fale os serviços (ex: trocar telhas, pintar paredes...)"
                  }
                  className="w-full bg-[#111622] border border-[#26304A] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isProcessingAI}
                className="p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[#9CA3AF] text-center">
              Fale livremente pelo microfone ou digite. A IA categoriza as disciplinas e formata as especificações.
            </p>
          </div>
        </div>

        {/* COLUNA DIREITA: DOCUMENTO & EDITOR ESTRUTURADO DO MEMORIAL */}
        <div className="lg:col-span-7 rounded-2xl border border-[#D4AF37]/40 bg-[#0B0F19] p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2436] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Estrutura do Memorial Descritivo ({stages.length} Etapas)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFormattedText}
                className="px-2.5 py-1 rounded-lg border border-[#26304A] bg-[#111622] hover:border-[#D4AF37] text-gray-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Texto
              </button>
              <button
                onClick={handleAddNewStage}
                className="px-3 py-1 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Etapa
              </button>
            </div>
          </div>

          {/* Lista de Etapas e Itens */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="rounded-xl border border-[#1E2436] bg-[#111622] p-4 space-y-3 hover:border-[#D4AF37]/50 transition-all"
              >
                {/* Título da Etapa */}
                <div className="flex items-center justify-between gap-2 border-b border-[#1E2436]/80 pb-2.5">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-mono font-bold text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded border border-[#F97316]/30">
                      {stage.stageCode}
                    </span>
                    <input
                      type="text"
                      value={stage.title}
                      onChange={(e) => handleUpdateStageTitle(stage.id, e.target.value)}
                      className="w-full bg-transparent border-none text-xs font-bold text-white uppercase focus:outline-none focus:bg-[#07090E] px-2 py-1 rounded"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleAddNewItemToStage(stage.id)}
                      title="Adicionar novo item nesta etapa"
                      className="p-1.5 rounded-lg bg-[#141A28] border border-[#26304A] hover:border-[#D4AF37] text-[#D4AF37] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStage(stage.id)}
                      title="Excluir etapa inteira"
                      className="p-1.5 rounded-lg bg-[#141A28] border border-[#26304A] hover:border-red-500 text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Itens Técnicos da Etapa */}
                <div className="space-y-2 pl-2">
                  {stage.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-start gap-2.5 bg-[#07090E] p-2.5 rounded-lg border border-[#1E2436] hover:border-[#26304A] group"
                    >
                      <span className="text-[11px] font-mono font-bold text-[#D4AF37] mt-0.5 shrink-0">
                        {it.itemNumber}
                      </span>
                      <textarea
                        rows={2}
                        value={it.description}
                        onChange={(e) =>
                          handleUpdateItemDescription(stage.id, it.id, e.target.value)
                        }
                        className="w-full bg-transparent border-none text-xs text-gray-300 leading-relaxed focus:outline-none focus:text-white resize-y"
                      />
                      <button
                        onClick={() => handleDeleteItem(stage.id, it.id)}
                        title="Remover este item"
                        className="opacity-40 group-hover:opacity-100 hover:text-red-400 p-1 text-gray-500 transition-opacity cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de Ações Inferior */}
          <div className="pt-3 border-t border-[#1E2436] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#9CA3AF]">
              Total de itens especificados:{" "}
              <strong className="text-white font-mono">
                {stages.reduce((acc, s) => acc + s.items.length, 0)} itens
              </strong>
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => generateMemorialWordDoc(metadata, stages)}
                className="px-4 py-2 rounded-xl bg-[#141A28] border border-[#26304A] text-gray-200 hover:border-[#D4AF37] text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-blue-400" /> Baixar Word (.DOC)
              </button>
              <button
                onClick={() => generateMemorialPDF(metadata, stages)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black font-bold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Baixar PDF Oficial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA CONFIGURAR API KEY DO GEMINI */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-[#D4AF37]/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-[#1E2436] pb-3">
              <Key className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-sm font-bold text-white">Configurar Chave da API do Google Gemini</h3>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              O sistema já conta com um <strong>Motor Heurístico Sênior Local</strong> que funciona sem chave. Caso queira utilizar a IA generativa avançada do Google Gemini (1.5 Flash / 2.0 Flash) para redações ainda mais profundas, insira sua chave gratuita abaixo:
            </p>
            <div>
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-mono uppercase">
                Chave da API do Gemini (AI Studio):
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#111622] border border-[#26304A] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#26304A] text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveApiKey(geminiApiKey)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F97316] text-black font-bold text-xs cursor-pointer"
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
