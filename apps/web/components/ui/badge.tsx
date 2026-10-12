import React from 'react';
import type { Status, Prioridade, Perfil } from '@sicredi/shared';

export function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case 'aberta':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF9E6] text-[#8C6400] border border-[#FCE8A6]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFCD00]" />
          Aberta
        </span>
      );
    case 'analise':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF4FC] text-[#0F5796] border border-[#CFE4FA]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1E78D4]" />
          Em Análise
        </span>
      );
    case 'aprovada':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF6EC] text-[#116834] border border-[#C8E6CE]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#146E37]" />
          Aprovada
        </span>
      );
    case 'rejeitada':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDF0F2] text-[#940C2C] border border-[#F8D0D6]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C0392B]" />
          Rejeitada
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
}

export function PriorityBadge({ prioridade }: { prioridade: Prioridade }) {
  switch (prioridade) {
    case 'alta':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#FDF0F2] text-[#C0392B] border border-[#F8D0D6]">
          Alta
        </span>
      );
    case 'media':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FFF9E6] text-[#8C6400] border border-[#FCE8A6]">
          Média
        </span>
      );
    case 'baixa':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F5F8F4] text-[#5A645A] border border-[#D7E6C8]">
          Baixa
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {prioridade}
        </span>
      );
  }
}

export function RoleBadge({ perfil }: { perfil: Perfil }) {
  if (perfil === 'gestor') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#EAF6EC] text-[#146E37] border border-[#C8E6CE]">
        Gestor
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#EBF7E9] text-[#3FA110] border border-[#D7E6C8]">
      Solicitante
    </span>
  );
}
