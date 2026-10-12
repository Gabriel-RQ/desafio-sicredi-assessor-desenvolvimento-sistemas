import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoricoTimeline } from './historico-timeline';
import type { HistoricoDecisao } from '@sicredi/shared';

describe('HistoricoTimeline Component', () => {
  it('deve exibir estado vazio com mensagem informativa caso não haja pareceres', () => {
    render(<HistoricoTimeline historicos={[]} />);

    expect(
      screen.getByText('Nenhuma deliberação registrada até o momento'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A solicitação aguarda a análise técnica e o parecer dos gestores/i),
    ).toBeInTheDocument();
  });

  it('deve renderizar nós da timeline com status, data, parecer e responsável', () => {
    const mockHistoricos: HistoricoDecisao[] = [
      {
        id: 'hist-1',
        solicitacaoId: 'sol-001',
        responsavelId: 'usr-1',
        status: 'analise',
        comentario: 'Encaminhado para validação orçamentária prévia.',
        dataDecisao: '2026-03-10T10:30:00Z',
        responsavel: {
          id: 'usr-1',
          nome: 'Roberto Analista',
          email: 'roberto@sicredi.com.br',
        },
      },
      {
        id: 'hist-2',
        solicitacaoId: 'sol-001',
        responsavelId: 'usr-2',
        status: 'aprovada',
        comentario: 'Proposta aprovada conforme limite operacional da cooperativa.',
        dataDecisao: '2026-03-10T14:45:00Z',
        responsavel: {
          id: 'usr-2',
          nome: 'Mariana Gestora',
          email: 'mariana@sicredi.com.br',
        },
      },
    ];

    render(<HistoricoTimeline historicos={mockHistoricos} />);

    // Verifica status badges
    expect(screen.getByText('Em Análise')).toBeInTheDocument();
    expect(screen.getByText('Aprovada')).toBeInTheDocument();

    // Verifica responsáveis
    expect(screen.getByText('Roberto Analista')).toBeInTheDocument();
    expect(screen.getByText('Mariana Gestora')).toBeInTheDocument();

    // Verifica comentários
    expect(
      screen.getByText('Encaminhado para validação orçamentária prévia.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Proposta aprovada conforme limite operacional da cooperativa.'),
    ).toBeInTheDocument();

    // Verifica indicador de deliberação mais recente no nó mais recente (primeiro nó da lista)
    const badgeMaisRecente = screen.getByText('Deliberação mais recente');
    expect(badgeMaisRecente).toBeInTheDocument();

    // A deliberação mais recente (14:45 - Mariana Gestora) deve conter o badge
    const cardMaisRecente = badgeMaisRecente.closest('.bg-\\[\\#F5F8F4\\]\\/60');
    expect(cardMaisRecente).toHaveTextContent('Mariana Gestora');
    expect(cardMaisRecente).toHaveTextContent('Proposta aprovada conforme limite operacional da cooperativa.');
  });

  it('deve ordenar automaticamente os históricos de forma decrescente pela data de decisão', () => {
    const mockHistoricosDesordenados: HistoricoDecisao[] = [
      {
        id: 'hist-antigo',
        solicitacaoId: 'sol-001',
        responsavelId: 'usr-1',
        status: 'aberta',
        comentario: 'Primeira análise.',
        dataDecisao: '2026-01-01T10:00:00Z',
        responsavel: { id: 'usr-1', nome: 'Gestor Antigo', email: 'antigo@sicredi.com.br' },
      },
      {
        id: 'hist-recente',
        solicitacaoId: 'sol-001',
        responsavelId: 'usr-2',
        status: 'aprovada',
        comentario: 'Última deliberação do comitê.',
        dataDecisao: '2026-03-01T10:00:00Z',
        responsavel: { id: 'usr-2', nome: 'Gestor Recente', email: 'recente@sicredi.com.br' },
      },
    ];

    render(<HistoricoTimeline historicos={mockHistoricosDesordenados} />);

    const nomes = screen.getAllByText(/Gestor (Recente|Antigo)/).map((el) => el.textContent);
    expect(nomes).toEqual(['Gestor Recente', 'Gestor Antigo']);

    const badgeMaisRecente = screen.getByText('Deliberação mais recente');
    const card = badgeMaisRecente.closest('.bg-\\[\\#F5F8F4\\]\\/60');
    expect(card).toHaveTextContent('Gestor Recente');
  });
});
