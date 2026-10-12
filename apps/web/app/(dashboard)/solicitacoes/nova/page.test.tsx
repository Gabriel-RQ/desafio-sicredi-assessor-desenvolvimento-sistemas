import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../lib/test-utils';
import NovaSolicitacaoPage from './page';
import { api } from '../../../../lib/api';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('NovaSolicitacaoPage', () => {
  const mockAreas = [
    { id: 1, descricao: 'Crédito Rural' },
    { id: 2, descricao: 'Tecnologia da Informação' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/areas') {
        return { data: mockAreas };
      }
      return { data: null };
    });
  });

  it('deve renderizar o formulário de nova solicitação com opções de área', async () => {
    renderWithProviders(<NovaSolicitacaoPage />);

    expect(screen.getByRole('heading', { name: /Nova Solicitação Interna/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título da Demanda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Área Solicitante/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição Detalhada e Justificativa/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Crédito Rural' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Tecnologia da Informação' })).toBeInTheDocument();
    });
  });

  it('deve exibir erros de validação ao submeter formulário em branco', async () => {
    renderWithProviders(<NovaSolicitacaoPage />);

    const submitBtn = screen.getByRole('button', { name: /Submeter Solicitação/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('O título deve ter no mínimo 3 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('Selecione uma área solicitante válida.')).toBeInTheDocument();
      expect(screen.getByText('A descrição deve ter no mínimo 5 caracteres.')).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('deve submeter o formulário com sucesso quando preenchido corretamente', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        id: 'nova-sol-123',
        titulo: 'Aquisição de computadores',
        descricao: 'Equipamentos para os novos estagiários',
        areaSolicitanteId: 2,
        prioridade: 'alta',
      },
    });

    renderWithProviders(<NovaSolicitacaoPage />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Tecnologia da Informação' })).toBeInTheDocument();
    });

    const tituloInput = screen.getByLabelText(/Título da Demanda/i);
    const areaSelect = screen.getByLabelText(/Área Solicitante/i);
    const prioridadeAltaBtn = screen.getByRole('button', { name: 'Alta' });
    const descricaoTextarea = screen.getByLabelText(/Descrição Detalhada e Justificativa/i);
    const submitBtn = screen.getByRole('button', { name: /Submeter Solicitação/i });

    fireEvent.change(tituloInput, { target: { value: 'Aquisição de computadores' } });
    fireEvent.change(areaSelect, { target: { value: '2' } });
    fireEvent.click(prioridadeAltaBtn);
    fireEvent.change(descricaoTextarea, {
      target: { value: 'Equipamentos para os novos estagiários' },
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/solicitacoes', {
        titulo: 'Aquisição de computadores',
        areaSolicitanteId: 2,
        prioridade: 'alta',
        descricao: 'Equipamentos para os novos estagiários',
      });
      expect(toast.success).toHaveBeenCalledWith('Solicitação cadastrada com sucesso!');
    });
  });

  it('deve exibir toast de erro caso a requisição falhe', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Erro de validação ao salvar.',
        },
      },
      isAxiosError: true,
    });

    renderWithProviders(<NovaSolicitacaoPage />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Crédito Rural' })).toBeInTheDocument();
    });

    const tituloInput = screen.getByLabelText(/Título da Demanda/i);
    const areaSelect = screen.getByLabelText(/Área Solicitante/i);
    const descricaoTextarea = screen.getByLabelText(/Descrição Detalhada e Justificativa/i);
    const submitBtn = screen.getByRole('button', { name: /Submeter Solicitação/i });

    fireEvent.change(tituloInput, { target: { value: 'Aquisição de máquinas' } });
    fireEvent.change(areaSelect, { target: { value: '1' } });
    fireEvent.change(descricaoTextarea, { target: { value: 'Descrição com mais de 5 caracteres' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
