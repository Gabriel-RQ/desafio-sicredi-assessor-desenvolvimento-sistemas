import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../lib/test-utils';
import { DetalheSolicitacaoClient } from './detalhe-solicitacao-client';
import { api } from '../../../../lib/api';
import * as authContext from '../../../../lib/auth-context';
import { toast } from 'sonner';
import type { Solicitacao } from '@sicredi/shared';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('DetalheSolicitacaoClient Component', () => {
  const mockSolicitacaoAberta: Solicitacao = {
    id: 'sol-12345678',
    titulo: 'Expansão de servidores para filial',
    descricao: 'Aumento da demanda no fechamento contábil trimestral',
    status: 'aberta',
    prioridade: 'alta',
    solicitanteId: 'usr-1',
    areaSolicitanteId: 2,
    dataSolicitacao: '2026-03-10T10:00:00Z',
    dataAtualizacao: '2026-03-10T10:00:00Z',
    solicitante: { id: 'usr-1', nome: 'Mariana Lima', email: 'mariana@sicredi.com.br' },
    area: { id: 2, descricao: 'Tecnologia da Informação' },
    historicosDecisao: [],
  };

  const mockSolicitacaoComHistorico: Solicitacao = {
    ...mockSolicitacaoAberta,
    status: 'aprovada',
    historicosDecisao: [
      {
        id: 'hist-1',
        solicitacaoId: 'sol-12345678',
        responsavelId: 'usr-gestor',
        status: 'aprovada',
        comentario: 'Aprovado conforme parecer do comitê de TI.',
        dataDecisao: '2026-03-10T15:00:00Z',
        responsavel: { id: 'usr-gestor', nome: 'Carlos Gestor', email: 'carlos@sicredi.com.br' },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'usr-gestor', nome: 'Carlos Gestor', email: 'carlos@sicredi.com.br', perfil: 'gestor' },
      isLoading: false,
      isMounted: true,
      login: vi.fn(),
      logout: vi.fn(),
      isGestor: true,
      isSolicitante: false,
    });
  });

  it('deve exibir estado de carregamento enquanto busca os detalhes', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {})); // pending

    const { container } = renderWithProviders(<DetalheSolicitacaoClient id="sol-12345678" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando a solicitação não for encontrada', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('404 Not Found'));

    renderWithProviders(<DetalheSolicitacaoClient id="sol-inexistente" />);

    await waitFor(() => {
      expect(screen.getByText('Solicitação não encontrada')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Voltar ao Painel/i })).toBeInTheDocument();
  });

  it('deve renderizar os detalhes da solicitação e formulário de deliberação para gestores', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSolicitacaoAberta });

    renderWithProviders(<DetalheSolicitacaoClient id="sol-12345678" />);

    await waitFor(() => {
      expect(screen.getByText('Expansão de servidores para filial')).toBeInTheDocument();
    });

    expect(screen.getByText('Mariana Lima')).toBeInTheDocument();
    expect(screen.getByText('Tecnologia da Informação')).toBeInTheDocument();
    expect(
      screen.getByText('Aumento da demanda no fechamento contábil trimestral'),
    ).toBeInTheDocument();

    // Formulário de decisão do Gestor
    expect(screen.getByRole('heading', { name: /Emitir Parecer de Gestão/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar Decisão/i })).toBeInTheDocument();
  });

  it('deve registrar decisão de aprovação com parecer do gestor', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSolicitacaoAberta });
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { ...mockSolicitacaoAberta, status: 'aprovada' } });

    renderWithProviders(<DetalheSolicitacaoClient id="sol-12345678" />);

    await waitFor(() => {
      expect(screen.getByText('Expansão de servidores para filial')).toBeInTheDocument();
    });

    const parecerTextarea = screen.getByPlaceholderText(
      /Descreva as razões da decisão, direcionamentos ou eventuais pendências/i,
    );
    const registrarBtn = screen.getByRole('button', { name: /Registrar Decisão/i });

    fireEvent.change(parecerTextarea, {
      target: { value: 'Aprovado conforme política de investimento.' },
    });
    fireEvent.click(registrarBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/solicitacoes/sol-12345678/decidir', {
        status: 'aprovada',
        comentario: 'Aprovado conforme política de investimento.',
      });
      expect(toast.success).toHaveBeenCalledWith('Solicitação aprovada com sucesso!');
    });
  });

  it('deve exibir histórico de deliberações anteriores quando disponível', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSolicitacaoComHistorico });

    renderWithProviders(<DetalheSolicitacaoClient id="sol-12345678" />);

    await waitFor(() => {
      expect(screen.getByText('Expansão de servidores para filial')).toBeInTheDocument();
    });

    // Histórico de deliberação
    expect(screen.getByText(/Histórico de Pareceres e Deliberação/i)).toBeInTheDocument();
    expect(screen.getByText('Aprovado conforme parecer do comitê de TI.')).toBeInTheDocument();
  });

  it('deve ocultar o formulário de decisão e exibir aviso quando a solicitação já estiver finalizada', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSolicitacaoComHistorico });

    renderWithProviders(<DetalheSolicitacaoClient id="sol-12345678" />);

    await waitFor(() => {
      expect(screen.getByText('Expansão de servidores para filial')).toBeInTheDocument();
    });

    // O formulário de emitir parecer NÃO deve ser exibido
    expect(screen.queryByRole('heading', { name: /Emitir Parecer de Gestão/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Registrar Decisão/i })).not.toBeInTheDocument();

    // Deve exibir aviso corporativo de deliberação concluída
    expect(screen.getByText('Deliberação Concluída')).toBeInTheDocument();
    expect(screen.getByText(/Esta solicitação já foi finalizada com o status/i)).toBeInTheDocument();
  });

  it('deve desabilitar a opção "Em Análise" caso a solicitação já esteja em análise', async () => {
    const mockSolicitacaoEmAnalise: Solicitacao = {
      ...mockSolicitacaoAberta,
      status: 'analise',
    };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSolicitacaoEmAnalise });

    renderWithProviders(<DetalheSolicitacaoClient id="sol-12345678" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Emitir Parecer de Gestão/i })).toBeInTheDocument();
    });

    const emAnaliseBtn = screen.getByRole('button', { name: /Em Análise/i });
    expect(emAnaliseBtn).toBeDisabled();
    expect(emAnaliseBtn).toHaveAttribute('title', 'A solicitação já está em análise técnica');
  });

  it('deve permitir exclusão da solicitação após confirmação', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSolicitacaoAberta });
    vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<DetalheSolicitacaoClient id="sol-12345678" />);

    await waitFor(() => {
      expect(screen.getByTitle('Remover solicitação')).toBeInTheDocument();
    });

    const excluirBtn = screen.getByTitle('Remover solicitação');
    fireEvent.click(excluirBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/solicitacoes/sol-12345678');
      expect(toast.success).toHaveBeenCalledWith('Solicitação removida com sucesso.');
    });
  });
});
