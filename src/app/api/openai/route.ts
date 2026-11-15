import { NextRequest, NextResponse } from "next/server";
import { SUPER_PROMPT_MEMORIAL, formatStagesToSpreadsheetText } from "@/lib/descritivoAI";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, apiKey, metadata = {}, stages = [], model = "gpt-4o-mini" } = body;

    const token = (apiKey || process.env.OPENAI_API_KEY || "").trim();
    if (!token) {
      return NextResponse.json(
        { error: "Chave da OpenAI (API Key) não fornecida. Insira sua chave sk-..." },
        { status: 400 }
      );
    }

    const contextMessage = `
DADOS DO PROJETO ATUAL:
- Unidade Escolar / Imóvel: ${metadata.propertyId || metadata.schoolName || metadata.projectName || "Não informado"}
- Município / UF: ${metadata.city || "São João do Piauí"} / ${metadata.uf || "PI"}
- Órgão: ${metadata.organization || "Secretaria da Educação / GPR"}
- Finalidade / Objeto: ${metadata.purpose || metadata.objectDescription || "Reforma e Manutenção da Unidade Escolar"}
- BDI da Obra (%): ${metadata.bdiPercent || "24,50%"}
- Mês/Ano Ref: ${metadata.mesAnoRef || "Novembro de 2026"}
- Data Extensa: ${metadata.dataExtensa || "Domingo, 8 de novembro de 2026"}

ESTADO ATUAL DO MEMORIAL:
${formatStagesToSpreadsheetText(stages) || "Nenhum serviço registrado anteriormente (Criando novo memorial do zero)."}

NOVA DEMANDA DO USUÁRIO (Texto / Áudio Transcrito):
"${userInput || ""}"

INSTRUÇÃO DE EXECUÇÃO (PADRÃO SEDUC-PI — ZERO CÓPIA LITERAL E ZERO SERVIÇOS FANTASMAS):
1. Processe cirurgicamente as palavras específicas, locais (ex: "na cobertura do pátio", "nos banheiros") e materiais/modelos (ex: "vaso acoplado", "revestimento") solicitados pelo usuário. NUNCA substitua o pedido real do usuário por um texto genérico salvo na memória e NUNCA inclua disciplinas que o usuário não pediu.
2. Categorias Principais numeradas sequencialmente (1., 2., 3., etc.) e em CAIXA ALTA (ex: 1. COBERTURA, 2. BANHEIROS).
3. Subitens sem marcadores, hífens, travessões ou numeração decimal (1.1, 1.2), iniciando com a primeira letra em maiúscula e o restante em caixa baixa, preferencialmente com o verbo técnico adequado (Executar, Fornecer e instalar, Substituir, Recuperar).
4. Regras Técnicas Obrigatórias (Automações de Escopo):
   - Água / Hidráulica / Hidrossanitário / Poço Tubular / Banheiros: Incluir obrigatoriamente ao final do bloco: "Executar teste de estanqueidade e funcionamento das instalações hidráulicas."
   - Reservatório / Caixa d'Água: Incluir obrigatoriamente os subitens: "Executar instalação de base pré-moldada para reservatório de água." e "Fornecer e instalar caixa d'água com capacidade mínima de 10.000 L para abastecimento da unidade escolar."
5. Incluir no final da resposta o bloco JSON estruturado delimitado por \`\`\`json contendo a chave "stages".
`;

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

    if (!openAiResponse.ok) {
      const errData = await openAiResponse.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `Erro HTTP ${openAiResponse.status} na API da OpenAI`;
      return NextResponse.json({ error: errMsg }, { status: openAiResponse.status });
    }

    const data = await openAiResponse.json();
    const rawText = data?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ rawText, model: model || "gpt-4o-mini" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar chamada com OpenAI" },
      { status: 500 }
    );
  }
}
