# 📌 Registro Oficial de Pontos de Restauração (PR) — OrçaBase.lab - GPR

Este documento registra cronologicamente todos os pontos de restauração do projeto para recuperação imediata sob demanda e sincronização contínua.

---

## 🔒 REGRA DE OURO DAS RESTAURAÇÕES
- **Estrutura preservada:** Next.js, App Router, TypeScript, Tailwind CSS, Python Serverless, componentes e rotas.
- **Identidade visual mantida:** Dark Industrial Luxury Minimalista (Fundo Deep Charcoal `#07090E`, Metallic Gold `#D4AF37`, Vibrant Orange `#F97316`).
- **Engenharia de Excel:** `openpyxl` (Strict Mode) com suporte integral a fórmulas vivas (`calcProperties.fullCalcOnLoad = True`) e fidelidade de layout.

---

### [PR.011]
- **Data/Hora:** 31/10/2026 19:31 (Horário Local)
- **Tag Git:** `PR.011`
- **Status:** Ativo / Em Produção 24/7
- **Links Oficiais:**
  - Produção Oficial (Vercel): https://orcabase-lab-gpr.vercel.app (e alias https://orcaeng-lab-ai-matching.vercel.app)
  - Backend Gateway (Next.js / Vercel): https://orcabase-lab-gpr.vercel.app/api
  - Repositório GitHub: https://github.com/Wisterly/orcabase-lab-gpr
  - Localhost de Desenvolvimento: http://localhost:3000
  - Pasta Oficial no Disco: C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR

#### 🖥️ Implementações Estruturais do PR.011 (Correção Definitiva da Preservação Física do Layout):
1. **Eliminação do Descarte de Estilos do SheetJS e Adoção do Motor Purista OpenXML com JSZip:**
   - O SheetJS (`XLSX.write`) na versão comunitária gratuita descartava e apagava 100% dos estilos, fontes, cores, larguras de colunas (`<cols>`), alturas de linhas (`<row ht="...">`) e bordas ao salvar o arquivo.
   - Implementação do motor purista baseado em `JSZip` que atua diretamente sobre o contêiner ZIP (`.xlsx`) original do Contrato Base armazenado no IndexedDB.
   - **Preservação de 100% dos bytes físicos do arquivo:** os arquivos `xl/styles.xml`, `xl/theme/`, `xl/drawings/`, cabeçalhos, logos, células mescladas e demais abas permanecem **intocados e idênticos byte a byte**.
2. **Injeção Cirúrgica na Célula de Quantitativo da Aba de Orçamento:**
   - O motor localiza o XML da aba de orçamento (`xl/worksheets/sheetX.xml`) e atualiza **estritamente e unicamente** o número `<v>...</v>` na coordenada da coluna de quantitativo (ex: `F15`), mantendo o atributo de estilo `s="..."` da célula, sua formatação numérica e alinhamento.
   - Todas as outras colunas (Código, Discriminação, Unidade, Preço Unitário e Fórmulas de Total `=F15*G15`) permanecem 100% intactas.
   - Ativação de `fullCalcOnLoad="1"` e `forceFullCalculation="1"` no `xl/workbook.xml` para que o Excel recalcule automaticamente todas as fórmulas de total e BDI ao abrir o arquivo.
3. **Botão de Ação Rápida no Card da Tela Principal:**
   - Adicionado no Card da Planilha 2 (Passo 1) um botão direto para anexar ou substituir o arquivo `.xlsx` do Contrato Base selecionado em 1 clique, garantindo que o arquivo correto do usuário esteja sempre ativo e gravado no IndexedDB.
4. **Criação da Rota de API Gateway (`src/app/api/route.ts`):**
   - Rota nativa do Next.js App Router implementada eliminando respostas 404 e garantindo comunicação total do gateway.

---

### [PR.010]
- **Data/Hora:** 31/10/2026 19:05 (Horário Local)
- **Tag Git:** `PR.010`
- **Status:** Ativo / Em Produção 24/7
- **Links Oficiais:**
  - Produção Oficial (Vercel): https://orcabase-lab-gpr.vercel.app (e alias https://orcaeng-lab-ai-matching.vercel.app)
  - Backend Serverless Python (Vercel): https://orcabase-lab-gpr.vercel.app/api
  - Repositório GitHub: https://github.com/Wisterly/orcabase-lab-gpr
  - Localhost de Desenvolvimento: http://localhost:3000
  - Pasta Oficial no Disco: C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR

