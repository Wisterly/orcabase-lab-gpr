// ============================================================================
// MEMORIAL DESCRITIVO INTELIGENTE — SUPER MOTOR DE IA DE INFRAESTRUTURA ESCOLAR
// Implementação do SUPER PROMPT oficial para elaboração de Memoriais Descritivos
// com padronização técnica, prioridade de ELÉTRICA e saída pronta para Excel.
// ============================================================================

import jsPDF from "jspdf";
import { SEDUC_PI_HEADER_LOGO_BASE64 } from "./seducHeaderLogo";

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

export interface AutomaticDates {
  mesAnoRef: string; // Ex: "Novembro de 2026"
  dataExtensa: string; // Ex: "Domingo, 8 de novembro de 2026"
  diaSemana: string; // Ex: "Domingo"
  dia: string; // Ex: "8" ou "1º"
  mesNome: string; // Ex: "Novembro"
  ano: number; // Ex: 2026
  dataNumerica: string; // Ex: "08/11/2026"
}

// ----------------------------------------------------------------------------
// Geração Automática Inteligente de Datas (Mês/Ano e Data Extensa com Dia da Semana)
// ----------------------------------------------------------------------------
export function getAutomaticDates(customDate: Date = new Date()): AutomaticDates {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const diasSemana = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
  ];
  const ano = customDate.getFullYear();
  const mesIndex = customDate.getMonth();
  const mesNome = meses[mesIndex];
  const diaSemana = diasSemana[customDate.getDay()];
  const diaNum = customDate.getDate();
  const diaFormatado = diaNum === 1 ? "1º" : `${diaNum}`;

  const mesAnoRef = `${mesNome} de ${ano}`;
  const dataExtensa = `${diaSemana}, ${diaFormatado} de ${mesNome.toLowerCase()} de ${ano}`;
  const dataNumerica = customDate.toLocaleDateString("pt-BR");

  return {
    mesAnoRef,
    dataExtensa,
    diaSemana,
    dia: diaFormatado,
    mesNome,
    ano,
    dataNumerica,
  };
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
  bdiPercent?: string; // BDI da Obra (%) Ex: "24,50%"
  mesAnoRef?: string; // Mês e ano de referência atualizado automaticamente Ex: "Novembro de 2026"
  dataExtensa?: string; // Data completa com dia da semana atualizada automaticamente Ex: "Domingo, 8 de novembro de 2026"
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
// SYSTEM PROMPT OFICIAL: ASSISTENTE TÉCNICO DE MEMORIAL DESCRITIVO (PADRÃO RESUMIDO E OBJETIVO SEDUC-PI)
// ----------------------------------------------------------------------------
export const SUPER_PROMPT_MEMORIAL = `# SYSTEM PROMPT: ASSISTENTE TÉCNICO DE MEMORIAL DESCRITIVO (PADRÃO RESUMIDO E OBJETIVO SEDUC-PI)

## 1. DIRETRIZ PRINCIPAL E ESTILO DE RESPOSTA
Você é um Engenheiro Civil Orçamentista da SEDUC-PI. Sua função é transformar solicitações informais de manutenção e reforma escolar em um Memorial Descritivo **RESUMIDO, DIRETO, GENÉRICO E OBJETIVO**, sem excesso de detalhes técnicos, sem especificar marcas, dimensões milimétricas, fck ou listas extensas de insumos.

## 2. REGRA DE OURO DO TAMANHO E DO RESUMO (MUITO IMPORTANTE)
- **Títulos Curtos e Genéricos (em CAIXA ALTA e SEM numeração):**
  Use títulos curtos, simples e padronizados de apenas uma ou duas palavras, como:
  \`COBERTURA\`, \`BANHEIROS\`, \`CALÇADAS\`, \`PISOS E REVESTIMENTOS\`, \`PINTURA\`, \`FORROS\`, \`ELÉTRICA\`, \`INSTALAÇÕES HIDRÁULICAS\`, \`MURO\`, \`ESQUADRIAS\`, \`COZINHA\`, \`ESTRUTURA\`.
  *(Nunca use títulos longos como "1. SERVIÇOS DE COBERTURA E ESTRUTURA DO PÁTIO" ou "2. INSTALAÇÕES HIDROSSANITÁRIAS E REPOSIÇÃO DE LOUÇAS").*
- **Quantidade de Subitens por Categoria (Apenas 1 a 3 linhas enxutas por título):**
  Para cada categoria solicitada, gere normalmente **2 subitens resumidos** (ou de 1 a 3 subitens no máximo, conforme o que foi pedido):
  1. Uma linha principal descrevendo de forma direta o serviço solicitado.
  2. Uma linha complementar englobando de forma genérica e resumida os reparos de base, estrutura de sustentação ou adequação de pontos necessários.
- **Proibição de Detalhamento Excessivo:**
  - NÃO invente especificações excessivas que não foram pedidas (ex: não cite "parafusos autoatarraxantes com neoprene", "chapa galvanizada com poliuretano", "fck 20 MPa com espessura de 7 cm", "parafusos de latão", "anel de vedação com guia").
  - Mantenha a redação limpa, abrangente e genérica, iniciando preferencialmente com o verbo **\`Executar\`** (ou \`Fornecer e instalar\` quando estritamente necessário).
  - Não adicione etapas extras não solicitadas (como "SERVIÇOS DE PÓS-OBRA E LIMPEZA FINAL"), a menos que o usuário peça limpeza expressamente.

## 3. REGRAS DE FORMATAÇÃO
- **Títulos:** Apenas o nome da disciplina em CAIXA ALTA (sem números antes do título, sem dois-pontos).
- **Subitens:**
  - Sem marcadores, hífens, bolinhas ou numeração (\`1.1\`, \`-\`, \`•\`).
  - Cada subitem em uma única frase curta e direta, iniciando com letra maiúscula (\`Executar ...\`) e terminando com ponto final.

## 4. EXEMPLOS DO PADRÃO EXATO ESPERADO (APRENDA ESTE ESTILO RESUMIDO)

### Exemplo 1 (Referência Principal):
**Pedido do usuário:** "Recuperar o telhado do pátio e trocar os vasos sanitários por modelos com caixa acoplada"
**Resposta adequada:**
COBERTURA
Executar revisão e recuperação da cobertura do pátio, com substituição das telhas danificadas.
Executar reparos na estrutura de sustentação do telhado, corrigindo os pontos comprometidos.

BANHEIROS
Executar substituição dos vasos sanitários existentes por modelos com caixa acoplada.
Executar adequação dos pontos hidráulicos e de esgoto, quando necessário.

### Exemplo 2 (Outras disciplinas seguindo o mesmo padrão resumido):
**Pedido do usuário:** "Recuperar as calçadas danificadas, consertar o piso das salas e pintar a escola"
**Resposta adequada:**
CALÇADAS
Executar recuperação e recomposição das calçadas danificadas no entorno da unidade escolar.
Executar regularização da base e acabamento desempenado com juntas de dilatação.

PISOS E REVESTIMENTOS
Executar regularização e recomposição do piso nas salas de aula, corrigindo os trechos danificados.

PINTURA
Executar preparação das superfícies, com lixamento e correção de imperfeições pontuais.
Executar pintura geral nas áreas solicitadas da unidade escolar, com acabamento adequado a cada superfície.

Ao final da resposta em texto puro, inclua OBRIGATORIAMENTE o bloco JSON estruturado para sincronização da planilha e do PDF:
\`\`\`json
{
  "stages": [
    {
      "title": "COBERTURA",
      "items": [
        { "description": "Executar revisão e recuperação da cobertura do pátio, com substituição das telhas danificadas." },
        { "description": "Executar reparos na estrutura de sustentação do telhado, corrigindo os pontos comprometidos." }
      ]
    },
    {
      "title": "BANHEIROS",
      "items": [
        { "description": "Executar substituição dos vasos sanitários existentes por modelos com caixa acoplada." },
        { "description": "Executar adequação dos pontos hidráulicos e de esgoto, quando necessário." }
      ]
    }
  ]
}
\`\`\`
`;

