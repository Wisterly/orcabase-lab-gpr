// ============================================================================
// MEMORIAL DESCRITIVO INTELIGENTE — MOTOR DE IA DE ENGENHARIA CIVIL SÊNIOR
// Processamento de linguagem natural (texto e voz), estruturação técnica ABNT/SINAPI
// e geração de Memorial Descritivo oficial em PDF e Word (.doc).
// ============================================================================

import jsPDF from "jspdf";

export interface DescritivoItem {
  id: string;
  itemNumber: string; // Ex: "1.1", "1.2"
  description: string; // Redação técnica concisa
  observations?: string;
}

export interface DescritivoStage {
  id: string;
  stageCode: string; // Ex: "1.0", "2.0"
  title: string; // Ex: "COBERTURA E ESTRUTURA DE TELHADO"
  items: DescritivoItem[];
}

export interface MemorialMetadata {
  projectName: string; // Ex: "12ª GRE - CETI DEP. FRANCISCO ANTONIO PAES LANDIM NETO"
  schoolName: string; // Ex: "CETI FADE III"
  city: string; // Ex: "São João do Piauí - PI"
  gre: string; // Ex: "12ª GRE"
  organization: string; // Ex: "Secretaria de Estado da Educação - SEDUC / GPR"
  objectDescription: string; // Ex: "Reforma, Manutenção Predial e Adequação Geral"
  engineerName: string; // Ex: "Eng. Responsável Técnico"
  creaNumber: string; // Ex: "CREA-PI nº 12345/D"
  dateStr: string; // Ex: "08/11/2026"
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  audioBlobUrl?: string;
  generatedStages?: DescritivoStage[];
}

// ----------------------------------------------------------------------------
// Ontologia da Engenharia Civil para Reconhecimento e Redação Técnica Local
// ----------------------------------------------------------------------------
interface KnowledgeDiscipline {
  keywords: string[];
  stageTitle: string;
  defaultItemsGenerator: (input: string) => string[];
}

