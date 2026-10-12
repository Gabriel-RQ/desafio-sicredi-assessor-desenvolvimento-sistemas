import React from 'react';
import { Header } from '../../components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
})
{
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8F4]">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-[#D7E6C8] bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#5A645A]">
          <span>© 2026 Sicredi • Sistema de Gestão de Solicitações Internas</span>
          <span>Cooperativa de Crédito • Conexão Cooperativa</span>
        </div>
      </footer>
    </div>
  );
}