// ----------------------------------------------------------------------------
// Motor Semântico Contextual Sênior (Anti-Vício / Raciocínio Personalizado SEDUC-PI)
// Interpreta cláusula por cláusula o pedido real do usuário (incluindo erros de
// digitação como "retalhamento no telha", locais específicos como "do pátio",
// "nos banheiros", e aplica as Automações de Escopo obrigatórias da SEDUC-PI).
// ----------------------------------------------------------------------------

function extractSpecificLocation(clause: string): string {
  const lower = clause.toLowerCase();
  if (lower.includes("pátio") || lower.includes("patio")) return "do pátio";
  if (lower.includes("refeitório") || lower.includes("refeitorio")) return "do refeitório";
  if (lower.includes("quadra")) return "da quadra poliesportiva";
  if (lower.includes("diretoria")) return "da diretoria";
  if (lower.includes("secretaria")) return "da secretaria";
  if (lower.includes("biblioteca")) return "da biblioteca";
  if (lower.includes("corredor") || lower.includes("circulação") || lower.includes("circulacao")) return "dos corredores e áreas de circulação";
  if (lower.includes("sala de aula") || lower.includes("salas de aula")) return "das salas de aula";
  if (lower.includes("auditório") || lower.includes("auditorio")) return "do auditório";
  if (lower.includes("cozinha")) return "da cozinha";
  if (lower.includes("fachada")) return "da fachada";
  if (lower.includes("muro")) return "do muro";
  return "";
}

function normalizeSentenceCase(text: string): string {
  const cleaned = text.replace(/^[\s•\-\*\d\.\)]+\s*/, "").trim();
  if (!cleaned) return "";
  const withDot = cleaned.endsWith(".") ? cleaned : `${cleaned}.`;
  return withDot.charAt(0).toUpperCase() + withDot.slice(1);
}

/**
 * Garante as Regras Técnicas Obrigatórias sem poluir respostas resumidas
 */
export function enforceMandatoryScopeAutomations(
  stages: DescritivoStage[],
  rawUserInput: string
): DescritivoStage[] {
  const fullLower = rawUserInput.toLowerCase();

  return stages.map((stg, idx) => {
    const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    const items = stg.items.map((it, iIdx) => ({
      ...it,
      itemNumber: `${iIdx + 1}`,
      description: normalizeSentenceCase(it.description),
    }));

    const stageTextCombined = `${cleanTitle} ${items.map((i) => i.description).join(" ")}`.toLowerCase();

    // Reservatório / Caixa d'Água (quando solicitado)
    const isReservatorio =
      stageTextCombined.includes("reservatório") ||
      stageTextCombined.includes("reservatorio") ||
      stageTextCombined.includes("caixa d'água") ||
      stageTextCombined.includes("caixa d'agua") ||
      stageTextCombined.includes("caixa dagua") ||
      stageTextCombined.includes("caixa de água") ||
      (cleanTitle.includes("ABASTECIMENTO") && (fullLower.includes("caixa") || fullLower.includes("reservat")));

    if (isReservatorio) {
      const baseItem = "Executar instalação de base pré-moldada para reservatório de água.";
      const caixaItem = "Fornecer e instalar caixa d'água com capacidade mínima de 10.000 L para abastecimento da unidade escolar.";

      if (!items.some((i) => i.description.toLowerCase().includes("base pré-moldada") || i.description.toLowerCase().includes("base pre-moldada"))) {
        items.push({
          id: `auto-res-base-${Date.now()}-${idx}`,
          itemNumber: `${items.length + 1}`,
          description: baseItem,
        });
      }
      if (!items.some((i) => i.description.toLowerCase().includes("10.000 l") || i.description.toLowerCase().includes("10000 l") || i.description.toLowerCase().includes("capacidade mínima de 10.000"))) {
        items.push({
          id: `auto-res-cx-${Date.now()}-${idx}`,
          itemNumber: `${items.length + 1}`,
          description: caixaItem,
        });
      }
    }

    // Teste de estanqueidade apenas se o usuário pedir expressamente ou em revisão geral de poço/rede hidráulica
    const explicitEstanqueidade =
      fullLower.includes("estanqueidade") ||
      fullLower.includes("teste hidráulic") ||
      fullLower.includes("teste hidraulic") ||
      cleanTitle.includes("POÇO");

    if (explicitEstanqueidade) {
      const estanqueidadeText = "Executar teste de estanqueidade e funcionamento das instalações hidráulicas.";
      const existingIdx = items.findIndex((i) =>
        i.description.toLowerCase().includes("teste de estanqueidade")
      );
      if (existingIdx === -1) {
        items.push({
          id: `auto-hid-est-${Date.now()}-${idx}`,
          itemNumber: `${items.length + 1}`,
          description: estanqueidadeText,
        });
      } else if (existingIdx !== items.length - 1) {
        const [removed] = items.splice(existingIdx, 1);
        items.push(removed);
      }
    }

    return {
      ...stg,
      stageCode: `${idx + 1}`,
      title: cleanTitle,
      items,
    };
  });
}

export function isRemoveOrAlterCommand(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return /\b(remova|remover|tire|tirar|exclua|excluir|retire|retirar|apague|apagar|delete|altere|alterar|mude|mudar|corrija|corrigir|substitua o título|substitua o item)\b/i.test(
    lower
  );
}

/**
 * Mescla acumulativamente as etapas anteriores com as novas etapas geradas pela IA
 * quando o usuário apenas digita novos serviços (sem pedir remoção ou alteração),
 * garantindo que o memorial NUNCA seja zerado sem clicar no botão "Novo Memorial".
 */
export function mergeAccumulatedStages(
  currentStages: DescritivoStage[],
  aiStages: DescritivoStage[],
  userInput: string
): DescritivoStage[] {
  if (!currentStages || currentStages.length === 0) {
    return aiStages;
  }

  // Se o usuário pediu explicitamente para remover ou alterar, respeita a lista editada pela IA
  if (isRemoveOrAlterCommand(userInput)) {
    return aiStages;
  }

  const mergedMap = new Map<string, DescritivoStage>();

  // 1. Mantém todas as etapas que já estavam sendo trabalhadas no memorial
  currentStages.forEach((stg) => {
    const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    mergedMap.set(cleanTitle, {
      id: stg.id,
      stageCode: stg.stageCode,
      title: cleanTitle,
      items: [...stg.items],
    });
  });

  // 2. Adiciona/mescla os novos títulos e serviços retornados pela IA
  aiStages.forEach((stg) => {
    const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    if (!cleanTitle) return;

    if (!mergedMap.has(cleanTitle)) {
      mergedMap.set(cleanTitle, {
        id: stg.id || `stg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stageCode: `${mergedMap.size + 1}`,
        title: cleanTitle,
        items: [...stg.items],
      });
    } else {
      const existing = mergedMap.get(cleanTitle)!;
      stg.items.forEach((newIt) => {
        const normNew = normalizeSentenceCase(newIt.description);
        const alreadyExists = existing.items.some(
          (oldIt) => oldIt.description.toLowerCase().trim() === normNew.toLowerCase().trim()
        );
        if (!alreadyExists && normNew) {
          existing.items.push({
            id: newIt.id || `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            itemNumber: `${existing.items.length + 1}`,
            description: normNew,
          });
        }
      });
    }
  });

  return Array.from(mergedMap.values()).map((stg, idx) => ({
    ...stg,
    stageCode: `${idx + 1}`,
    items: stg.items.map((it, iIdx) => ({
      ...it,
      itemNumber: `${iIdx + 1}`,
    })),
  }));
}

