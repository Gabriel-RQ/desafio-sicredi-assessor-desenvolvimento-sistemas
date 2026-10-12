import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../lib/test-utils';
import { RequestsTable } from './requests-table';
import { api } from '../../lib/api';
import * as authContext from '../../lib/auth-context';
import type { Solicitacao, AreaResponse } from '@sicredi/shared';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('RequestsTable Component', () => {
  const mockAreas: AreaResponse[] = [
    { id: 1, descricao: 'Crédito Rural' },
    { id: 2, descricao: 'Tecnologia da Informação' },
  ];

  const mockSolicitacoes: Solicitacao[] = [
    {
      id: 'sol-001',
      titulo: 'Aquisição de Trator Agrícola',
      descricao: 'Financiamento para associado da cooperativa',
      status: 'aberta',
      prioridade: 'alta',
      solicitanteId: 'usr-1',
      areaSolicitanteId: 1,
      dataSolicitacao: '2026-03-10T10:00:00Z',
      dataAtualizacao: '2026-03-10T10:00:00Z',
      solicitante: { id: 'usr-1', nome: 'Mariana Lima', email: 'mariana@sicredi.com.br' },
      area: { id: 1, descricao: 'Crédito Rural' },
      historicosDecisao: [],
    },
    {
      id: 'sol-002',
      titulo: 'Renovação de Licença de Software',
      descricao: 'Licenciamento anual do sistema contábil',
      status: 'aprovada',
      prioridade: 'media',
      solicitanteId: 'usr-2',
      areaSolicitanteId: 2,
      dataSolicitacao: '2026-03-09T09:00:00Z',
      dataAtualizacao: '2026-03-09T14:00:00Z',
      solicitante: { id: 'usr-2', nome: 'Lucas Silva', email: 'lucas@sicredi.com.br' },
      area: { id: 2, descricao: 'Tecnologia da Informação' },
      historicosDecisao: [
        {
          id: 'hist-1',
          solicitacaoId: 'sol-002',
          responsavelId: 'usr-3',
          status: 'aprovada',
          comentario: 'Documentação validada e aprovada pelo comitê técnico.',
          dataDecisao: '2026-03-09T14:00:00Z',
        },
      ],
    },
    {
      id: 'sol-003',
      titulo: 'Reforma de Fachada da Agência',
      descricao: 'Pintura externa e nova sinalização',
      status: 'rejeitada',
      prioridade: 'baixa',
      solicitanteId: 'usr-1',
      areaSolicitanteId: 1,
      dataSolicitacao: '2026-03-08T08:00:00Z',
      dataAtualizacao: '2026-03-08T16:00:00Z',
      solicitante: { id: 'usr-1', nome: 'Mariana Lima', email: 'mariana@sicredi.com.br' },
      area: { id: 1, descricao: 'Crédito Rural' },
      historicosDecisao: [
        {
          id: 'hist-2',
          solicitacaoId: 'sol-003',
          responsavelId: 'usr-3',
          status: 'rejeitada',
          comentario: 'Orçamento ultrapassou o teto previsto para o trimestre.',
          dataDecisao: '2026-03-08T16:00:00Z',
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'usr-99', nome: 'Gestor Geral', email: 'gestor@sicredi.com.br', perfil: 'gestor' },
      isLoading: false,
      isMounted: true,
      login: vi.fn(),
      logout: vi.fn(),
      isGestor: true,
      isSolicitante: false,
    });
  });

  it('deve renderizar a tabela com as solicitações e badges correspondentes', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/areas') return { data: mockAreas };
      if (url === '/solicitacoes') {
        return {
          data: {
            data: mockSolicitacoes,
            meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
          },
        };
      }
      return { data: null };
    });

    renderWithProviders(<RequestsTable />);

    await waitFor(() => {
      expect(screen.getByText('Aquisição de Trator Agrícola')).toBeInTheDocument();
    });

    expect(screen.getByText('Renovação de Licença de Software')).toBeInTheDocument();
    expect(screen.getByText('Reforma de Fachada da Agência')).toBeInTheDocument();

    // Badges de Status
    expect(screen.getByText('Aberta')).toBeInTheDocument();
    expect(screen.getByText('Aprovada')).toBeInTheDocument();
    expect(screen.getByText('Rejeitada')).toBeInTheDocument();

    // Badges de Prioridade (encontrados no select de filtro e na tabela)
    expect(screen.getAllByText('Alta').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Média').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Baixa').length).toBeGreaterThanOrEqual(2);

    // Áreas
    expect(screen.getAllByText('Crédito Rural')).toHaveLength(3); // 2 nas linhas + 1 no select
    expect(screen.getAllByText('Tecnologia da Informação')).toHaveLength(2); // 1 na linha + 1 no select
  });

  it('deve renderizar links de ação contextuais conforme o status da solicitação', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/areas') return { data: mockAreas };
      if (url === '/solicitacoes') {
        return {
          data: {
            data: mockSolicitacoes,
            meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
          },
        };
      }
      return { data: null };
    });

    renderWithProviders(<RequestsTable />);

    await waitFor(() => {
      expect(screen.getByText('Aquisição de Trator Agrícola')).toBeInTheDocument();
    });

    // Para pendente/aberta de gestor: ação de Avaliar
    const avaliarLink = screen.getByRole('link', { name: /Avaliar/i });
    expect(avaliarLink).toBeInTheDocument();
    expect(avaliarLink).toHaveAttribute('href', '/solicitacoes/sol-001');

    // Para aprovada: ação "Ver Parecer"
    const parecerLink = screen.getByRole('link', { name: /Ver Parecer/i });
    expect(parecerLink).toBeInTheDocument();
    expect(parecerLink).toHaveAttribute('href', '/solicitacoes/sol-002');

    // Para rejeitada: ação "Justificativa"
    const justificativaLink = screen.getByRole('link', { name: /Justificativa/i });
    expect(justificativaLink).toBeInTheDocument();
    expect(justificativaLink).toHaveAttribute('href', '/solicitacoes/sol-003');
  });

  it('deve permitir buscar por texto e limpar os filtros ativos', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/areas') return { data: mockAreas };
      if (url === '/solicitacoes') {
        return {
          data: {
            data: mockSolicitacoes,
            meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
          },
        };
      }
      return { data: null };
    });

    renderWithProviders(<RequestsTable />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Buscar por título, descrição ou solicitante/i),
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Buscar por título, descrição ou solicitante/i,
    );
    fireEvent.change(searchInput, { target: { value: 'Trator' } });

    // O botão de limpar filtros com o ícone X deve estar presente
    await waitFor(() => {
      expect(screen.getByTitle('Limpar filtros')).toBeInTheDocument();
    });

    // Clica no botão de limpar filtros
    const limparBtn = screen.getByTitle('Limpar filtros');
    fireEvent.click(limparBtn);

    expect(searchInput).toHaveValue('');
  });

  it('deve exibir estado vazio com mensagem e orientação caso não haja dados', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/areas') return { data: mockAreas };
      if (url === '/solicitacoes') {
        return {
          data: {
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
          },
        };
      }
      return { data: null };
    });

    renderWithProviders(<RequestsTable />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma solicitação encontrada')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Não foram localizados registros para os critérios e filtros informados/i),
    ).toBeInTheDocument();
  });

  it('deve manter o botão de atualizar habilitado e exibir esqueleto antes da montagem (proteção de hidratação)', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isMounted: false,
      login: vi.fn(),
      logout: vi.fn(),
      isGestor: false,
      isSolicitante: false,
    });

    renderWithProviders(<RequestsTable />);

    const refreshBtn = screen.getByTitle('Atualizar dados');
    expect(refreshBtn).not.toBeDisabled();
    // Deve renderizar esqueleto de carregamento antes de montar
    const skeletonRows = document.querySelectorAll('tbody tr.animate-pulse');
    expect(skeletonRows.length).toBeGreaterThan(0);
  });
});
