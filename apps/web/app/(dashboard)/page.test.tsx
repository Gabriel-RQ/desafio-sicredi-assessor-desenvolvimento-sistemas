import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../lib/test-utils';
import DashboardPage from './page';

// Mock child components
vi.mock('../../components/dashboard/kpi-cards', () => ({
  KpiCards: () => <div data-testid="mock-kpi-cards">KPI Cards Mock</div>,
}));

vi.mock('../../components/dashboard/requests-table', () => ({
  RequestsTable: () => <div data-testid="mock-requests-table">Requests Table Mock</div>,
}));

describe('DashboardPage', () => {
  it('deve renderizar o cabeçalho, breadcrumbs e botão de nova solicitação', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /Painel de Solicitações Internas/i })).toBeInTheDocument();
    expect(screen.getByText('Processos Corporativos')).toBeInTheDocument();
    expect(screen.getByText('Solicitações Internas')).toBeInTheDocument();

    const novaBtn = screen.getByRole('link', { name: /Nova Solicitação/i });
    expect(novaBtn).toBeInTheDocument();
    expect(novaBtn).toHaveAttribute('href', '/solicitacoes/nova');

    expect(screen.getByTestId('mock-kpi-cards')).toBeInTheDocument();
    expect(screen.getByTestId('mock-requests-table')).toBeInTheDocument();
  });
});
