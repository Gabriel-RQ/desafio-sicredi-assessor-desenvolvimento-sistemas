import React, { Suspense } from 'react';
import { DetalheSolicitacaoClient } from './detalhe-solicitacao-client';

export const dynamic = 'force-dynamic';

export default async function DetalheSolicitacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-10 bg-gray-200 rounded w-96" />
          <div className="h-64 bg-white rounded-xl border border-[#D7E6C8]" />
        </div>
      }
    >
      <DetalheSolicitacaoClient id={id} />
    </Suspense>
  );
}
