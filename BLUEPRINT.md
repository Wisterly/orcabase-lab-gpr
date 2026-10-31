# 📘 BLUEPRINT TÉCNICO OFICIAL — OrçaBase.lab - GPR

> **Módulo:** `OrçaBase.lab - GPR`  
> **Versão:** 1.1.0 (`PR.002` implantado e ativo)  
> **Ambiente de Produção 24/7:** [https://orcabase-lab-gpr.vercel.app](https://orcabase-lab-gpr.vercel.app)  
> **Backend Python Serverless:** [https://orcabase-lab-gpr.vercel.app/api](https://orcabase-lab-gpr.vercel.app/api)  
> **Repositório GitHub:** [https://github.com/Wisterly/orcabase-lab-gpr](https://github.com/Wisterly/orcabase-lab-gpr)  
> **Caminho Local da Pasta Oficial:** `C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR`

---

## 1. 🏗️ Arquitetura do Sistema & Stack Tecnológica

| Camada | Tecnologia | Especificação Técnica |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15+ (App Router, TypeScript) | Client Components reativos, Server Components quando aplicável |
| **Estilização** | Tailwind CSS | **Dark Industrial Luxury Mode**: Fundo Navy Blue (`#060B14`, `#0A1124`) e Dark Charcoal (`#111827`), destaques em Metallic Gold (`#D4AF37`) e Vibrant Orange (`#F97316`) |
| **Responsividade** | Mobile-First para Desktop | Adaptação estrita em Grid/Flexbox com rolagem horizontal nas tabelas |
| **Backend** | Python Serverless Functions | Localizado em `/api/index.py`, executado na infraestrutura Vercel Edge/Serverless |
| **Motor de Excel** | `openpyxl` (Strict Mode) | **REQUISITO ESTRITO:** Geração 100% `openpyxl`, preservando fórmulas vivas de multiplicação e soma (`calcProperties.fullCalcOnLoad = True`) |
| **Motor de IA** | Matching Semântico & Vetorial | Heurística ponderada com tokens de especificações técnicas (ex: 30 MPa, 10mm, traços), Jaccard e bônus de compatibilidade de unidade |
| **Catálogo de Referência** | SINAPI / SICRO Embutido | Insumos e composições oficiais para correspondência instantânea e busca livre |
| **Persistência** | Postgres / Supabase + LocalStorage | Persistência resiliente de De-Para e memórias de mapeamento |
| **CI/CD** | GitHub + Vercel | Repositório conectado e sincronizado a cada tag de restauração (`PR.001`, `PR.002`, etc.) |

---

## 2. 📊 Modelos de Dados Oficiais (TypeScript)

Localizados em [`src/types/index.ts`](file:///C:/Users/Lenovo/Documents/antigravity/LAB%20-%20GPR/OrçaBase.lab%20-%20GPR/src/types/index.ts):

```typescript
export interface CalculationStrategy {
  mode: 'KEEP_QUANTITY' | 'KEEP_TOTAL_VALUE';
}

export interface ItemBase {
  id: string;
  code?: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_value: number;
}

export interface CatalogItem {
  code: string;
  description: string;
  unit: string;
  unit_price: number;
  source: 'SINAPI' | 'SICRO' | 'PROPRIA';
  category?: string;
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

export interface MatchingStatistics {
  total_items: number;
  matched_count: number;
  manual_count: number;
  original_total_value: number;
  calculated_total_value: number;
  variance_value: number;
  variance_percentage: number;
}
```

---

## 3. 🎯 Funcionalidades e Pipeline Operacional (`PR.002`)

1. **Ingestão de Planilhas Orçamentárias (`.xlsx`):**
   - Upload com drag-and-drop ou seletor de arquivo no frontend.
   - Processamento no backend via `openpyxl.load_workbook`.
   - Botão para carregar Orçamento Modelo Realista com 1 clique.
2. **Motor de IA e Matching Semântico:**
   - Comparação semântica e técnica contra a base referencial SINAPI e SICRO.
   - Cálculo do score de confiança de 0% a 100%.
   - Ranqueamento dos 4 melhores candidatos por item.
3. **Mesa De-Para Operacional Interativa:**
   - Visualização lado a lado em tabela responsiva com cores de confiança (verde, âmbar, vermelho).
   - Modal de ajuste manual com busca instantânea em catálogo SINAPI.
   - Aplicação da `CalculationStrategy` em tempo real:
     - `KEEP_TOTAL_VALUE`: Trava o valor total original do item e recalcula a quantidade com base no novo preço unitário (`Qtd = ValorTotal / NovoPrecoUnitario`).
     - `KEEP_QUANTITY`: Trava a quantidade original e recalcula o valor total (`ValorTotal = Qtd * NovoPrecoUnitario`).
4. **Painel de Métricas Financeiras:**
   - Total Original vs Total Compatibilizado vs Variação Financeira (Delta R$ e %).
5. **Geração e Exportação Excel com `openpyxl` (Strict Mode):**
   - Criação via `api/index.py` com estilização Dark Industrial Luxury.
   - Inclusão de Fórmulas Vivas de multiplicação (`=D{row}*E{row}` e `=K{row}*J{row}`).
   - Fórmulas de recálculo dinâmico da estratégia no Excel.
   - Fórmulas de totalização viva com `=SUM(...)`.
   - `wb.calculation.calcPr.fullCalcOnLoad = True` garantido.
