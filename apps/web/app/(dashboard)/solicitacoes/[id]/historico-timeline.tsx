import { useMemo } from 'react';
import type { HistoricoDecisao, Status } from '@sicredi/shared';
import { StatusBadge } from '../../../../components/ui/badge';
import { CheckCircle2, XCircle, Clock, Inbox, ShieldCheck, User } from 'lucide-react';

interface HistoricoTimelineProps
{
  historicos?: HistoricoDecisao[];
}

export function HistoricoTimeline({ historicos }: HistoricoTimelineProps)
{
  const formatDate = (dateString?: string) =>
  {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusNodeConfig = (status: Status) =>
  {
    switch (status) {
      case 'aprovada':
        return {
          icon: CheckCircle2,
          color: '#146E37',
          bgColor: '#EAF6EC',
          borderColor: '#C8E6CE',
        };
      case 'rejeitada':
        return {
          icon: XCircle,
          color: '#C0392B',
          bgColor: '#FDF0F2',
          borderColor: '#F8D0D6',
        };
      case 'analise':
        return {
          icon: Clock,
          color: '#1E78D4',
          bgColor: '#EBF4FC',
          borderColor: '#CFE4FA',
        };
      case 'aberta':
      default:
        return {
          icon: Inbox,
          color: '#8C6400',
          bgColor: '#FFF9E6',
          borderColor: '#FCE8A6',
        };
    }
  };

  // Garante ordenação cronológica decrescente (deliberação mais recente primeiro)
  const itensOrdenados = useMemo(() =>
  {
    if (!historicos || historicos.length === 0) return [];
    return [...historicos].sort((a, b) =>
    {
      const timeA = a.dataDecisao ? new Date(a.dataDecisao).getTime() : 0;
      const timeB = b.dataDecisao ? new Date(b.dataDecisao).getTime() : 0;
      return timeB - timeA;
    });
  }, [historicos]);

  if (itensOrdenados.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-[#F5F8F4] border border-[#D7E6C8] text-center text-xs text-[#5A645A]">
        <Clock className="h-6 w-6 text-[#5A645A] mx-auto mb-2 opacity-60" />
        <span className="font-semibold block text-[#232B23] mb-1">
          Nenhuma deliberação registrada até o momento
        </span>
        <p>A solicitação aguarda a análise técnica e o parecer dos gestores da cooperativa.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D7E6C8]">
      {itensOrdenados.map((hist, index) =>
      {
        const { icon: StatusIcon, color, bgColor, borderColor } = getStatusNodeConfig(hist.status);
        const isMaisRecente = index === 0;

        return (
          <div key={hist.id} className="relative group">
            {/* Nó marcador na linha do tempo */}
            <div
              className="absolute -left-6 sm:-left-8 top-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center border-2 bg-white shadow-2xs z-10 transition-transform group-hover:scale-110"
              style={{ borderColor, backgroundColor: bgColor, color }}
              title={`Decisão: ${hist.status}`}
            >
              <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>

            {/* Conteúdo do Card da Deliberação */}
            <div className="bg-[#F5F8F4]/60 rounded-xl p-4 sm:p-5 border border-[#D7E6C8] shadow-xs space-y-3 transition-colors hover:bg-[#F5F8F4]">
              {/* Cabeçalho do Nó: Status, Responsável e Data */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-[#E6EDE0]">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={hist.status} />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#232B23]">
                    <User className="h-3.5 w-3.5 text-[#146E37]" />
                    <span>{hist.responsavel?.nome || 'Gestor Responsável'}</span>
                  </div>
                  {hist.responsavel?.email && (
                    <span className="hidden md:inline text-[11px] text-[#5A645A]">
                      ({hist.responsavel.email})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5A645A]">
                  <Clock className="h-3 w-3" />
                  <time dateTime={hist.dataDecisao}>{formatDate(hist.dataDecisao)}</time>
                </div>
              </div>

              {/* Parecer / Justificativa Emitida */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#5A645A] uppercase tracking-wider block">
                  Parecer:
                </span>
                <p className="text-xs text-[#232B23] bg-white p-3.5 rounded-lg border border-[#D7E6C8] leading-relaxed whitespace-pre-wrap font-sans shadow-2xs">
                  {hist.comentario}
                </p>
              </div>

              {/* Rodapé do Nó se for o mais recente */}
              {isMaisRecente && (
                <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#146E37]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Deliberação mais recente</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
