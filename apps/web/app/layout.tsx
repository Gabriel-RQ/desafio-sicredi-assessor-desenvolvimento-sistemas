import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../lib/providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Sicredi | Gestão de Solicitações Internas',
  description: 'Sistema corporativo de gestão e aprovação de solicitações internas - Cooperativa Sicredi',
  icons: {
    icon: '/sicredi_logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
