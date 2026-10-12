import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './header';
import * as authContext from '../../lib/auth-context';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  LogOut: () => <span data-testid="logout-icon">LogOut</span>,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

describe('Header Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a marca Sicredi e o título do sistema', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isMounted: true,
      login: vi.fn(),
      logout: mockLogout,
      isGestor: false,
      isSolicitante: false,
    });

    render(<Header />);

    expect(screen.getByAltText('Sicredi')).toBeInTheDocument();
    expect(screen.getByText('Sicredi Conexão')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Solicitações')).toBeInTheDocument();
  });

  it('deve exibir informações do usuário autenticado e permitir logout', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        nome: 'Gabriel Queiroz',
        email: 'gabriel@sicredi.com.br',
        perfil: 'gestor',
      },
      isLoading: false,
      isMounted: true,
      login: vi.fn(),
      logout: mockLogout,
      isGestor: true,
      isSolicitante: false,
    });

    render(<Header />);

    // Iniciais do nome
    expect(screen.getByText('GQ')).toBeInTheDocument();
    // Nome e email
    expect(screen.getByText('Gabriel Queiroz')).toBeInTheDocument();
    expect(screen.getByText('gabriel@sicredi.com.br')).toBeInTheDocument();
    // Badge de perfil
    expect(screen.getByText('Gestor')).toBeInTheDocument();

    // Botão de logout
    const logoutBtn = screen.getByTitle('Sair do sistema');
    expect(logoutBtn).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('não deve exibir dados do usuário antes da montagem (SSR safety)', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        nome: 'Gabriel Queiroz',
        email: 'gabriel@sicredi.com.br',
        perfil: 'gestor',
      },
      isLoading: false,
      isMounted: false,
      login: vi.fn(),
      logout: mockLogout,
      isGestor: true,
      isSolicitante: false,
    });

    render(<Header />);

    expect(screen.queryByText('Gabriel Queiroz')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Sair do sistema')).not.toBeInTheDocument();
  });
});
