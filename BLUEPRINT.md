# 📘 BLUEPRINT TÉCNICO OFICIAL — OrçaBase.lab - GPR

> **Módulo:** `OrçaBase.lab - GPR`  
> **Versão:** 1.2.0 (`PR.003` implantado e ativo)  
> **Ambiente de Produção 24/7:** [https://orcabase-lab-gpr.vercel.app](https://orcabase-lab-gpr.vercel.app)  
> **Backend Python Serverless:** [https://orcabase-lab-gpr.vercel.app/api](https://orcabase-lab-gpr.vercel.app/api)  
> **Repositório GitHub:** [https://github.com/Wisterly/orcabase-lab-gpr](https://github.com/Wisterly/orcabase-lab-gpr)  
> **Caminho Local da Pasta Oficial:** `C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR`

---

## 1. 🏗️ Arquitetura do Sistema & Stack Tecnológica

| Camada | Tecnologia | Especificação Técnica |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15+ (App Router, TypeScript) | Client Components reativos, 3 abas sem conflito (Mesa De-Para, Curva ABC, Memória) |
| **Estilização** | Tailwind CSS | **Dark Industrial Luxury Mode**: Fundo Navy Blue (`#060B14`, `#0A1124`) e Dark Charcoal (`#111827`), destaques em Metallic Gold (`#D4AF37`) e Vibrant Orange (`#F97316`) |
| **Responsividade** | Mobile-First para Desktop | Adaptação estrita em Grid/Flexbox com rolagem horizontal nas tabelas |
| **Backend** | Python Serverless Functions | Localizado em `/api/index.py`, executado na infraestrutura Vercel Edge/Serverless |
| **Motor de Excel** | `openpyxl` (Strict Mode) | Geração multi-aba ("Orçamento Compatibilizado" + "Curva ABC (Pareto)"), preservando fórmulas vivas de multiplicação e soma (`calcProperties.fullCalcOnLoad = True`) |
| **Motor de IA** | Matching Semântico & Vetorial | Heurística ponderada com tokens de especificações técnicas (ex: 30 MPa, 10mm, traços), Jaccard e bônus de compatibilidade de unidade |
| **Memória de Aprendizado** | `MappingMemory` (LocalStorage / DB) | Gravação imediata de substituições manuais para auto-aprendizado permanente |
| **Análise de Engenharia** | Curva ABC (Princípio de Pareto) | Separação em Classe A (80% do valor), Classe B (15%) e Classe C (5%) |
| **Catálogo de Referência** | SINAPI / SICRO Embutido | Insumos e composições oficiais para correspondência instantânea e busca livre |
| **CI/CD** | GitHub + Vercel | Repositório conectado e sincronizado a cada tag de restauração (`PR.001`, `PR.002`, `PR.003`, etc.) |

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
  id?: string;
  base_description: string;
  base_unit: string;
  dest_code: string;
  dest_description: string;
  dest_unit: string;
  unit_price: number;
  match_type: 'AI_SUGGESTION' | 'MANUAL_OVERRIDE' | 'HISTORICAL_MEMORY';
  updated_at?: string;
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

export interface ABCItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  percentage_of_total: number;
  accumulated_percentage: number;
  classification: 'A' | 'B' | 'C';
}
```

---

## 3. 🎯 Funcionalidades e Pipeline Operacional (`PR.003`)

1. **Mesa De-Para Operacional Interativa:**
   - Visualização lado a lado de itens orçamentários originais x referências (SINAPI / SICRO).
   - Cores de score de confiança (Verde >=80%, Âmbar >=50%, Vermelho <50%).
   - Modal de ajuste manual com busca dinâmica.
2. **Memória de Aprendizado do Sistema (`MappingMemory`):**
   - Gravação imediata de qualquer substituição manual feita pelo usuário.
   - Aplicação automática com 100% de confiança em novos orçamentos que compartilhem o mesmo insumo.
3. **Curva ABC Analítica (Pareto 80/20):**
   - Classificação financeira em tempo real:
     - **Classe A:** Insumos que somam até 80% do valor da obra (foco máximo de negociação).
     - **Classe B:** Insumos intermediários (15% do valor).
     - **Classe C:** Insumos de baixo valor agregado (5% do valor).
4. **Estratégias Matemáticas Sem Conflito (Botões de Escolha):**
   - **`KEEP_TOTAL_VALUE` (Travar Valor Total):** $\text{Qtd} = \frac{\text{Valor Total}}{\text{Novo Preço Unitário}}$.
   - **`KEEP_QUANTITY` (Travar Quantidade):** $\text{Valor Total} = \text{Qtd} \times \text{Novo Preço Unitário}$.
5. **Exportação Excel Multi-Aba com `openpyxl` (Strict Mode):**
   - Aba 1: "Orçamento Compatibilizado" (fórmulas vivas de multiplicação, estratégia e soma).
   - Aba 2: "Curva ABC (Pareto)" (fórmulas vivas de percentual, valor e destaque visual por classe).
   - `wb.calculation.calcPr.fullCalcOnLoad = True` garantido.
