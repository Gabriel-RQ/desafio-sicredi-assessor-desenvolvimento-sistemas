'use client';

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogIn, Lock, Mail, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Informe um endereço de e-mail corporativo válido.'),
  senha: z.string().min(1, 'A senha é obrigatória.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage()
{
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (data: LoginFormData) =>
  {
    try {
      setIsSubmitting(true);
      await login(data);
      toast.success('Autenticação realizada com sucesso!');
    } catch (error: unknown) {
      let mensagem = 'Não foi possível realizar o login. Verifique suas credenciais.';
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as { detail?: string; message?: string; };
        mensagem = data.detail || data.message || mensagem;
      }
      toast.error(mensagem);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (email: string) =>
  {
    setValue('email', email, { shouldValidate: true });
    setValue('senha', 'Sicredi@2026', { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[#F5F8F4] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decorativo Cooperativo */}
      <div className="absolute inset-0 bg-[radial-gradient(#146E37_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.04] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Image
            src="/sicredi_logo.svg"
            alt="Sicredi"
            width={160}
            height={40}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-[#232B23] font-heading">
          Gestão de Solicitações Internas
        </h1>
        <p className="mt-2 text-center text-sm text-[#5A645A]">
          Acesse a plataforma corporativa da sua cooperativa
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#D7E6C8] sm:rounded-2xl sm:px-10">
          <form noValidate className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Campo E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#232B23] mb-1.5"
              >
                E-mail Corporativo
              </label>
              <div className="relative rounded-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5A645A]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="exemplo@sicredi.local"
                  {...register('email')}
                  className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm text-[#232B23] placeholder-[#828E82] transition-colors focus:outline-none ${errors.email
                    ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]'
                    : 'border-[#D7E6C8] focus:border-[#146E37] focus:ring-1 focus:ring-[#146E37]'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#C0392B]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-semibold text-[#232B23] mb-1.5"
              >
                Senha
              </label>
              <div className="relative rounded-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5A645A]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('senha')}
                  className={`block w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm text-[#232B23] placeholder-[#828E82] transition-colors focus:outline-none ${errors.senha
                    ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]'
                    : 'border-[#D7E6C8] focus:border-[#146E37] focus:ring-1 focus:ring-[#146E37]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5A645A] hover:text-[#232B23] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1.5 text-xs text-[#C0392B]">
                  {errors.senha.message}
                </p>
              )}
            </div>

            {/* Botão de Entrar */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-[#3FA110] hover:bg-[#146E37] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#146E37] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Acessar Plataforma</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Atalhos para Avaliação e Demonstração */}
          <div className="mt-6 pt-6 border-t border-[#E6EDE0]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5A645A] mb-3 text-center">
              Acesso Rápido para Avaliação (Demonstração)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('gestor@sicredi.local')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-[#D7E6C8] bg-[#F5F8F4] hover:bg-[#EBF7E9] hover:border-[#146E37] transition-all text-center group"
              >
                <div className="flex items-center gap-1.5 text-[#146E37] font-semibold text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Perfil Gestor</span>
                </div>
                <span className="text-[11px] text-[#5A645A] mt-0.5">
                  Gestora Ana
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('joao@sicredi.local')}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-[#D7E6C8] bg-[#F5F8F4] hover:bg-[#EBF7E9] hover:border-[#3FA110] transition-all text-center group"
              >
                <div className="flex items-center gap-1.5 text-[#3FA110] font-semibold text-xs">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Solicitante</span>
                </div>
                <span className="text-[11px] text-[#5A645A] mt-0.5">
                  João Solicitante
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Corporativo */}
        <p className="mt-6 text-center text-xs text-[#5A645A]">
          Sicredi • 2026
        </p>
      </div>
    </div >
  );
}
