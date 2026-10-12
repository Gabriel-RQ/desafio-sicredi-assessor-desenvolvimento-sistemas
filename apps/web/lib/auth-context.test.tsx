import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-context';
import { api } from './api';
import * as cookiesNext from 'cookies-next';

// Mock api
vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock cookies-next
vi.mock('cookies-next', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

describe('AuthContext and useAuth', () => {
  const mockUserGestor = {
    id: 1,
    nome: 'Carlos Gestor',
    email: 'carlos@sicredi.com.br',
    perfil: 'gestor' as const,
    criadoEm: '2026-01-01T00:00:00Z',
  };

  const mockUserSolicitante = {
    id: 2,
    nome: 'Ana Solicitante',
    email: 'ana@sicredi.com.br',
    perfil: 'solicitante' as const,
    criadoEm: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve disparar erro caso useAuth seja consumido fora do AuthProvider', () => {
    // Silencia console.error esperado do React durante lançamento de exceção
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth deve ser utilizado dentro de um AuthProvider');

    consoleError.mockRestore();
  });

  it('deve inicializar com usuário nulo quando cookies estão vazios', () => {
    vi.mocked(cookiesNext.getCookie).mockReturnValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isGestor).toBe(false);
    expect(result.current.isSolicitante).toBe(false);
    expect(result.current.isMounted).toBe(true);
  });

  it('deve carregar usuário gestor a partir dos cookies existentes', () => {
    vi.mocked(cookiesNext.getCookie).mockImplementation((key) => {
      if (key === 'token') return 'mocked-jwt-token';
      if (key === 'user') return JSON.stringify(mockUserGestor);
      return undefined;
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toEqual(mockUserGestor);
    expect(result.current.isGestor).toBe(true);
    expect(result.current.isSolicitante).toBe(false);
  });

  it('deve carregar usuário solicitante a partir dos cookies existentes', () => {
    vi.mocked(cookiesNext.getCookie).mockImplementation((key) => {
      if (key === 'token') return 'mocked-jwt-token';
      if (key === 'user') return JSON.stringify(mockUserSolicitante);
      return undefined;
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toEqual(mockUserSolicitante);
    expect(result.current.isGestor).toBe(false);
    expect(result.current.isSolicitante).toBe(true);
  });

  it('deve tratar com segurança cookie corrompido com JSON inválido', () => {
    vi.mocked(cookiesNext.getCookie).mockImplementation((key) => {
      if (key === 'token') return 'mocked-token';
      if (key === 'user') return '{json-invalido';
      return undefined;
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toBeNull();
  });

  it('deve executar o fluxo de login salvando cookies e notificando o evento', async () => {
    vi.mocked(cookiesNext.getCookie).mockReturnValue(undefined);
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        accessToken: 'novo-token-jwt',
        usuario: mockUserGestor,
      },
    });

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      await result.current.login({
        email: 'carlos@sicredi.com.br',
        senha: 'senha123',
      });
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'carlos@sicredi.com.br',
      senha: 'senha123',
    });
    expect(cookiesNext.setCookie).toHaveBeenCalledWith(
      'token',
      'novo-token-jwt',
      expect.objectContaining({ path: '/' }),
    );
    expect(cookiesNext.setCookie).toHaveBeenCalledWith(
      'user',
      JSON.stringify(mockUserGestor),
      expect.objectContaining({ path: '/' }),
    );
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
  });

  it('deve executar o logout excluindo cookies e notificando o evento', () => {
    vi.mocked(cookiesNext.getCookie).mockReturnValue(undefined);
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    act(() => {
      result.current.logout();
    });

    expect(cookiesNext.deleteCookie).toHaveBeenCalledWith('token', { path: '/' });
    expect(cookiesNext.deleteCookie).toHaveBeenCalledWith('user', { path: '/' });
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
  });
});
