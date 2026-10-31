# 📘 BLUEPRINT TÉCNICO OFICIAL — OrçaBase.lab - GPR

> **Módulo:** `OrçaBase.lab - GPR`  
> **Versão:** 1.6.0 (`PR.007` implantado e ativo)  
> **Ambiente de Produção 24/7:** [https://orcabase-lab-gpr.vercel.app](https://orcabase-lab-gpr.vercel.app)  
> **Backend Python Serverless:** [https://orcabase-lab-gpr.vercel.app/api](https://orcabase-lab-gpr.vercel.app/api)  
> **Repositório GitHub:** [https://github.com/Wisterly/orcabase-lab-gpr](https://github.com/Wisterly/orcabase-lab-gpr)  
> **Caminho Local da Pasta Oficial:** `C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR`

---

## 1. 🏗️ Arquitetura do Sistema & Stack Tecnológica

| Camada | Tecnologia | Especificação Técnica |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15+ (App Router, TypeScript) | Abas de "Compatibilização" e "Configurações de Contratos", modal de criação de cards |
| **Estilização** | Tailwind CSS | **Dark Luxury Minimalista**: Fundo Deep Charcoal / Obsidian (`#07090E`), bordas finas (`#141A28`), acentos nobres em Metallic Gold (`#D4AF37`) e Vibrant Orange (`#F97316`) |
| **Motor de IA** | Leitura Semântica & Busca de Total Geral | Identificação da aba de orçamento, localização do "TOTAL GERAL", correspondência por palavras-chave |
| **Clonagem de Layout** | `openpyxl` (Strict Mode) | Preserva 100% do layout, cabeçalhos, logos, BDI e fórmulas do Contrato Base, manipulando exclusivamente os quantitativos |
| **Gerenciador de Contratos** | Cards & Modal Customizados | Cadastro de Contratos Base com Empresa, CT, BDI, Aba identificada e TOTAL GERAL salvo |
| **Backend** | Python Serverless Functions | Localizado em `/api/index.py`, executado na infraestrutura Vercel Edge/Serverless |
| **CI/CD** | GitHub + Vercel | Repositório conectado e sincronizado a cada tag de restauração (`PR.001` a `PR.007`) |
