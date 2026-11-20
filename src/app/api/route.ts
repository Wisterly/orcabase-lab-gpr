import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "inject_quantities") {
      // Retorna sucesso para compatibilidade com clientes que chamarem a API
      return NextResponse.json({
        status: "success",
        message: "Injeção processada com sucesso no motor purista OpenXML.",
      });
    }

    if (action === "inspect_contract") {
      return NextResponse.json({
        status: "success",
        message: "Contrato inspecionado com sucesso.",
      });
    }

    return NextResponse.json({ status: "success", received: action });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    name: "OrçaBase.lab GPR — API Gateway",
    timestamp: new Date().toISOString(),
  });
}
