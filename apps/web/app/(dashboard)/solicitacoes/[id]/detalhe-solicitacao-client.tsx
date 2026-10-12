'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import type { Solicitacao } from '@sicredi/shared';
import { StatusBadge, PriorityBadge } from '../../../../components/ui/badge';
import { HistoricoTimeline } from './historico-timeline';
import {
  ArrowLeft,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  AlertCircle,
  Trash2,
  ChevronRight,
  Home,
} from 'lucide-react';

export function DetalheSolicitacaoClient({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isGestor, user } = useAuth();

  // Estados da decisão
  const [decisaoStatus, setDecisaoStatus] = useState<'aprovada' | 'rejeitada' | 'analise'>('aprovada');
  const [comentario, setComentario] = useState('');
  const [isSubmittingDecisao, setIsSubmittingDecisao] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Consulta da Solicitação
  const { data: solicitacao, isLoading, error } = useQuery<Solicitacao>({
    queryKey: ['solicitacao-detalhe', id],
    queryFn: async () => {
      const response = await api.get(`/solicitacoes/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  // Mutação para registrar decisão
  const handleDecidir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitacao || (solicitacao.status !== 'aberta' && solicitacao.status !== 'analise')) {
      toast.error('Esta solicitação já foi finalizada e não pode receber novas decisões.');
      return;
    }

    if (!comentario.trim()) {
      toast.error('Informe o parecer ou justificativa da decisão.');
      return;
    }

    try {
      setIsSubmittingDecisao(true);
      await api.patch(`/solicitacoes/${id}/decidir`, {
        status: decisaoStatus,
        comentario: comentario.trim(),
      });

      toast.success(
        decisaoStatus === 'aprovada'
          ? 'Solicitação aprovada com sucesso!'
          : decisaoStatus === 'rejeitada'
          ? 'Solicitação rejeitada com justificativa.'
          : 'Solicitação colocada em análise técnica.'
      );

      setComentario('');
      // Invalida as consultas para atualizar os dados da tela e do dashboard
      queryClient.invalidateQueries({ queryKey: ['solicitacao-detalhe', id] });
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metricas'] });
    } catch (err: unknown) {
      let msg = 'Não foi possível registrar a decisão.';
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { detail?: string; message?: string };
        msg = data.detail || data.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSubmittingDecisao(false);
    }
  };

  // Mutação para remover (soft delete)
  const handleExcluir = async () => {
    if (!confirm('Deseja realmente remover esta solicitação?')) return;

    try {
      setIsDeleting(true);
      await api.delete(`/solicitacoes/${id}`);
      toast.success('Solicitação removida com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metricas'] });
      router.push('/');
    } catch (err: unknown) {
      let msg = 'Não foi possível remover a solicitação.';
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { detail?: string; message?: string };
        msg = data.detail || data.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded w-96" />
        <div className="h-64 bg-white rounded-xl border border-[#D7E6C8]" />
      </div>
    );
  }

  if (error || !solicitacao) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="p-3 bg-[#FDF0F2] text-[#C0392B] rounded-full inline-flex mb-3">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-[#232B23]">
          Solicitação não encontrada
        </h2>
        <p className="text-xs text-[#5A645A] mt-2 mb-6">
          A solicitação procurada não existe ou você não possui permissão para visualizá-la.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#146E37] hover:bg-[#0F532A] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Painel</span>
        </Link>
      </div>
    );
  }

  const isDono = solicitacao.solicitanteId === user?.id;
  const isPendente = solicitacao.status === 'aberta' || solicitacao.status === 'analise';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
        <Link href="/" className="hover:text-[#146E37] transition-colors">
          Solicitações Internas
        </Link>
        <ChevronRight className="h-3 w-3 text-[#D7E6C8]" />
        <span className="font-semibold text-[#232B23]">
          #{solicitacao.id.slice(0, 8).toUpperCase()}
        </span>
      </nav>

      {/* Cabeçalho da Demanda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#D7E6C8]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold text-[#5A645A]">
              #{solicitacao.id.slice(0, 8).toUpperCase()}
            </span>
            <StatusBadge status={solicitacao.status} />
            <PriorityBadge prioridade={solicitacao.prioridade} />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#232B23] tracking-tight">
            {solicitacao.titulo}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Ação de Exclusão (se for dono ou gestor e estiver pendente) */}
          {(isDono || isGestor) && isPendente && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleExcluir}
              title="Remover solicitação"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#C0392B] hover:bg-[#FDF0F2] border border-[#F8D0D6] transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </button>
          )}

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#5A645A] hover:text-[#232B23] hover:bg-white border border-[#D7E6C8] transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>
      </div>

      {/* Grid Principal de Dados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna da Esquerda/Centro: Detalhes e Descrição */}
        <div className="md:col-span-2 space-y-6">
          {/* Card da Descrição */}
          <div className="bg-white p-6 rounded-xl border border-[#D7E6C8] shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A645A] mb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#146E37]" />
              <span>Descrição da Solicitação</span>
            </h2>
            <div className="text-sm text-[#232B23] whitespace-pre-wrap leading-relaxed">
              {solicitacao.descricao}
            </div>
          </div>

          {/* Histórico de Decisões e Pareceres */}
          <div className="bg-white p-6 rounded-xl border border-[#D7E6C8] shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A645A] mb-4 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#146E37]" />
              <span>Histórico de Pareceres e Deliberação</span>
            </h2>

            <HistoricoTimeline historicos={solicitacao.historicosDecisao} />
          </div>

          {/* Painel de Avaliação (Exclusivo para Gestores) */}
          {isGestor && (
            isPendente ? (
              <div className="bg-white p-6 rounded-xl border border-[#146E37] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#D7E6C8]">
                  <ShieldCheck className="h-5 w-5 text-[#146E37]" />
                  <div>
                    <h2 className="text-sm font-bold font-heading text-[#232B23]">
                      Emitir Parecer de Gestão
                    </h2>
                    <p className="text-xs text-[#5A645A]">
                      Delibere sobre a solicitação registrando a justificativa técnica institucional
                    </p>
                  </div>
                </div>

                <form onSubmit={handleDecidir} className="space-y-4">
                  {/* Seletor de Decisão */}
                  <div>
                    <label className="block text-xs font-semibold text-[#232B23] mb-1.5">
                      Decisão Operacional:
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDecisaoStatus('aprovada')}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          decisaoStatus === 'aprovada'
                            ? 'bg-[#EAF6EC] border-[#146E37] text-[#116834] ring-1 ring-[#146E37]'
                            : 'border-[#D7E6C8] bg-white text-[#5A645A] hover:bg-[#EAF6EC]'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Aprovar</span>
                      </button>

                      <button
                        type="button"
                        disabled={solicitacao.status === 'analise'}
                        title={
                          solicitacao.status === 'analise'
                            ? 'A solicitação já está em análise técnica'
                            : 'Colocar solicitação em análise técnica'
                        }
                        onClick={() => setDecisaoStatus('analise')}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          solicitacao.status === 'analise'
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : decisaoStatus === 'analise'
                            ? 'bg-[#EBF4FC] border-[#1E78D4] text-[#0F5796] ring-1 ring-[#1E78D4]'
                            : 'border-[#D7E6C8] bg-white text-[#5A645A] hover:bg-[#EBF4FC]'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Em Análise</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDecisaoStatus('rejeitada')}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          decisaoStatus === 'rejeitada'
                            ? 'bg-[#FDF0F2] border-[#C0392B] text-[#940C2C] ring-1 ring-[#C0392B]'
                            : 'border-[#D7E6C8] bg-white text-[#5A645A] hover:bg-[#FDF0F2]'
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  </div>

                  {/* Comentário / Justificativa */}
                  <div>
                    <label
                      htmlFor="comentario"
                      className="block text-xs font-semibold text-[#232B23] mb-1.5"
                    >
                      Parecer / Justificativa Institucional <span className="text-[#C0392B]">*</span>
                    </label>
                    <textarea
                      id="comentario"
                      rows={4}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Descreva as razões da decisão, direcionamentos ou eventuais pendências..."
                      className="block w-full rounded-lg border border-[#D7E6C8] px-3.5 py-2.5 text-xs text-[#232B23] placeholder-[#828E82] focus:outline-none focus:ring-1 focus:ring-[#146E37] focus:border-[#146E37]"
                    />
                  </div>

                  {/* Botão de Envio do Parecer */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingDecisao}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#146E37] hover:bg-[#0F532A] shadow-xs hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmittingDecisao ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Registrar Decisão</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-[#F5F8F4] p-5 rounded-xl border border-[#D7E6C8] flex items-center gap-3.5 text-xs text-[#5A645A]">
                <CheckCircle2 className="h-5 w-5 text-[#146E37] shrink-0" />
                <div>
                  <strong className="text-[#232B23] block text-sm">
                    Deliberação Concluída
                  </strong>
                  Esta solicitação já foi finalizada com o status{' '}
                  <strong className="capitalize text-[#232B23]">{solicitacao.status}</strong>{' '}
                  e não permite a emissão de novos pareceres.
                </div>
              </div>
            )
          )}
        </div>

        {/* Coluna da Direita: Metadados Estruturais */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#D7E6C8] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A645A] pb-2 border-b border-[#E6EDE0]">
              Informações Institucionais
            </h3>

            {/* Solicitante */}
            <div className="flex items-start gap-2.5">
              <User className="h-4 w-4 text-[#146E37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-[#5A645A] block">
                  Solicitante Responsável
                </span>
                <span className="text-xs font-bold text-[#232B23]">
                  {solicitacao.solicitante?.nome || 'Não identificado'}
                </span>
                <span className="text-[11px] text-[#5A645A] block">
                  {solicitacao.solicitante?.email}
                </span>
              </div>
            </div>

            {/* Área Solicitante */}
            <div className="flex items-start gap-2.5">
              <Building2 className="h-4 w-4 text-[#146E37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-[#5A645A] block">
                  Coordenação / Área
                </span>
                <span className="text-xs font-bold text-[#232B23]">
                  {solicitacao.area?.descricao || 'Geral'}
                </span>
              </div>
            </div>

            {/* Data de Criação */}
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-[#146E37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-[#5A645A] block">
                  Data de Abertura
                </span>
                <span className="text-xs font-bold text-[#232B23]">
                  {formatDate(solicitacao.dataSolicitacao)}
                </span>
              </div>
            </div>

            {/* Data de Atualização */}
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-[#146E37] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-[#5A645A] block">
                  Última Atualização
                </span>
                <span className="text-xs font-bold text-[#232B23]">
                  {formatDate(solicitacao.dataAtualizacao)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
