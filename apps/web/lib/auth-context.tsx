'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { api } from './api';
import type { UsuarioResponse, LoginPayload, LoginResponse } from '@sicredi/shared';

interface AuthContextType {
  user: UsuarioResponse | null;
  isLoading: boolean;
  isMounted: boolean;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => void;
  isGestor: boolean;
  isSolicitante: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inscrição para sincronização de cookie entre abas e eventos
function subscribeToCookie(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

function getClientCookieSnapshot(): string {
  if (typeof window === 'undefined') return '';
  const token = getCookie('token');
  const user = getCookie('user');
  if (!token || !user) return '';
  return typeof user === 'string' ? user : JSON.stringify(user);
}

function getServerCookieSnapshot(): string {
  return '';
}

const emptySubscribe = () => () => {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // useSyncExternalStore: padrão oficial do React 18/19 para dados externos à árvore React
  const rawUser = useSyncExternalStore(
    subscribeToCookie,
    getClientCookieSnapshot,
    getServerCookieSnapshot,
  );

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const user = useMemo<UsuarioResponse | null>(() => {
    if (!isMounted || !rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, [isMounted, rawUser]);

  const login = async (credentials: LoginPayload) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const { accessToken, usuario } = response.data;

    // Salva cookie por 8 horas
    const maxAge = 60 * 60 * 8;
    setCookie('token', accessToken, { maxAge, path: '/' });
    setCookie('user', JSON.stringify(usuario), { maxAge, path: '/' });

    // Notifica listeners no navegador
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }

    router.push('/');
  };

  const logout = () => {
    deleteCookie('token', { path: '/' });
    deleteCookie('user', { path: '/' });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }

    router.push('/login');
  };

  const isGestor = user?.perfil === 'gestor';
  const isSolicitante = user?.perfil === 'solicitante';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        isMounted,
        login,
        logout,
        isGestor,
        isSolicitante,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
