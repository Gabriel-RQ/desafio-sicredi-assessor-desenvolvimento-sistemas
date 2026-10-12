'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import type { MetricasDashboard, ListaSolicitacoesPaginada } from '@sicredi/shared';
import { Clock, CheckCircle2, XCircle, Inbox, Layers } from 'lucide-react';

export function KpiCards() {
  const { isGestor, user, isMounted } = useAuth();

  // Para Gestor: busca métricas consolidadas em /dashboard
  const { data: metricasGestor, isLoading: isLoadingGestor } = useQuery<MetricasDashboard>({
    queryKey: ['dashboard-metricas-gestor'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data;
    },
    enabled: isMounted && isGestor === true,
  });

  // Para Solicitante: busca suas próprias solicitações para consolidar seus indicadores pessoais
  const { data: solicitacoesSolicitante, isLoading: isLoadingSolicitante } = useQuery<ListaSolicitacoesPaginada>({
    queryKey: ['solicitacoes-metricas-solicitante', user?.id],
    queryFn: async () => {
      const response = await api.get('/solicitacoes', { params: { limit: 100 } });
      return response.data;
    },
    enabled: isMounted && isGestor === false,
  });

  const metricas: MetricasDashboard | null = useMemo(() => {
    if (isGestor && metricasGestor) {
      return metricasGestor;
    }
    if (!isGestor && solicitacoesSolicitante) {
      const lista = solicitacoesSolicitante.data || [];
      return {
        total: solicitacoesSolicitante.meta.total || lista.length,
        porStatus: {
          aberta: lista.filter((s) => s.status === 'aberta').length,
          analise: lista.filter((s) => s.status === 'analise').length,
          aprovada: lista.filter((s) => s.status === 'aprovada').length,
          rejeitada: lista.filter((s) => s.status === 'rejeitada').length,
        },
        porPrioridade: {
          baixa: lista.filter((s) => s.prioridade === 'baixa').length,
          media: lista.filter((s) => s.prioridade === 'media').length,
          alta: lista.filter((s) => s.prioridade === 'alta').length,
        },
      };
    }
    return null;
  }, [isGestor, metricasGestor, solicitacoesSolicitante]);

  const isLoading = isGestor ? isLoadingGestor : isLoadingSolicitante;

  if (!isMounted || isLoading || !metricas) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-[#D7E6C8] h-24"
          />
        ))}
      </div>
    );
  }

  const { total, porStatus } = metricas;
  const abertaPct = total > 0 ? ((porStatus.aberta / total) * 100).toFixed(0) : '0';
  const analisePct = total > 0 ? ((porStatus.analise / total) * 100).toFixed(0) : '0';
  const aprovadaPct = total > 0 ? ((porStatus.aprovada / total) * 100).toFixed(0) : '0';
  const rejeitadaPct = total > 0 ? ((porStatus.rejeitada / total) * 100).toFixed(0) : '0';

  const cards = [
    {
      title: isGestor ? 'Total Geral' : 'Minhas Demandas',
      value: total,
      subtext: isGestor ? 'Demandas ativas na cooperativa' : 'Cadastradas por você',
      icon: Layers,
      color: '#146E37',
      bgLight: '#EAF6EC',
    },
    {
      title: 'Abertas',
      value: porStatus.aberta,
      subtext: `${abertaPct}% do volume`,
      icon: Inbox,
      color: '#8C6400',
      bgLight: '#FFF9E6',
    },
    {
      title: 'Em Análise',
      value: porStatus.analise,
      subtext: `${analisePct}% em deliberação`,
      icon: Clock,
      color: '#0F5796',
      bgLight: '#EBF4FC',
    },
    {
      title: 'Aprovadas',
      value: porStatus.aprovada,
      subtext: `${aprovadaPct}% taxa aprovação`,
      icon: CheckCircle2,
      color: '#116834',
      bgLight: '#EAF6EC',
    },
    {
      title: 'Rejeitadas',
      value: porStatus.rejeitada,
      subtext: `${rejeitadaPct}% taxa recusa`,
      icon: XCircle,
      color: '#940C2C',
      bgLight: '#FDF0F2',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Grade de Indicadores (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="bg-white p-4 rounded-xl border border-[#D7E6C8] shadow-xs flex flex-col justify-between transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5A645A]">
                  {c.title}
                </span>
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: c.bgLight, color: c.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-heading text-[#232B23]">
                  {c.value}
                </div>
                <div className="text-[11px] text-[#5A645A] mt-0.5 font-medium">
                  {c.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de Distribuição Proporcional */}
      {total > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-[#D7E6C8] shadow-xs">
          <div className="flex justify-between items-center text-xs text-[#5A645A] mb-2 font-medium">
            <span>Distribuição do Ciclo de Solicitações</span>
            <span>{total} demandas registradas</span>
          </div>
          <div className="h-2.5 w-full bg-[#E6EDE0] rounded-full overflow-hidden flex">
            {porStatus.aberta > 0 && (
              <div
                style={{ width: `${(porStatus.aberta / total) * 100}%` }}
                className="bg-[#FFCD00] h-full transition-all"
                title={`Abertas: ${porStatus.aberta}`}
              />
            )}
            {porStatus.analise > 0 && (
              <div
                style={{ width: `${(porStatus.analise / total) * 100}%` }}
                className="bg-[#1E78D4] h-full transition-all"
                title={`Em Análise: ${porStatus.analise}`}
              />
            )}
            {porStatus.aprovada > 0 && (
              <div
                style={{ width: `${(porStatus.aprovada / total) * 100}%` }}
                className="bg-[#146E37] h-full transition-all"
                title={`Aprovadas: ${porStatus.aprovada}`}
              />
            )}
            {porStatus.rejeitada > 0 && (
              <div
                style={{ width: `${(porStatus.rejeitada / total) * 100}%` }}
                className="bg-[#C0392B] h-full transition-all"
                title={`Rejeitadas: ${porStatus.rejeitada}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Distribuição por Prioridade (Edital 4.4) */}
      {total > 0 && metricas.porPrioridade && (
        <div className="bg-white p-3.5 rounded-xl border border-[#D7E6C8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-medium text-[#5A645A]">Distribuição por Prioridade:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#C0392B]" />
              <span className="text-[#5A645A]">Alta:</span>
              <strong className="text-[#232B23] font-mono">({metricas.porPrioridade.alta})</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FFCD00]" />
              <span className="text-[#5A645A]">Média:</span>
              <strong className="text-[#232B23] font-mono">({metricas.porPrioridade.media})</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#146E37]" />
              <span className="text-[#5A645A]">Baixa:</span>
              <strong className="text-[#232B23] font-mono">({metricas.porPrioridade.baixa})</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