const CIVIL_ONTOLOGY: KnowledgeDiscipline[] = [
  {
    keywords: ["calçada", "calcada", "passeio", "acesso", "piso externo", "rampa", "acessibilidade", "concreto desempenado"],
    stageTitle: "PAVIMENTAÇÃO, CALÇADAS E ACESSIBILIDADE",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Execução de nova calçada perimetral de proteção em concreto simples desempenado e sarrafeado, fck ≥ 20 MPa, espessura e=7cm, sobre lastro de brita compactado.");
      if (text.includes("recupera") || text.includes("danific") || text.includes("rachad") || text.includes("fissur") || text.includes("conserto")) {
        items.push("Demolição e recuperação pontual de trechos de calçadas existentes fissuradas ou desniveladas, visando garantir a estanqueidade junto aos alicerces do edifício.");
      }
      if (text.includes("rampa") || text.includes("acessib") || text.includes("tátil")) {
        items.push("Adequação de rampas de acessibilidade conforme NBR 9050, com instalação de piso tátil direcional e de alerta em placas pré-moldadas.");
      }
      return items;
    },
  },
  {
    keywords: ["telhado", "cobertura", "telha", "goteira", "infiltra", "ripa", "caibro", "terça", "madeira", "calha", "rufo", "retelhamento"],
    stageTitle: "COBERTURA, ESTRUTURA E RETELHAMENTO",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Revisão minuciosa em toda a estrutura de cobertura existente, incluindo alinhamento, reaperto de tirantes e substituição de peças de madeira danificadas (terças, caibros e ripas) por cupins ou umidade.");
      items.push("Execução de retelhamento geral com substituição de telhas cerâmicas/fibrocimento quebradas ou trincadas, com vedação estanque para eliminação total de goteiras e infiltrações.");
      if (text.includes("calha") || text.includes("rufo") || text.includes("pluvia") || text.includes("infiltra")) {
        items.push("Instalação e recuperação de rufos e calhas em chapa galvanizada nº 24 com caimento adequado e bocais de descida interligados à rede pluvial.");
      }
      return items;
    },
  },
  {
    keywords: ["pintura", "pintar", "tinta", "parede", "sala", "muro", "fachada", "látex", "acrílica", "selador", "massa"],
    stageTitle: "PINTURA E ACABAMENTOS DE PAREDES E TETO",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Lixamento, raspagem de partes soltas, aplicação de fundo selador acrílico e emassamento pontual para correção de imperfeições nas paredes internas e externas.");
      items.push("Aplicação de pintura em tinta látex acrílica fosca premium de alta durabilidade, lavável, em duas a três demãos sobre paredes internas de salas de aula e circulações.");
      if (text.includes("fachada") || text.includes("extern") || text.includes("muro")) {
        items.push("Pintura em tinta acrílica emborrachada impermeabilizante para fachadas e muros externos, resistente a intempéries e raios UV.");
      }
      if (text.includes("porta") || text.includes("grade") || text.includes("portão") || text.includes("ferro")) {
        items.push("Aplicação de pintura em esmalte sintético acetinado sobre esquadrias metálicas e portas de madeira, precedido de fundo anticorrosivo zarcão.");
      }
      return items;
    },
  },
  {
    keywords: ["caixa", "água", "agua", "reservatório", "reservatorio", "tubo", "bomba", "hidráulica", "hidraulica", "esgoto", "torneira", "sanitário", "banheiro"],
    stageTitle: "INSTALAÇÕES HIDROSSANITÁRIAS E RESERVAÇÃO",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      if (text.includes("caixa") || text.includes("reservat")) {
        items.push("Fornecimento e instalação de novo reservatório d'água cilíndrico em polietileno com tampa de encaixe rápido, capacidade nominal adequada, sobre base de apoio nivelada.");
        items.push("Reestruturação completa do barrilete de distribuição, ramais de extravasor (ladrão) e limpeza em tubos de PVC soldável com registros de gaveta brutos.");
      }
      if (text.includes("banheiro") || text.includes("sanit") || text.includes("torneira") || text.includes("esgoto")) {
        items.push("Revisão de instalações sanitárias com desobstrução e substituição de sifões, torneiras de pressão temporizadas antivandalismo e reparos em válvulas de descarga.");
      }
      return items;
    },
  },
  {
    keywords: ["elétrica", "eletrica", "luz", "lâmpada", "lampada", "led", "fio", "cabo", "tomada", "interruptor", "disjuntor", "quadro"],
    stageTitle: "INSTALAÇÕES ELÉTRICAS E ILUMINAÇÃO",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Revisão e readequação do Quadro de Distribuição de Circuitos (QDC), com identificação de barramentos, balanceamento de fases e instalação de disjuntores termomagnéticos padrão DIN com proteção DR.");
      items.push("Substituição de luminárias fluorescentes antigas por painéis/luminárias de LED de alta eficiência energética (sobrepor/embutir) e substituição de interruptores e tomadas 2P+T padrão NBR 14136.");
      return items;
    },
  },
  {
    keywords: ["porta", "janela", "vidro", "fechadura", "esquadria", "grade", "basculante", "compensado"],
    stageTitle: "ESQUADRIAS DE MADEIRA E METÁLICAS",
    defaultItemsGenerator: () => {
      return [
        "Revisão de esquadrias com substituição de portas em madeira compensada lisa semi-oca, incluindo jogos de aduelas, alizares e ferragens completas (dobradiças de aço e fechadura de embutir cilíndrica com maçaneta tipo alavanca).",
        "Recuperação de janelas metálicas e básculas, com lubrificação de eixos articulados e substituição de vidros lisos transparentes ou canelados quebrados e colocação de baguetes.",
      ];
    },
  },
  {
    keywords: ["piso", "cerâmica", "ceramica", "revestimento", "azulejo", "rejunte", "porcelanato"],
    stageTitle: "PISOS E REVESTIMENTOS CERÂMICOS",
    defaultItemsGenerator: () => {
      return [
        "Execução de contrapiso regularizado em argamassa traço 1:3, com espessura média e=3cm sobre base limpa e despolvilhada.",
        "Assentamento de piso cerâmico esmaltado de tráfego intenso (PEI 5) com argamassa colante AC-II e rejuntamento cimentício resinado antifúngico.",
      ];
    },
  },
  {
    keywords: ["limpeza", "entulho", "bota-fora", "placa", "demolição", "demolicao", "final"],
    stageTitle: "SERVIÇOS PRELIMINARES E LIMPEZA FINAL",
    defaultItemsGenerator: () => {
      return [
        "Fornecimento e instalação de placa de identificação da obra em chapa de aço galvanizado estruturada em madeira, conforme padrão institucional.",
        "Remoção contínua de entulhos decorrentes das intervenções com bota-fora em aterro sanitário ou área de descarte licenciada pelo município.",
        "Limpeza geral e fina de toda a área interna e externa após a conclusão das obras, entregando a edificação em plenas condições higiênicas de uso.",
      ];
    },
  },
];

