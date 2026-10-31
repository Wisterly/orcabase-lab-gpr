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
   - Fazer `git push` para sincronizar automaticamente com a Vercel em `https://orcaeng-lab-ai-matching.vercel.app`.
