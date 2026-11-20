/**
 * ============================================================================
 * 🔒 VERIFICADOR DE INTEGRIDADE — CADEADO DE ENGENHARIA (ORÇAMENTOS)
 * ============================================================================
 * Verifica antes de cada build (`prebuild`) se a programação de compatibilização
 * e clonagem de planilhas (`src/lib/excelEngine.ts` e `src/lib/compatEngineLock.ts`)
 * permanece 100% intacta e idêntica ao manifesto blindado `.compat-lock.json`.
 *
 * Se qualquer alteração não autorizada for feita nesses arquivos, o build é
 * imediatamente interrompido para impedir perda de lógica ou regressões.
 * ============================================================================
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const LOCK_FILE = path.join(ROOT, ".compat-lock.json");

const PROTECTED_FILES = [
  "src/lib/excelEngine.ts",
  "src/lib/compatEngineLock.ts",
];

function computeNormalizedSha256(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Arquivo protegido ausente: ${relPath}`);
  }
  // Normaliza CRLF -> LF para que o hash seja 100% idêntico no Windows e no Linux (Vercel)
  const raw = fs.readFileSync(fullPath, "utf8").replace(/\r\n/g, "\n");
  return crypto.createHash("sha256").update(raw, "utf8").digest("hex");
}

const isUpdateMode = process.argv.includes("--update-lock");

if (isUpdateMode) {
  const hashes = {};
  for (const file of PROTECTED_FILES) {
    hashes[file] = computeNormalizedSha256(file);
  }
  const payload = {
    lockVersion: "LOCK-PR023-PR038-BLINDADO",
    lockedAt: new Date().toISOString(),
    description:
      "Cadeado criptográfico SHA-256 do motor de compatibilização e exportação de planilhas de Orçamento. PROIBIDO alterar sem autorização explícita do usuário.",
    hashes,
  };
  fs.writeFileSync(LOCK_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log("🔒 [CADEADO DE COMPATIBILIZAÇÃO] Manifesto .compat-lock.json atualizado com sucesso!");
  process.exit(0);
}

if (!fs.existsSync(LOCK_FILE)) {
  console.error("❌ [CADEADO DE COMPATIBILIZAÇÃO] Arquivo .compat-lock.json não encontrado!");
  process.exit(1);
}

const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, "utf8"));
let hasViolation = false;

for (const file of PROTECTED_FILES) {
  const currentHash = computeNormalizedSha256(file);
  const expectedHash = lockData.hashes?.[file];
  if (currentHash !== expectedHash) {
    console.error(`\n🚨 [VIOLAÇÃO DE CADEADO DETECTADA] O arquivo protegido "${file}" foi modificado sem autorização!`);
    console.error(`   Hash esperado (Blindado): ${expectedHash}`);
    console.error(`   Hash atual encontrado:    ${currentHash}`);
    hasViolation = true;
  }
}

if (hasViolation) {
  console.error(
    "\n🔒 BLOQUEIO DE SEGURANÇA ATIVO: A programação de compatibilização de planilhas da aba Orçamento está protegida por cadeado (PR.023 / PR.038).\n" +
      "   Nenhuma alteração pode ser feita em `src/lib/excelEngine.ts` ou `src/lib/compatEngineLock.ts` a menos que o usuário peça explicitamente.\n"
  );
  process.exit(1);
}

console.log("✅ [CADEADO DE COMPATIBILIZAÇÃO ATIVO] Integridade SHA-256 de `excelEngine.ts` e `compatEngineLock.ts` 100% verificada.");
