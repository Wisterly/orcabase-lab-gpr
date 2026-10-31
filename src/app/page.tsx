"use client";

import React, { useState } from "react";
import {
  Brain,
  Cpu,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRightLeft,
  Database,
  Sparkles,
  Zap,
  Globe,
  GitBranch,
} from "lucide-react";
import { CalculationStrategy, ItemBase, MappingMemory } from "@/types";

export default function Home() {
  const [strategy, setStrategy] = useState<CalculationStrategy["mode"]>("KEEP_TOTAL_VALUE");
  
  // Amostra de itens para demonstração dos modelos de dados
  const [items] = useState<ItemBase[]>([
    {
      id: "ITEM-001",
      description: "CONCRETO USINADO FCK 30 MPA BOMBEAVEL SLUMP 12 +/- 2",
      unit: "M3",
      quantity: 45.5,
      unit_price: 485.0,
      total_value: 22067.5,
    },
    {
      id: "ITEM-002",
      description: "ACO CA-50 D=10.0MM (3/8) CORTE E DOBRA EM CANTEIRO",
      unit: "KG",
      quantity: 1250.0,
      unit_price: 9.85,
      total_value: 12312.5,
    },
    {
      id: "ITEM-003",
      description: "FORMA DE COMPENSADO RESINADO E=12MM P/ ESTRUTURA",
      unit: "M2",
      quantity: 320.0,
      unit_price: 68.4,
      total_value: 21888.0,
    },
  ]);

  const [memories] = useState<MappingMemory[]>([
    {
      base_description: "CONCRETO USINADO FCK 30 MPA BOMBEAVEL SLUMP 12 +/- 2",
      base_unit: "M3",
      dest_code: "SINAPI-94970",
      dest_description: "CONCRETO FCK 30MPA, TRACO 1:1,9:2,3 - LANCAMENTO E ADENSAMENTO",
      dest_unit: "M3",
      match_type: "AI_SUGGESTION",
    },
    {
      base_description: "ACO CA-50 D=10.0MM (3/8) CORTE E DOBRA EM CANTEIRO",
      base_unit: "KG",
      dest_code: "SINAPI-101689",
      dest_description: "ARMACAO DE PILAR OU VIGA UTILIZANDO ACO CA-50 DE 10,0 MM",
      dest_unit: "KG",
      match_type: "HISTORICAL_MEMORY",
    },
  ]);

  return (
    <main className="min-h-screen bg-navy-950 text-gray-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 border-b border-navy-800 bg-navy-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-orange-500 shadow-lg shadow-gold-500/20">
              <Brain className="h-6 w-6 text-navy-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  OrcaEng <span className="bg-gradient-to-r from-gold-400 to-orange-400 bg-clip-text text-transparent">Lab AI</span>
                </span>
                <span className="rounded-full bg-navy-800 px-2 py-0.5 text-xs font-semibold text-gold-400 border border-gold-500/30">
                  AI Matching v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400">Motor Inteligente de De-Para e Orçamentação</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden items-center space-x-2 rounded-lg border border-navy-800 bg-navy-950/80 px-3 py-1.5 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">Produção 24/7 Ativa</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-gold-400">
              <GitBranch className="h-3.5 w-3.5" />
              <span>PR.001</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Banner de Boas-Vindas e Stack */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-900 via-charcoal-900 to-navy-950 p-6 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400 border border-orange-500/30 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Módulo de Engenharia e Inteligência Artificial Inicializado</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                Compatibilização Semântica de Planilhas Orçamentárias
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                Processamento vetorial com preservação integral de fórmulas vivas, parser seguro em{" "}
                <span className="font-semibold text-gold-400">openpyxl</span> e estratégia matemática configurável.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <div className="rounded-xl border border-navy-800 bg-navy-950/60 p-3">
                <div className="flex items-center space-x-2 text-gold-400 mb-1">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Excel Engine</span>
                </div>
                <div className="text-sm font-semibold text-white">openpyxl</div>
                <div className="text-[10px] text-gray-400">Strict Excel Generation</div>
              </div>

              <div className="rounded-xl border border-navy-800 bg-navy-950/60 p-3">
                <div className="flex items-center space-x-2 text-orange-400 mb-1">
                  <Cpu className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Engine</span>
                </div>
                <div className="text-sm font-semibold text-white">Embeddings / Cosine</div>
                <div className="text-[10px] text-gray-400">Vetorização Semântica</div>
              </div>

              <div className="rounded-xl border border-navy-800 bg-navy-950/60 p-3">
                <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Backend</span>
                </div>
                <div className="text-sm font-semibold text-white">Python Serverless</div>
                <div className="text-[10px] text-gray-400">Vercel Edge & Cloud</div>
              </div>

              <div className="rounded-xl border border-navy-800 bg-navy-950/60 p-3">
                <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                  <Database className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Database</span>
                </div>
                <div className="text-sm font-semibold text-white">Postgres / Supabase</div>
                <div className="text-[10px] text-gray-400">Memória de Mapeamento</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Control Panel */}
        <div className="mb-8 rounded-2xl border border-navy-800 bg-navy-900/60 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                  Estratégia de Cálculo Ativa (`CalculationStrategy`)
                </h2>
                <p className="text-xs text-gray-400">Define o comportamento ao aplicar o De-Para em novos insumos</p>
              </div>
            </div>

            <div className="flex rounded-xl bg-navy-950 p-1 border border-navy-800">
              <button
                onClick={() => setStrategy("KEEP_TOTAL_VALUE")}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  strategy === "KEEP_TOTAL_VALUE"
                    ? "bg-gold-500 text-navy-950 shadow-md shadow-gold-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>KEEP_TOTAL_VALUE (Manter Valor Total)</span>
              </button>
              <button
                onClick={() => setStrategy("KEEP_QUANTITY")}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  strategy === "KEEP_QUANTITY"
                    ? "bg-gold-500 text-navy-950 shadow-md shadow-gold-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>KEEP_QUANTITY (Manter Quantidade)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tables Section - Strict Mobile-First to Desktop Scaling */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Tabela de Itens Base (ItemBase) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-navy-800 bg-charcoal-900/90 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-navy-800 bg-navy-900/80 px-5 py-4">
                <div className="flex items-center space-x-2.5">
                  <Layers className="h-5 w-5 text-gold-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Itens da Planilha Base (`ItemBase`)
                  </h3>
                </div>
                <span className="rounded-md bg-navy-800 px-2 py-0.5 text-xs font-medium text-gray-300">
                  {items.length} itens carregados
                </span>
              </div>

              {/* Responsive Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-navy-800 bg-navy-950 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Descrição do Insumo / Serviço</th>
                      <th className="px-3 py-3 text-center">UN</th>
                      <th className="px-3 py-3 text-right">Qtd</th>
                      <th className="px-3 py-3 text-right">Unitário (R$)</th>
                      <th className="px-4 py-3 text-right">Total (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60 font-mono">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-navy-800/40 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-gold-400">
                          {item.id}
                        </td>
                        <td className="px-4 py-3 font-sans text-gray-200">
                          {item.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-400">
                          {item.unit}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-gray-200">
                          {item.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-gray-300">
                          {item.unit_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-white">
                          {item.total_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tabela de Memória de Mapeamento (MappingMemory) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-navy-800 bg-charcoal-900/90 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-navy-800 bg-navy-900/80 px-5 py-4">
                <div className="flex items-center space-x-2.5">
                  <ArrowRightLeft className="h-5 w-5 text-orange-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Memória De-Para (`MappingMemory`)
                  </h3>
                </div>
                <span className="rounded-md bg-navy-800 px-2 py-0.5 text-xs font-medium text-orange-400">
                  {memories.length} regras ativas
                </span>
              </div>

              <div className="divide-y divide-navy-800/60 p-4 space-y-4">
                {memories.map((mem, idx) => (
                  <div key={idx} className="rounded-xl border border-navy-800 bg-navy-950/70 p-3.5 hover:border-gold-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-gold-400">{mem.dest_code}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                          mem.match_type === "AI_SUGGESTION"
                            ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                            : mem.match_type === "HISTORICAL_MEMORY"
                            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {mem.match_type}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 mb-1">
                      <span className="font-semibold text-gray-300">Base:</span> {mem.base_description} ({mem.base_unit})
                    </div>
                    <div className="text-xs text-gray-200">
                      <span className="font-semibold text-gold-400">Destino:</span> {mem.dest_description} ({mem.dest_unit})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-800 pt-6 text-xs text-gray-500 sm:flex-row">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gold-400" />
            <span>OrcaEng Lab AI Matching • Infraestrutura Vercel Serverless & GitHub CI/CD</span>
          </div>
          <div>
            <span>Engenharia GPR 2026 • Design System Dark Industrial Luxury</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
