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
// SYSTEM PROMPT OFICIAL (V2): ENGENHEIRO CIVIL MASTER & ORÇAMENTISTA (PADRÃO SEDUC-PI)
// ----------------------------------------------------------------------------
export const SUPER_PROMPT_MEMORIAL = `# SYSTEM PROMPT: ENGENHEIRO CIVIL MASTER & ORÇAMENTISTA (PADRÃO SEDUC-PI)

## 1. DIRETRIZ PRINCIPAL E PERSONA
Você é um Engenheiro Civil Sênior Especialista em Patologia das Construções, Obras Públicas e Orçamentação. Sua função é traduzir solicitações informais de reformas escolares em descritivos técnicos de alta precisão executiva, adotando rigor científico, literário, prático e normativo (ABNT/DNIT/SEDUC-PI).

## 2. MENTALIDADE DE ENGENHEIRO CIVIL MASTER (PASSO A PASSO EXECUTIVO)
- **Raciocínio Técnico Profundo:** Nunca trate um serviço de forma genérica. Quando o usuário citar um problema ou elemento (ex: calçadas, pisos, pinturas, coberturas, impermeabilizações), você deve pensar imediatamente na sequência lógica de engenharia (preparação de base, tratamento de patologias, aplicação de camada de proteção/aderência, acabamento adequado e especificação correta do material).
- **Especificidade de Materiais por Substrato:** 
  - Tintas para pisos (ex: epóxi ou acrílica com alta resistência à abrasão) exigem tratamento de base e primer diferentes de paredes (látex/acrílica) ou esquadrias metálicas (esmalte sintético/zarcão).
  - Recuperação de calçadas exige escarificação, compactação de subleito, base de brita/lastro de concreto magro e lançamento de concreto fck adequado com juntas de dilatação.
- **Resumo Executivo de Campo:** Cada subitem deve descrever o procedimento técnico de forma concisa (uma linha), mas carregando toda a bagagem de um memorial descritivo real.

## 3. REGRA SUPREMA DE ANTI-VÍCIO (PROIBIÇÃO DE CÓPIA LITERAL)
- Os exemplos servem APENAS para ilustrar o formato, o tamanho e o estilo.
- NUNCA copie respostas de exemplos anteriores por ver palavras-chave parecidas. Analise semanticamente o pedido atual do usuário e construa um descritivo novo e inédito.

## 4. REGRAS DE FORMATAÇÃO E ESTRUTURA
- Categorias Principais: Numeradas sequencialmente (1., 2., 3., etc.) com títulos em CAIXA ALTA.
- Subitens: 
  - SEM marcadores, hífens, travessões ou numeração decimal (como 1.1).
  - Primeira letra maiúscula e restante em caixa baixa.
  - Iniciar com verbos no infinitivo (Executar, Fornecer e instalar, Aplicar, Recuperar).
  - Curtos, diretos e prontos para planilha orçamentária.

## 5. REGRAS TÉCNICAS OBRIGATÓRIAS (AUTOMAÇÕES DE ESCOPO)
- Água / Hidráulica / Hidrossanitário / Poço Tubular: Incluir obrigatoriamente no final do bloco:
  Executar teste de estanqueidade e funcionamento das instalações hidráulicas.
- Reservatório / Caixa d'Água: Incluir obrigatoriamente:
  Executar instalação de base pré-moldada para reservatório de água.
  Fornecer e instalar caixa d'água com capacidade mínima de 10.000 L para abastecimento da unidade escolar.

## 6. RESTRIÇÕES DE SAÍDA
- Não inclua preços, BDI, composições de custos ou conversas paralelas. Entregue direto o bloco formatado.

## EXEMPLO DE RACIOCÍNIO TÉCNICO AVANÇADO
- **Exemplo de Solicitação:** "recuperar as calçadas danificadas e pintar o piso da quadra"
- **Processo Mental do Engenheiro Master:** 
  - Calçada danificada: não é só jogar cimento. Exige remoção do piso quebrado, preparo/compactação da base de terra, lastro e concreto novo com caimento e juntas.
  - Pintura de piso de quadra: exige limpeza/lavagem profunda, tratamento de fissuras, aplicação de selador/primer específico e pintura com tinta acrílica/esportiva de alta resistência ao tráfego.
- **Resultado Gerado:**
  1. PISOS E CALÇADAS
  Executar demolição e remoção de placas de concreto danificadas das calçadas com regularização e compactação do subleito.
  Executar lançamento de lastro de brita e concretagem de novo piso para calçadas com acabamento desempenado e juntas de dilatação.
  
  2. PINTURA
  Executar limpeza e lavagem mecanizada da superfície do piso seguida de tratamento de fissuras e patologias.
  Aplicar selador acrílico e pintura em tinta de alta resistência ao tráfego e intempéries para pisos e quadras esportivas.
  
  3. SERVIÇOS DE PÓS-OBRA E LIMPEZA FINAL
  Executar limpeza geral pós-obra com remoção de entulhos e resíduos gerados.

Ao final da resposta em texto puro, inclua OBRIGATORIAMENTE o bloco JSON estruturado para sincronização da planilha e do PDF:
\`\`\`json
{
  "stages": [
    {
      "title": "PISOS E CALÇADAS",
      "items": [
        { "description": "Executar demolição e remoção de placas de concreto danificadas das calçadas com regularização e compactação do subleito." },
        { "description": "Executar lançamento de lastro de brita e concretagem de novo piso para calçadas com acabamento desempenado e juntas de dilatação." }
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
 * Garante as Regras Técnicas Obrigatórias (Automações de Escopo - Seção 4 do System Prompt)
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

    // Regra 4.2: Reservatório / Caixa d'Água
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

    // Regra 4.1: Água / Hidráulica / Hidrossanitário / Poço Tubular / Banheiros com intervenção hidráulica
    const isHidraulica =
      stageTextCombined.includes("hidráulic") ||
      stageTextCombined.includes("hidraulic") ||
      stageTextCombined.includes("hidrossanit") ||
      stageTextCombined.includes("poço") ||
      stageTextCombined.includes("poco") ||
      stageTextCombined.includes("água") ||
      stageTextCombined.includes("agua") ||
      stageTextCombined.includes("vaso") ||
      stageTextCombined.includes("bacia sanit") ||
      stageTextCombined.includes("torneira") ||
      stageTextCombined.includes("tubulação") ||
      stageTextCombined.includes("registro") ||
      cleanTitle.includes("BANHEIRO") ||
      cleanTitle.includes("HIDRÁULICA") ||
      cleanTitle.includes("HIDROSSANIT") ||
      cleanTitle.includes("POÇO") ||
      cleanTitle.includes("ABASTECIMENTO");

    if (isHidraulica) {
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
        // Garante que fique ao final do bloco
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

// ----------------------------------------------------------------------------
// Processador Semântico Contextual Local (Padrão SEDUC-PI — Zero Cópia Literal)
// ----------------------------------------------------------------------------
export function generateLocalSeniorDescription(
  userInput: string,
  existingStages: DescritivoStage[] = []
): DescritivoStage[] {
  const normalized = userInput.toLowerCase().trim();
  const stagesMap = new Map<string, DescritivoStage>();

  // 1. Carrega etapas existentes (se o usuário estiver refinando o memorial atual)
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

  // 3. Divide a solicitação do usuário em cláusulas semânticas (por /, ;, quebras de linha, vírgulas longas)
  const clauses = userInput
    .split(/[\/;\n]+|(?:\s+-\s+)/)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const clause of clauses) {
    const cLower = clause.toLowerCase();
    const loc = extractSpecificLocation(clause);
    let matchedInClause = false;

    // --- COBERTURA / TELHADO / RETELHAMENTO / GOTEIRAS ---
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
      const targetLoc = loc ? `na cobertura ${loc}` : "na cobertura da unidade escolar";

      if (cLower.includes("retelhamento") || cLower.includes("retalhamento") || cLower.includes("goteira") || cLower.includes("infiltra") || cLower.includes("telha")) {
        addStageItem(
          "COBERTURA",
          `Executar substituição e retelhamento pontual ${targetLoc} para correção de infiltrações e alinhamento do telhado.`
        );
      }
      if (cLower.includes("madeira") || cLower.includes("estrutura") || cLower.includes("caibro") || cLower.includes("ripa") || cLower.includes("terça")) {
        addStageItem(
          "COBERTURA",
          `Executar revisão e substituição de peças danificadas do madeiramento ${targetLoc}.`
        );
      }
      if (cLower.includes("calha") || cLower.includes("rufo")) {
        addStageItem(
          "COBERTURA",
          `Executar instalação e revisão de calhas e rufos metálicos ${targetLoc} para escoamento pluvial.`
        );
      }
    }

    // --- BANHEIROS / VASOS / ACOPLADO / REVESTIMENTO EM BANHEIRO / TORNEIRAS / HIDROSSANITÁRIO ---
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
            "Executar substituição de vasos sanitários convencionais por modelos com caixa acoplada, incluindo conexões e engates flexíveis."
          );
        } else {
          addStageItem(
            "BANHEIROS",
            "Executar substituição e assentamento de vasos sanitários nos banheiros, incluindo conexões e vedação."
          );
        }
      }

      if (cLower.includes("revestimento") || cLower.includes("cerâmica") || cLower.includes("ceramica") || cLower.includes("azulejo")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Executar aplicação de revestimento cerâmico nas paredes dos banheiros com assentamento e rejuntamento."
        );
      }

      if (cLower.includes("torneira") || cLower.includes("registro") || cLower.includes("lavatório") || cLower.includes("lavatorio") || cLower.includes("pia")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Fornecer e instalar torneiras e metais sanitários nos lavatórios dos banheiros."
        );
      }

      if (cLower.includes("forro")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Executar recomposição e instalação de forro nos banheiros."
        );
      }

      if (cLower.includes("porta") || cLower.includes("fechadura") || cLower.includes("trinco")) {
        addedSpecificBathroomItem = true;
        addStageItem(
          "BANHEIROS",
          "Executar revisão e substituição de portas, trincos e ferragens das cabines dos banheiros."
        );
      }

      if (!addedSpecificBathroomItem) {
        addStageItem(
          "BANHEIROS",
          "Executar revisão e adequação das instalações hidrossanitárias dos banheiros da unidade escolar."
        );
      }
    }

    // --- RESERVATÓRIO / CAIXA D'ÁGUA / ABASTECIMENTO DE ÁGUA / POÇO ---
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
          ? "POÇO TUBULAR E ABASTECIMENTO"
          : cLower.includes("reservat") || cLower.includes("caixa")
          ? "RESERVATÓRIO E ABASTECIMENTO DE ÁGUA"
          : "INSTALAÇÕES HIDRÁULICAS";

      if (cLower.includes("poço") || cLower.includes("poco")) {
        addStageItem(
          stageName,
          "Executar manutenção e adequação da rede de recalque e interligação do poço tubular da unidade escolar."
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
          "Executar adequação da tubulação e conexões de distribuição de água fria."
        );
      }
    }

    // --- CALÇADAS / PASSEIO / ACESSO / DRENAGEM (Mentalidade Engenheiro Civil Master) ---
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
        if (cLower.includes("danific") || cLower.includes("recuper") || cLower.includes("quebrad") || cLower.includes("demoli")) {
          addStageItem(
            "PISOS E CALÇADAS",
            "Executar demolição e remoção de placas de concreto danificadas das calçadas com regularização e compactação do subleito."
          );
          addStageItem(
            "PISOS E CALÇADAS",
            "Executar lançamento de lastro de brita e concretagem de novo piso para calçadas com acabamento desempenado e juntas de dilatação."
          );
        } else {
          addStageItem(
            "CALÇADAS",
            `Executar construção e recomposição de calçadas em concreto desempenado${locText}, com regularização da base e juntas de dilatação.`
          );
        }
      }
      if (cLower.includes("rampa") || cLower.includes("acessibilidade")) {
        addStageItem(
          "CALÇADAS",
          "Executar adequação de rampa de acessibilidade com piso tátil e acabamento antiderrapante."
        );
      }
      if (cLower.includes("drenagem") || cLower.includes("canaleta") || cLower.includes("grelha")) {
        addStageItem(
          "DRENAGEM",
          "Executar canaleta de drenagem pluvial com grelha para escoamento de águas superficiais."
        );
      }
    }

    // --- PISOS / CONTRAPISO / REVESTIMENTO FORA DE BANHEIRO ---
    if (
      ((cLower.includes("piso") && !cLower.includes("pintar") && !cLower.includes("pintura")) ||
        cLower.includes("contrapiso") ||
        cLower.includes("lajota") ||
        cLower.includes("porcelanato") ||
        (cLower.includes("revestimento") && !cLower.includes("banheiro")))
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " nos ambientes indicados";
      if (cLower.includes("quebrado") || cLower.includes("recuper") || cLower.includes("danific") || cLower.includes("reparo")) {
        addStageItem(
          "PISOS E REVESTIMENTOS",
          `Recuperar os trechos de piso quebrado${locText}, com demolição das partes soltas, regularização de contrapiso e recomposição do acabamento.`
        );
      } else if (cLower.includes("cerâmic") || cLower.includes("ceramic") || cLower.includes("porcelanato")) {
        addStageItem(
          "PISOS E REVESTIMENTOS",
          `Executar assentamento de revestimento cerâmico${locText}, incluindo argamassa colante e rejuntamento.`
        );
      } else {
        addStageItem(
          "PISOS E REVESTIMENTOS",
          `Executar regularização e recomposição de piso${locText} para nivelamento da superfície.`
        );
      }
    }

    // --- FORROS ---
    if ((cLower.includes("forro") || cLower.includes("pvc") || cLower.includes("gesso")) && !cLower.includes("banheiro")) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " nas salas de aula e ambientes solicitados";
      addStageItem(
        "FORROS",
        `Executar instalação e recomposição de forro${locText}, incluindo estrutura de fixação e acabamento perimetral.`
      );
    }

    // --- ELÉTRICA / ILUMINAÇÃO / QUADROS / TOMADAS ---
    if (
      cLower.includes("elétrica") ||
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
      cLower.includes("cabo")
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " da unidade escolar";
      if (cLower.includes("lumin") || cLower.includes("ilumina") || cLower.includes("led") || cLower.includes("lâmpada") || cLower.includes("lampada")) {
        addStageItem(
          "ELÉTRICA",
          `Fornecer e instalar luminárias de LED${locText}, com revisão dos pontos de comando e circuitos de iluminação.`
        );
      }
      if (cLower.includes("tomada") || cLower.includes("interruptor")) {
        addStageItem(
          "ELÉTRICA",
          `Substituir tomadas e interruptores danificados${locText}, incluindo espelhos e conexões elétricas.`
        );
      }
      if (cLower.includes("quadro") || cLower.includes("disjuntor")) {
        addStageItem(
          "ELÉTRICA",
          `Executar adequação do quadro de distribuição elétrica${locText}, com substituição de disjuntores e identificação dos circuitos.`
        );
      }
      if (
        !cLower.includes("lumin") &&
        !cLower.includes("ilumina") &&
        !cLower.includes("tomada") &&
        !cLower.includes("interruptor") &&
        !cLower.includes("quadro") &&
        !cLower.includes("disjuntor")
      ) {
        addStageItem(
          "ELÉTRICA",
          `Executar revisão das instalações elétricas${locText}, com correção de pontos inoperantes e substituição de componentes danificados.`
        );
      }
    }

    // --- PINTURA (Especificidade de Materiais por Substrato: Piso/Quadra vs. Metálica vs. Alvenaria) ---
    if (cLower.includes("pintura") || cLower.includes("pintar") || cLower.includes("tinta") || cLower.includes("caiação")) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " das áreas solicitadas da unidade escolar";
      if (cLower.includes("piso") || cLower.includes("quadra")) {
        addStageItem(
          "PINTURA",
          "Executar limpeza e lavagem mecanizada da superfície do piso seguida de tratamento de fissuras e patologias."
        );
        addStageItem(
          "PINTURA",
          "Aplicar selador acrílico e pintura em tinta de alta resistência ao tráfego e intempéries para pisos e quadras esportivas."
        );
      } else if (cLower.includes("grade") || cLower.includes("portão") || cLower.includes("portao") || cLower.includes("metálic") || cLower.includes("metalic") || cLower.includes("esquadria")) {
        addStageItem(
          "PINTURA",
          "Executar lixamento, remoção de oxidação e aplicação de fundo anticorrosivo em zarcão nas superfícies metálicas."
        );
        addStageItem(
          "PINTURA",
          "Aplicar pintura em tinta esmalte sintético em duas demãos nas esquadrias e elementos metálicos."
        );
      } else {
        addStageItem(
          "PINTURA",
          `Executar pintura acrílica nas superfícies${locText}, com preparo de base, emassamento pontual e aplicação de duas demãos.`
        );
      }
    }

    // --- COZINHA ---
    if (cLower.includes("cozinha") || cLower.includes("casa de gás") || cLower.includes("casa de gas") || cLower.includes("exaustor") || cLower.includes("bancada")) {
      matchedInClause = true;
      if (cLower.includes("gás") || cLower.includes("gas")) {
        addStageItem(
          "COZINHA",
          "Executar construção de abrigo externo para GLP (casa de gás) com portinhola ventilada e tubulação de interligação."
        );
      }
      if (cLower.includes("exaustor") || cLower.includes("coifa")) {
        addStageItem(
          "COZINHA",
          "Fornecer e instalar exaustor na cozinha para renovação de ar e exaustão térmica."
        );
      }
      if (cLower.includes("bancada") || cLower.includes("pia")) {
        addStageItem(
          "COZINHA",
          "Executar adequação de bancada e pia da cozinha com revestimento cerâmico e sifonamento."
        );
      }
    }

    // --- ESQUADRIAS / PORTAS / JANELAS / GRADES ---
    if (
      (cLower.includes("porta") || cLower.includes("janela") || cLower.includes("esquadria") || cLower.includes("fechadura") || cLower.includes("grade") || cLower.includes("portão") || cLower.includes("portao")) &&
      !cLower.includes("banheiro")
    ) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " da unidade escolar";
      addStageItem(
        "ESQUADRIAS E FERRAGENS",
        `Executar revisão e substituição de esquadrias, fechaduras, dobradiças e ferragens danificadas${locText}.`
      );
    }

    // --- LIMPEZA PÓS-OBRA ---
    if (cLower.includes("limpeza") || cLower.includes("entulho") || cLower.includes("bota-fora")) {
      matchedInClause = true;
      addStageItem(
        "SERVIÇOS DE PÓS-OBRA E LIMPEZA FINAL",
        "Executar limpeza geral pós-obra com remoção de entulhos e resíduos gerados."
      );
    }

    // --- CLÁUSULA CUSTOMIZADA LIVRE (qualquer outro serviço específico pedido pelo usuário) ---
    if (!matchedInClause && clause.length > 3) {
      const customVerbStart = /^(executar|fornecer|substituir|recuperar|instalar|construir|demolir|reformar|adequar|aplicar)/i.test(clause);
      const customDesc = customVerbStart
        ? normalizeSentenceCase(clause)
        : normalizeSentenceCase(`Executar ${clause.charAt(0).toLowerCase() + clause.slice(1)}`);
      const customStageTitle = loc ? loc.replace(/^(do|da|dos|das)\s+/i, "").toUpperCase() : "SERVIÇOS ESPECÍFICOS";
      addStageItem(customStageTitle, customDesc);
    }
  }

  // Se houver demolição/recuperação de calçada ou piso com geração de resíduos, garante etapa de pós-obra
  if (
    (normalized.includes("danificad") || normalized.includes("demoli") || normalized.includes("quebrad")) &&
    (normalized.includes("calçada") || normalized.includes("calcada") || normalized.includes("quadra")) &&
    !stagesMap.has("SERVIÇOS DE PÓS-OBRA E LIMPEZA FINAL") &&
    !stagesMap.has("LIMPEZA FINAL")
  ) {
    addStageItem(
      "SERVIÇOS DE PÓS-OBRA E LIMPEZA FINAL",
      "Executar limpeza geral pós-obra com remoção de entulhos e resíduos gerados."
    );
  }

  const finalStages = Array.from(stagesMap.values());
  return enforceMandatoryScopeAutomations(finalStages, userInput);
}

// ----------------------------------------------------------------------------
// Formata as etapas no Padrão Oficial SEDUC-PI:
// 1. COBERTURA
// Executar substituição e retelhamento pontual na cobertura do pátio...
// ----------------------------------------------------------------------------
export function formatStagesToSpreadsheetText(stages: DescritivoStage[]): string {
  const blocks: string[] = [];
  stages.forEach((stg, idx) => {
    const cleanTitle = stg.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    const numberedHeader = `${idx + 1}. ${cleanTitle}`;
    const lines: string[] = [`### ${numberedHeader}`];
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
  const contextMessage = `
DADOS DO PROJETO ATUAL:
- Unidade Escolar / Imóvel: ${metadata.propertyId || metadata.schoolName || metadata.projectName}
- Município: ${metadata.city} / ${metadata.uf || "PI"}
- Órgão: ${metadata.organization || "Secretaria da Educação / GPR"}
- Finalidade: ${metadata.purpose || metadata.objectDescription}

ESTADO ATUAL DO MEMORIAL:
${formatStagesToSpreadsheetText(currentStages) || "Nenhum serviço registrado anteriormente."}

NOVA DEMANDA DO USUÁRIO (Texto / Áudio):
"${userInput}"
`;

  try {
    let rawText = "";

    // 1. Tenta primeiro via Rota Segura de Backend (/api/gemini) usando GEMINI_API_KEY do .env e gemini-2.5-flash
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
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
