'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { RoleBadge } from '../ui/badge';

export function Header() {
  const { user, logout, isMounted } = useAuth();

  return (
    <header className="bg-white border-b border-[#D7E6C8] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Nome do Sistema */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-1 rounded-lg transition-transform group-hover:scale-105">
                <Image
                  src="/sicredi_logo.svg"
                  alt="Sicredi"
                  width={120}
                  height={32}
                  style={{ width: 'auto', height: 'auto' }}
                  priority
                />
              </div>
              <div className="hidden sm:block border-l border-[#D7E6C8] pl-3">
                <span className="text-xs font-bold text-[#146E37] tracking-wider uppercase block">
                  Sicredi Conexão
                </span>
                <span className="text-sm font-semibold text-[#232B23] font-heading block">
                  Gestão de Solicitações
                </span>
              </div>
            </Link>
          </div>

          {/* Dados do Usuário e Logout - Renderizado com segurança pós-hidratação */}
          {isMounted && user ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#EAF6EC] border border-[#C8E6CE] flex items-center justify-center text-[#146E37] font-bold text-sm">
                  {user.nome
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-bold text-[#232B23]">
                      {user.nome}
                    </span>
                    <RoleBadge perfil={user.perfil} />
                  </div>
                  <span className="text-xs text-[#5A645A]">{user.email}</span>
                </div>
              </div>

              <div className="h-6 w-px bg-[#E6EDE0] hidden sm:block" />

              <button
                type="button"
                onClick={logout}
                title="Sair do sistema"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5A645A] hover:text-[#C0392B] hover:bg-[#FDF0F2] border border-transparent hover:border-[#F8D0D6] transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <div className="h-9 w-32" />
          )}
        </div>
      </div>
    </header>
  );
}
