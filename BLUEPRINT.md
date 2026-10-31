# 📘 BLUEPRINT TÉCNICO OFICIAL — OrcaEng Lab AI Matching

> **Módulo:** `OrcaEng_Lab_AI_Matching`  
> **Versão:** 1.0.0 (`PR.001` implantado e ativo)  
> **Ambiente de Produção 24/7:** [https://orcaeng-lab-ai-matching.vercel.app](https://orcaeng-lab-ai-matching.vercel.app)  
> **Backend Python Serverless:** [https://orcaeng-lab-ai-matching.vercel.app/api](https://orcaeng-lab-ai-matching.vercel.app/api)  
> **Repositório GitHub:** [https://github.com/Wisterly/orcaeng-lab-ai-matching](https://github.com/Wisterly/orcaeng-lab-ai-matching)  
> **Caminho Local da Pasta Base:** `C:\Users\Lenovo\Documents\antigravity\OrcaEng_Lab_AI_Matching`

---

## 1. 🏗️ Arquitetura do Sistema & Stack Tecnológica

| Camada | Tecnologia | Especificação Técnica |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15+ (App Router, TypeScript) | Client Components reativos, Server Components quando aplicável |
| **Estilização** | Tailwind CSS | **Dark Industrial Luxury Mode**: Fundo Navy Blue (`#060B14`, `#0A1124`) e Dark Charcoal (`#111827`), destaques em Metallic Gold (`#D4AF37`) e Vibrant Orange (`#F97316`) |
| **Responsividade** | Mobile-First para Desktop | Adaptação estrita em Grid/Flexbox com rolagem horizontal nas tabelas |
| **Backend** | Python Serverless Functions | Localizado em `/api/*.py`, executado na infraestrutura Vercel Edge/Serverless |
| **Motor de Excel** | `openpyxl` (Strict Mode) | **REQUISITO ESTRITO:** Pandas é usado exclusivamente para extração e manipulação tabular rápida em memória, **NUNCA** para geração ou gravação de planilhas. A geração é 100% `openpyxl`, preservando fórmulas vivas (`calcProperties.fullCalcOnLoad`) |
| **Motor de IA** | Embeddings / Cosine Similarity | Suporte a `sentence-transformers`, vetores Qdrant e OpenAI Embeddings |
| **Persistência** | Postgres / Supabase + LocalStorage | Persistência resiliente de De-Para e memórias de mapeamento |
| **CI/CD** | GitHub + Vercel | Repositório conectado e sincronizado a cada tag de restauração (`PR.001`, `PR.002`, etc.) |

---

## 2. 📊 Modelos de Dados Oficiais (TypeScript)

Localizados em [`src/types/index.ts`](file:///C:/Users/Lenovo/Documents/antigravity/OrcaEng_Lab_AI_Matching/src/types/index.ts):

```typescript
export interface CalculationStrategy {
  mode: 'KEEP_QUANTITY' | 'KEEP_TOTAL_VALUE';
}

export interface ItemBase {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_value: number;
}

export interface MappingMemory {
  base_description: string;
  base_unit: string;
  dest_code: string;
  dest_description: string;
  dest_unit: string;
  match_type: 'AI_SUGGESTION' | 'MANUAL_OVERRIDE' | 'HISTORICAL_MEMORY';
}

export interface MatchCandidate {
  dest_code: string;
  dest_description: string;
  dest_unit: string;
  unit_price: number;
  confidence_score: number;
  match_type: MappingMemory['match_type'];
  explanation?: string;
}

export interface MatchingResultItem {
  source_item: ItemBase;
  selected_match?: MatchCandidate;
  candidates: MatchCandidate[];
  strategy_applied: CalculationStrategy['mode'];
  calculated_quantity: number;
  calculated_unit_price: number;
  calculated_total_value: number;
  status: 'PENDING' | 'MATCHED' | 'MANUAL_REQUIRED';
}
```

---

## 3. 🎯 Funcionalidades e Pipeline de Execução

1. **Ingestão de Planilhas Orçamentárias (`.xlsx`):**
   - Upload com drag-and-drop.
   - Extração estruturada de itens, composições, unidades, quantidades, preços unitários e totais.
2. **Motor de Busca e Correspondência Vetorial (AI Matching):**
   - Busca semântica entre itens da base do cliente e catálogos de referência (ex: SINAPI, SICRO, Bases Próprias).
   - Cálculo de índice de similaridade (`confidence_score` de 0 a 100%).
   - Classificação por `AI_SUGGESTION`, `HISTORICAL_MEMORY` e `MANUAL_OVERRIDE`.
3. **Mesa De-Para Interativa:**
   - Visualização lado a lado (Base vs Destino).
   - Seletor de alternativas sugeridas por IA.
   - Ajuste manual e memorização automática para contratos futuros.
4. **Aplicação de Estratégia de Cálculo (`CalculationStrategy`):**
   - **`KEEP_TOTAL_VALUE`**: Mantém o valor total original do item travado e recalcula a quantidade com base no novo preço unitário (`Qtd = ValorTotal / NovoPrecoUnitario`).
   - **`KEEP_QUANTITY`**: Mantém a quantidade original travada e recalcula o valor total (`ValorTotal = Qtd * NovoPrecoUnitario`).
5. **Geração e Exportação de Planilha Excel com `openpyxl`:**
   - Preservação de cabeçalhos, cores, larguras de coluna e fórmulas vivas.
   - Download imediato da planilha compatibilizada.

---

## 4. 🔒 Política de Restaurações (`PONTOS_DE_RESTAURACAO.md`)
- A cada ciclo de entrega de nova feature, um commit com tag `PR.00X` é gerado e registrado no arquivo `PONTOS_DE_RESTAURACAO.md`.
- Deploy automático é disparado para a Vercel.
- O histórico de dados em `localStorage` permanece desacoplado da estrutura do código.
