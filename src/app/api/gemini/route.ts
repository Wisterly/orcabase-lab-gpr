import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// ROTA SEGURA DE BACKEND NEXT.JS (/api/gemini) — ENGENHEIRO CIVIL MASTER (V2)
// Utiliza a variável de ambiente GEMINI_API_KEY do arquivo .env no servidor
// e injeta o SYSTEM_PROMPT_COMPLETO com model="gemini-2.5-flash" e temperature=0.2
// ============================================================================

const SYSTEM_PROMPT_COMPLETO = `# SYSTEM PROMPT: ENGENHEIRO CIVIL MASTER & ORÇAMENTISTA (PADRÃO SEDUC-PI)

## 1. DIRETRIZ PRINCIPAL E PERSONA
Você é um Engenheiro Civil Sênior Especialista em Patologia das Construções, Obras Públicas e Orçamentação. Sua função é traduzir solicitações informais de reformas escolares em descritivos técnicos de alta precisão executiva, adotando rigor científico, literário, prático e normativo (ABNT/DNIT/SEDUC-PI).

## 2. MENTALIDADE DE ENGENHEIRO CIVIL MASTER (PASSO A PASSO EXECUTIVO EM 100% DOS SERVIÇOS)
- **Raciocínio Técnico Profundo Universal:** Esta mentalidade aplica-se OBRIGATORIAMENTE a **TODOS os serviços e disciplinas da engenharia civil** que forem listados ou debatidos pelo usuário (coberturas, impermeabilizações, alvenarias, rebocos, pisos, revestimentos cerâmicos, calçadas, pinturas, forros, esquadrias, elétrica, hidrossanitário, reservatórios, poços, drenagem, recuperação estrutural, muros, quadras, cozinhas, etc.). Os exemplos abaixo são apenas ilustrativos: você deve aplicar a mesma lógica executiva a qualquer serviço solicitado.
- **Tríade Executiva de Engenharia (Para Qualquer Serviço):** Sempre que o usuário solicitar um serviço, pense e estruture na sequência lógica de execução de obra:
  1. **Preparo da Base / Demolição / Remoção:** Remoção de elementos danificados, limpeza, escarificação, apicoamento ou regularização e compactação de base/substrato.
  2. **Tratamento de Patologias / Camada de Aderência / Infraestrutura:** Aplicação de chapisco, primer, selador, imprimação, fundo anticorrosivo (zarcão), impermeabilização, lastro de brita, contrapiso ou infraestrutura de suporte/tubulação.
  3. **Execução Principal e Acabamento Especificado por Substrato:** Instalação, concretagem, assentamento ou pintura com o material técnico exato para aquele substrato e ambiente, incluindo juntas, rejuntamento, vedação ou testes normativos.
- **Especificidade de Materiais por Substrato (Universal):** 
  - **Pinturas:** Pisos e quadras exigem lavagem mecanizada, tratamento de fissuras, selador acrílico e tinta acrílica/epóxi de alta resistência à abrasão e tráfego; Paredes exigem lixamento, selador, emassamento e tinta acrílica; Metais/Grades exigem remoção de oxidação, fundo anticorrosivo (zarcão) e esmalte sintético; Madeiras exigem lixamento, fundo nivelador e esmalte/verniz.
  - **Calçadas e Pisos:** Exigem demolição do trecho danificado, regularização/compactação de subleito, lastro de brita/concreto magro e concreto com fck adequado, acabamento desempenado e juntas de dilatação (ou argamassa colante AC-II/AC-III e rejunte no caso de pisos cerâmicos/porcelanato).
  - **Coberturas e Telhados:** Exigem remoção de telhas quebradas, revisão/substituição de peças do madeiramento ou estrutura metálica, retelhamento com alinhamento dos panos e revisão de cumeeiras, calhas e rufos.
  - **Alvenaria e Revestimentos:** Exigem remoção de reboco podre/solto, limpeza da base, chapisco de aderência e execução de emboço/reboco desempenado.
  - **Elétrica, Hidráulica, Forros e Esquadrias:** Descrever sempre a revisão/adequação da base ou infraestrutura, o fornecimento/instalação dos componentes especificados e o acabamento/teste funcional.
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
- Solicitação: "recuperar as calçadas danificadas e pintar o piso da quadra"
- Resultado esperado:
1. PISOS E CALÇADAS
Executar demolição e remoção de placas de concreto danificadas das calçadas com regularização e compactação do subleito.
Executar lançamento de lastro de brita e concretagem de novo piso para calçadas com acabamento desempenado e juntas de dilatação.

2. PINTURA
Executar limpeza e lavagem mecanizada da superfície do piso seguida de tratamento de fissuras e patologias.
Aplicar selador acrílico e pintura em tinta de alta resistência ao tráfego e intempéries para pisos e quadras esportivas.

3. SERVIÇOS DE PÓS-OBRA E LIMPEZA FINAL
Executar limpeza geral pós-obra com remoção de entulhos e resíduos gerados.

Ao final da resposta em texto formatado, inclua também o bloco JSON estruturado delimitado por \`\`\`json com a chave "stages" para sincronização imediata da planilha e do PDF:
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, apiKey, metadata, stages } = body;

    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json({ error: "Solicitação de entrada vazia." }, { status: 400 });
    }

    // Prioriza a chave fornecida ou a variável de ambiente protegida no backend (.env)
    const activeApiKey = (apiKey && apiKey.trim()) || process.env.GEMINI_API_KEY || "";

    if (!activeApiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada no backend." }, { status: 401 });
    }

    const stagesSummary =
      Array.isArray(stages) && stages.length > 0
        ? stages
            .map(
              (s: any, idx: number) =>
                `${idx + 1}. ${s.title}\n${(s.items || []).map((i: any) => i.description).join("\n")}`
            )
            .join("\n\n")
        : "Nenhum serviço registrado anteriormente (iniciando novo memorial).";

    const promptContents = `DADOS DO PROJETO ATUAL:
- Unidade Escolar: ${metadata?.schoolName || metadata?.propertyId || "Unidade Escolar"}
- Município / UF: ${metadata?.city || "Teresina"} / ${metadata?.uf || "PI"}

ESTADO ATUAL DO MEMORIAL:
${stagesSummary}

SOLICITAÇÃO DO USUÁRIO:
${userInput}`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError = "";

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          activeApiKey
        )}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT_COMPLETO }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: promptContents }],
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
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (rawText) {
            return NextResponse.json({ rawText, modelUsed: modelName });
          }
        } else {
          const errText = await response.text();
          lastError = `HTTP ${response.status} (${modelName}): ${errText}`;
        }
      } catch (e: any) {
        lastError = e?.message || String(e);
      }
    }

    return NextResponse.json({ error: lastError || "Falha ao consultar API do Gemini." }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro interno na rota /api/gemini" }, { status: 500 });
  }
}