// ----------------------------------------------------------------------------
// Processador de IA Local (Engenharia Civil Sênior)
// ----------------------------------------------------------------------------
export function generateLocalSeniorDescription(userInput: string, existingStages: DescritivoStage[] = []): DescritivoStage[] {
  const normalized = userInput.toLowerCase();
  const stages: DescritivoStage[] = [];

  // Sempre inicia com Serviços Preliminares se não existir
  let stageCounter = existingStages.length + 1;
  const hasPrelim = existingStages.some((s) => s.title.includes("PRELIMINAR"));

  if (!hasPrelim && (normalized.includes("placa") || normalized.includes("limpeza") || normalized.includes("início") || existingStages.length === 0)) {
    stages.push({
      id: `stg-${Date.now()}-0`,
      stageCode: `${stageCounter}.0`,
      title: "SERVIÇOS PRELIMINARES E MOBILIZAÇÃO",
      items: [
        {
          id: `it-${Date.now()}-0-1`,
          itemNumber: `${stageCounter}.1`,
          description: "Mobilização de equipe técnica, ferramentas e equipamentos de proteção individual (EPI) necessários para a execução dos serviços em conformidade com as normas regulamentadoras (NR-18 e NR-35).",
        },
        {
          id: `it-${Date.now()}-0-2`,
          itemNumber: `${stageCounter}.2`,
          description: "Fornecimento e afixação de placa de obra indicativa em chapa galvanizada e estrutura de madeira conforme padronização do órgão contratante.",
        },
      ],
    });
    stageCounter++;
  }

  // Percorre as disciplinas da ontologia civil
  CIVIL_ONTOLOGY.forEach((discipline) => {
    const matched = discipline.keywords.some((k) => normalized.includes(k));
    if (matched) {
      // Verifica se já existe um stage com título similar
      const alreadyExists = existingStages.some((s) => s.title.toUpperCase().includes(discipline.stageTitle.split(" ")[0]));
      if (!alreadyExists) {
        const itemTexts = discipline.defaultItemsGenerator(normalized);
        const stageItems: DescritivoItem[] = itemTexts.map((text, idx) => ({
          id: `it-${Date.now()}-${stageCounter}-${idx + 1}`,
          itemNumber: `${stageCounter}.${idx + 1}`,
          description: text,
        }));

        stages.push({
          id: `stg-${Date.now()}-${stageCounter}`,
          stageCode: `${stageCounter}.0`,
          title: discipline.stageTitle,
          items: stageItems,
        });
        stageCounter++;
      }
    }
  });

  // Se nenhuma disciplina bateu com as palavras-chave, gera uma especificação customizada inteligente
  if (stages.length === 0) {
    stages.push({
      id: `stg-${Date.now()}-${stageCounter}`,
      stageCode: `${stageCounter}.0`,
      title: "SERVIÇOS DE MANUTENÇÃO E RECUPERAÇÃO GERAL",
      items: [
        {
          id: `it-${Date.now()}-${stageCounter}-1`,
          itemNumber: `${stageCounter}.1`,
          description: `Execução de intervenções civis especializadas conforme demanda informada: "${userInput.trim()}". Os serviços serão realizados com materiais de primeira qualidade e mão de obra qualificada.`,
        },
        {
          id: `it-${Date.now()}-${stageCounter}-2`,
          itemNumber: `${stageCounter}.2`,
          description: "Inspeção e liberação técnica pelo engenheiro fiscal antes do fechamento das etapas construtivas.",
        },
      ],
    });
    stageCounter++;
  }

  // Adiciona a etapa final de Limpeza Final se for obra nova e não tiver
  const hasCleaning = existingStages.some((s) => s.title.includes("LIMPEZA FINAL"));
  if (!hasCleaning && stages.length > 0) {
    stages.push({
      id: `stg-${Date.now()}-${stageCounter}`,
      stageCode: `${stageCounter}.0`,
      title: "SERVIÇOS COMPLEMENTARES E LIMPEZA FINAL",
      items: [
        {
          id: `it-${Date.now()}-${stageCounter}-1`,
          itemNumber: `${stageCounter}.1`,
          description: "Remoção e transporte de todos os resíduos sólidos e entulhos gerados durante a execução dos serviços para bota-fora autorizado.",
        },
        {
          id: `it-${Date.now()}-${stageCounter}-2`,
          itemNumber: `${stageCounter}.2`,
          description: "Limpeza geral minuciosa de vidros, pisos, louças e áreas externas, entregando o imóvel completamente desimpedido e pronto para uso.",
        },
      ],
    });
  }

  return stages;
}

