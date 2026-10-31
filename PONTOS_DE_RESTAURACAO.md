# 📌 Registro Oficial de Pontos de Restauração (PR) — OrçaBase.lab - GPR

Este documento registra cronologicamente todos os pontos de restauração do projeto para recuperação imediata sob demanda e sincronização contínua.

---

## 🔒 REGRA DE OURO DAS RESTAURAÇÕES
- **Estrutura preservada:** Next.js, App Router, TypeScript, Tailwind CSS, Python Serverless, componentes e rotas.
- **Identidade visual mantida:** Dark Industrial Luxury Minimalista (Fundo Deep Charcoal `#07090E`, Metallic Gold `#D4AF37`, Vibrant Orange `#F97316`).
- **Engenharia de Excel:** `openpyxl` (Strict Mode) com suporte integral a fórmulas vivas (`calcProperties.fullCalcOnLoad = True`) e fidelidade de layout.

---

### [PR.008]
- **Data/Hora:** 31/10/2026 18:12 (Horário Local)
- **Tag Git:** `PR.008`
- **Status:** Ativo / Em Produção 24/7
- **Links Oficiais:**
  - Produção Oficial (Vercel): https://orcabase-lab-gpr.vercel.app (e alias https://orcaeng-lab-ai-matching.vercel.app)
  - Backend Serverless Python (Vercel): https://orcabase-lab-gpr.vercel.app/api
  - Repositório GitHub: https://github.com/Wisterly/orcabase-lab-gpr
  - Localhost de Desenvolvimento: http://localhost:3000
  - Pasta Oficial no Disco: C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR

#### 🖥️ Implementações Estruturais do PR.008:
1. **Estudo Estrutural 100% Completo das Duas Planilhas (`src/lib/excelEngine.ts` + `api/index.py`):**
   - Varredura de até 80 linhas para localização exata do cabeçalho (mesmo com células mescladas ou logotipos), inferência estatística de colunas (`Item`, `Código`, `Fonte`, `Descrição`, `Unidade`, **`Coluna Alvo de Quantitativo`**, `Preço Unitário`, `Total`), leitura de todas as abas (`sheetNames`) com seletor de aba, mapeamento de 100% das **Etapas/Grupos** e classificação por **Setor/Disciplina da Engenharia Civil** (`PINTURA`, `HIDRÁULICA`, `ELÉTRICA`, `ESTRUTURA`, `ALVENARIA`, `REVESTIMENTO`, `PISOS`, `COBERTURA`, `IMPERMEABILIZAÇÃO`, `ESQUADRIAS`, `DEMOLIÇÃO`, `TERRAPLENAGEM`, `PRELIMINARES`).
   - Armazenamento binário via **IndexedDB** (`saveContractBinary`, `getContractBinary`) para preservar arquivos `.xlsx` grandes sem estourar o limite do `localStorage`.
   - Correção definitiva da substituição/anexação de planilha diretamente nos Cards existentes na aba **Configurações**.
2. **Área de Trabalho Dupla e Alocação Semântica Contextual na Coluna de Quantitativo:**
   - Cruzamento entre a **Planilha 1 (Origem dos Quantitativos)** e a **Planilha 2 (Contrato Base Destino)** considerando Código, Disciplina/Setor onde o serviço está localizado, Palavras-Chave técnicas, Especificações numéricas e Unidade de Medida.
   - Dois botões independentes para escolha do usuário:
     - **Opção 1 (`KEEP_TOTAL_VALUE` — Manter o Valor Final do Orçamento):** Posiciona cada quantitativo na composição correspondente da Planilha Base e reescalona proporcionalmente os quantitativos para que o Valor Total Final bata exatamente com o valor da Planilha 1 (ou qualquer Valor Alvo definido pelo usuário).
     - **Opção 2 (`KEEP_QUANTITY` — Manter o Quantitativo Exato da Planilha 1):** Mantém exatamente a quantidade física da Planilha 1 na coluna de quantitativo da composição correspondente do Contrato Base.
3. **Download Infalível via Blob + `openpyxl` com Preservação 100% do Layout:**
   - O arquivo `.xlsx` baixado clona integralmente a Planilha Base do Contrato (cores, fontes, bordas, cabeçalhos, BDI e fórmulas vivas), alterando **UNICAMENTE os números na coluna de Quantitativo** nas linhas das composições, com download via `Uint8Array` $\rightarrow$ `Blob` $\rightarrow$ `URL.createObjectURL`.

---

### [PR.007]
- **Data/Hora:** 31/10/2026 17:41 (Horário Local)
- **Tag Git:** `PR.007`
- **Status:** Concluído
- **Implementações:** Leitura inteligente por IA da aba de orçamento, busca do TOTAL GERAL e injeção de quantitativos.

---

### [PR.006]
- **Data/Hora:** 31/10/2026 17:30 (Horário Local)
- **Tag Git:** `PR.006`
- **Status:** Concluído
- **Implementações:** Gerenciador de Contratos Base fiel aos prints, compatibilização com layout original e injeção de quantitativos.

---

### [PR.005]
- **Data/Hora:** 31/10/2026 17:17 (Horário Local)
- **Tag Git:** `PR.005`
- **Status:** Concluído
- **Implementações:** Sistema 100% interativo sem dados mock, standby limpo e extração real de planilhas.

---

### [PR.004]
- **Data/Hora:** 31/10/2026 17:12 (Horário Local)
- **Tag Git:** `PR.004`
- **Status:** Concluído
- **Implementações:** Redesign clean minimalista com caixas duplas de upload drag-and-drop.

---

### [PR.003]
- **Data/Hora:** 31/10/2026 17:02 (Horário Local)
- **Tag Git:** `PR.003`
- **Status:** Concluído
- **Implementações:** Curva ABC Pareto 80/20, Memória de Aprendizado persistente e exportação multi-aba no openpyxl.

---

### [PR.002]
- **Data/Hora:** 31/10/2026 16:56 (Horário Local)
- **Tag Git:** `PR.002`
- **Status:** Concluído
- **Implementações:** Ingestão de planilhas `.xlsx`, motor semântico com tokens e unidades, catálogo SINAPI/SICRO e mesa De-Para operacional.

---

### [PR.001]
- **Data/Hora:** 31/10/2026 16:46 (Horário Local)
- **Tag Git:** `PR.001`
- **Status:** Concluído
- **Implementações:** Inicialização de infraestrutura, CI/CD, Next.js, App Router, TypeScript, Tailwind CSS, modelos de dados, backend Python serverless com openpyxl ativo.
