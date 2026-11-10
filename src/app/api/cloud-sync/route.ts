import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const REPO = "Wisterly/orcabase-lab-gpr";
const REF_PATH = "cloud-sync/state";

export interface CloudSyncState {
  version: number;
  updatedAt: string;
  contracts: any[];
  contractBinaryChunks: Record<string, string[]>;
  appSettings: {
    selectedContractId?: string;
    calcStrategy?: string;
    customKeywords?: {
      descKeyword?: string;
      unitKeyword?: string;
      qtyKeyword?: string;
      totalKeyword?: string;
    };
  };
  memorialTemplate?: {
    meta: any | null;
    chunks?: string[];
  };
}

function getFallbackInitialState(): CloudSyncState {
  let defaultContracts: any[] = [];
  try {
    const p = path.join(process.cwd(), "public/contracts-base/default_contracts.json");
    if (fs.existsSync(p)) {
      defaultContracts = JSON.parse(fs.readFileSync(p, "utf8"));
    }
  } catch {}

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    contracts: defaultContracts,
    contractBinaryChunks: {
      "ct-1793483100060": ["STATIC:/contracts-base/ct-1793483100060.xlsx"],
      "ct-1794106333065": ["STATIC:/contracts-base/ct-1794106333065.xlsm"],
      "ct-1794115127068": ["STATIC:/contracts-base/ct-1794115127068.xlsx"],
      "ct-1794115257721": ["STATIC:/contracts-base/ct-1794115257721.xlsx"],
    },
    appSettings: {
      selectedContractId: "ct-1794106333065",
      calcStrategy: "KEEP_TOTAL_VALUE",
      customKeywords: {
        descKeyword: "Descrição, Composição, Discriminação, Especificação, Serviço",
        unitKeyword: "Unidade, Unid., Und, Un",
        qtyKeyword: "Quantitativo, Quantidade, Quant., Qtd, Qtde",
        totalKeyword: "Total Geral, Valor Total, Total do Orçamento",
      },
    },
    memorialTemplate: {
      meta: null,
      chunks: [],
    },
  };
}

