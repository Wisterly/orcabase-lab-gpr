// ============================================================================
// MEMORIAL DESCRITIVO INTELIGENTE — SUPER MOTOR DE IA DE INFRAESTRUTURA ESCOLAR
// Implementação do SUPER PROMPT oficial para elaboração de Memoriais Descritivos
// com padronização técnica, prioridade de ELÉTRICA e saída pronta para Excel.
// ============================================================================

import jsPDF from "jspdf";

export interface DescritivoItem {
  id: string;
  itemNumber: string; // Ex: "1.1" ou apenas identificador interno
  description: string; // Redação técnica padronizada iniciando com "Executar" ou "Fornecer e instalar"
  observations?: string;
}

export interface DescritivoStage {
  id: string;
  stageCode: string; // Código de ordenação interna
  title: string; // Ex: "FORROS", "PINTURA GERAL", "ELÉTRICA" (Sem numeração, SEMPRE em CAIXA ALTA)
  items: DescritivoItem[];
}

export interface MemorialMetadata {
  projectName: string;
  schoolName: string;
  city: string;
  gre: string;
  organization: string;
  objectDescription: string;
  engineerName: string;
  creaNumber: string;
  dateStr: string;
  propertyId?: string;
  uf?: string;
  areaM2?: string;
  perimeterM?: string;
  datumSystem?: string;
  purpose?: string;
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
// SUPER PROMPT MESTRE — DIRETRIZES DA ENGENHARIA DE INFRAESTRUTURA ESCOLAR
// ----------------------------------------------------------------------------
export const SUPER_PROMPT_MEMORIAL = `
# SUPER PROMPT — ASSISTENTE INTELIGENTE PARA ELABORAÇÃO DE MEMORIAIS DESCRITIVOS DE SERVIÇOS DE INFRAESTRUTURA ESCOLAR

## 1. IDENTIDADE E FUNÇÃO DO ASSISTENTE
Você é um assistente especializado em interpretação de demandas, organização de serviços de engenharia, manutenção, reforma e adequação de unidades escolares, com foco na elaboração de memoriais descritivos para orçamentos de obras e serviços de infraestrutura escolar.
Sua função é transformar uma descrição informal em um texto técnico, claro, objetivo, coerente e adequado para utilização em orçamentos de obras escolares.
PRIORIDADE: CLAREZA + OBJETIVIDADE + PADRONIZAÇÃO.

## 2. PADRÃO OBRIGATÓRIO DE FORMATAÇÃO (REGRAS ABSOLUTAS)
1. TÍTULOS DOS GRUPOS/ITENS:
   - Estar SEMPRE em CAIXA ALTA (Ex: FORROS, PINTURA GERAL, BANHEIROS, COZINHA, ELÉTRICA, COBERTURA, ESQUADRIAS E FERRAGENS, LABORATÓRIO DE INFORMÁTICA, ÁREAS EXTERNAS, ESTACIONAMENTO, AUDITÓRIO, DORMITÓRIOS, LIMPEZA PÓS-OBRA, SERVIÇOS GERAIS).
   - NÃO possuir numeração inicial (NUNCA usar "1. FORROS", "1.0 PINTURA GERAL", "ITEM 01 - BANHEIROS").
   - Apresentar somente o nome do ambiente, serviço ou especialidade. Curtos e objetivos.

2. REGRA ESPECIAL E OBRIGATÓRIA PARA ELÉTRICA (PRIORIDADE MÁXIMA):
   - O título do grupo DEVE ser EXATAMENTE: ELÉTRICA.
   - NUNCA utilizar "INSTALAÇÕES ELÉTRICAS", "ILUMINAÇÃO", "SISTEMA ELÉTRICO" ou variações.
   - TODOS os serviços elétricos (incluindo iluminação, luminárias, luminárias slim, tomadas, interruptores, quadros de distribuição, disjuntores, chuveiros elétricos, alimentação de bombas) DEVEM ser agrupados no item ELÉTRICA, mesmo que relacionados a ambientes diferentes.
   - Quando o usuário especificar que luminárias slim serão instaladas em ambientes com forro novo, preserve essa informação exata na redação dentro de ELÉTRICA.

3. DESCRIÇÃO DOS SERVIÇOS:
   - Cada serviço DEVE ser apresentado em uma linha independente.
   - NÃO utilizar marcadores, bolinhas, traços (-) ou numeração de serviços no início da linha.
   - NÃO inserir linhas em branco entre os serviços do mesmo grupo.
   - O objetivo é permitir que o usuário copie o conteúdo diretamente para células do Excel, mantendo cada serviço em uma linha.

4. PADRÃO DE REDAÇÃO DOS SERVIÇOS:
   - Inicie a descrição preferencialmente com "Executar...".
   - Quando o serviço envolver aquisição e instalação de materiais/equipamentos, utilize "Fornecer e instalar...".
   - Não inventar especificações não fornecidas pelo usuário (não inventar dimensões, espessuras, marcas, modelos, capacidades como 10.000L).
   - Sem procedimento executivo excessivamente longo. Redação objetiva e técnica.

5. TRATAMENTO DE ALTERAÇÕES E COMPLEMENTAÇÕES (REGRA ABSOLUTA):
   - TODA ALTERAÇÃO OU COMPLEMENTAÇÃO DEVE GERAR A REAPRESENTAÇÃO DO DESCRITIVO COMPLETO E ATUALIZADO.
   - Nunca responda somente com o trecho alterado. Preserve todo o histórico acumulado do orçamento atual.

6. PADRÃO DE SAÍDA:
   - A resposta deve apresentar DIRETAMENTE o descritivo no formato:
### NOME DO GRUPO EM CAIXA ALTA
Executar descrição técnica do primeiro serviço na linha.
Executar descrição técnica do segundo serviço na linha.

### OUTRO GRUPO
Executar descrição do serviço...

- NÃO colocar introduções ("Segue abaixo o memorial...", "Conforme solicitado...").
- No final da sua resposta, inclua OBRIGATORIAMENTE um bloco JSON delimitado por \`\`\`json contendo a lista estruturada das etapas e itens:
\`\`\`json
{
  "stages": [
    {
      "title": "FORROS",
      "items": [
        { "description": "Executar instalação de forro em todas as salas de aula da unidade escolar." }
      ]
    },
    {
      "title": "ELÉTRICA",
      "items": [
        { "description": "Executar revisão geral das instalações elétricas da unidade escolar, incluindo tomadas, interruptores e iluminação, com reparo ou substituição dos componentes danificados." },
        { "description": "Executar instalação de luminárias do tipo slim nos novos ambientes que receberão forro." }
      ]
    }
  ]
}
\`\`\`
`;

// ----------------------------------------------------------------------------
// Ontologia da Engenharia de Infraestrutura Escolar (Classificação Local)
// ----------------------------------------------------------------------------
interface KnowledgeDiscipline {
  keywords: string[];
  stageTitle: string;
  defaultItemsGenerator: (input: string) => string[];
}

export const CIVIL_ONTOLOGY: KnowledgeDiscipline[] = [
  {
    keywords: ["forro", "pvc", "gesso", "desplacamento", "forros"],
    stageTitle: "FORROS",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Executar instalação de forro em todas as salas de aula da unidade escolar.");
      if (text.includes("troca") || text.includes("substitu") || text.includes("danific") || text.includes("caído")) {
        items.push("Executar substituição dos trechos de forro danificados ou comprometidos por novos forros.");
      }
      if (text.includes("revis") || text.includes("fixa")) {
        items.push("Executar revisão e fixação dos forros existentes nos demais ambientes.");
      }
      return items;
    },
  },
  {
    keywords: ["pintura", "pintar", "tinta", "parede", "sala", "muro", "fachada", "látex", "acrílica", "selador"],
    stageTitle: "PINTURA GERAL",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Executar pintura geral da unidade escolar, contemplando as áreas internas e externas, incluindo paredes, muro e fachada.");
      if (text.includes("esquadria") || text.includes("grade") || text.includes("portão") || text.includes("porta")) {
        items.push("Executar pintura em esmalte sintético sobre esquadrias metálicas e portas de madeira.");
      }
      return items;
    },
  },
  {
    keywords: ["vaso", "torneira", "tubo", "hidráulica", "hidraulica", "esgoto", "sanitário", "banheiro", "desentup", "desobstru"],
    stageTitle: "BANHEIROS",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Executar revisão geral das instalações hidrossanitárias dos banheiros da unidade escolar.");
      if (text.includes("torneira") || text.includes("troca") || text.includes("vazamento")) {
        items.push("Executar substituição das torneiras danificadas, com adequação dos pontos hidráulicos.");
      }
      if (text.includes("vaso") || text.includes("desentup") || text.includes("desobstru")) {
        items.push("Executar desobstrução e revisão das bacias sanitárias dos banheiros.");
      }
      return items;
    },
  },
  {
    keywords: ["gás", "gas", "exaustor", "cozinha", "bancada", "refeitório", "refeitorio", "fogão"],
    stageTitle: "COZINHA",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      if (text.includes("gás") || text.includes("gas") || text.includes("abrigo")) {
        items.push("Executar construção de casa de gás na área externa da cozinha, incluindo adequação do espaço para acomodação dos recipientes.");
      }
      if (text.includes("exaust") || text.includes("coifa") || text.includes("ventila")) {
        items.push("Executar instalação de exaustores na cozinha, incluindo as adequações necessárias ao funcionamento.");
      }
      if (text.includes("bancada") || text.includes("pia") || text.includes("revest")) {
        items.push("Executar adequações nas bancadas e pias da cozinha, com aplicação de revestimento cerâmico lavável.");
      }
      if (items.length === 0) {
        items.push("Executar adequações físicas gerais na cozinha da unidade escolar.");
      }
      return items;
    },
  },
  {
    keywords: [
      "elétrica", "eletrica", "luz", "lâmpada", "lampada", "led", "fio", "cabo",
      "tomada", "interruptor", "disjuntor", "quadro", "qdc", "slim", "iluminação",
      "iluminacao", "luminária", "luminaria", "chuveiro"
    ],
    stageTitle: "ELÉTRICA",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Executar revisão geral das instalações elétricas da unidade escolar, incluindo tomadas, interruptores e iluminação, com reparo ou substituição dos componentes danificados.");
      if (text.includes("slim") || text.includes("forro") || text.includes("luminár") || text.includes("luminar") || text.includes("painel")) {
        items.push("Executar instalação de luminárias do tipo slim nos novos ambientes que receberão forro.");
      }
      if (text.includes("quadro") || text.includes("disjuntor") || text.includes("proteção") || text.includes("qdc")) {
        items.push("Executar adequação dos quadros de distribuição de circuitos, com instalação de proteções adequadas e balanceamento de cargas.");
      }
      if (text.includes("chuveiro") || text.includes("banho")) {
        items.push("Executar adequação de circuito elétrico e instalação elétrica para chuveiros.");
      }
      return items;
    },
  },
  {
    keywords: ["telhado", "cobertura", "telha", "goteira", "infiltra", "ripa", "caibro", "terça", "madeira", "calha", "rufo", "retelhamento"],
    stageTitle: "COBERTURA",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Executar retelhamento da unidade escolar, com substituição das telhas quebradas e correção dos pontos de infiltração e goteiras.");
      if (text.includes("madeira") || text.includes("estrutura") || text.includes("terça") || text.includes("caibro")) {
        items.push("Executar revisão da estrutura da cobertura, com recuperação dos trechos comprometidos.");
      }
      if (text.includes("calha") || text.includes("rufo") || text.includes("pluvial")) {
        items.push("Executar revisão e substituição de calhas e rufos metálicos com bocal de descida.");
      }
      return items;
    },
  },
  {
    keywords: ["porta", "janela", "vidro", "fechadura", "esquadria", "grade", "trinco", "ferragens", "dobradiça"],
    stageTitle: "ESQUADRIAS E FERRAGENS",
    defaultItemsGenerator: () => [
      "Executar revisão das portas e esquadrias de toda a unidade escolar, incluindo trincos e fechaduras, com reparo ou substituição dos componentes danificados.",
      "Executar substituição de vidros quebrados ou danificados nas janelas das salas de aula.",
    ],
  },
  {
    keywords: ["informática", "informatica", "computador", "laboratório", "laboratorio", "rede", "lógica", "logica"],
    stageTitle: "LABORATÓRIO DE INFORMÁTICA",
    defaultItemsGenerator: () => [
      "Executar adaptação de sala de aula para implantação de laboratório de informática.",
      "Executar construção e instalação de bancadas, incluindo revestimento das superfícies.",
      "Executar instalação de cabeamento de lógica e pontos de rede para atendimento aos equipamentos do laboratório.",
    ],
  },
  {
    keywords: ["calçada", "calcada", "acesso", "rampa", "drenagem", "sarjeta", "canaleta", "passagem", "externa"],
    stageTitle: "ÁREAS EXTERNAS",
    defaultItemsGenerator: (text) => {
      const items: string[] = [];
      items.push("Executar recuperação e construção de novas calçadas de proteção perimetral na unidade escolar.");
      if (text.includes("drenag") || text.includes("sarjeta") || text.includes("canaleta") || text.includes("grade")) {
        items.push("Executar construção de sistema de drenagem pluvial com instalação de grade metálica para proteção e passagem de pedestres.");
      }
      return items;
    },
  },
  {
    keywords: ["estacionamento", "moto", "carro", "veículo", "veiculo", "brita", "garagem"],
    stageTitle: "ESTACIONAMENTO",
    defaultItemsGenerator: () => [
      "Executar adequação do estacionamento com nivelamento, regularização e aplicação de colchão de brita.",
      "Executar revisão e pintura da estrutura e portões de acesso do estacionamento.",
    ],
  },
  {
    keywords: ["auditório", "auditorio", "palco"],
    stageTitle: "AUDITÓRIO",
    defaultItemsGenerator: () => [
      "Executar adequações no auditório, incluindo rampas de acesso e revisão das esquadrias.",
    ],
  },
  {
    keywords: ["dormitório", "dormitorio", "alojamento", "rede", "armador"],
    stageTitle: "DORMITÓRIOS",
    defaultItemsGenerator: () => [
      "Executar instalação de armadores de rede reforçados nas paredes dos dormitórios.",
      "Executar revisão geral hidrossanitária dos banheiros dos dormitórios.",
    ],
  },
  {
    keywords: ["limpeza", "entulho", "bota-fora", "resíduo", "residuos", "pós-obra", "pos-obra"],
    stageTitle: "LIMPEZA PÓS-OBRA",
    defaultItemsGenerator: () => [
      "Executar limpeza geral da obra, incluindo remoção e retirada de todo o entulho gerado pelos serviços.",
    ],
  },
  {
    keywords: ["geral", "diversos", "serviços gerais"],
    stageTitle: "SERVIÇOS GERAIS",
    defaultItemsGenerator: () => [
      "Executar serviços gerais de manutenção predial conforme alinhamento com a fiscalização.",
    ],
  },
];

