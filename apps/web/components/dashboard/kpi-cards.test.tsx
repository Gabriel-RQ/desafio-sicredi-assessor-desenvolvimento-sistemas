import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../lib/test-utils';
import { KpiCards } from './kpi-cards';
import { api } from '../../lib/api';
import * as authContext from '../../lib/auth-context';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('KpiCards Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar skeleton de carregamento enquanto busca métricas', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: '1', nome: 'Gestor', email: 'g@s.com', perfil: 'gestor' },
      isLoading: false,
      isMounted: true,
      login: vi.fn(),
      logout: vi.fn(),
      isGestor: true,
      isSolicitante: false,
    });

    vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // Suspensa / carregando

    const { container } = renderWithProviders(<KpiCards />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('deve exibir métricas consolidadas do gestor via /dashboard', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: '1', nome: 'Gestor', email: 'g@s.com', perfil: 'gestor' },
      isLoading: false,
      isMounted: true,
      login: vi.fn(),
      logout: vi.fn(),
      isGestor: true,
      isSolicitante: false,
    });

    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        total: 10,
        porStatus: {
          aberta: 4,
          analise: 2,
          aprovada: 3,
          rejeitada: 1,
        },
        porPrioridade: {
          alta: 5,
          media: 3,
          baixa: 2,
        },
      },
    });

    renderWithProviders(<KpiCards />);

    await waitFor(() => {
      expect(screen.getByText('Total Geral')).toBeInTheDocument();
    });

    expect(screen.getByText('10')).toBeInTheDocument(); // Total
    expect(screen.getByText('4')).toBeInTheDocument(); // Abertas
    expect(screen.getByText('2')).toBeInTheDocument(); // Em análise
    expect(screen.getByText('3')).toBeInTheDocument(); // Aprovadas
    expect(screen.getByText('1')).toBeInTheDocument(); // Rejeitadas

    // Subtextos com porcentagens
    expect(screen.getByText('40% do volume')).toBeInTheDocument();
    expect(screen.getByText('20% em deliberação')).toBeInTheDocument();
    expect(screen.getByText('30% taxa aprovação')).toBeInTheDocument();
    expect(screen.getByText('10% taxa recusa')).toBeInTheDocument();

    // Barra de distribuição proporcional
    expect(screen.getByText('Distribuição do Ciclo de Solicitações')).toBeInTheDocument();
    expect(screen.getByText('10 demandas registradas')).toBeInTheDocument();
  });

  it('deve calcular métricas pessoais do solicitante a partir de suas solicitações', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: '2', nome: 'Solicitante', email: 's@s.com', perfil: 'solicitante' },
      isLoading: false,
      isMounted: true,
      login: vi.fn(),
      logout: vi.fn(),
      isGestor: false,
      isSolicitante: true,
    });

    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: [
          { id: '1', status: 'aberta', prioridade: 'alta' },
          { id: '2', status: 'aprovada', prioridade: 'media' },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 100,
          totalPages: 1,
        },
      },
    });

    renderWithProviders(<KpiCards />);

    await waitFor(() => {
      expect(screen.getByText('Minhas Demandas')).toBeInTheDocument();
    });

    expect(screen.getByText('2')).toBeInTheDocument(); // Total
    expect(screen.getByText('50% taxa aprovação')).toBeInTheDocument();
  });
});