// ----------------------------------------------------------------------------
// Chamada ao Google Gemini API (Quando o usuário fornecer chave ou via servidor)
// ----------------------------------------------------------------------------
export async function queryGeminiSeniorEngineer(
  userInput: string,
  apiKey: string,
  metadata: MemorialMetadata,
  currentStages: DescritivoStage[] = []
): Promise<{ textResponse: string; stages: DescritivoStage[] }> {
  const systemPrompt = `
Você é o Engenheiro Civil Sênior Coordenador de Obras Públicas e Manutenção Predial Escolar do Estado.
Sua missão é ouvir a demanda informada pelo orçamentista/fiscal (que muitas vezes é dita em linguagem coloquial ou gravação de voz) e redigir o MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS oficial.

DIRETRIZES TÉCNICAS E DE REDAÇÃO:
1. Redija como um Engenheiro Sênior: linguagem técnica, concisa, formal, executiva e direta (verbos no infinitivo como "Executar", "Fornecer e instalar", "Proceder à revisão", "Substituir").
2. Organize em TÍTULOS GERAIS (ex: 1.0 SERVIÇOS PRELIMINARES, 2.0 COBERTURA E TELHADO, 3.0 PAVIMENTAÇÃO E CALÇADAS, 4.0 INSTALAÇÕES HIDROSSANITÁRIAS, 5.0 PINTURA GERAL, 6.0 LIMPEZA FINAL).
3. Cada etapa deve conter ITENS numerados sequencialmente (ex: 1.1, 1.2, 2.1, 2.2...).
4. Não utilize textos longos e cansativos. O texto deve ser objetivo e descrever com precisão técnica o que deve ser feito e os padrões de materiais (ex: cimento, fck, espessura, tipo de tinta, telha).
5. O retorno DEVE conter um resumo explicativo para o chat E OBRIGATORIAMENTE um bloco JSON delimitado por \`\`\`json contendo a lista estruturada das etapas e itens no formato:
{
  "stages": [
    {
      "stageCode": "1.0",
      "title": "NOME DA ETAPA EM MAIÚSCULAS",
      "items": [
        {
          "itemNumber": "1.1",
          "description": "Texto técnico objetivo do item..."
        }
      ]
    }
  ]
}
`;

  const contextMessage = `
DADOS DO PROJETO ATUAL:
- Escola / Unidade: ${metadata.schoolName} (${metadata.projectName})
- Município / Local: ${metadata.city}
- Órgão: ${metadata.organization} (${metadata.gre})
- Objeto: ${metadata.objectDescription}

DEMANDA DO USUÁRIO (Voz/Texto):
"${userInput}"

Etapas já existentes no memorial: ${currentStages.map((s) => `${s.stageCode} ${s.title} (${s.items.length} itens)`).join(", ") || "Nenhuma, criar a partir do zero."}

Por favor, elabore ou incremente o Memorial Descritivo Técnico com base nessa solicitação.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${contextMessage}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extrai o JSON estruturado do texto gerado
    let parsedStages: DescritivoStage[] = [];
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*"stages"[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.stages)) {
          parsedStages = parsed.stages.map((stg: any, sIdx: number) => ({
            id: `gemini-stg-${Date.now()}-${sIdx}`,
            stageCode: stg.stageCode || `${sIdx + 1}.0`,
            title: String(stg.title || "").toUpperCase(),
            items: (stg.items || []).map((it: any, iIdx: number) => ({
              id: `gemini-it-${Date.now()}-${sIdx}-${iIdx}`,
              itemNumber: it.itemNumber || `${sIdx + 1}.${iIdx + 1}`,
              description: String(it.description || ""),
            })),
          }));
        }
      } catch (err) {
        console.warn("Falha ao fazer parse do JSON do Gemini, usando extrator de fallback:", err);
      }
    }

    if (parsedStages.length === 0) {
      parsedStages = generateLocalSeniorDescription(userInput, currentStages);
    }

    // Limpa a resposta em texto retirando o bloco JSON para ficar agradável no balão do chat
    const cleanChatText = rawText.replace(/```json[\s\S]*?```/g, "").trim() || "Memorial Descritivo estruturado com sucesso!";

    return {
      textResponse: cleanChatText,
      stages: parsedStages,
    };
  } catch (err) {
    console.warn("Erro ao consultar Gemini, acionando Motor Local Sênior:", err);
    const localStages = generateLocalSeniorDescription(userInput, currentStages);
    return {
      textResponse: `Estruturei as especificações técnicas da sua demanda com base na engenharia civil institucional:\n\nForam geradas ${localStages.length} etapas técnicas prontas para compor o Memorial Descritivo.`,
      stages: localStages,
    };
  }
}

// ============================================================================
// GERAÇÃO DE PDF OFICIAL DO MEMORIAL DESCRITIVO (Layout A4 Executivo)
// ============================================================================
export function generateMemorialPDF(metadata: MemorialMetadata, stages: DescritivoStage[]): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const printableWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin;
      drawPageBorderAndHeader();
    }
  };

  const drawPageBorderAndHeader = () => {
    // Linha superior elegante
    doc.setDrawColor(212, 175, 55); // Ouro Metálico
    doc.setLineWidth(0.8);
    doc.line(margin, margin - 5, pageWidth - margin, margin - 5);

    // Linha fina cinza
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, margin - 3, pageWidth - margin, margin - 3);

    // Rodapé de Numeração de Página
    const totalPages = doc.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Memorial Descritivo — ${metadata.schoolName || metadata.projectName} | Página ${doc.getCurrentPageInfo().pageNumber}`,
      margin,
      pageHeight - 10
    );
    doc.text("OrçaBase.lab — GPR Engenharia", pageWidth - margin - 40, pageHeight - 10);
  };

  // 1. CABEÇALHO INSTITUCIONAL
  drawPageBorderAndHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Navy Dark
  doc.text(metadata.organization.toUpperCase(), pageWidth / 2, currentY, { align: "center" });
  currentY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22); // Orange Accent
  doc.text(`${metadata.gre.toUpperCase()} — DEPARTAMENTO DE INFRAESTRUTURA`, pageWidth / 2, currentY, { align: "center" });
  currentY += 8;

  // Caixa Título Principal
  doc.setFillColor(15, 23, 42); // Navy
  doc.roundedRect(margin, currentY, printableWidth, 12, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(212, 175, 55); // Gold
  doc.text("MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS", pageWidth / 2, currentY + 7.5, { align: "center" });
  currentY += 16;

  // 2. QUADRO RESUMO DE IDENTIFICAÇÃO DA OBRA
  doc.setFillColor(248, 250, 252); // Cinza bem claro
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, printableWidth, 28, 1, 1, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);

  const col1X = margin + 4;
  const col2X = margin + 95;
  let qY = currentY + 5;

  doc.setFont("helvetica", "bold");
  doc.text("UNIDADE / ESCOLA:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.schoolName || "-", col1X + 32, qY);

  doc.setFont("helvetica", "bold");
  doc.text("MUNICÍPIO / UF:", col2X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.city || "-", col2X + 26, qY);

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("PROJETO / ATA:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.projectName || "-", col1X + 32, qY);

  doc.setFont("helvetica", "bold");
  doc.text("DATA DE EMISSÃO:", col2X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.dateStr || new Date().toLocaleDateString("pt-BR"), col2X + 26, qY);

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("OBJETO DA INTERVENÇÃO:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.objectDescription || "Manutenção Predial e Adequação Geral", col1X + 42, qY);

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("RESPONSÁVEL TÉCNICO:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(`${metadata.engineerName || "Engenheiro Civil"} (${metadata.creaNumber || "CREA/CAU"})`, col1X + 42, qY);

  currentY += 34;

  // 3. INTRODUÇÃO NORMATIVA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1.0 CONSIDERAÇÕES PRELIMINARES E NORMAS APLICÁVEIS", margin, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  const introText =
    "O presente Memorial Descritivo tem por finalidade fixar as condições técnicas e construtivas para a execução dos serviços de reforma, reparos e adequações na edificação escolar supracitada. Todas as intervenções deverão obedecer rigorosamente às normas técnicas da ABNT pertinentes, às recomendações dos fabricantes dos materiais empregados e às determinações da Fiscalização.";
  const splitIntro = doc.splitTextToSize(introText, printableWidth);
  doc.text(splitIntro, margin, currentY);
  currentY += splitIntro.length * 4.2 + 6;

  // 4. DISCRIMINAÇÃO TÉCNICA DAS ETAPAS E ITENS
  stages.forEach((stage, sIdx) => {
    checkPageBreak(25);

    // Faixa da Etapa / Título
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.rect(margin, currentY, printableWidth, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${stage.stageCode} — ${stage.title}`, margin + 3, currentY + 5);
    currentY += 10;

    // Itens da Etapa
    stage.items.forEach((item) => {
      const itemHeader = `${item.itemNumber} `;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(249, 115, 22);

      const headerWidth = doc.getTextWidth(itemHeader);
      const textWidth = printableWidth - headerWidth - 2;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const splitItem = doc.splitTextToSize(item.description, textWidth);

      checkPageBreak(splitItem.length * 4 + 4);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(itemHeader, margin + 2, currentY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(splitItem, margin + 2 + headerWidth, currentY);

      currentY += splitItem.length * 4 + 3.5;
    });

    currentY += 3;
  });

  // 5. RECEBIMENTO DOS SERVIÇOS & ASSINATURA
  checkPageBreak(40);
  currentY += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("RECEBIMENTO E CONCLUSÃO", margin, currentY);
  currentY += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const finishText =
    "Os serviços serão recebidos mediante vistoria da equipe de engenharia fiscal, mediante constatação da completa conformidade com as presentes especificações técnicas, testes funcionais e limpeza final de todas as áreas afetadas.";
  const splitFinish = doc.splitTextToSize(finishText, printableWidth);
  doc.text(splitFinish, margin, currentY);
  currentY += splitFinish.length * 3.8 + 15;

  // Linhas para Assinatura
  checkPageBreak(25);
  const signColWidth = (printableWidth - 10) / 2;

  // Assinatura 1
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.4);
  doc.line(margin + 5, currentY, margin + 5 + signColWidth, currentY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(metadata.engineerName || "Engenheiro Responsável Técnico", margin + 5 + signColWidth / 2, currentY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(metadata.creaNumber || "CREA/CAU", margin + 5 + signColWidth / 2, currentY + 7.5, { align: "center" });

  // Assinatura 2
  const sign2X = margin + signColWidth + 10;
  doc.line(sign2X + 5, currentY, sign2X + 5 + signColWidth, currentY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text("Fiscal de Obras / Órgão Contratante", sign2X + 5 + signColWidth / 2, currentY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(metadata.organization || "SEDUC / GPR", sign2X + 5 + signColWidth / 2, currentY + 7.5, { align: "center" });

  // Salva o arquivo PDF
  const safeFilename = `Memorial_Descritivo_${(metadata.schoolName || metadata.projectName || "Obra").replace(/[\/\\:\*\?\"<>\|]/g, "_").trim()}.pdf`;
  doc.save(safeFilename);
}

// ============================================================================
// EXPORTAÇÃO PARA MICROSOFT WORD (.DOC FORMATADO)
// ============================================================================
export function generateMemorialWordDoc(metadata: MemorialMetadata, stages: DescritivoStage[]): void {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Memorial Descritivo — ${metadata.schoolName || metadata.projectName}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #1e293b; }
        h1 { font-size: 14pt; color: #0f172a; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 4px; }
        h2 { font-size: 12pt; color: #0f172a; background-color: #f1f5f9; padding: 6px; border-left: 4px solid #f97316; margin-top: 18px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
        .meta-table td { border: 1px solid #cbd5e1; padding: 6px 10px; }
        .meta-label { font-weight: bold; background-color: #f8fafc; width: 25%; }
        .item-row { margin-bottom: 8px; text-align: justify; }
        .item-num { font-weight: bold; color: #0f172a; margin-right: 6px; }
        .sign-table { width: 100%; margin-top: 40px; text-align: center; }
        .sign-table td { width: 50%; padding-top: 30px; font-size: 10pt; }
        .sign-line { border-top: 1px solid #334155; width: 80%; margin: 0 auto; }
      </style>
    </head>
    <body>
      <h1>${metadata.organization.toUpperCase()}</h1>
      <p style="text-align: center; font-weight: bold; color: #f97316; margin-top: -6px;">${metadata.gre.toUpperCase()}</p>
      <h1 style="color: #0f172a; border-bottom: 2px solid #d4af37; font-size: 13pt;">MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS</h1>

      <table class="meta-table">
        <tr>
          <td class="meta-label">UNIDADE / ESCOLA:</td>
          <td>${metadata.schoolName || "-"}</td>
          <td class="meta-label">MUNICÍPIO / UF:</td>
          <td>${metadata.city || "-"}</td>
        </tr>
        <tr>
          <td class="meta-label">PROJETO / ATA:</td>
          <td>${metadata.projectName || "-"}</td>
          <td class="meta-label">DATA:</td>
          <td>${metadata.dateStr || new Date().toLocaleDateString("pt-BR")}</td>
        </tr>
        <tr>
          <td class="meta-label">OBJETO:</td>
          <td colspan="3">${metadata.objectDescription || "Manutenção Predial e Adequação Geral"}</td>
        </tr>
        <tr>
          <td class="meta-label">RESP. TÉCNICO:</td>
          <td colspan="3">${metadata.engineerName || "Engenheiro Civil"} — ${metadata.creaNumber || "CREA/CAU"}</td>
        </tr>
      </table>

      <h3>1.0 CONSIDERAÇÕES PRELIMINARES</h3>
      <p style="text-align: justify;">O presente Memorial Descritivo tem por finalidade fixar as condições técnicas e construtivas para a execução dos serviços de reforma, reparos e adequações na edificação escolar supracitada. Todas as intervenções deverão obedecer rigorosamente às normas técnicas da ABNT pertinentes, às recomendações dos fabricantes dos materiais empregados e às determinações da Fiscalização.</p>

      ${stages
        .map(
          (stage) => `
        <h2>${stage.stageCode} — ${stage.title}</h2>
        ${stage.items
          .map(
            (it) => `
          <div class="item-row">
            <span class="item-num">${it.itemNumber}</span>
            <span>${it.description}</span>
          </div>
        `
          )
          .join("")}
      `
        )
        .join("")}

      <table class="sign-table">
        <tr>
          <td>
            <div class="sign-line"></div>
            <strong>${metadata.engineerName || "Engenheiro Responsável Técnico"}</strong><br/>
            <span>${metadata.creaNumber || "CREA/CAU"}</span>
          </td>
          <td>
            <div class="sign-line"></div>
            <strong>Fiscal de Obras</strong><br/>
            <span>${metadata.organization}</span>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", content], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Memorial_Descritivo_${(metadata.schoolName || metadata.projectName || "Obra").replace(/[\/\\:\*\?\"<>\|]/g, "_").trim()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