// ----------------------------------------------------------------------------
// Processador Semântico Contextual Local (Padrão Resumido, Genérico e Objetivo SEDUC-PI)
// ----------------------------------------------------------------------------
export function generateLocalSeniorDescription(
  userInput: string,
  existingStages: DescritivoStage[] = []
): DescritivoStage[] {
  const normalized = userInput.toLowerCase().trim();
  const stagesMap = new Map<string, DescritivoStage>();

  // 1. Mantém SEMPRE as etapas existentes do memorial em andamento (só zera no botão Novo Memorial)
  existingStages.forEach((stg) => {
    const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    stagesMap.set(cleanTitle, {
      id: stg.id,
      stageCode: stg.stageCode,
      title: cleanTitle,
      items: [...stg.items],
    });
  });

  // 2. Trata comandos explícitos de remoção
  if (normalized.includes("tire") || normalized.includes("remova") || normalized.includes("exclua") || normalized.includes("retire")) {
    if (normalized.includes("elétrica") || normalized.includes("eletrica")) stagesMap.delete("ELÉTRICA");
    if (normalized.includes("pintura")) {
      stagesMap.delete("PINTURA");
      stagesMap.delete("PINTURA GERAL");
    }
    if (normalized.includes("forro")) stagesMap.delete("FORROS");
    if (normalized.includes("cobertura") || normalized.includes("telhado")) stagesMap.delete("COBERTURA");
    if (normalized.includes("banheiro")) stagesMap.delete("BANHEIROS");
    if (normalized.includes("cozinha")) stagesMap.delete("COZINHA");
    if (normalized.includes("calçada") || normalized.includes("calcada")) {
      stagesMap.delete("CALÇADAS");
      stagesMap.delete("CALÇADAS E ÁREAS EXTERNAS");
    }
  }

  const addStageItem = (rawTitle: string, itemDesc: string) => {
    const stageTitle = rawTitle.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    const formattedDesc = normalizeSentenceCase(itemDesc);
    if (!formattedDesc) return;

    if (!stagesMap.has(stageTitle)) {
      stagesMap.set(stageTitle, {
        id: `stg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        stageCode: `${stagesMap.size + 1}`,
        title: stageTitle,
        items: [],
      });
    }
    const stg = stagesMap.get(stageTitle)!;
    const isDup = stg.items.some(
      (it) => it.description.toLowerCase().trim() === formattedDesc.toLowerCase().trim()
    );
    if (!isDup) {
      stg.items.push({
        id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemNumber: `${stg.items.length + 1}`,
        description: formattedDesc,
      });
    }
  };

  // 3. Divide a solicitação do usuário em cláusulas semânticas
  const clauses = userInput
    .split(/[\/;\n]+|(?:\s+-\s+)|(?:\s+e\s+(?=(?:trocar|recuperar|construir|pintar|reformar|instalar|substituir|fazer|consertar|revisar)))/i)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const clause of clauses) {
    const cLower = clause.toLowerCase();
    const loc = extractSpecificLocation(clause);
    let matchedInClause = false;

    // --- COBERTURA ---
    if (
      cLower.includes("telha") ||
      cLower.includes("cobertura") ||
      cLower.includes("retelhamento") ||
      cLower.includes("retalhamento") ||
      cLower.includes("goteira") ||
      cLower.includes("infiltra") ||
      cLower.includes("calha") ||
      cLower.includes("rufo")
    ) {
      matchedInClause = true;
      const targetLoc = loc ? `da cobertura ${loc}` : "da cobertura da unidade escolar";
      addStageItem(
        "COBERTURA",
        `Executar revisão e recuperação ${targetLoc}, com substituição das telhas danificadas.`
      );
      addStageItem(
        "COBERTURA",
        "Executar reparos na estrutura de sustentação do telhado, corrigindo os pontos comprometidos."
      );
    }

    // --- IMPERMEABILIZAÇÃO ---
    if (
      cLower.includes("impermeabiliza") ||
      cLower.includes("manta") ||
      cLower.includes("umidade") ||
      (cLower.includes("laje") && (cLower.includes("infiltra") || cLower.includes("vazamento")))
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " nas áreas afetadas";
      addStageItem(
        "IMPERMEABILIZAÇÃO",
        `Executar preparação e regularização da superfície${locText} para correção de infiltrações.`
      );
      addStageItem(
        "IMPERMEABILIZAÇÃO",
        `Executar aplicação de sistema impermeabilizante nas áreas comprometidas${locText}.`
      );
    }

    // --- ALVENARIA / REBOCO / MURO ---
    if (
      cLower.includes("alvenaria") ||
      cLower.includes("reboco") ||
      cLower.includes("emboço") ||
      cLower.includes("emboco") ||
      cLower.includes("chapisco") ||
      cLower.includes("trinca") ||
      cLower.includes("fissura") ||
      cLower.includes("muro")
    ) {
      matchedInClause = true;
      const stageName = cLower.includes("muro") ? "MURO" : "ALVENARIA E REVESTIMENTOS";
      const locText = loc ? ` ${loc}` : " da unidade escolar";

      if (cLower.includes("muro")) {
        addStageItem(
          stageName,
          "Executar recuperação e reconstrução dos trechos danificados do muro da unidade escolar."
        );
        addStageItem(
          stageName,
          "Executar revestimento argamassado e acabamento nos trechos recuperados do muro."
        );
      } else {
        addStageItem(
          stageName,
          `Executar recuperação das paredes e recomposição de reboco nos trechos danificados${locText}.`
        );
      }
    }

    // --- ESTRUTURA ---
    if (
      cLower.includes("pilar") ||
      cLower.includes("viga") ||
      cLower.includes("armadura") ||
      cLower.includes("ferragem exposta") ||
      cLower.includes("estrutural")
    ) {
      matchedInClause = true;
      addStageItem(
        "ESTRUTURA",
        "Executar recuperação estrutural dos elementos de concreto danificados, com tratamento das armaduras."
      );
      addStageItem(
        "ESTRUTURA",
        "Executar recomposição e acabamento das peças estruturais recuperadas."
      );
    }

    // --- BANHEIROS ---
    if (
      cLower.includes("banheiro") ||
      cLower.includes("vaso") ||
      cLower.includes("acoplado") ||
      cLower.includes("acoplada") ||
      cLower.includes("bacia") ||
      cLower.includes("mictório") ||
      cLower.includes("mictorio") ||
      cLower.includes("lavatório") ||
      cLower.includes("lavatorio") ||
      cLower.includes("torneira") ||
      cLower.includes("descarga") ||
      cLower.includes("hidrossanit")
    ) {
      matchedInClause = true;
      let addedSpecificBathroomItem = false;

      if (cLower.includes("vaso") || cLower.includes("acoplad") || cLower.includes("bacia")) {
        addedSpecificBathroomItem = true;
        if (cLower.includes("acoplad")) {
          addStageItem(
            "BANHEIROS",
            "Executar substituição dos vasos sanitários existentes por modelos com caixa acoplada."
          );
          addStageItem(
            "BANHEIROS",
            "Executar adequação dos pontos hidráulicos e de esgoto, quando necessário."
          );
        } else {
          addStageItem(
            "BANHEIROS",
            "Executar substituição dos vasos sanitários danificados nos banheiros."
          );
          addStageItem(
            "BANHEIROS",
            "Executar adequação dos pontos hidráulicos e de esgoto, quando necessário."
          );
        }
      }

      if (cLower.includes("revestimento") || cLower.includes("cerâmica") || cLower.includes("ceramica") || cLower.includes("azulejo")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Executar aplicação de revestimento cerâmico nas paredes dos banheiros, com assentamento e rejuntamento."
        );
      }

      if (cLower.includes("torneira") || cLower.includes("registro") || cLower.includes("lavatório") || cLower.includes("lavatorio") || cLower.includes("pia")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Executar substituição de lavatórios, torneiras, registros e acessórios danificados nos banheiros."
        );
      }

      if (cLower.includes("forro")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Executar recomposição e instalação de forro nos banheiros."
        );
      }

      if (cLower.includes("porta") || cLower.includes("fechadura") || cLower.includes("trinco") || cLower.includes("divisória") || cLower.includes("divisoria")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Executar revisão e substituição de portas, divisórias e ferragens dos banheiros."
        );
      }

      if (!addedSpecificBathroomItem) {
        addStageItem(
          "BANHEIROS",
          "Executar revisão geral das instalações hidrossanitárias, louças e acessórios dos banheiros."
        );
        addStageItem(
          "BANHEIROS",
          "Executar adequação dos pontos hidráulicos e de esgoto, quando necessário."
        );
      }
    }

    // --- RESERVATÓRIO / INSTALAÇÕES HIDRÁULICAS ---
    if (
      cLower.includes("reservatório") ||
      cLower.includes("reservatorio") ||
      cLower.includes("caixa d'água") ||
      cLower.includes("caixa d'agua") ||
      cLower.includes("caixa dagua") ||
      cLower.includes("caixa de água") ||
      cLower.includes("abastecimento") ||
      cLower.includes("poço") ||
      cLower.includes("poco") ||
      (cLower.includes("água") && !cLower.includes("goteira")) ||
      (cLower.includes("hidráulica") || cLower.includes("hidraulica"))
    ) {
      matchedInClause = true;
      const stageName =
        cLower.includes("poço") || cLower.includes("poco")
          ? "POÇO TUBULAR"
          : cLower.includes("reservat") || cLower.includes("caixa")
          ? "RESERVATÓRIO"
          : "INSTALAÇÕES HIDRÁULICAS";

      if (cLower.includes("poço") || cLower.includes("poco")) {
        addStageItem(
          stageName,
          "Executar manutenção e recuperação do sistema de bombeamento e instalações do poço tubular."
        );
      }
      if (cLower.includes("reservat") || cLower.includes("caixa")) {
        addStageItem(
          stageName,
          "Executar instalação de base pré-moldada para reservatório de água."
        );
        addStageItem(
          stageName,
          "Fornecer e instalar caixa d'água com capacidade mínima de 10.000 L para abastecimento da unidade escolar."
        );
      }
      if (cLower.includes("tubula") || cLower.includes("rede") || cLower.includes("hidráulic") || cLower.includes("hidraulic")) {
        addStageItem(
          stageName,
          "Executar revisão e adequação das tubulações e conexões da rede hidráulica."
        );
      }
    }

    // --- CALÇADAS ---
    if (
      cLower.includes("calçada") ||
      cLower.includes("calcada") ||
      cLower.includes("passeio") ||
      cLower.includes("rampa") ||
      cLower.includes("drenagem") ||
      cLower.includes("canaleta")
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " no entorno da unidade escolar";
      if (cLower.includes("calçada") || cLower.includes("calcada") || cLower.includes("passeio")) {
        addStageItem(
          "CALÇADAS",
          `Executar recuperação e recomposição das calçadas danificadas${locText}.`
        );
        addStageItem(
          "CALÇADAS",
          "Executar regularização da base e acabamento desempenado com juntas de dilatação."
        );
      }
      if (cLower.includes("rampa") || cLower.includes("acessibilidade")) {
        addStageItem(
          "CALÇADAS",
          "Executar construção e adequação de rampas de acessibilidade na unidade escolar."
        );
      }
      if (cLower.includes("drenagem") || cLower.includes("canaleta") || cLower.includes("grelha")) {
        addStageItem(
          "DRENAGEM",
          "Executar recomposição de canaletas e dispositivos de drenagem pluvial."
        );
      }
    }

    // --- PISOS E REVESTIMENTOS ---
    if (
      ((cLower.includes("piso") && !cLower.includes("pintar") && !cLower.includes("pintura")) ||
        cLower.includes("contrapiso") ||
        cLower.includes("lajota") ||
        cLower.includes("porcelanato") ||
        cLower.includes("granilite") ||
        (cLower.includes("revestimento") && !cLower.includes("banheiro")))
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " nos ambientes indicados";
      addStageItem(
        "PISOS E REVESTIMENTOS",
        `Executar regularização e recomposição do piso${locText}, corrigindo os trechos danificados.`
      );
    }

    // --- FORROS ---
    if ((cLower.includes("forro") || cLower.includes("pvc") || cLower.includes("gesso")) && !cLower.includes("banheiro")) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " nos ambientes solicitados";
      addStageItem(
        "FORROS",
        `Executar revisão e recomposição do forro${locText}, substituindo as partes danificadas.`
      );
      addStageItem(
        "FORROS",
        "Executar reparos e nivelamento na estrutura de fixação do forro."
      );
    }

    // --- LABORATÓRIO DE INFORMÁTICA ---
    if (cLower.includes("laboratório") || cLower.includes("laboratorio") || cLower.includes("informática") || cLower.includes("informatica")) {
      matchedInClause = true;
      addStageItem(
        "LABORATÓRIO DE INFORMÁTICA",
        "Executar adaptação do espaço para implantação do laboratório de informática, com fornecimento e instalação de novas bancadas."
      );
      addStageItem(
        "LABORATÓRIO DE INFORMÁTICA",
        "Executar aplicação de revestimento nas superfícies indicadas do ambiente."
      );
      if (cLower.includes("lógica") || cLower.includes("logica") || cLower.includes("elétrica") || cLower.includes("eletrica")) {
        addStageItem(
          "ELÉTRICA E LÓGICA",
          "Executar novas instalações elétricas com pontos de tomada para atendimento às bancadas."
        );
        addStageItem(
          "ELÉTRICA E LÓGICA",
          "Executar infraestrutura e cabeamento de rede de lógica para o laboratório de informática."
        );
      }
    }

    // --- ELÉTRICA ---
    if (
      (cLower.includes("elétrica") ||
        cLower.includes("eletrica") ||
        cLower.includes("tomada") ||
        cLower.includes("interruptor") ||
        cLower.includes("luminária") ||
        cLower.includes("luminaria") ||
        cLower.includes("iluminação") ||
        cLower.includes("iluminacao") ||
        cLower.includes("disjuntor") ||
        cLower.includes("quadro") ||
        cLower.includes("fiação") ||
        cLower.includes("fiacao") ||
        cLower.includes("cabo") ||
        cLower.includes("subestação") ||
        cLower.includes("subestacao")) &&
      !cLower.includes("lógica") &&
      !cLower.includes("logica")
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " da unidade escolar";
      addStageItem(
        "ELÉTRICA",
        `Executar revisão e adequação das instalações elétricas e quadros de distribuição${locText}.`
      );
      addStageItem(
        "ELÉTRICA",
        "Executar substituição de luminárias, tomadas, interruptores e componentes danificados."
      );
    }

    // --- PINTURA ---
    if (cLower.includes("pintura") || cLower.includes("pintar") || cLower.includes("tinta") || cLower.includes("caiação")) {
      matchedInClause = true;
      if (cLower.includes("interna") && cLower.includes("externa")) {
        addStageItem(
          "PINTURA",
          "Executar pintura geral interna e externa das edificações da unidade escolar."
        );
        if (cLower.includes("piso") || cLower.includes("calçada") || cLower.includes("calcada")) {
          addStageItem(
            "PINTURA",
            "Executar pintura em pisos e calçadas com tinta específica para tráfego."
          );
        }
      } else {
        const locText = loc ? ` ${loc}` : " nas áreas solicitadas da unidade escolar";
        addStageItem(
          "PINTURA",
          `Executar preparação das superfícies${locText}, com limpeza, lixamento e correção de imperfeições.`
        );
        addStageItem(
          "PINTURA",
          `Executar pintura geral${locText}, com acabamento adequado a cada superfície.`
        );
      }
    }

    // --- FACHADA ---
    if (cLower.includes("fachada")) {
      matchedInClause = true;
      addStageItem(
        "FACHADA",
        "Executar reforma e adequação da fachada da unidade escolar, seguindo o padrão institucional da SEDUC."
      );
    }

    // --- COZINHA ---
    if ((cLower.includes("cozinha") || cLower.includes("casa de gás") || cLower.includes("casa de gas") || cLower.includes("exaustor") || cLower.includes("bancada")) && !cLower.includes("laboratório") && !cLower.includes("laboratorio") && !cLower.includes("informática") && !cLower.includes("informatica")) {
      matchedInClause = true;
      addStageItem(
        "COZINHA",
        "Executar adequação e reparos nas instalações e bancadas da cozinha."
      );
    }

    // --- ESQUADRIAS ---
    if (
      (cLower.includes("porta") || cLower.includes("janela") || cLower.includes("esquadria") || cLower.includes("fechadura") || cLower.includes("grade") || cLower.includes("portão") || cLower.includes("portao")) &&
      !cLower.includes("banheiro") &&
      !cLower.includes("pintar") &&
      !cLower.includes("pintura")
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " da unidade escolar";
      addStageItem(
        "ESQUADRIAS",
        `Executar revisão, reparo e substituição de portas, janelas e esquadrias danificadas${locText}.`
      );
      addStageItem(
        "ESQUADRIAS",
        "Executar substituição de fechaduras, dobradiças e ferragens comprometidas."
      );
    }

    // --- LIMPEZA ---
    if (cLower.includes("limpeza") || cLower.includes("entulho") || cLower.includes("bota-fora")) {
      matchedInClause = true;
      addStageItem(
        "LIMPEZA FINAL",
        "Executar limpeza geral da obra com remoção de entulhos."
      );
    }

    // --- CLÁUSULA CUSTOMIZADA LIVRE (resumida e genérica) ---
    if (!matchedInClause && clause.length > 3) {
      const customVerbStart = /^(executar|fornecer|substituir|recuperar|instalar|construir|demolir|reformar|adequar|aplicar)/i.test(clause);
      const cleanClauseText = clause.replace(/^[\s•\-\*\d\.\)]+\s*/, "").trim();
      const customStageTitle = loc ? loc.replace(/^(do|da|dos|das)\s+/i, "").toUpperCase() : "SERVIÇOS GERAIS";

      const customDesc = customVerbStart
        ? normalizeSentenceCase(cleanClauseText)
        : normalizeSentenceCase(`Executar ${cleanClauseText.charAt(0).toLowerCase() + cleanClauseText.slice(1)}`);
      addStageItem(customStageTitle, customDesc);
    }
  }

  const finalStages = Array.from(stagesMap.values());
  return enforceMandatoryScopeAutomations(finalStages, userInput);
}

// ----------------------------------------------------------------------------
// Formata as etapas no Padrão Resumido Oficial SEDUC-PI:
// COBERTURA
// Executar revisão e recuperação da cobertura do pátio, com substituição das telhas danificadas.
// Executar reparos na estrutura de sustentação do telhado, corrigindo os pontos comprometidos.
// ----------------------------------------------------------------------------
export function formatStagesToSpreadsheetText(stages: DescritivoStage[]): string {
  const blocks: string[] = [];
  stages.forEach((stg) => {
    const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    const lines: string[] = [`### ${cleanTitle}`];
    stg.items.forEach((it) => {
      // Cada subitem em uma linha, sem marcadores, hífens ou numeração decimal (1.1, 1.2)
      lines.push(normalizeSentenceCase(it.description));
    });
    blocks.push(lines.join("\n"));
  });
  return blocks.join("\n\n");
}

// ----------------------------------------------------------------------------
// Chamada ao Google Gemini API (V2: gemini-2.5-flash, temperature=0.2,
// SYSTEM_PROMPT_COMPLETO e proteção da chave GEMINI_API_KEY no backend /api/gemini)
// ----------------------------------------------------------------------------
export async function queryGeminiSeniorEngineer(
  userInput: string,
  apiKey: string,
  metadata: MemorialMetadata,
  currentStages: DescritivoStage[] = []
): Promise<{ textResponse: string; stages: DescritivoStage[] }> {
  const contextMessage = currentStages.length > 0
    ? `MEMORIAL DESCRITIVO ATUAL EM ANDAMENTO:\n${formatStagesToSpreadsheetText(currentStages)}\n\nNOVA MENSAGEM DO USUÁRIO:\n${userInput}\n\nINSTRUÇÃO OBRIGATÓRIA:\n- Se o usuário digitou novos serviços (mesmo sem dizer "adicione"), MANTENHA integralmente todos os títulos e serviços do MEMORIAL DESCRITIVO ATUAL EM ANDAMENTO e ADICIONE os novos títulos/serviços solicitados.\n- Se o usuário pediu para remover/tirar/excluir algum item ou título, remova apenas o que foi pedido e mantenha todo o restante.\n- Se o usuário pediu para alterar/mudar algum item ou título, aplique a alteração e mantenha todo o restante.`
    : userInput;

  try {
    let rawText = "";

    // 1. Tenta primeiro via Rota Segura de Backend (/api/gemini) usando GEMINI_API_KEY e system_prompt_seduc.md
    try {
      const backendRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          apiKey,
          metadata,
          stages: currentStages,
        }),
      });
      if (backendRes.ok) {
        const backendJson = await backendRes.json();
        if (backendJson.rawText) {
          rawText = backendJson.rawText;
        }
      }
    } catch (backendErr) {
      console.warn("Rota /api/gemini indisponível, tentando chamada direta:", backendErr);
    }

    // 2. Fallback direto se uma chave foi informada no cliente
    if (!rawText && apiKey && apiKey.trim()) {
      for (const directModel of ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.8-flash"]) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${directModel}:generateContent?key=${encodeURIComponent(
            apiKey.trim()
          )}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SUPER_PROMPT_MEMORIAL }],
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: contextMessage }],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 3500,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (rawText) break;
          }
        } catch {
          // tenta próximo modelo
        }
      }
    }

    if (!rawText) {
      throw new Error("Sem resposta remota do Gemini; acionando Motor Engenheiro Civil Master.");
    }

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
            title: String(stg.title || "").toUpperCase().replace(/^\d+[\.\s\-]+/, "").trim(),
            items: (stg.items || []).map((it: any, iIdx: number) => ({
              id: `gemini-it-${Date.now()}-${sIdx}-${iIdx}`,
              itemNumber: `${iIdx + 1}`,
              description: normalizeSentenceCase(String(it.description || "")),
            })),
          }));
        }
      } catch (err) {
        console.warn("Falha ao fazer parse do JSON do Gemini, usando extrator de fallback:", err);
      }
    }

    if (parsedStages.length === 0) {
      parsedStages = parseStagesFromPlainText(rawText);
    }

    if (parsedStages.length === 0) {
      parsedStages = generateLocalSeniorDescription(userInput, currentStages);
    } else {
      parsedStages = mergeAccumulatedStages(currentStages, parsedStages, userInput);
      parsedStages = enforceMandatoryScopeAutomations(parsedStages, userInput);
    }

    const cleanChatText = formatStagesToSpreadsheetText(parsedStages);

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