async function ghRequest(endpoint: string, method: string = "GET", body?: any) {
  const token = process.env.GITHUB_CLOUD_SYNC_TOKEN;
  if (!token) {
    throw new Error("GITHUB_CLOUD_SYNC_TOKEN ausente");
  }
  const res = await fetch(`https://api.github.com/repos/${REPO}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${endpoint} (${res.status}): ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function readCloudStateFromGitHub(): Promise<{
  state: CloudSyncState;
  treeSha: string;
}> {
  try {
    const refData = await ghRequest(`/git/ref/${REF_PATH}`);
    const commitSha = refData.object.sha;
    const commitData = await ghRequest(`/git/commits/${commitSha}`);
    const meta = JSON.parse(commitData.message);
    const blobData = await ghRequest(`/git/blobs/${meta.stateBlobSha}`);
    const decoded = Buffer.from(blobData.content, "base64").toString("utf8");
    const state = JSON.parse(decoded) as CloudSyncState;
    return {
      state,
      treeSha: meta.treeSha || commitData.tree.sha,
    };
  } catch {
    const mainRef = await ghRequest("/git/ref/heads/main");
    const mainCommit = await ghRequest(`/git/commits/${mainRef.object.sha}`);
    return {
      state: getFallbackInitialState(),
      treeSha: mainCommit.tree.sha,
    };
  }
}

async function writeCloudStateToGitHub(state: CloudSyncState, treeSha: string): Promise<void> {
  state.version = (state.version || 1) + 1;
  state.updatedAt = new Date().toISOString();

  const blob = await ghRequest("/git/blobs", "POST", {
    content: JSON.stringify(state),
    encoding: "utf-8",
  });

  const commit = await ghRequest("/git/commits", "POST", {
    message: JSON.stringify({
      stateBlobSha: blob.sha,
      treeSha,
      updatedAt: state.updatedAt,
    }),
    tree: treeSha,
    parents: [],
  });

  try {
    await ghRequest(`/git/refs/${REF_PATH}`, "PATCH", {
      sha: commit.sha,
      force: true,
    });
  } catch {
    await ghRequest("/git/refs", "POST", {
      ref: `refs/${REF_PATH}`,
      sha: commit.sha,
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "get_state";

  try {
    if (action === "get_chunk") {
      const sha = searchParams.get("sha");
      if (!sha) {
        return NextResponse.json({ error: "Parâmetro sha obrigatório" }, { status: 400 });
      }
      const blobData = await ghRequest(`/git/blobs/${sha}`);
      const chunk = Buffer.from(blobData.content, "base64").toString("utf8");
      return NextResponse.json(
        { ok: true, chunk },
        { headers: { "Cache-Control": "public, max-age=31536000, immutable" } }
      );
    }

    // Default: get_state
    if (!process.env.GITHUB_CLOUD_SYNC_TOKEN) {
      return NextResponse.json(
        { ok: true, state: getFallbackInitialState(), mode: "static-fallback" },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const { state } = await readCloudStateFromGitHub();
    return NextResponse.json(
      { ok: true, state, mode: "cloud-github" },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    console.error("Erro no GET /api/cloud-sync:", err);
    return NextResponse.json(
      { ok: true, state: getFallbackInitialState(), mode: "error-fallback", error: err?.message },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (!process.env.GITHUB_CLOUD_SYNC_TOKEN) {
      return NextResponse.json({
        ok: false,
        reason: "GITHUB_CLOUD_SYNC_TOKEN não configurado neste ambiente local",
      });
    }

    if (action === "upload_chunk") {
      const chunk: string = body.chunk;
      if (!chunk || typeof chunk !== "string") {
        return NextResponse.json({ error: "Chunk inválido" }, { status: 400 });
      }
      const blob = await ghRequest("/git/blobs", "POST", {
        content: chunk,
        encoding: "utf-8",
      });
      return NextResponse.json({ ok: true, sha: blob.sha });
    }

    if (action === "save_state") {
      const { state: currentState, treeSha } = await readCloudStateFromGitHub();

      // 1. Atualiza lista de contratos (sempre sem rawWorkbookBase64 embutido no JSON principal)
      if (Array.isArray(body.contracts)) {
        currentState.contracts = body.contracts.map((c: any) => {
          const copy = { ...c };
          delete copy.rawWorkbookBase64;
          return copy;
        });
      }

      // 2. Faz upsert de um único card de contrato se enviado individualmente
      if (body.upsertContract && body.upsertContract.id) {
        const cleanCard = { ...body.upsertContract };
        delete cleanCard.rawWorkbookBase64;
        const existsIdx = currentState.contracts.findIndex((c: any) => c.id === cleanCard.id);
        if (existsIdx >= 0) {
          currentState.contracts[existsIdx] = cleanCard;
        } else {
          currentState.contracts = [cleanCard, ...currentState.contracts];
        }
      }

      // 3. Registra chunks de binário de contrato (.xlsx/.xlsm)
      if (body.upsertContractBinary && body.upsertContractBinary.contractId) {
        const { contractId, chunks } = body.upsertContractBinary;
        if (!currentState.contractBinaryChunks) {
          currentState.contractBinaryChunks = {};
        }
        currentState.contractBinaryChunks[contractId] = chunks;
      }

      // 4. Remove contrato se solicitado
      if (body.deleteContractId) {
        currentState.contracts = currentState.contracts.filter(
          (c: any) => c.id !== body.deleteContractId
        );
        if (currentState.contractBinaryChunks) {
          delete currentState.contractBinaryChunks[body.deleteContractId];
        }
      }

      // 5. Atualiza configurações globais (selectedContractId, calcStrategy, customKeywords)
      if (body.appSettings && typeof body.appSettings === "object") {
        currentState.appSettings = {
          ...(currentState.appSettings || {}),
          ...body.appSettings,
        };
      }

      // 6. Atualiza Planilha Base do Memorial Descritivo (.xlsx com tags = AQUI)
      if (body.memorialTemplate !== undefined) {
        currentState.memorialTemplate = body.memorialTemplate;
      }

      await writeCloudStateToGitHub(currentState, treeSha);

      return NextResponse.json({
        ok: true,
        updatedAt: currentState.updatedAt,
        version: currentState.version,
        state: currentState,
      });
    }

    return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
  } catch (err: any) {
    console.error("Erro no POST /api/cloud-sync:", err);
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
