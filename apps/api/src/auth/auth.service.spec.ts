import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Perfil } from '../generated/prisma/enums.js';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosServiceMock: any;
  let hashServiceMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    usuariosServiceMock = {
      buscarPorEmail: vi.fn(),
    };
    hashServiceMock = {
      comparar: vi.fn(),
    };
    jwtServiceMock = {
      signAsync: vi.fn(),
    };
    configServiceMock = {
      get: vi.fn().mockReturnValue('8h'),
    };

    service = new AuthService(
      usuariosServiceMock,
      hashServiceMock,
      jwtServiceMock,
      configServiceMock,
    );
  });

  it('deve realizar login com sucesso e retornar token', async () => {
    usuariosServiceMock.buscarPorEmail.mockResolvedValue({
      id: 'user-123',
      nome: 'João Solicitante',
      email: 'joao@sicredi.local',
      senhaHash: 'scrypt$mock',
      perfil: Perfil.solicitante,
      ativo: true,
    });
    hashServiceMock.comparar.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt.token.mock');

    const result = await service.login({
      email: 'JOAO@sicredi.local ',
      senha: 'Sicredi@2026',
    });

    expect(result.accessToken).toBe('jwt.token.mock');
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiraEm).toBe('8h');
    expect(result.usuario).toEqual({
      id: 'user-123',
      nome: 'João Solicitante',
      email: 'joao@sicredi.local',
      perfil: Perfil.solicitante,
    });
    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: 'user-123',
      nome: 'João Solicitante',
      perfil: Perfil.solicitante,
    });
  });

  it('deve lançar UnauthorizedException se usuário não existir', async () => {
    usuariosServiceMock.buscarPorEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'inexistente@sicredi.local',
        senha: 'qualquer',
      }),
    ).rejects.toThrow(new UnauthorizedException('Credenciais inválidas.'));

    expect(hashServiceMock.comparar).toHaveBeenCalled();
  });

  it('deve lançar UnauthorizedException se usuário estiver inativo', async () => {
    usuariosServiceMock.buscarPorEmail.mockResolvedValue({
      id: 'user-123',
      email: 'inativo@sicredi.local',
      senhaHash: 'scrypt$mock',
      ativo: false,
    });

    await expect(
      service.login({
        email: 'inativo@sicredi.local',
        senha: 'qualquer',
      }),
    ).rejects.toThrow(new UnauthorizedException('Credenciais inválidas.'));
  });

  it('deve lançar UnauthorizedException se a senha for incorreta', async () => {
    usuariosServiceMock.buscarPorEmail.mockResolvedValue({
      id: 'user-123',
      email: 'joao@sicredi.local',
      senhaHash: 'scrypt$mock',
      ativo: true,
    });
    hashServiceMock.comparar.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'joao@sicredi.local',
        senha: 'senha-errada',
      }),
    ).rejects.toThrow(new UnauthorizedException('Credenciais inválidas.'));
  });
});
