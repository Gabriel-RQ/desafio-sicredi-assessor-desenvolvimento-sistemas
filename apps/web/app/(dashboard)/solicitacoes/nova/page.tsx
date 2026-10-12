'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import { api } from '../../../../lib/api';
import type { AreaResponse } from '@sicredi/shared';
import {
  ChevronRight,
  Home,
  ArrowLeft,
  Send,
  Info,
} from 'lucide-react';

const novaSolicitacaoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter no mínimo 3 caracteres.')
    .max(150, 'O título deve ter no máximo 150 caracteres.'),
  areaSolicitanteId: z
    .number({ message: 'Selecione uma área solicitante válida.' })
    .positive('Selecione uma área solicitante válida.'),
  prioridade: z.enum(['baixa', 'media', 'alta']),
  descricao: z
    .string()
    .min(5, 'A descrição deve ter no mínimo 5 caracteres.'),
});

type NovaSolicitacaoFormData = z.infer<typeof novaSolicitacaoSchema>;

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar lista de áreas cadastradas
  const { data: areas, isLoading: isLoadingAreas } = useQuery<AreaResponse[]>({
    queryKey: ['areas-list'],
    queryFn: async () => {
      const response = await api.get('/areas');
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<NovaSolicitacaoFormData>({
    resolver: zodResolver(novaSolicitacaoSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      prioridade: 'media',
    },
  });

  const queryClient = useQueryClient();

  const selectedPrioridade = useWatch({ control, name: 'prioridade' });

  const onSubmit = async (data: NovaSolicitacaoFormData) => {
    try {
      setIsSubmitting(true);
      await api.post('/solicitacoes', data);
      await queryClient.invalidateQueries({ queryKey: ['solicitacoes-list'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-metricas-gestor'] });
      await queryClient.invalidateQueries({ queryKey: ['solicitacoes-metricas-solicitante'] });
      toast.success('Solicitação cadastrada com sucesso!');
      router.push('/');
    } catch (error: unknown) {
      let mensagem = 'Não foi possível registrar a solicitação. Tente novamente.';
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as { detail?: string; message?: string };
        mensagem = data.detail || data.message || mensagem;
      }
      toast.error(mensagem);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Nova Solicitação
        </span>
      </nav>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D7E6C8]">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#232B23] tracking-tight">
            Nova Solicitação Interna
          </h1>
          <p className="text-xs text-[#5A645A] mt-1">
            Preencha os dados abaixo para submeter sua demanda à triagem e avaliação dos gestores
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#5A645A] hover:text-[#232B23] hover:bg-white border border-[#D7E6C8] transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar ao Painel</span>
        </Link>
      </div>

      {/* Card do Formulário */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#D7E6C8] shadow-xs">
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Título da Demanda */}
          <div>
            <label
              htmlFor="titulo"
              className="block text-sm font-semibold text-[#232B23] mb-1.5"
            >
              Título da Demanda <span className="text-[#C0392B]">*</span>
            </label>
            <div className="relative rounded-lg">
              <input
                id="titulo"
                type="text"
                placeholder="Ex.: Solicitação de expansão de licenças operacionais..."
                {...register('titulo')}
                className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#232B23] placeholder-[#828E82] transition-colors focus:outline-none ${
                  errors.titulo
                    ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]'
                    : 'border-[#D7E6C8] focus:border-[#146E37] focus:ring-1 focus:ring-[#146E37]'
                }`}
              />
            </div>
            {errors.titulo ? (
              <p className="mt-1.5 text-xs text-[#C0392B]">
                {errors.titulo.message}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-[#5A645A]">
                Resumo claro e conciso da necessidade operacional (3 a 150 caracteres).
              </p>
            )}
          </div>

          {/* Linha dupla: Área Solicitante e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Área Solicitante */}
            <div>
              <label
                htmlFor="areaSolicitanteId"
                className="block text-sm font-semibold text-[#232B23] mb-1.5"
              >
                Área Solicitante <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <select
                  id="areaSolicitanteId"
                  disabled={isLoadingAreas}
                  {...register('areaSolicitanteId', { valueAsNumber: true })}
                  className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#232B23] bg-white transition-colors focus:outline-none ${
                    errors.areaSolicitanteId
                      ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]'
                      : 'border-[#D7E6C8] focus:border-[#146E37] focus:ring-1 focus:ring-[#146E37]'
                  }`}
                >
                  <option value="">Selecione a coordenação ou setor...</option>
                  {areas?.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.descricao}
                    </option>
                  ))}
                </select>
              </div>
              {errors.areaSolicitanteId && (
                <p className="mt-1.5 text-xs text-[#C0392B]">
                  {errors.areaSolicitanteId.message}
                </p>
              )}
            </div>

            {/* Nível de Prioridade */}
            <div>
              <label className="block text-sm font-semibold text-[#232B23] mb-1.5">
                Nível de Prioridade <span className="text-[#C0392B]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setValue('prioridade', 'baixa', { shouldValidate: true })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                    selectedPrioridade === 'baixa'
                      ? 'bg-[#F5F8F4] border-[#146E37] text-[#146E37] ring-1 ring-[#146E37]'
                      : 'border-[#D7E6C8] bg-white text-[#5A645A] hover:bg-[#F5F8F4]'
                  }`}
                >
                  Baixa
                </button>

                <button
                  type="button"
                  onClick={() => setValue('prioridade', 'media', { shouldValidate: true })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                    selectedPrioridade === 'media'
                      ? 'bg-[#FFF9E6] border-[#FFCD00] text-[#8C6400] ring-1 ring-[#FFCD00]'
                      : 'border-[#D7E6C8] bg-white text-[#5A645A] hover:bg-[#FFF9E6]'
                  }`}
                >
                  Média
                </button>

                <button
                  type="button"
                  onClick={() => setValue('prioridade', 'alta', { shouldValidate: true })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                    selectedPrioridade === 'alta'
                      ? 'bg-[#FDF0F2] border-[#C0392B] text-[#940C2C] ring-1 ring-[#C0392B]'
                      : 'border-[#D7E6C8] bg-white text-[#5A645A] hover:bg-[#FDF0F2]'
                  }`}
                >
                  Alta
                </button>
              </div>
              {errors.prioridade && (
                <p className="mt-1.5 text-xs text-[#C0392B]">
                  {errors.prioridade.message}
                </p>
              )}
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-semibold text-[#232B23] mb-1.5"
            >
              Descrição Detalhada e Justificativa{' '}
              <span className="text-[#C0392B]">*</span>
            </label>
            <textarea
              id="descricao"
              rows={5}
              placeholder="Descreva o contexto operacional, o objetivo da solicitação, impacto esperado e prazos desejados..."
              {...register('descricao')}
              className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#232B23] placeholder-[#828E82] transition-colors focus:outline-none ${
                errors.descricao
                  ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]'
                  : 'border-[#D7E6C8] focus:border-[#146E37] focus:ring-1 focus:ring-[#146E37]'
              }`}
            />
            {errors.descricao && (
              <p className="mt-1.5 text-xs text-[#C0392B]">
                {errors.descricao.message}
              </p>
            )}
          </div>

          {/* Caixa de Orientação Institucional */}
          <div className="p-3.5 rounded-lg bg-[#F5F8F4] border border-[#D7E6C8] flex items-start gap-2.5 text-xs text-[#5A645A]">
            <Info className="h-4 w-4 text-[#146E37] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#232B23]">Orientação de Governança:</strong>{' '}
              Toda nova solicitação é protocolada com o status inicial{' '}
              <strong className="text-[#8C6400]">Aberta</strong> e encaminhada para a fila
              de deliberação dos gestores da cooperativa.
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6EDE0]">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#5A645A] hover:text-[#232B23] hover:bg-[#F5F8F4] border border-transparent hover:border-[#D7E6C8] transition-all"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#3FA110] hover:bg-[#146E37] shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#146E37] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submeter Solicitação</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
