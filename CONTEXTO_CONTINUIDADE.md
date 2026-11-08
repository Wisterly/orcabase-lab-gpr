# 🔄 Contexto de Continuidade Imediata — OrçaBase.lab - GPR

## 📍 Ponto Atual de Entrega — Ciclo PR.035
O ciclo **`PR.035`** implementou a **3ª Aba Principal "Configurações"**, a **Simplificação Estrita do Card 2 (Dados do Memorial)** e o **Motor de Injeção em Planilha Excel com Tags `= AQUI`**:
1. **Nova 3ª Aba Principal no Topo ("Configurações"):**
   - Abas 3D no cabeçalho: `Orçamento`, `Descritivos` e `Configurações` (`mainModule === "CONFIGURACOES"`).
   - Na aba `Orçamento`: removida a barra cinza secundária, deixando o fluxo direto no Workspace dos 3 passos, com um banner elegante de identificação do contrato ativo e atalho para gerenciamento.
   - Na aba `Configurações`: centralizada e dividida em duas sub-abas por demanda:
     - **Sub-aba 1: Demandas de Orçamento:** Gestão completa dos Contratos Base Cadastrados (novo contrato, upload `.xlsx`/`.xlsm`, identificação de colunas por nome, remapeamento de abas e intervalos de linhas).
     - **Sub-aba 2: Demandas de Descritivos:** Gestão da **Planilha Excel Base do Memorial Descritivo (.xlsx)**:
       - Status em tempo real (Padrão SEDUC vs Personalizada com tamanho e data de upload);
       - Dropzone interativo para anexar e substituir a planilha base;
       - Botão para **Baixar Modelo com Tags (.xlsx)** gerado pelo sistema;
       - Botão para **Restaurar Padrão SEDUC / GPR**;
       - **Guia Visual Explicativo das 6 tags com `= AQUI`** (`ESCOLA = AQUI`, `MUNICÍPIO = AQUI`, `BDI = AQUI`, `MÊS/ANO = AQUI`, `DATA EXTENSA = AQUI`, `MEMORIAL = AQUI`).
2. **Card 2 (Dados do Memorial em DescritivoView) Simplificado:**
   - Mantidos estritamente os 3 dados variáveis pedidos: `Nome da Escola`, `Município` (com UF) e `BDI da Obra (%)`.
   - Removidos GRE, Finalidade e Responsável Técnico da interface de edição.
   - Bloco de **Datas Automáticas Autossuficientes**: Mês/Ano atual e Data Extensa com Dia da Semana gerados dinamicamente com base no dia de elaboração do memorial, sem necessidade de digitação.
3. **Motor de Injeção em Planilha Excel (`src/lib/memorialExcelEngine.ts`):**
   - Substituição exata de células terminadas em `= AQUI` ou contendo `= AQUI` mantendo 100% da formatação e estilos originais.
   - Injeção das etapas em CAIXA ALTA e serviços sem marcadores na tag `MEMORIAL = AQUI`.
   - Novo botão **`📊 Baixar Memorial (.xlsx)`** na barra inferior de ações e no modal de tela cheia.
4. **Build e Produção:** Next.js 15 compilado com 0 erros e pronto para sincronização contínua.

---

## 🎯 Próximo Passo do Agente (Ciclo PR.036)
1. **Auditoria de Desvios de Quantitativos:** Indicador visual de variação percentual dos itens compatibilizados.
2. **Histórico em Nuvem:** Compartilhamento multiusuário via Supabase/PostgreSQL.
