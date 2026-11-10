import { ContractBaseCard, CalculationStrategy } from "../types";
import {
  arrayBufferToBase64,
  getContractBinary,
  saveContractBinary,
} from "./excelEngine";
import { StoredTemplateMeta } from "./memorialExcelEngine";

const CHUNK_SIZE = 2_400_000; // ~2.4 MB por chunk (seguro abaixo do limite de 4.5 MB da Vercel)

export const BUILTIN_STATIC_CONTRACT_BINARIES: Record<string, string> = {
  "ct-1793483100060": "/contracts-base/ct-1793483100060.xlsx",
  "ct-1794106333065": "/contracts-base/ct-1794106333065.xlsm",
  "ct-1794115127068": "/contracts-base/ct-1794115127068.xlsx",
  "ct-1794115257721": "/contracts-base/ct-1794115257721.xlsx",
};

export interface CloudSyncStateClient {
  version: number;
  updatedAt: string;
  contracts: ContractBaseCard[];
  contractBinaryChunks: Record<string, string[]>;
  appSettings: {
    selectedContractId?: string;
    calcStrategy?: CalculationStrategy["mode"];
    customKeywords?: {
      descKeyword?: string;
      unitKeyword?: string;
      qtyKeyword?: string;
      totalKeyword?: string;
    };
  };
  memorialTemplate?: {
    meta: StoredTemplateMeta | null;
    chunks?: string[];
  };
}

let cachedBinaryChunksMap: Record<string, string[]> = {
  "ct-1793483100060": ["STATIC:/contracts-base/ct-1793483100060.xlsx"],
  "ct-1794106333065": ["STATIC:/contracts-base/ct-1794106333065.xlsm"],
  "ct-1794115127068": ["STATIC:/contracts-base/ct-1794115127068.xlsx"],
  "ct-1794115257721": ["STATIC:/contracts-base/ct-1794115257721.xlsx"],
};

/**
 * Busca os 4 contratos oficiais embutidos em `/contracts-base/default_contracts.json`
 */
export async function fetchStaticDefaultContracts(): Promise<ContractBaseCard[]> {
  try {
    const res = await fetch(`/contracts-base/default_contracts.json?_t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Busca o estado global sincronizado na nuvem (Contratos, Configurações e Planilha Base do Memorial).
 */
export async function fetchCloudState(): Promise<CloudSyncStateClient | null> {
  try {
    const res = await fetch(`/api/cloud-sync?action=get_state&_t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json && json.state) {
      if (json.state.contractBinaryChunks) {
        cachedBinaryChunksMap = {
          ...cachedBinaryChunksMap,
          ...json.state.contractBinaryChunks,
        };
      }
      return json.state as CloudSyncStateClient;
    }
  } catch (e) {
    console.warn("Aviso ao consultar estado em nuvem, usando base estática:", e);
  }

  const fallbackContracts = await fetchStaticDefaultContracts();
  if (fallbackContracts.length > 0) {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      contracts: fallbackContracts,
      contractBinaryChunks: cachedBinaryChunksMap,
      appSettings: {
        selectedContractId: fallbackContracts[0].id,
        calcStrategy: "KEEP_TOTAL_VALUE",
      },
    };
  }
  return null;
}

/**
 * Faz upload de uma string Base64 grande dividida em chunks de 2.4 MB para a nuvem
 */
export async function uploadBase64InChunksToCloud(base64Data: string): Promise<string[]> {
  const cleanB64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const chunks: string[] = [];
  for (let i = 0; i < cleanB64.length; i += CHUNK_SIZE) {
    chunks.push(cleanB64.slice(i, i + CHUNK_SIZE));
  }

  const shas: string[] = [];
  for (const chunk of chunks) {
    const res = await fetch("/api/cloud-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upload_chunk",
        chunk,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data?.sha) {
      throw new Error(data?.error || "Falha ao enviar chunk para a nuvem");
    }
    shas.push(data.sha);
  }
  return shas;
}

/**
 * Baixa uma string Base64 da nuvem a partir de sua lista de chunks (ou URL estática)
 */
export async function downloadBase64FromCloudChunks(chunksOrStatic: string[]): Promise<string | null> {
  if (!chunksOrStatic || chunksOrStatic.length === 0) return null;

  // Caso 1: Arquivo estático oficial pré-cadastrado no servidor (/contracts-base/...)
  if (chunksOrStatic[0].startsWith("STATIC:")) {
    const staticUrl = chunksOrStatic[0].replace("STATIC:", "");
    const res = await fetch(staticUrl);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return arrayBufferToBase64(buf);
  }

  // Caso 2: Chunks gravados em Blobs na nuvem GitHub
  const parts = await Promise.all(
    chunksOrStatic.map(async (sha) => {
      const res = await fetch(`/api/cloud-sync?action=get_chunk&sha=${encodeURIComponent(sha)}`);
      if (!res.ok) throw new Error(`Falha ao baixar chunk ${sha}`);
      const data = await res.json();
      return data.chunk as string;
    })
  );
  return parts.join("");
}