// ----------------------------------------------------------------------------
// Extrator Resiliente de Etapas a partir de Texto Formatado (Fallback Seguro)
// Suporta títulos "1. COBERTURA", "### 1. COBERTURA" ou "COBERTURA"
// ----------------------------------------------------------------------------
export function parseStagesFromPlainText(text: string): DescritivoStage[] {
  const clean = text
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .trim();

  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);
  const stages: DescritivoStage[] = [];
  let currentStage: DescritivoStage | null = null;
  let stageCount = 1;
  let itemCount = 1;

  for (const line of lines) {
    const isMarkdownHeader = /^#{1,4}\s+/.test(line);
    const isNumberedUpperHeader = /^\d+\.\s+[A-ZÀ-Ú\s\/\-]{3,}$/.test(line);
    const candidateTitle = line.replace(/^#{1,4}\s+/, "").replace(/^\d+[\.\s\-]+/, "").trim();
    const isAllUpper =
      candidateTitle.length >= 3 &&
      candidateTitle === candidateTitle.toUpperCase() &&
      !candidateTitle.startsWith("EXECUTAR ") &&
      !candidateTitle.startsWith("FORNECER ") &&
      !candidateTitle.startsWith("SUBSTITUIR ") &&
      !candidateTitle.startsWith("RECUPERAR ");

    if (isMarkdownHeader || isNumberedUpperHeader || isAllUpper) {
      const stageTitle = candidateTitle.toUpperCase();
      currentStage = {
        id: `parsed-stg-${Date.now()}-${stageCount}`,
        stageCode: `${stageCount}`,
        title: stageTitle,
        items: [],
      };
      stages.push(currentStage);
      stageCount++;
      itemCount = 1;
    } else if (currentStage) {
      const cleanDesc = normalizeSentenceCase(line);
      if (cleanDesc.length > 3) {
        currentStage.items.push({
          id: `parsed-it-${Date.now()}-${stageCount}-${itemCount}`,
          itemNumber: `${itemCount}`,
          description: cleanDesc,
        });
        itemCount++;
      }
    }
  }

  return stages;
}

