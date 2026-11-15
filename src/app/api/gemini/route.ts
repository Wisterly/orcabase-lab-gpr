import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// ROTA SEGURA DE BACKEND NEXT.JS (/api/gemini) — ENGENHEIRO CIVIL MASTER (V2)
// Utiliza a variável de ambiente GEMINI_API_KEY do arquivo .env no servidor
// e injeta o SYSTEM_PROMPT_COMPLETO com model="gemini-2.5-flash" e temperature=0.2
// ============================================================================

const SYSTEM_PROMPT_COMPLETO = `# SYSTEM PROMPT: ENGENHEIRO CIVIL MASTER & ORÇAMENTISTA (PADRÃO SEDUC-PI)

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
