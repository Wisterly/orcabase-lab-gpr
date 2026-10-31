# OrcaEng Lab — AI Matching

Módulo de Compatibilização Semântica e Mapeamento Inteligente (De-Para) de Planilhas Orçamentárias da Engenharia Civil.

## 🚀 Arquitetura e Stack Tecnológica
- **Frontend:** Next.js (App Router, TypeScript)
- **Estilização:** Tailwind CSS (Dark Mode com tons Navy Blue & Dark Charcoal, acentos em Metallic Gold & Orange vibrante)
- **Backend:** Python (Vercel Serverless Functions) em `/api`
- **Manipulação de Excel:** `openpyxl` (Requisito estrito: Pandas apenas para extração de dados, geração exclusiva via openpyxl)
- **Motor de IA:** sentence-transformers / Vector Embeddings & Cosine Similarity
- **Banco de Dados:** Vercel Postgres / Supabase
- **Hospedagem & CI/CD:** GitHub Actions + Vercel 24/7 Online

## 📋 Modelos de Dados Oficiais
- `CalculationStrategy`: Modos `KEEP_QUANTITY` e `KEEP_TOTAL_VALUE`
- `ItemBase`: Itens da planilha base com código, descrição, unidade, quantidade, preço unitário e valor total.
- `MappingMemory`: Histórico e correspondências aprendidas (`AI_SUGGESTION`, `MANUAL_OVERRIDE`, `HISTORICAL_MEMORY`).
