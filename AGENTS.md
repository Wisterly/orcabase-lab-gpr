# 🤖 Diretrizes para Agentes — OrcaEng Lab AI Matching

Ao trabalhar neste projeto:

1. **Idioma Estrito:** Todo o raciocínio, comentários, documentação e respostas devem ser estritamente em **Português do Brasil (pt-BR)**.
2. **Design System:** Manter o Dark Industrial Luxury:
   - Fundo: Navy Blue (`#060B14`, `#0A1124`) e Dark Charcoal (`#111827`)
   - Acentos: Metallic Gold (`#D4AF37`) e Orange (`#F97316`)
   - Responsivo mobile-first com Grid/Flexbox e overflow nas tabelas.
3. **Regra de Ouro do Excel:**
   - Usar `openpyxl` exclusivamente para geração e estilização de arquivos `.xlsx`.
   - Pandas é restrito unicamente para extração/parse de dados em memória, NUNCA para gerar planilhas Excel.
   - Ativar `calcProperties.fullCalcOnLoad = True` em arquivos gerados.
4. **CI/CD e Versionamento:**
   - A cada avanço significativo, registrar no `PONTOS_DE_RESTAURACAO.md` a tag correspondente (`PR.002`, `PR.003`, etc.).
   - Fazer `git push` para sincronizar automaticamente com a Vercel em `https://orcaeng-lab-ai-matching.vercel.app` e `https://orcabase-lab-gpr.vercel.app`.
5. **🔒 CADEADO ABSOLUTO DA PROGRAMAÇÃO DE COMPATIBILIZAÇÃO DE ORÇAMENTOS (PROIBIDO ALTERAR):**
   - A lógica, algoritmos e funções de compatibilização de planilhas na aba **Orçamento** (leitura da Planilha 1 e Contratos Base pelo nome das colunas, cálculo de similaridade, posicionamento de quantitativos, ajuste de valor final alvo, clonagem OpenXML fiel `.xlsx`/`.xlsm` preservando `vbaProject.bin`, fórmulas e estilos, e nomenclatura de saída) estão **BLINDADOS POR CADEADO CRIPTOGRÁFICO SHA-256** (`.compat-lock.json` + `scripts/verify-compat-lock.mjs` + `src/lib/compatEngineLock.ts` + `src/lib/excelEngine.ts`).
   - **É TERMINANTEMENTE PROIBIDO** modificar, refatorar, simplificar ou substituir qualquer lógica de programação referente à compatibilização de orçamentos em `src/lib/excelEngine.ts`, `src/lib/compatEngineLock.ts` ou nos handlers de compatibilização em `src/app/page.tsx` durante alterações de design, layout ou de outras abas (como Descritivos ou Configurações).
   - Essa programação **SÓ PODE SER TOCADA** no dia em que o usuário solicitar **expressa e especificamente** uma alteração na lógica interna de compatibilização de orçamentos.