#### 🖥️ Implementações Estruturais do PR.010:
1. **Regra Estrita de Nomenclatura no Salvar Como (`Nome da Planilha 1 (Nome do Contrato).xlsx`):**
   - A planilha gerada e baixada assume automaticamente e com exatidão o nome da **Planilha 1 (Planilha Inicial)** anexada pelo usuário, acrescida do nome do Contrato Base selecionado entre parênteses ao final.
   - Exemplo fiel do usuário: `12ª GRE, 7º Deputado Francisco Antônio Paz Landim Neto, São João do Piauí - Inauguração (DESENVOLVA).xlsx`.
   - Limpeza automática de caracteres proibidos em sistemas de arquivos mantendo integridade perfeita do nome original.
2. **Cópia Fiel Físico-Digital da Planilha Base do Contrato:**
   - O processo de geração realiza um "Salvar Como" autêntico: o binário original da Planilha Base do Contrato (preservado no IndexedDB) é clonado integralmente.
   - O motor `openpyxl` abre o clone com fórmulas vivas (`calcProperties.fullCalcOnLoad = True`), preserva 100% das fontes, cores, larguras de colunas, células mescladas, cabeçalhos, rodapés e fórmulas de BDI/Totalização, alterando **unicamente** as células numéricas da coluna de quantitativo identificada.
3. **Indicador de Taxa Percentual de Compatibilização (%):**
   - Card luxury com progresso visual exibindo a porcentagem exata de assertividade e cobertura da compatibilização (ex: `88%`, `96%`, `100%`).
   - Apresenta o quantitativo de itens alocados versus itens totais da Planilha 1 e alerta em tempo real quando há serviços que necessitam de atenção.
4. **Mesa Interativa de Resolução de Pendências (Itens sem Similaridade Direta):**
   - Visualização dedicada para itens da Planilha 1 onde o sistema encontrou correspondência com menor confiança ou múltiplas opções no contrato base.
   - Cartões com sugestões inteligentes do contrato base e botão direto de vínculo (*"Alocar X un Aqui"*).
   - Modal completo de busca interativa em tempo real com filtro por código, discriminação ou disciplina de qualquer composição do Contrato Base.
   - Ao vincular, o quantitativo é posicionado imediatamente na linha correspondente do contrato, a porcentagem de compatibilização sobe em tempo real e a planilha é atualizada.

---

### [PR.009]
- **Data/Hora:** 31/10/2026 18:37 (Horário Local)
- **Tag Git:** `PR.009`
- **Status:** Ativo / Em Produção 24/7
- **Links Oficiais:**
  - Produção Oficial (Vercel): https://orcabase-lab-gpr.vercel.app (e alias https://orcaeng-lab-ai-matching.vercel.app)
  - Backend Serverless Python (Vercel): https://orcabase-lab-gpr.vercel.app/api
  - Repositório GitHub: https://github.com/Wisterly/orcabase-lab-gpr
  - Localhost de Desenvolvimento: http://localhost:3000
  - Pasta Oficial no Disco: C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR

#### 🖥️ Implementações Estruturais do PR.009:
1. **Busca Dinâmica Guiada Exclusivamente pelo Nome da Coluna (Sem Fixação de Letras Rígidas):**
   - Eliminação completa de suposições rígidas de colunas (como "Coluna F" ou "Coluna G"). O sistema varre as linhas de cabeçalho (linhas 1 a 120) identificando as colunas pelo **nome escrito no cabeçalho**:
     - **Coluna de Quantitativo:** busca por `quantitativo`, `quantidade`, `quant.`, `quant`, `qtd.`, `qtd`, `qtde`, `qte`, etc.
     - **Coluna de Composição / Descrição / Discriminação:** busca por `descrição`, `discriminação`, `composição`, `especificação`, `serviço`, etc.
     - **Coluna de Unidade:** busca por `unidade`, `unid.`, `und.`, `un.`, etc.
     - **Total Geral do Orçamento:** busca por `total geral`, `valor total`, `total do orçamento`, etc.
2. **Opção de Configuração e Confirmação de Nomes de Coluna na Aba de Configurações:**
   - No modal de cadastro de novo contrato, o usuário dispõe de campos explícitos para definir ou refinar as palavras-chave procuradas pelo sistema.
   - Assim que a planilha `.xlsx` é anexada, o sistema exibe dropdowns contendo **todas as colunas da planilha identificadas pelos seus nomes reais**, permitindo ao usuário confirmar ou selecionar qualquer coluna pelo nome (ex: `Nome: "QUANTITATIVO" (Ex: 120,00)` ou `Nome: "DISCRIMINAÇÃO DOS SERVIÇOS"`).
   - Nos cards existentes, o usuário também pode ajustar o mapeamento das colunas pelo nome a qualquer momento.
3. **Injeção Fiel de Quantitativo por Nome no openpyxl:**
   - O backend Python serverless (`api/index.py`) e o motor local recebem o nome real da coluna de quantitativo (`qty_header_name`) e localizam a célula correspondente diretamente no cabeçalho da planilha original antes de gravar os quantitativos, garantindo precisão milimétrica em qualquer planilha.

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
