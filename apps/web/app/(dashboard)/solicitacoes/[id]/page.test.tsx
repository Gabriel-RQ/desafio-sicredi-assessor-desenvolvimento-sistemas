import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetalheSolicitacaoPage from './page';

vi.mock('./detalhe-solicitacao-client', () => ({
  DetalheSolicitacaoClient: ({ id }: { id: string }) => (
    <div data-testid="mock-detalhe-client">Detalhe ID: {id}</div>
  ),
}));

describe('DetalheSolicitacaoPage', () => {
  it('deve resolver a promise de params e renderizar o componente cliente com o id correto', async () => {
    const paramsPromise = Promise.resolve({ id: 'sol-999' });

    const pageElement = await DetalheSolicitacaoPage({ params: paramsPromise });
    render(pageElement);

    expect(screen.getByTestId('mock-detalhe-client')).toBeInTheDocument();
    expect(screen.getByText('Detalhe ID: sol-999')).toBeInTheDocument();
  });
});
