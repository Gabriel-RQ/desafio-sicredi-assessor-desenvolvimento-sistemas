import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../lib/test-utils';
import LoginPage from './page';
import * as authContext from '../../../lib/auth-context';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isMounted: true,
      login: mockLogin,
      logout: vi.fn(),
      isGestor: false,
      isSolicitante: false,
    });
  });

  it('deve renderizar o formulário de login com a identidade visual do Sicredi', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByAltText('Sicredi')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Gestão de Solicitações Internas/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail Corporativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acessar Plataforma/i })).toBeInTheDocument();
  });

  it('deve exibir validação caso os campos obrigatórios estejam vazios', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: /Acessar Plataforma/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('O e-mail é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('A senha é obrigatória.')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve validar formato incorreto de e-mail', async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/E-mail Corporativo/i);
    const senhaInput = screen.getByLabelText(/Senha/i);
    const submitBtn = screen.getByRole('button', { name: /Acessar Plataforma/i });

    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.change(senhaInput, { target: { value: 'Sicredi@2026' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Informe um endereço de e-mail corporativo válido.'),
      ).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve preencher as credenciais ao clicar no botão de acesso rápido', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const quickGestorBtn = screen.getByRole('button', { name: /Perfil Gestor/i });
    await user.click(quickGestorBtn);

    const emailInput = screen.getByLabelText(/E-mail Corporativo/i) as HTMLInputElement;
    const senhaInput = screen.getByLabelText(/Senha/i) as HTMLInputElement;

    expect(emailInput.value).toBe('gestor@sicredi.local');
    expect(senhaInput.value).toBe('Sicredi@2026');
  });

  it('deve alternar a visibilidade da senha ao clicar no botão de alternância', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const senhaInput = screen.getByLabelText(/Senha/i) as HTMLInputElement;
    expect(senhaInput.type).toBe('password');

    // Botão de alternar visualização de senha
    const toggleBtn = senhaInput.parentElement?.querySelector('button');
    expect(toggleBtn).toBeInTheDocument();

    if (toggleBtn) {
      await user.click(toggleBtn);
      expect(senhaInput.type).toBe('text');

      await user.click(toggleBtn);
      expect(senhaInput.type).toBe('password');
    }
  });

  it('deve submeter o login com sucesso quando os dados forem válidos', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/E-mail Corporativo/i);
    const senhaInput = screen.getByLabelText(/Senha/i);
    const submitBtn = screen.getByRole('button', { name: /Acessar Plataforma/i });

    await user.type(emailInput, 'gestor@sicredi.local');
    await user.type(senhaInput, 'Sicredi@2026');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'gestor@sicredi.local',
        senha: 'Sicredi@2026',
      });
      expect(toast.success).toHaveBeenCalledWith('Autenticação realizada com sucesso!');
    });
  });

  it('deve exibir notificação de erro caso a chamada de login falhe', async () => {
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Credenciais inválidas.',
        },
      },
      isAxiosError: true,
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/E-mail Corporativo/i);
    const senhaInput = screen.getByLabelText(/Senha/i);
    const submitBtn = screen.getByRole('button', { name: /Acessar Plataforma/i });

    await user.type(emailInput, 'gestor@sicredi.local');
    await user.type(senhaInput, 'senhaErrada');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