/**
 * Obtém o binário (.xlsx/.xlsm em Base64) de um contrato:
 * 1º tenta do IndexedDB local;
 * 2º se não estiver no computador atual (ex: aberto no PC do trabalho), baixa automaticamente da Nuvem ou de `/contracts-base/` e salva no IndexedDB local!
 */
export async function getOrFetchContractBinaryCloud(contractId: string): Promise<string | null> {
  // 1. Verifica no IndexedDB local deste navegador
  const localBin = await getContractBinary(contractId);
  if (localBin && localBin.length > 100) {
    return localBin;
  }

  // 2. Verifica se é um dos 4 contratos oficiais embutidos em `/contracts-base/`
  const staticPath = BUILTIN_STATIC_CONTRACT_BINARIES[contractId];
  if (staticPath) {
    try {
      const res = await fetch(staticPath);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const b64 = arrayBufferToBase64(buf);
        await saveContractBinary(contractId, b64);
        return b64;
      }
    } catch (e) {
      console.warn("Falha ao buscar binário estático do contrato:", e);
    }
  }

  // 3. Busca na Nuvem (/api/cloud-sync) os chunks deste contrato
  try {
    let chunks: string[] | undefined = cachedBinaryChunksMap[contractId];
    if (!chunks) {
      const state = await fetchCloudState();
      chunks = state?.contractBinaryChunks?.[contractId];
    }
    if (chunks && chunks.length > 0) {
      const b64 = await downloadBase64FromCloudChunks(chunks);
      if (b64 && b64.length > 100) {
        await saveContractBinary(contractId, b64);
        return b64;
      }
    }
  } catch (e) {
    console.warn("Erro ao baixar binário do contrato da nuvem:", e);
  }

  return null;
}

/**
 * Salva atualizações de contratos, binários, configurações ou template de memorial na Nuvem
 */
export async function pushStateUpdateToCloud(payload: {
  contracts?: ContractBaseCard[];
  upsertContract?: ContractBaseCard;
  contractBinaryBase64?: { contractId: string; base64: string };
  deleteContractId?: string;
  appSettings?: CloudSyncStateClient["appSettings"];
  memorialTemplate?: { meta: StoredTemplateMeta | null; base64?: string };
}): Promise<boolean> {
  try {
    let upsertContractBinary: { contractId: string; chunks: string[] } | undefined;

    if (payload.contractBinaryBase64) {
      const { contractId, base64 } = payload.contractBinaryBase64;
      if (BUILTIN_STATIC_CONTRACT_BINARIES[contractId] && !base64) {
        upsertContractBinary = {
          contractId,
          chunks: [`STATIC:${BUILTIN_STATIC_CONTRACT_BINARIES[contractId]}`],
        };
      } else if (base64 && base64.length > 100) {
        const chunks = await uploadBase64InChunksToCloud(base64);
        cachedBinaryChunksMap[contractId] = chunks;
        upsertContractBinary = { contractId, chunks };
      }
    }

    let memorialTemplatePayload: { meta: StoredTemplateMeta | null; chunks?: string[] } | undefined;
    if (payload.memorialTemplate !== undefined) {
      if (!payload.memorialTemplate.meta) {
        memorialTemplatePayload = { meta: null, chunks: [] };
      } else if (payload.memorialTemplate.base64) {
        const chunks = await uploadBase64InChunksToCloud(payload.memorialTemplate.base64);
        memorialTemplatePayload = {
          meta: payload.memorialTemplate.meta,
          chunks,
        };
      } else {
        memorialTemplatePayload = {
          meta: payload.memorialTemplate.meta,
        };
      }
    }

    const res = await fetch("/api/cloud-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_state",
        contracts: payload.contracts,
        upsertContract: payload.upsertContract,
        upsertContractBinary,
        deleteContractId: payload.deleteContractId,
        appSettings: payload.appSettings,
        memorialTemplate: memorialTemplatePayload,
      }),
    });

    const data = await res.json();
    return Boolean(res.ok && data?.ok);
  } catch (e) {
    console.warn("Falha ao sincronizar atualização com a nuvem:", e);
    return false;
  }
}
