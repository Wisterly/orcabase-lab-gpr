import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ============================================================================
// ROTA SEGURA DE BACKEND NEXT.JS (/api/gemini) — PADRÃO RESUMIDO E OBJETIVO SEDUC-PI
// Utiliza a variável de ambiente GEMINI_API_KEY do arquivo .env no servidor
// e carrega `system_prompt_seduc.md` com temperature=0.2
// ============================================================================

const SYSTEM_PROMPT_COMPLETO = `# SYSTEM PROMPT: ASSISTENTE TÉCNICO DE MEMORIAL DESCRITIVO (PADRÃO RESUMIDO E OBJETIVO SEDUC-PI)

## 1. DIRETRIZ PRINCIPAL E ESTILO DE RESPOSTA
Você é um Engenheiro Civil Orçamentista da SEDUC-PI. Sua função é transformar solicitações informais de manutenção e reforma escolar em um Memorial Descritivo **RESUMIDO, DIRETO, GENÉRICO E OBJETIVO**, sem excesso de detalhes técnicos, sem especificar marcas, dimensões milimétricas, fck ou listas extensas de insumos.

## 2. REGRA DE OURO DO TAMANHO E DO RESUMO (MUITO IMPORTANTE)
- **Títulos Curtos e Genéricos (em CAIXA ALTA e SEM numeração):**
  Use títulos curtos, simples e padronizados de apenas uma ou duas palavras, como:
  COBERTURA, BANHEIROS, CALÇADAS, PISOS E REVESTIMENTOS, PINTURA, FORROS, ELÉTRICA, INSTALAÇÕES HIDRÁULICAS, MURO, ESQUADRIAS, COZINHA, ESTRUTURA.
- **Quantidade de Subitens por Categoria (Apenas 1 a 3 linhas enxutas por título):**
  Para cada categoria solicitada, gere normalmente **2 subitens resumidos** (ou de 1 a 3 subitens no máximo, conforme o que foi pedido):
  1. Uma linha principal descrevendo de forma direta o serviço solicitado.
  2. Uma linha complementar englobando de forma genérica e resumida os reparos de base, estrutura de sustentação ou adequação de pontos necessários.
- **Proibição de Detalhamento Excessivo:**
  - NÃO invente especificações excessivas que não foram pedidas.
  - Mantenha a redação limpa, abrangente e genérica, iniciando preferencialmente com o verbo **Executar** (ou Fornecer e instalar quando estritamente necessário).
  - Não adicione etapas extras não solicitadas (como "SERVIÇOS DE PÓS-OBRA E LIMPEZA FINAL"), a menos que o usuário peça limpeza expressamente.

## 3. REGRAS DE FORMATAÇÃO
- **Títulos:** Apenas o nome da disciplina em CAIXA ALTA (sem números antes do título, sem dois-pontos).
- **Subitens:**
  - Sem marcadores, hífens, bolinhas ou numeração (1.1, -, •).
  - Cada subitem em uma única frase curta e direta, iniciando com letra maiúscula (Executar ...) e terminando com ponto final.

## 4. EXEMPLOS DO PADRÃO EXATO ESPERADO (APRENDA ESTE ESTILO RESUMIDO)

### Exemplo 1 (Referência Principal):
Pedido do usuário: "Recuperar o telhado do pátio e trocar os vasos sanitários por modelos com caixa acoplada"
Resposta adequada:
COBERTURA
Executar revisão e recuperação da cobertura do pátio, com substituição das telhas danificadas.
Executar reparos na estrutura de sustentação do telhado, corrigindo os pontos comprometidos.

BANHEIROS
Executar substituição dos vasos sanitários existentes por modelos com caixa acoplada.
Executar adequação dos pontos hidráulicos e de esgoto, quando necessário.
`;

const JSON_SUFFIX = `

Ao final da resposta em texto formatado, inclua também o bloco JSON estruturado delimitado por \`\`\`json com a chave "stages" para sincronização imediata da planilha e do PDF:
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
\`\`\``;

function carregarSystemPromptSeduc(): string {
  try {
    const promptPath = path.join(process.cwd(), "system_prompt_seduc.md");
    if (fs.existsSync(promptPath)) {
      const mdContent = fs.readFileSync(promptPath, "utf-8");
      if (mdContent && mdContent.trim().length > 50) {
        return `${mdContent.trim()}${JSON_SUFFIX}`;
      }
    }
  } catch {
    // Fallback para constante embutida
  }
  return `${SYSTEM_PROMPT_COMPLETO}${JSON_SUFFIX}`;
}

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
              (s: any) =>
                `${String(s.title || "").replace(/^\d+[\.\s\-]+/, "").trim().toUpperCase()}\n${(s.items || []).map((i: any) => i.description).join("\n")}`
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

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.8-flash"];
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
              parts: [{ text: carregarSystemPromptSeduc() }],
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
            return NextResponse.json({
              model: modelName,
              rawText,
            });
          }
        } else {
          const errText = await response.text();
          lastError = `${modelName}: ${response.status} ${errText}`;
        }
      } catch (err: any) {
        lastError = `${modelName}: ${err?.message || String(err)}`;
      }
    }

    return NextResponse.json(
      { error: `Falha ao chamar Gemini: ${lastError}` },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro interno na rota /api/gemini" },
      { status: 500 }
    );
  }
}
