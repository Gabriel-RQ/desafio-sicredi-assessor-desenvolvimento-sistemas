'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import type {
  ListaSolicitacoesPaginada,
  AreaResponse,
  Status,
  Prioridade,
  Solicitacao,
} from '@sicredi/shared';
import { StatusBadge, PriorityBadge } from '../ui/badge';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';

export function RequestsTable() {
  const { isGestor, isMounted } = useAuth();

  // Estados dos filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [prioridadeFilter, setPrioridadeFilter] = useState<Prioridade | ''>('');
  const [areaFilter, setAreaFilter] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<
    'dataSolicitacao' | 'prioridade' | 'status' | 'titulo' | 'dataAtualizacao'
  >('dataSolicitacao');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Buscar Áreas cadastradas
  const { data: areas } = useQuery<AreaResponse[]>({
    queryKey: ['areas-list'],
    queryFn: async () => {
      const response = await api.get('/areas');
      return response.data;
    },
    enabled: isMounted,
  });

  // Buscar Solicitações com parâmetros
  const {
    data: solicitacoesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<ListaSolicitacoesPaginada>({
    queryKey: [
      'solicitacoes-list',
      page,
      limit,
      searchTerm,
      statusFilter,
      prioridadeFilter,
      areaFilter,
      sortBy,
      order,
    ],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit,
        sortBy,
        order,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (prioridadeFilter) params.prioridade = prioridadeFilter;
      if (areaFilter) params.areaId = areaFilter;

      const response = await api.get('/solicitacoes', { params });
      return response.data;
    },
    enabled: isMounted,
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPrioridadeFilter('');
    setAreaFilter('');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) || Boolean(statusFilter) || Boolean(prioridadeFilter) || Boolean(areaFilter);

  const formatProtocolo = (id: string) => {
    return `#${id.slice(0, 8).toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const renderContextualAction = (solicitacao: Solicitacao) => {
    const isPendente = solicitacao.status === 'aberta' || solicitacao.status === 'analise';

    if (isPendente && isGestor) {
      return (
        <Link
          href={`/solicitacoes/${solicitacao.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#146E37] bg-[#EAF6EC] hover:bg-[#146E37] hover:text-white border border-[#C8E6CE] transition-all shadow-2xs"
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          <span>Avaliar</span>
        </Link>
      );
    }

    if (solicitacao.status === 'aprovada') {
      return (
        <Link
          href={`/solicitacoes/${solicitacao.id}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#116834] hover:bg-[#EAF6EC] transition-all"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Ver Parecer</span>
        </Link>
      );
    }

    if (solicitacao.status === 'rejeitada') {
      return (
        <Link
          href={`/solicitacoes/${solicitacao.id}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#940C2C] hover:bg-[#FDF0F2] transition-all"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Justificativa</span>
        </Link>
      );
    }

    return (
      <Link
        href={`/solicitacoes/${solicitacao.id}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5A645A] hover:text-[#232B23] hover:bg-[#F5F8F4] transition-all"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>Detalhes</span>
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#D7E6C8] shadow-xs overflow-hidden">
      {/* Abas Rápidas por Status */}
      <div className="flex border-b border-[#D7E6C8] bg-[#F5F8F4]/50 px-4 pt-3 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setStatusFilter('');
            setPage(1);
          }}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            statusFilter === ''
              ? 'border-[#146E37] text-[#146E37]'
              : 'border-transparent text-[#5A645A] hover:text-[#232B23]'
          }`}
        >
          Todas as Demandas
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('aberta');
            setPage(1);
          }}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            statusFilter === 'aberta'
              ? 'border-[#FFCD00] text-[#8C6400]'
              : 'border-transparent text-[#5A645A] hover:text-[#232B23]'
          }`}
        >
          Abertas
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('analise');
            setPage(1);
          }}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            statusFilter === 'analise'
              ? 'border-[#1E78D4] text-[#0F5796]'
              : 'border-transparent text-[#5A645A] hover:text-[#232B23]'
          }`}
        >
          Em Análise
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('aprovada');
            setPage(1);
          }}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            statusFilter === 'aprovada'
              ? 'border-[#146E37] text-[#116834]'
              : 'border-transparent text-[#5A645A] hover:text-[#232B23]'
          }`}
        >
          Aprovadas
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter('rejeitada');
            setPage(1);
          }}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            statusFilter === 'rejeitada'
              ? 'border-[#C0392B] text-[#940C2C]'
              : 'border-transparent text-[#5A645A] hover:text-[#232B23]'
          }`}
        >
          Rejeitadas
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="p-4 border-b border-[#D7E6C8] bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5A645A]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por título, descrição ou solicitante..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#D7E6C8] pl-9 pr-3 py-2 text-xs text-[#232B23] placeholder-[#828E82] focus:outline-none focus:ring-1 focus:ring-[#146E37] focus:border-[#146E37] bg-white transition-all"
          />
        </div>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Prioridade */}
          <select
            value={prioridadeFilter}
            onChange={(e) => {
              setPrioridadeFilter(e.target.value as Prioridade | '');
              setPage(1);
            }}
            className="rounded-lg border border-[#D7E6C8] px-3 py-2 text-xs text-[#232B23] focus:outline-none focus:ring-1 focus:ring-[#146E37] bg-white cursor-pointer"
          >
            <option value="">Prioridade: Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Área */}
          <select
            value={areaFilter}
            onChange={(e) => {
              setAreaFilter(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
            className="rounded-lg border border-[#D7E6C8] px-3 py-2 text-xs text-[#232B23] focus:outline-none focus:ring-1 focus:ring-[#146E37] bg-white cursor-pointer max-w-[160px] truncate"
          >
            <option value="">Área: Todas</option>
            {areas?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.descricao}
              </option>
            ))}
          </select>

          {/* Ordenação */}
          <select
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('-') as [
                'dataSolicitacao' | 'prioridade' | 'status' | 'titulo' | 'dataAtualizacao',
                'asc' | 'desc',
              ];
              setSortBy(newSort);
              setOrder(newOrder);
              setPage(1);
            }}
            className="rounded-lg border border-[#D7E6C8] px-3 py-2 text-xs text-[#232B23] focus:outline-none focus:ring-1 focus:ring-[#146E37] bg-white cursor-pointer"
          >
            <option value="dataSolicitacao-desc">Mais recentes</option>
            <option value="dataSolicitacao-asc">Mais antigas</option>
            <option value="prioridade-desc">Maior prioridade</option>
            <option value="status-asc">Status</option>
          </select>

          {/* Botão Reset */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Limpar filtros"
              className="p-2 rounded-lg text-[#5A645A] hover:text-[#C0392B] hover:bg-[#FDF0F2] transition-colors border border-transparent hover:border-[#F8D0D6]"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Recarregar */}
          <button
            type="button"
            onClick={() => refetch()}
            title="Atualizar dados"
            disabled={isMounted ? isFetching : false}
            className="p-2 rounded-lg text-[#5A645A] hover:text-[#146E37] hover:bg-[#EAF6EC] transition-colors border border-transparent hover:border-[#C8E6CE]"
          >
            <RefreshCw
              className={`h-4 w-4 ${isMounted && isFetching ? 'animate-spin text-[#146E37]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#232B23]">
          <thead className="bg-[#F5F8F4] text-[#5A645A] font-semibold uppercase tracking-wider text-[11px] border-b border-[#D7E6C8]">
            <tr>
              <th scope="col" className="px-4 py-3 w-28">
                Protocolo
              </th>
              <th scope="col" className="px-4 py-3">
                Demanda & Solicitante
              </th>
              <th scope="col" className="px-4 py-3 w-44">
                Área Solicitante
              </th>
              <th scope="col" className="px-4 py-3 w-28">
                Prioridade
              </th>
              <th scope="col" className="px-4 py-3 w-32">
                Status
              </th>
              <th scope="col" className="px-4 py-3 w-36">
                Data Abertura
              </th>
              <th scope="col" className="px-4 py-3 w-28 text-right">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EDE0]">
            {!isMounted || isLoading ? (
              [...Array(limit)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-200 rounded w-28" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="h-6 bg-gray-200 rounded w-16 ml-auto" />
                  </td>
                </tr>
              ))
            ) : solicitacoesData?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#5A645A]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-[#F5F8F4] rounded-full text-[#5A645A]">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="font-semibold text-sm text-[#232B23]">
                      Nenhuma solicitação encontrada
                    </span>
                    <p className="text-xs max-w-sm text-[#5A645A]">
                      Não foram localizados registros para os critérios e filtros
                      informados.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-semibold text-[#146E37] hover:underline"
                      >
                        Limpar todos os filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              solicitacoesData?.data.map((solicitacao) => (
                <tr
                  key={solicitacao.id}
                  className="hover:bg-[#F5F8F4]/60 transition-colors"
                >
                  {/* Protocolo */}
                  <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-[#5A645A]">
                    {formatProtocolo(solicitacao.id)}
                  </td>

                  {/* Demanda & Solicitante */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-[#232B23] text-sm hover:text-[#146E37] transition-colors">
                      <Link href={`/solicitacoes/${solicitacao.id}`}>
                        {solicitacao.titulo}
                      </Link>
                    </div>
                    <div className="text-[11px] text-[#5A645A] mt-0.5">
                      Por: {solicitacao.solicitante?.nome || 'Não informado'}
                    </div>
                  </td>

                  {/* Área */}
                  <td className="px-4 py-3.5 text-[#5A645A]">
                    {solicitacao.area?.descricao || '-'}
                  </td>

                  {/* Prioridade */}
                  <td className="px-4 py-3.5">
                    <PriorityBadge prioridade={solicitacao.prioridade} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={solicitacao.status} />
                  </td>

                  {/* Data */}
                  <td className="px-4 py-3.5 text-[#5A645A] text-[11px]">
                    {formatDate(solicitacao.dataSolicitacao)}
                  </td>

                  {/* Ação Contextual (Ergonomia) */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {renderContextualAction(solicitacao)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {solicitacoesData && solicitacoesData.meta.total > 0 && (
        <div className="p-4 border-t border-[#D7E6C8] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A645A]">
          <div className="flex items-center gap-2">
            <span>
              Exibindo{' '}
              <strong className="text-[#232B23]">
                {Math.min(
                  (solicitacoesData.meta.page - 1) * solicitacoesData.meta.limit + 1,
                  solicitacoesData.meta.total,
                )}
              </strong>{' '}
              a{' '}
              <strong className="text-[#232B23]">
                {Math.min(
                  solicitacoesData.meta.page * solicitacoesData.meta.limit,
                  solicitacoesData.meta.total,
                )}
              </strong>{' '}
              de{' '}
              <strong className="text-[#232B23]">
                {solicitacoesData.meta.total}
              </strong>{' '}
              solicitações
            </span>

            <span className="mx-2 text-[#D7E6C8] hidden sm:inline">|</span>

            <div className="flex items-center gap-1.5">
              <span>Por página:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-[#D7E6C8] px-2 py-1 text-xs text-[#232B23] focus:outline-none focus:ring-1 focus:ring-[#146E37] bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded border border-[#D7E6C8] text-[#5A645A] hover:bg-[#F5F8F4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-[#232B23]">
              {page} de {solicitacoesData.meta.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= solicitacoesData.meta.totalPages}
              onClick={() =>
                setPage((p) => Math.min(p + 1, solicitacoesData.meta.totalPages))
              }
              className="p-1.5 rounded border border-[#D7E6C8] text-[#5A645A] hover:bg-[#F5F8F4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
