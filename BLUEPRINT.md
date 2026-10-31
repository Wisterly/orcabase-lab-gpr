# 📘 BLUEPRINT TÉCNICO OFICIAL — OrçaBase.lab - GPR

> **Módulo:** `OrçaBase.lab - GPR`  
> **Versão:** 1.4.0 (`PR.005` implantado e ativo)  
> **Ambiente de Produção 24/7:** [https://orcabase-lab-gpr.vercel.app](https://orcabase-lab-gpr.vercel.app)  
> **Backend Python Serverless:** [https://orcabase-lab-gpr.vercel.app/api](https://orcabase-lab-gpr.vercel.app/api)  
> **Repositório GitHub:** [https://github.com/Wisterly/orcabase-lab-gpr](https://github.com/Wisterly/orcabase-lab-gpr)  
> **Caminho Local da Pasta Oficial:** `C:\Users\Lenovo\Documents\antigravity\LAB - GPR\OrçaBase.lab - GPR`

---

## 1. 🏗️ Arquitetura do Sistema & Stack Tecnológica

| Camada | Tecnologia | Especificação Técnica |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15+ (App Router, TypeScript) | Interface minimalista, dinâmica e reativa — sem dados falsos/mock |
| **Estilização** | Tailwind CSS | **Dark Luxury Minimalista**: Fundo Deep Charcoal / Obsidian (`#07090E`), bordas finas (`#141A28`), acentos nobres em Metallic Gold (`#D4AF37`) e Vibrant Orange (`#F97316`) |
| **Ingestão Dinâmica** | Drag & Drop Multi-Zone | Leitura real de `.xlsx` arrastados pelo usuário com extração em tempo real |
| **Backend** | Python Serverless Functions | Localizado em `/api/index.py`, executado na infraestrutura Vercel Edge/Serverless |
| **Motor de Excel** | `openpyxl` (Strict Mode) | Geração multi-aba ("Orçamento Compatibilizado" + "Curva ABC (Pareto)"), preservando fórmulas vivas de multiplicação e soma (`calcProperties.fullCalcOnLoad = True`) |
| **Motor de IA** | Matching Semântico & Vetorial | Heurística ponderada com tokens de especificações técnicas, Jaccard e bônus de unidade |
| **Memória de Aprendizado** | `MappingMemory` (LocalStorage) | Gravação de decisões manuais com prioridade automática de 100% |
| **Análise de Engenharia** | Curva ABC (Princípio de Pareto) | Separação em Classe A (80% do valor), Classe B (15%) e Classe C (5%) |
| **CI/CD** | GitHub + Vercel | Repositório conectado e sincronizado a cada tag de restauração (`PR.001` a `PR.005`) |
