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

ESTADO ATUAL DO MEMORIAL (Contexto Acumulado):
${formatStagesToSpreadsheetText(stages) || "Nenhum serviço registrado anteriormente."}

NOVA DEMANDA DO USUÁRIO (Texto / Áudio Transcrito):
"${userInput || ""}"

INSTRUÇÃO:
Analise a nova demanda com a metodologia técnica de Engenheiro Sênior de Infraestrutura Escolar da SEDUC/GPR.
Incorpore, altere ou exclua os serviços no memorial existente e apresente o DESCRITIVO COMPLETO, CONSOLIDADO E ATUALIZADO no padrão obrigatório:
1. Títulos em CAIXA ALTA e sem numeração.
2. Todo serviço de natureza elétrica ou iluminação no grupo único chamado exatamente ELÉTRICA.
3. Cada serviço em uma linha independente, iniciando preferencialmente com "Executar" ou "Fornecer e instalar".
4. Sem marcadores, traços (-), asteriscos ou bolinhas no início das linhas.
5. Sem linhas em branco entre serviços do mesmo grupo.
6. Não inventar marcas, materiais, capacidades ou dimensões não informadas.
7. Incluir no final o bloco JSON estruturado com a chave "stages".
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