// ----------------------------------------------------------------------------
// Chamada à OpenAI API / ChatGPT (Orientada pelo SYSTEM PROMPT SEDUC-PI)
// ----------------------------------------------------------------------------
export async function queryOpenAISeniorEngineer(
  userInput: string,
  apiKey: string,
  metadata: MemorialMetadata,
  currentStages: DescritivoStage[] = [],
  model: string = "gpt-4o-mini"
): Promise<{ textResponse: string; stages: DescritivoStage[] }> {
  const contextMessage = `
DADOS DO PROJETO ATUAL:
- Unidade Escolar / Imóvel: ${metadata.propertyId || metadata.schoolName || metadata.projectName || "Não informado"}
- Município / UF: ${metadata.city || "São João do Piauí"} / ${metadata.uf || "PI"}
- Órgão: ${metadata.organization || "Secretaria da Educação / GPR"}
- Finalidade / Objeto: ${metadata.purpose || metadata.objectDescription || "Reforma e Manutenção da Unidade Escolar"}
- BDI da Obra (%): ${metadata.bdiPercent || "24,50%"}
- Mês/Ano Ref: ${metadata.mesAnoRef || "Novembro de 2026"}
- Data Extensa: ${metadata.dataExtensa || "Domingo, 15 de novembro de 2026"}

ESTADO ATUAL DO MEMORIAL:
${formatStagesToSpreadsheetText(currentStages) || "Nenhum serviço registrado anteriormente (Criando novo memorial do zero)."}

NOVA DEMANDA DO USUÁRIO (Texto / Áudio Transcrito):
"${userInput}"

INSTRUÇÃO DE EXECUÇÃO (PADRÃO SEDUC-PI — ZERO CÓPIA LITERAL E ZERO SERVIÇOS FANTASMAS):
1. Processe cirurgicamente as palavras específicas, locais (ex: "na cobertura do pátio", "nos banheiros") e materiais/modelos (ex: "vaso acoplado", "revestimento") solicitados pelo usuário. NUNCA substitua o pedido real do usuário por um texto genérico salvo na memória e NUNCA inclua disciplinas que o usuário não pediu.
2. Categorias Principais numeradas sequencialmente (1., 2., 3., etc.) e em CAIXA ALTA (ex: 1. COBERTURA, 2. BANHEIROS).
3. Subitens sem marcadores, hífens, travessões ou numeração decimal (1.1, 1.2), iniciando com a primeira letra em maiúscula e o restante em caixa baixa, preferencialmente com o verbo técnico adequado (Executar, Fornecer e instalar, Substituir, Recuperar).
4. Regras Técnicas Obrigatórias (Automações de Escopo):
   - Água / Hidráulica / Hidrossanitário / Poço Tubular / Banheiros: Incluir obrigatoriamente ao final do bloco: "Executar teste de estanqueidade e funcionamento das instalações hidráulicas."
   - Reservatório / Caixa d'Água: Incluir obrigatoriamente os subitens: "Executar instalação de base pré-moldada para reservatório de água." e "Fornecer e instalar caixa d'água com capacidade mínima de 10.000 L para abastecimento da unidade escolar."
5. Incluir no final o bloco JSON estruturado delimitado por \`\`\`json contendo a chave "stages".
`;

  try {
    let rawText = "";

    // 1. Tenta via Rota Segura Next.js (/api/openai)
    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          apiKey,
          metadata,
          stages: currentStages,
          model,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.rawText) {
          rawText = json.rawText;
        }
      }
    } catch (routeErr) {
      console.warn("Rota /api/openai inacessível, tentando chamada direta:", routeErr);
    }

    // 2. Se a rota interna não retornou texto e a chave existe no cliente, tenta conexão direta
    if (!rawText && apiKey) {
      const directRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: SUPER_PROMPT_MEMORIAL,
            },
            {
              role: "user",
              content: contextMessage,
            },
          ],
          temperature: 0.1,
          max_tokens: 3500,
        }),
      });

      if (directRes.ok) {
        const openAiData = await directRes.json();
        rawText = openAiData?.choices?.[0]?.message?.content || "";
      } else {
        const errJson = await directRes.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Erro OpenAI HTTP ${directRes.status}`);
      }
    }

    if (!rawText) {
      throw new Error("Não foi possível obter resposta da OpenAI.");
    }

    // Extrai o JSON estruturado do texto gerado
    let parsedStages: DescritivoStage[] = [];
    const jsonMatch =
      rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*"stages"[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.stages)) {
          parsedStages = parsed.stages.map((stg: any, sIdx: number) => ({
            id: `openai-stg-${Date.now()}-${sIdx}`,
            stageCode: `${sIdx + 1}`,
            title: String(stg.title || "").toUpperCase().replace(/^\d+[\.\s\-]+/, "").trim(),
            items: (stg.items || []).map((it: any, iIdx: number) => ({
              id: `openai-it-${Date.now()}-${sIdx}-${iIdx}`,
              itemNumber: `${iIdx + 1}`,
              description: normalizeSentenceCase(String(it.description || "")),
            })),
          }));
        }
      } catch (err) {
        console.warn("Falha ao fazer parse do JSON da OpenAI:", err);
      }
    }

    // Se o modelo retornou texto formatado mas não gerou o bloco JSON, faz o parse linha a linha
    if (parsedStages.length === 0) {
      parsedStages = parseStagesFromPlainText(rawText);
    }

    // Fallback de segurança para o motor sênior local
    if (parsedStages.length === 0) {
      parsedStages = generateLocalSeniorDescription(userInput, currentStages);
    } else {
      parsedStages = mergeAccumulatedStages(currentStages, parsedStages, userInput);
      parsedStages = enforceMandatoryScopeAutomations(parsedStages, userInput);
    }

    // Formata estritamente no padrão numerado SEDUC-PI (1. COBERTURA, 2. BANHEIROS)
    const cleanChatText = formatStagesToSpreadsheetText(parsedStages);

    return {
      textResponse: cleanChatText,
      stages: parsedStages,
    };
  } catch (err) {
    console.warn("Erro ao consultar OpenAI, acionando Motor Local Sênior:", err);
    const localStages = generateLocalSeniorDescription(userInput, currentStages);
    return {
      textResponse: formatStagesToSpreadsheetText(localStages),
      stages: localStages,
    };
  }
}

// ============================================================================
// GERAÇÃO DE PDF OFICIAL DO MEMORIAL DESCRITIVO (100% Fiel ao DESCRITIVO MODELO.xlsx)
// ============================================================================
export function buildMemorialPDFDoc(metadata: MemorialMetadata, stages: DescritivoStage[]): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  // Margens laterais equivalentes ao pageMargins left=0.27", right=0.27" do Excel (~7.5mm)
  const marginX = 7.5;
  const marginTop = 18;
  const printableWidth = pageWidth - marginX * 2; // 195mm
  let currentY = marginTop;

  const schoolUpper = (metadata.schoolName || metadata.propertyId || "CETI FADE III").trim().toUpperCase();
  const cityUpper = (metadata.city || "CAJAZEIRAS DO PIAUÍ").trim().toUpperCase();
  const mesAnoFormatted = (metadata.mesAnoRef || "Novembro de 2026").replace(/\s+de\s+/i, ", ").toUpperCase();
  const footerDateFormatted = (metadata.dataExtensa || "domingo, 15 de novembro de 2026").toLowerCase();

  const bdiRaw = (metadata.bdiPercent || "24,50%").trim();
  const bdiFormatted = bdiRaw.endsWith("%") ? bdiRaw : `${bdiRaw}%`;

  // Proporções exatas das colunas B..I do DESCRITIVO MODELO.xlsx
  // B=14mm | C..G=142mm | H=19.5mm | I=19.5mm (Total = 195mm)
  const wColB = 14;
  const wColCG = 142;
  const wColH = 19.5;
  const wColI = 19.5;
  const wColBG = wColB + wColCG; // 156mm (B2:G5)
  const wColHI = wColH + wColI; // 39mm (H2:I5 — Brasão SEDUC-PI)

  const xColB = marginX;
  const xColC = xColB + wColB;
  const xColH = xColB + wColBG;
  const xColI = xColH + wColH;

  // 1. CABEÇALHO SUPERIOR (Linhas 2 a 5 do Excel: B2:G5 à esquerda + H2:I5 com Brasão à direita)
  const hRow2 = 6.2;
  const hRow3 = 3.8;
  const hRow4 = 3.8;
  const hRow5 = 5.4;
  const hHeaderBlock = hRow2 + hRow3 + hRow4 + hRow5; // 19.2mm

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.28);
  doc.setFillColor(255, 255, 255);

  // Caixa direita mesclada H2:I5 (Brasão do Governo do Piauí / SEDUC)
  doc.rect(xColH, currentY, wColHI, hHeaderBlock, "FD");
  try {
    // O brasão original tem proporção 215x143 (~1.5:1) posicionado à direita de H2:I5
    const imgW = 36.5;
    const imgH = 17.6;
    const imgX = xColH + (wColHI - imgW) / 2;
    const imgY = currentY + (hHeaderBlock - imgH) / 2;
    doc.addImage(SEDUC_PI_HEADER_LOGO_BASE64, "PNG", imgX, imgY, imgW, imgH);
  } catch (e) {
    console.warn("Aviso ao renderizar brasão no PDF:", e);
  }

  // Linha 2 (B2:G2): PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - <ESCOLA>
  doc.rect(xColB, currentY, wColBG, hRow2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`PLANILHA ORÇAMENTÁRIA DE MANUTENÇÃO - ${schoolUpper}`, xColB + wColBG / 2, currentY + 4.3, {
    align: "center",
  });
  currentY += hRow2;

  // Linha 3 (B3:G3): GOVERNO DO ESTADO DO PIAUÍ
  doc.rect(xColB, currentY, wColBG, hRow3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.text("GOVERNO DO ESTADO DO PIAUÍ", xColB + wColBG / 2, currentY + 2.7, { align: "center" });
  currentY += hRow3;

  // Linha 4 (B4:G4): SECRETARIA DE ESTADO DA EDUCAÇÃO - SEDUC
  doc.rect(xColB, currentY, wColBG, hRow4);
  doc.text("SECRETARIA DE ESTADO DA EDUCAÇÃO - SEDUC", xColB + wColBG / 2, currentY + 2.7, { align: "center" });
  currentY += hRow4;

  // Linha 5 (B5:G5): UNIDADE DE GESTÃO DA REDE FÍSICA - UGERF
  doc.rect(xColB, currentY, wColBG, hRow5);
  doc.text("UNIDADE DE GESTÃO DA REDE FÍSICA - UGERF", xColB + wColBG / 2, currentY + 3.6, { align: "center" });
  currentY += hRow5;

  // 2. TABELA DE METADADOS (Linhas 6 a 9 do Excel)
  const hMeta = 3.8;
  const drawSeducMetaRow = (
    labelB: string,
    valC: string,
    midDatabaseText: string | null,
    labelH: string,
    valI: string,
    isBottomRow: boolean = false
  ) => {
    doc.setLineWidth(0.28);
    doc.rect(xColB, currentY, wColB, hMeta);
    doc.rect(xColC, currentY, wColCG, hMeta);
    doc.rect(xColH, currentY, wColH, hMeta);
    doc.rect(xColI, currentY, wColI, hMeta);

    // Rótulo na Coluna B (alinhado à direita, negrito)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(0, 0, 0);
    doc.text(labelB, xColB + wColB - 1, currentY + 2.7, { align: "right" });

    // Conteúdo em C:G
    if (midDatabaseText) {
      const wDatePart = 68;
      const xSplit = xColC + wDatePart;
      doc.line(xSplit, currentY, xSplit, currentY + hMeta);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.text(valC, xColC + 1.2, currentY + 2.7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.text(midDatabaseText, xSplit + (wColCG - wDatePart) / 2, currentY + 2.7, { align: "center" });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.text(valC, xColC + 1.2, currentY + 2.7);
    }

    // Coluna H (L.S. / BDI label)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    doc.text(labelH, xColH + wColH - 1, currentY + 2.7, { align: "right" });

    // Coluna I (Valor percentual)
    doc.text(valI, xColI + wColI - 1, currentY + 2.7, { align: "right" });

    if (isBottomRow) {
      doc.setLineWidth(0.45);
      doc.line(xColB, currentY + hMeta, xColB + printableWidth, currentY + hMeta);
    }

    currentY += hMeta;
  };

  drawSeducMetaRow(
    "OBJETO:",
    "MANUTENÇÃO PREDIAL DAS UNIDADES ESCOLARES DA REDE ESTADUAL",
    null,
    "L.S. (MENSAL)=",
    "70,90%"
  );
  drawSeducMetaRow(
    "DATA:",
    mesAnoFormatted,
    "DATA BASE: SINAPI_PI  |  SEINFRA_CE  |  ORSE_SE",
    "L.S. (HORISTA)=",
    "113,05%"
  );
  drawSeducMetaRow("UNIDADE.:", schoolUpper, null, "BDI (DIF)=", "0,00%");
  drawSeducMetaRow("MUNICÍPIO:", cityUpper, null, "BDI=", bdiFormatted, true);

  // Linha 10: Espaço em branco (3.6mm)
  currentY += 3.6;

  // 3. FAIXA CINZA "MEMORIAL DESCRITIVO" (Linha 11: B11:I11)
  const hRow11 = 8.4;
  doc.setFillColor(217, 217, 217);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.28);
  doc.rect(xColB, currentY, printableWidth, hRow11, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.2);
  doc.setTextColor(0, 0, 0);
  doc.text("MEMORIAL DESCRITIVO", xColB + printableWidth / 2, currentY + 5.3, { align: "center" });
  currentY += hRow11;

  // Linha 12: Espaço em branco (3.6mm)
  currentY += 3.6;

  // 4. FAIXA "SERVIÇOS - <ESCOLA>" (Linha 13: B13:I13)
  const hRow13 = 4.4;
  doc.setFillColor(255, 255, 255);
  doc.rect(xColB, currentY, printableWidth, hRow13, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.setTextColor(0, 0, 0);
  doc.text(`SERVIÇOS - ${schoolUpper}`, xColB + printableWidth / 2, currentY + 3.1, { align: "center" });
  currentY += hRow13;

  // Linha 14: Espaço antes da Moldura Externa (3.4mm)
  currentY += 3.4;

  // 5. MOLDURA EXTERNA (B15:I{penúltima}) E CAIXA INTERNA CONTÍNUA (C17:H{antepenúltima})
  const outerBoxStartY = currentY;
  const innerBoxX = xColC; // Começa na coluna C
  const innerBoxW = wColCG + wColH; // Vai de C até H (161.5mm)
  const innerBoxStartY = outerBoxStartY + 5.2; // Duas linhas de respiro superior (Linhas 15 e 16)

  let cursorY = innerBoxStartY;

  const stagesToRender: DescritivoStage[] =
    stages && stages.length > 0
      ? stages
      : [
          {
            id: "empty-stage",
            stageCode: "1",
            title: "SERVIÇOS GERAIS",
            items: [],
          },
        ];

  stagesToRender.forEach((stage, sIdx) => {
    const cleanTitle = stage.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    const numberedTitle = `${sIdx + 1}. ${cleanTitle}`;

    // Linha do Título (Em CAIXA ALTA, Negrito Vermelho Centralizado na caixa C:H)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    doc.setTextColor(255, 0, 0);
    doc.text(numberedTitle, innerBoxX + innerBoxW / 2, cursorY + 3.1, { align: "center" });
    cursorY += 3.8;

    // Linha espaçadora vazia logo abaixo do título (Linha 18 / 27 do Excel)
    cursorY += 3.4;

    // Subitens de serviço da categoria
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(0, 0, 0);

    stage.items.forEach((item) => {
      const cleanDesc = normalizeSentenceCase(item.description);
      const wrappedLines: string[] = doc.splitTextToSize(cleanDesc, innerBoxW - 2.2);
      wrappedLines.forEach((lineText) => {
        doc.text(lineText, innerBoxX + 0.8, cursorY + 2.8);
        cursorY += 3.7;
      });
    });

    // Linha separadora entre categorias (Linha 25 do Excel)
    if (sIdx < stagesToRender.length - 1) {
      cursorY += 3.7;
    }
  });

  // Linha de fechamento inferior da caixa interna C:H (Linha 34 do Excel)
  const innerBoxEndY = cursorY + 3.6;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.28);
  doc.rect(innerBoxX, innerBoxStartY, innerBoxW, innerBoxEndY - innerBoxStartY);

  // Linha horizontal intermediária da moldura externa (Linha 35 do Excel) e base espessa (Linha 36)
  const midBottomLineY = innerBoxEndY + 3.6;
  const outerBoxEndY = midBottomLineY + 3.4;

  // Desenha a Moldura Externa Espessa (B15:I36)
  doc.setLineWidth(0.5);
  doc.rect(xColB, outerBoxStartY, printableWidth, outerBoxEndY - outerBoxStartY);

  // Linha horizontal fina interna (base da Linha 35 de B até I)
  doc.setLineWidth(0.25);
  doc.line(xColB, midBottomLineY, xColB + printableWidth, midBottomLineY);

  // 6. DATA EXTENSA COM DIA DA SEMANA NO RODAPÉ (Linha 37: B37:I37)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.0);
  doc.setTextColor(0, 0, 0);
  doc.text(footerDateFormatted, xColB + printableWidth / 2, outerBoxEndY + 2.9, { align: "center" });

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
          <td class="label">UNIDADE ESCOLAR:</td>
          <td>${metadata.schoolName || metadata.propertyId || "-"}</td>
        </tr>
        <tr>
          <td class="label">MUNICÍPIO / UF:</td>
          <td>${metadata.city || "-"} / ${metadata.uf || "PI"}</td>
        </tr>
        <tr>
          <td class="label">BDI DA OBRA (%):</td>
          <td>${metadata.bdiPercent || "24,50%"}</td>
        </tr>
        <tr>
          <td class="label">MÊS / ANO REF.:</td>
          <td>${metadata.mesAnoRef || "Novembro de 2026"}</td>
        </tr>
        <tr>
          <td class="label">GRE / REGIONAL:</td>
          <td>${metadata.gre || "12ª GRE"}</td>
        </tr>
        <tr>
          <td class="label">FINALIDADE / OBJETO:</td>
          <td>${metadata.purpose || metadata.objectDescription || "Reforma e Manutenção Predial"}</td>
        </tr>
        <tr>
          <td class="label">DATA DE EMISSÃO:</td>
          <td>${metadata.dataExtensa || metadata.dateStr || new Date().toLocaleDateString("pt-BR")}</td>
        </tr>
      </table>

      ${stages
        .map(
          (stg, idx) => `
        <h2>${idx + 1}. ${stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase()}</h2>
        ${stg.items.map((it) => `<p class="service-line">${normalizeSentenceCase(it.description)}</p>`).join("")}
      `
        )
        .join("")}

      <br/><br/>
      <p style="text-align: center; font-style: italic; margin-top: 25px; font-size: 10.5pt; color: #475569;">
        ${metadata.city || "Teresina"} - ${metadata.uf || "PI"}, ${metadata.dataExtensa || "Domingo, 8 de novembro de 2026"}.
      </p>
      <br/>
      <table style="border: none; margin-top: 20px;">
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
