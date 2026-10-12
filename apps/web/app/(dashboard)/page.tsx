'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Home, ChevronRight, Layers } from 'lucide-react';
import { KpiCards } from '../../components/dashboard/kpi-cards';
import { RequestsTable } from '../../components/dashboard/requests-table';
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Corporativo */}
      <nav aria-label="Navegação estrutural" className="flex items-center gap-1.5 text-xs text-[#5A645A]">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-[#146E37] transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Início</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-[#D7E6C8]" />
        <span>Processos Corporativos</span>
        <ChevronRight className="h-3 w-3 text-[#D7E6C8]" />
        <span className="font-semibold text-[#232B23]">
          Solicitações Internas
        </span>
      </nav>

      {/* Cabeçalho da Página com Ação Primária */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#D7E6C8]">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#232B23] tracking-tight">
            Painel de Solicitações Internas
          </h1>
          <p className="text-xs text-[#5A645A] mt-1">
            Gestão centralizada de demandas, triagem e deliberação cooperativa
          </p>
        </div>

        {/* Botão de Criação */}
        <div>
          <Link
            href="/solicitacoes/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#3FA110] hover:bg-[#146E37] shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#146E37] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Solicitação</span>
          </Link>
        </div>
      </div>

      {/* Indicadores Resumo (KPIs) */}
      <section aria-labelledby="kpis-title">
        <h2 id="kpis-title" className="sr-only">
          Métricas e Indicadores
        </h2>
        <KpiCards />
      </section>

      {/* Tabela de Solicitações */}
      <section aria-labelledby="tabela-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#146E37]" />
            <h2 id="tabela-title" className="text-sm font-bold font-heading text-[#232B23]">
              Fila de Atendimento e Consulta
            </h2>
          </div>
          <span className="text-xs text-[#5A645A]">
            Atualização em tempo real
          </span>
        </div>
        <RequestsTable />
      </section>
    </div>
  );
}
