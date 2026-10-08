import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { PerfisGuard } from './perfis.guard.js';
import { Perfil } from '../../generated/prisma/enums.js';

describe('PerfisGuard', () => {
  let guard: PerfisGuard;
  let reflectorMock: any;

  beforeEach(() => {
    reflectorMock = {
      getAllAndOverride: vi.fn(),
    };
    guard = new PerfisGuard(reflectorMock);
  });

  const criarContexto = (usuario?: any) => {
    const request: any = { usuario };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    };
  };

  it('deve permitir acesso se não houver restrição de perfis', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    const ctx = criarContexto();

    const result = guard.canActivate(ctx as any);
    expect(result).toBe(true);
  });

  it('deve permitir acesso se usuário possuir perfil exigido', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Perfil.gestor]);
    const ctx = criarContexto({ id: 'u1', perfil: Perfil.gestor });

    const result = guard.canActivate(ctx as any);
    expect(result).toBe(true);
  });

  it('deve lançar ForbiddenException se usuário não possuir perfil exigido', () => {
    reflectorMock.getAllAndOverride.mockReturnValue([Perfil.gestor]);
    const ctx = criarContexto({ id: 'u2', perfil: Perfil.solicitante });

    expect(() => guard.canActivate(ctx as any)).toThrow(
      new ForbiddenException('Seu perfil não tem permissão para esta operação.'),
    );
  });
});
