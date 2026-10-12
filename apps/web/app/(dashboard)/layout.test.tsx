import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLayout from './layout';

// Mock Header
vi.mock('../../components/layout/header', () => ({
  Header: () => <header data-testid="mock-header">Header Mock</header>,
}));

describe('DashboardLayout', () => {
  it('deve renderizar Header, container principal com children e rodapé institucional', () => {
    render(
      <DashboardLayout>
        <div data-testid="test-child">Conteúdo da Página</div>
      </DashboardLayout>,
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(
      screen.getByText(/© 2026 Sicredi • Sistema de Gestão de Solicitações Internas/i),
    ).toBeInTheDocument();
  });
});
