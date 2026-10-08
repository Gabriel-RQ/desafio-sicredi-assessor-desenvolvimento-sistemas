import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Perfil } from '../../generated/prisma/enums.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtServiceMock: any;
  let reflectorMock: any;

  beforeEach(() => {
    jwtServiceMock = {
      verifyAsync: vi.fn(),
    };
    reflectorMock = {
      getAllAndOverride: vi.fn(),
    };
    guard = new JwtAuthGuard(jwtServiceMock, reflectorMock);
  });

  const criarContexto = (headers: Record<string, string> = {}) => {
    const request: any = { headers };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      request,
    };
  };

  it('deve permitir acesso para rotas marcadas como públicas', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);
    const ctx = criarContexto();

    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
    expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException se cabeçalho Authorization estiver ausente', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const ctx = criarContexto();

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      new UnauthorizedException('Token de autenticação não fornecido.'),
    );
  });

  it('deve lançar UnauthorizedException se token for inválido ou expirado', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('Token expired'));
    const ctx = criarContexto({ authorization: 'Bearer token-invalido' });

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      new UnauthorizedException('Token ausente, inválido ou expirado.'),
    );
  });

  it('deve validar token com sucesso e anexar usuario à requisição', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 'usr-1',
      nome: 'Ana',
      perfil: Perfil.gestor,
    });
    const ctx = criarContexto({ authorization: 'Bearer token-valido' });

    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
    expect(ctx.request.usuario).toEqual({
      id: 'usr-1',
      nome: 'Ana',
      perfil: Perfil.gestor,
    });
  });
});