// ----------------------------------------------------------------------------
// Processador de IA Local (Engenharia Civil de Infraestrutura Escolar)
// ----------------------------------------------------------------------------
export function generateLocalSeniorDescription(
  userInput: string,
  existingStages: DescritivoStage[] = []
): DescritivoStage[] {
  const normalized = userInput.toLowerCase();
  const stagesMap = new Map<string, DescritivoStage>();

  // 1. Carrega as etapas existentes preservando o contexto do orçamento atual
  existingStages.forEach((stg) => {
    stagesMap.set(stg.title.toUpperCase(), {
      id: stg.id,
      stageCode: stg.stageCode,
      title: stg.title.toUpperCase(),
      items: [...stg.items],
    });
  });

  // 2. Trata comandos explícitos de remoção
  if (normalized.includes("tire") || normalized.includes("remova") || normalized.includes("exclua")) {
    if (normalized.includes("elétrica") || normalized.includes("eletrica")) stagesMap.delete("ELÉTRICA");
    if (normalized.includes("pintura")) stagesMap.delete("PINTURA GERAL");
    if (normalized.includes("forro")) stagesMap.delete("FORROS");
    if (normalized.includes("cobertura") || normalized.includes("telhado")) stagesMap.delete("COBERTURA");
    if (normalized.includes("banheiro")) stagesMap.delete("BANHEIROS");
    if (normalized.includes("cozinha")) stagesMap.delete("COZINHA");
  }

  // 3. Identifica as disciplinas demandadas
  CIVIL_ONTOLOGY.forEach((discipline) => {
    const hasMatch = discipline.keywords.some((kw) => normalized.includes(kw));
    if (hasMatch) {
      const generatedItems = discipline.defaultItemsGenerator(normalized);
      const stageTitle = discipline.stageTitle.toUpperCase();

      if (stagesMap.has(stageTitle)) {
        // Se já existe, adiciona novos itens evitando repetições exatas
        const existing = stagesMap.get(stageTitle)!;
        generatedItems.forEach((newItemText) => {
          const isDuplicate = existing.items.some((it) => it.description.toLowerCase().trim() === newItemText.toLowerCase().trim());
          if (!isDuplicate) {
            existing.items.push({
              id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              itemNumber: `${existing.items.length + 1}`,
              description: newItemText,
            });
          }
        });
      } else {
        // Cria nova etapa sem numeração no título
        stagesMap.set(stageTitle, {
          id: `stg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          stageCode: `${stagesMap.size + 1}`,
          title: stageTitle,
          items: generatedItems.map((text, idx) => ({
            id: `it-${Date.now()}-${idx}`,
            itemNumber: `${idx + 1}`,
            description: text,
          })),
        });
      }
    }
  });

  // Se nenhum serviço específico for detectado, adiciona ao menos SERVIÇOS GERAIS
  if (stagesMap.size === 0) {
    stagesMap.set("SERVIÇOS GERAIS", {
      id: `stg-default-${Date.now()}`,
      stageCode: "1",
      title: "SERVIÇOS GERAIS",
      items: [
        {
          id: `it-def-1`,
          itemNumber: "1",
          description: "Executar serviços especializados de manutenção e adequação predial na unidade escolar.",
        },
      ],
    });
  }

  return Array.from(stagesMap.values());
}

// ----------------------------------------------------------------------------
// Formata as etapas em texto limpo para visualização direta e cópia no Excel
// ----------------------------------------------------------------------------
export function formatStagesToSpreadsheetText(stages: DescritivoStage[]): string {
  const blocks: string[] = [];
  stages.forEach((stg) => {
    const lines: string[] = [`### ${stg.title.toUpperCase()}`];
    stg.items.forEach((it) => {
      // Cada serviço em uma linha, sem marcadores, sem bolinhas e sem traços
      lines.push(it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim());
    });
    blocks.push(lines.join("\n"));
  });
  return blocks.join("\n\n");
}

// ----------------------------------------------------------------------------
// Chamada ao Google Gemini API (Orientada pelo SUPER PROMPT)
// ----------------------------------------------------------------------------
export async function queryGeminiSeniorEngineer(
  userInput: string,
  apiKey: string,
  metadata: MemorialMetadata,
  currentStages: DescritivoStage[] = []
): Promise<{ textResponse: string; stages: DescritivoStage[] }> {
  const contextMessage = `
DADOS DO PROJETO ATUAL:
- Unidade Escolar / Imóvel: ${metadata.propertyId || metadata.schoolName || metadata.projectName}
- Município: ${metadata.city} / ${metadata.uf || "PI"}
- Órgão: ${metadata.organization || "Secretaria da Educação / GPR"}
- Finalidade: ${metadata.purpose || metadata.objectDescription}

ESTADO ATUAL DO MEMORIAL (Contexto Acumulado):
${formatStagesToSpreadsheetText(currentStages) || "Nenhum serviço registrado anteriormente."}

NOVA DEMANDA DO USUÁRIO (Texto / Áudio):
"${userInput}"

INSTRUÇÃO:
Analise a nova demanda, incorpore ou altere os serviços no memorial existente e apresente o DESCRITIVO COMPLETO E ATUALIZADO no padrão obrigatório (títulos em CAIXA ALTA sem numeração, ELÉTRICA como título único para serviços elétricos/iluminação, cada serviço em uma linha iniciando com Executar/Fornecer e instalar, sem marcadores ou bolinhas, e o bloco JSON estruturado no final).
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
            parts: [{ text: `${SUPER_PROMPT_MEMORIAL}\n\n${contextMessage}` }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 3000,
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
            stageCode: `${sIdx + 1}`,
            title: String(stg.title || "").toUpperCase().replace(/^\d+[\.\s\-]+/, ""),
            items: (stg.items || []).map((it: any, iIdx: number) => ({
              id: `gemini-it-${Date.now()}-${sIdx}-${iIdx}`,
              itemNumber: `${iIdx + 1}`,
              description: String(it.description || "").replace(/^[\s•\-\*\d\.]+\s*/, "").trim(),
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

    // Limpa a resposta retirando o bloco JSON para manter a saída limpa
    const cleanChatText = rawText.replace(/```json[\s\S]*?```/g, "").trim() || formatStagesToSpreadsheetText(parsedStages);

    return {
      textResponse: cleanChatText,
      stages: parsedStages,
    };
  } catch (err) {
    console.warn("Erro ao consultar Gemini, acionando Motor Local Sênior:", err);
    const localStages = generateLocalSeniorDescription(userInput, currentStages);
    return {
      textResponse: formatStagesToSpreadsheetText(localStages),
      stages: localStages,
    };
  }
}

// ============================================================================
// GERAÇÃO DE PDF OFICIAL DO MEMORIAL DESCRITIVO (Layout A4 Executivo)
// ============================================================================
export function buildMemorialPDFDoc(metadata: MemorialMetadata, stages: DescritivoStage[]): jsPDF {
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
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.line(margin, margin - 5, pageWidth - margin, margin - 5);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, margin - 3, pageWidth - margin, margin - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Memorial Descritivo — ${metadata.propertyId || metadata.schoolName || metadata.projectName} | Página ${doc.getCurrentPageInfo().pageNumber}`,
      margin,
      pageHeight - 10
    );
    doc.text("OrçaBase.lab — GPR Engenharia", pageWidth - margin - 40, pageHeight - 10);
  };

  // 1. CABEÇALHO INSTITUCIONAL
  drawPageBorderAndHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text((metadata.organization || "GOVERNO DO ESTADO — SECRETARIA DA EDUCAÇÃO").toUpperCase(), pageWidth / 2, currentY, { align: "center" });
  currentY += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(249, 115, 22);
  doc.text(`${(metadata.gre || "GPR").toUpperCase()} — DEPARTAMENTO DE ENGENHARIA E INFRAESTRUTURA ESCOLAR`, pageWidth / 2, currentY, { align: "center" });
  currentY += 8;

  // Caixa Título Principal
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, printableWidth, 12, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(212, 175, 55);
  doc.text("MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS", pageWidth / 2, currentY + 7.5, { align: "center" });
  currentY += 16;

  // 2. QUADRO RESUMO DE IDENTIFICAÇÃO DO IMÓVEL / UNIDADE ESCOLAR
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  const quadroHeight = (metadata.areaM2 || metadata.datumSystem) ? 35 : 28;
  doc.roundedRect(margin, currentY, printableWidth, quadroHeight, 1, 1, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);

  const col1X = margin + 4;
  const col2X = margin + 95;
  let qY = currentY + 5;

  doc.setFont("helvetica", "bold");
  doc.text("UNIDADE ESCOLAR / IMÓVEL:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.propertyId || metadata.schoolName || "-", col1X + 46, qY);

  doc.setFont("helvetica", "bold");
  doc.text("MUNICÍPIO / UF:", col2X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(`${metadata.city || "-"}${metadata.uf ? ` - ${metadata.uf}` : ""}`, col2X + 26, qY);

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("FINALIDADE / OBJETO:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.purpose || metadata.objectDescription || "-", col1X + 46, qY);

  doc.setFont("helvetica", "bold");
  doc.text("DATA DE EMISSÃO:", col2X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.dateStr || new Date().toLocaleDateString("pt-BR"), col2X + 26, qY);

  if (metadata.areaM2 || metadata.perimeterM || metadata.datumSystem) {
    qY += 5.5;
    doc.setFont("helvetica", "bold");
    doc.text("ÁREA TOTAL / PERÍMETRO:", col1X, qY);
    doc.setFont("helvetica", "normal");
    doc.text(`${metadata.areaM2 ? `${metadata.areaM2} m²` : "-"}  |  Perímetro: ${metadata.perimeterM ? `${metadata.perimeterM} m` : "-"}`, col1X + 46, qY);

    doc.setFont("helvetica", "bold");
    doc.text("SISTEMA REF. / DATUM:", col2X, qY);
    doc.setFont("helvetica", "normal");
    doc.text(metadata.datumSystem || "SIRGAS2000", col2X + 38, qY);
  }

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("RESPONSÁVEL TÉCNICO:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(`${metadata.engineerName || "Engenheiro Civil"} (${metadata.creaNumber || "CREA/CAU"})`, col1X + 46, qY);

  currentY += quadroHeight + 6;

  // 3. INTRODUÇÃO
  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("DISPOSIÇÕES GERAIS E NORMAS APLICÁVEIS", margin, currentY);
  currentY += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  const introText =
    "O presente Memorial Descritivo tem por finalidade fixar as diretrizes técnicas, métodos executivos e padrões de qualidade exigidos para a execução dos serviços de engenharia e adequação da infraestrutura escolar, em estrita observância às normas da ABNT e especificações do órgão contratante.";
  const splitIntro = doc.splitTextToSize(introText, printableWidth);
  doc.text(splitIntro, margin, currentY);
  currentY += splitIntro.length * 4 + 6;

  // 4. ETAPAS E ITENS TÉCNICOS (Sem numeração no título, cada serviço em uma linha)
  stages.forEach((stage) => {
    checkPageBreak(25);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.rect(margin, currentY, printableWidth, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    // Título em CAIXA ALTA sem numeração inicial
    doc.text(stage.title.toUpperCase(), margin + 3, currentY + 5);
    currentY += 10;

    stage.items.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);

      const cleanDesc = item.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim();
      const splitItem = doc.splitTextToSize(cleanDesc, printableWidth - 4);

      checkPageBreak(splitItem.length * 4 + 4);

      doc.text(splitItem, margin + 2, currentY);
      currentY += splitItem.length * 4 + 3;
    });

    currentY += 2;
  });

  // 5. RECEBIMENTO E CONCLUSÃO
  checkPageBreak(40);
  currentY += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("RECEBIMENTO E CONCLUSÃO DOS SERVIÇOS", margin, currentY);
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

  return doc;
}

export function generateMemorialPDF(metadata: MemorialMetadata, stages: DescritivoStage[]): void {
  const doc = buildMemorialPDFDoc(metadata, stages);
  const safeFilename = `Memorial_Descritivo_${(metadata.propertyId || metadata.schoolName || metadata.projectName || "Obra").replace(/[\/\\:\*\?\"<>\|]/g, "_").trim()}.pdf`;
  doc.save(safeFilename);
}

export function getMemorialPDFBlobUrl(metadata: MemorialMetadata, stages: DescritivoStage[]): string {
  const doc = buildMemorialPDFDoc(metadata, stages);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

// ============================================================================
// EXPORTAÇÃO PARA MICROSOFT WORD (.DOC FORMATADO)
// ============================================================================
export function generateMemorialWordDoc(metadata: MemorialMetadata, stages: DescritivoStage[]): void {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Memorial Descritivo — ${metadata.propertyId || metadata.schoolName || metadata.projectName}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #1e293b; }
        h1 { font-size: 14pt; color: #0f172a; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 4px; }
        h2 { font-size: 12pt; color: #0f172a; background-color: #f1f5f9; padding: 6px; border-left: 4px solid #f97316; margin-top: 18px; text-transform: uppercase; }
        p.service-line { margin: 4px 0; font-size: 11pt; color: #334155; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        td { padding: 4px 8px; border: 1px solid #cbd5e1; font-size: 10pt; }
        .label { font-weight: bold; background: #f8fafc; width: 30%; }
      </style>
    </head>
    <body>
      <h1>MEMORIAL DESCRITIVO E ESPECIFICAÇÕES TÉCNICAS</h1>
      <table>
        <tr>
          <td class="label">UNIDADE / IMÓVEL:</td>
          <td>${metadata.propertyId || metadata.schoolName || "-"}</td>
        </tr>
        <tr>
          <td class="label">MUNICÍPIO / UF:</td>
          <td>${metadata.city || "-"} / ${metadata.uf || "PI"}</td>
        </tr>
        <tr>
          <td class="label">FINALIDADE / OBJETO:</td>
          <td>${metadata.purpose || metadata.objectDescription || "-"}</td>
        </tr>
        <tr>
          <td class="label">DATA:</td>
          <td>${metadata.dateStr || new Date().toLocaleDateString("pt-BR")}</td>
        </tr>
      </table>

      ${stages
        .map(
          (stg) => `
        <h2>${stg.title.toUpperCase()}</h2>
        ${stg.items.map((it) => `<p class="service-line">${it.description.replace(/^[\s•\-\*\d\.]+\s*/, "").trim()}</p>`).join("")}
      `
        )
        .join("")}

      <br/><br/>
      <table style="border: none; margin-top: 30px;">
        <tr style="border: none;">
          <td style="border: none; text-align: center; width: 50%;">
            __________________________________________<br/>
            <strong>${metadata.engineerName || "Engenheiro Responsável Técnico"}</strong><br/>
            ${metadata.creaNumber || "CREA/CAU"}
          </td>
          <td style="border: none; text-align: center; width: 50%;">
            __________________________________________<br/>
            <strong>Fiscal de Obras</strong><br/>
            ${metadata.organization || "SEDUC / GPR"}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const safeFilename = `Memorial_Descritivo_${(metadata.propertyId || metadata.schoolName || metadata.projectName || "Obra").replace(/[\/\\:\*\?\"<>\|]/g, "_").trim()}.doc`;

  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
