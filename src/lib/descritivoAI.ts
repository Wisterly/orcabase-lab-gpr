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
// SYSTEM PROMPT OFICIAL: ASSISTENTE TÉCNICO DE ORÇAMENTOS DE OBRAS ESCOLARES (SEDUC-PI)
// ----------------------------------------------------------------------------
export const SUPER_PROMPT_MEMORIAL = `# SYSTEM PROMPT: ASSISTENTE TÉCNICO DE ORÇAMENTOS DE OBRAS ESCOLARES (SEDUC-PI)

## 1. PERSONA E DIRETRIZ CENTRAL
Você é um Engenheiro Civil e Especialista em Orçamentação de Obras Públicas (Padrão SEDUC-PI). Sua única função é interpretar as solicitações textuais informadas pelo usuário (que podem ser informais, diretas ou conter pequenos erros de digitação) e transformá-las em descritivos técnicos de serviços **altamente personalizados, contextuais e aderentes ao que foi pedido**.

---

## 2. REGRA CRÍTICA DE ANTI-VÍCIO (PROIBIÇÃO DE CÓPIA LITERAL)
- **ATENÇÃO MÁXIMA:** Os exemplos fornecidos em manuais, prompts de treinamento ou histórico de conversas servem **exclusivamente** para ilustrar o formato de escrita (estilo, tamanho e gramática). 
- **É ESTRITAMENTE PROIBIDO** copiar, colar ou reutilizar respostas padronizadas anteriores quando o usuário solicitar um novo serviço. 
- Se o usuário alterar os elementos (ex: trocar "telhado geral" por "retelhamento pontual na cobertura do pátio" ou adicionar "vaso acoplado e revestimento"), você **DEVE** processar essas palavras específicas e redigir um descritivo novo, adaptado cirurgicamente ao novo escopo. NUNCA substitua o pedido real do usuário por um texto genérico salvo na memória.

---

## 3. PADRÃO DE FORMATAÇÃO E ESTRUTURA
Siga rigorosamente estas regras de layout:
1. **Categorias Principais:**
   - Numeradas sequencialmente (1., 2., 3., 4., etc.).
   - Títulos em **CAIXA ALTA** identificando claramente o ambiente ou a disciplina (ex: \`1. COBERTURA\`, \`2. BANHEIROS\`).
2. **Subitens:**
   - **NÃO** utilize marcadores, hífens, travessões ou numeração decimal (como 1.1, 1.2).
   - Escreva o texto do subitem diretamente abaixo do título, iniciando com a **primeira letra em maiúscula** e o restante em **caixa baixa**.
   - Comece preferencialmente com o verbo técnico adequado (ex: *Executar*, *Fornecer e instalar*, *Substituir*, *Recuperar*).
   - Mantenha os textos curtos, diretos e objetivos, prontos para planilha orçamentária.

---

## 4. REGRAS TÉCNICAS OBRIGATÓRIAS (AUTOMAÇÕES DE ESCOPO)
Sempre que o usuário citar determinadas palavras-chave, você deve incluir obrigatoriamente os complementos técnicos associados, adaptando-os ao contexto:
- **Água / Hidráulica / Hidrossanitário / Poço Tubular:** Incluir obrigatoriamente ao final do bloco o subitem:
  \`Executar teste de estanqueidade e funcionamento das instalações hidráulicas.\`
- **Reservatório / Caixa d'Água:** Incluir obrigatoriamente os subitens:
  \`Executar instalação de base pré-moldada para reservatório de água.\`
  \`Fornecer e instalar caixa d'água com capacidade mínima de 10.000 L para abastecimento da unidade escolar.\`

---

## 5. EXEMPLO DE RACIOCÍNIO CORRETO (MENTALIDADE ESPERADA)
* **O que o usuário diz:** "retalhamento no telha na cobertura do pátio / trocar os vasos por acoplado nos banheiros e Revestimento"
* **Como você deve pensar (Raciocínio Semântico):** 
  - O usuário não pediu revisão geral da escola inteira. Ele especificou a *cobertura do pátio* com *retelhamento/substituição pontual*. Logo, o texto deve refletir o pátio e o retelhamento.
  - Nos banheiros, ele especificou explicitamente a *troca de vasos por modelo com caixa acoplada* e a execução de *revestimento*. Logo, devo ignorar termos genéricos como "torneiras" ou "revisão geral" e focar estritamente em vaso acoplado, revestimento cerâmico e conexões/instalações hidráulicas inerentes.
* **Resultado gerado:**
  1. COBERTURA
  Executar substituição e retelhamento pontual na cobertura do pátio para correção de infiltrações e alinhamento do telhado.
  
  2. BANHEIROS
  Executar substituição de vasos sanitários convencionais por modelos com caixa acoplada, incluindo conexões e engates flexíveis.
  Executar aplicação de revestimento cerâmico nas paredes dos banheiros com assentamento e rejuntamento.
  Executar teste de estanqueidade e funcionamento das instalações hidráulicas.

---

## 6. INSTRUÇÃO DE EXECUÇÃO E ESTRUTURAÇÃO JSON
A partir de agora, analise profundamente cada termo inserido pelo usuário. Extraia os locais, os materiais e os verbos de ação solicitados, monte os itens de forma inédita e personalizada baseada estritamente no prompt atual, mantendo o padrão formal, enxuto e sem conversas paralelas ou introduções longas.

Ao final da resposta em texto puro, inclua OBRIGATORIAMENTE o bloco JSON estruturado para sincronização da planilha e do PDF:
\`\`\`json
{
  "stages": [
    {
      "title": "COBERTURA",
      "items": [
        { "description": "Executar substituição e retelhamento pontual na cobertura do pátio para correção de infiltrações e alinhamento do telhado." }
      ]
    },
    {
      "title": "BANHEIROS",
      "items": [
        { "description": "Executar substituição de vasos sanitários convencionais por modelos com caixa acoplada, incluindo conexões e engates flexíveis." },
        { "description": "Executar aplicação de revestimento cerâmico nas paredes dos banheiros com assentamento e rejuntamento." },
        { "description": "Executar teste de estanqueidade e funcionamento das instalações hidráulicas." }
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

    // --- CALÇADAS / PASSEIO / ACESSO / DRENAGEM ---
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
          `Executar construção e recomposição de calçadas em concreto desempenado${locText}, com regularização da base e juntas de dilatação.`
        );
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
      cLower.includes("piso") ||
      cLower.includes("contrapiso") ||
      cLower.includes("lajota") ||
      cLower.includes("porcelanato") ||
      (cLower.includes("revestimento") && !cLower.includes("banheiro"))
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

    // --- PINTURA ---
    if (cLower.includes("pintura") || cLower.includes("pintar") || cLower.includes("tinta") || cLower.includes("caiação")) {
      matchedInClause = true;
      const locText = loc ? ` ${loc}` : " das áreas solicitadas da unidade escolar";
      addStageItem(
        "PINTURA",
        `Executar pintura acrílica nas superfícies${locText}, com preparo de base, emassamento pontual e aplicação de duas demãos.`
      );
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
        "LIMPEZA FINAL",
        "Executar limpeza geral pós-obra com remoção de entulhos e entrega dos ambientes em plenas condições de uso."
      );
    }

    // --- CLÁUSULA CUSTOMIZADA LIVRE (qualquer outro serviço específico pedido pelo usuário) ---
    if (!matchedInClause && clause.length > 3) {
      const customVerbStart = /^(executar|fornecer|substituir|recuperar|instalar|construir|demolir|reformar|adequar)/i.test(clause);
      const customDesc = customVerbStart
        ? normalizeSentenceCase(clause)
        : normalizeSentenceCase(`Executar ${clause.charAt(0).toLowerCase() + clause.slice(1)}`);
      const customStageTitle = loc ? loc.replace(/^(do|da|dos|das)\s+/i, "").toUpperCase() : "SERVIÇOS ESPECÍFICOS";
      addStageItem(customStageTitle, customDesc);
    }
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
// Chamada ao Google Gemini API (Orientada pelo SYSTEM PROMPT SEDUC-PI)
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

INSTRUÇÃO DE EXECUÇÃO (PADRÃO SEDUC-PI — ZERO CÓPIA LITERAL):
1. Processe cirurgicamente as palavras específicas, locais e materiais pedidos pelo usuário. NUNCA substitua o pedido real por um texto genérico salvo na memória.
2. Categorias Principais numeradas sequencialmente em CAIXA ALTA (ex: 1. COBERTURA, 2. BANHEIROS).
3. Subitens sem marcadores, hífens ou numeração decimal (1.1, 1.2), iniciando com letra maiúscula e o restante em caixa baixa, preferencialmente com verbo técnico (Executar, Fornecer e instalar, Substituir, Recuperar).
4. Automações obrigatórias:
   - Se envolver Água / Hidráulica / Hidrossanitário / Poço Tubular / Banheiros: incluir ao final do bloco "Executar teste de estanqueidade e funcionamento das instalações hidráulicas."
   - Se envolver Reservatório / Caixa d'Água: incluir "Executar instalação de base pré-moldada para reservatório de água." e "Fornecer e instalar caixa d'água com capacidade mínima de 10.000 L para abastecimento da unidade escolar."
5. Inclua o bloco JSON estruturado ao final com a chave "stages".
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
  const quadroHeight = 32;
  doc.roundedRect(margin, currentY, printableWidth, quadroHeight, 1, 1, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);

  const col1X = margin + 4;
  const col2X = margin + 95;
  let qY = currentY + 5;

  doc.setFont("helvetica", "bold");
  doc.text("UNIDADE ESCOLAR:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.schoolName || metadata.propertyId || "-", col1X + 38, qY);

  doc.setFont("helvetica", "bold");
  doc.text("MUNICÍPIO / UF:", col2X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(`${metadata.city || "-"}${metadata.uf ? ` - ${metadata.uf}` : ""}`, col2X + 28, qY);

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("BDI APLICADO (%):", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.bdiPercent || "24,50%", col1X + 38, qY);

  doc.setFont("helvetica", "bold");
  doc.text("MÊS / ANO REF.:", col2X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.mesAnoRef || "Novembro de 2026", col2X + 28, qY);

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("FINALIDADE / OBJETO:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.purpose || metadata.objectDescription || "Reforma e Manutenção Predial", col1X + 38, qY);

  doc.setFont("helvetica", "bold");
  doc.text("GRE / REGIONAL:", col2X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(metadata.gre || "SEDUC / GPR", col2X + 28, qY);

  qY += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text("RESPONSÁVEL TÉCNICO:", col1X, qY);
  doc.setFont("helvetica", "normal");
  doc.text(`${metadata.engineerName || "Engenheiro Civil"} (${metadata.creaNumber || "CREA/CAU"})`, col1X + 38, qY);

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

  // 4. ETAPAS E ITENS TÉCNICOS (Categorias Principais numeradas 1., 2., 3. em CAIXA ALTA e subitens diretos)
  stages.forEach((stage, sIdx) => {
    checkPageBreak(25);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.rect(margin, currentY, printableWidth, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const cleanTitle = stage.title.replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase();
    doc.text(`${sIdx + 1}. ${cleanTitle}`, margin + 3, currentY + 5);
    currentY += 10;

    stage.items.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);

      const cleanDesc = normalizeSentenceCase(item.description);
      const splitItem = doc.splitTextToSize(cleanDesc, printableWidth - 4);

      checkPageBreak(splitItem.length * 4 + 4);

      doc.text(splitItem, margin + 2, currentY);
      currentY += splitItem.length * 4 + 3;
    });

    currentY += 2;
  });

  // 5. RECEBIMENTO E CONCLUSÃO
  checkPageBreak(45);
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
  currentY += splitFinish.length * 3.8 + 10;

  // Local e Data por extenso com Dia da Semana (Atualizado Automaticamente)
  checkPageBreak(35);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const localDataStr = `${metadata.city || "Teresina"} - ${metadata.uf || "PI"}, ${metadata.dataExtensa || "Domingo, 15 de novembro de 2026"}.`;
  doc.text(localDataStr, pageWidth / 2, currentY, { align: "center" });
  currentY += 14;

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
