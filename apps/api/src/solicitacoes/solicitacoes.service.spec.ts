import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { Perfil, Prioridade, Status } from '../generated/prisma/enums.js';
import { UsuarioAutenticado } from '../auth/types/usuario-autenticado.js';
import { usuarioPublicoSelect } from '../usuarios/usuarios.service.js';

describe('SolicitacoesService', () => {
  let service: SolicitacoesService;
  let prismaMock: {
    area: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    solicitacao: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  const usuarioSolicitante: UsuarioAutenticado = {
    id: 'user-solicitante-1',
    nome: 'Maria Silva',
    perfil: Perfil.solicitante,
  };

  const usuarioGestor: UsuarioAutenticado = {
    id: 'user-gestor-1',
    nome: 'Gestora Ana',
    perfil: Perfil.gestor,
  };

  beforeEach(() => {
    prismaMock = {
      area: {
        findUnique: vi.fn(),
      },
      solicitacao: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    service = new SolicitacoesService(prismaMock as unknown as PrismaService);
  });

  describe('criar', () => {
    it('deve criar uma solicitação vinculada ao usuário autenticado', async () => {
      prismaMock.area.findUnique.mockResolvedValue({
        id: 1,
        descricao: 'Tecnologia',
      });
      const mockCreated = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        titulo: 'Acesso VPN',
        descricao: 'Liberar acesso VPN',
        solicitanteId: usuarioSolicitante.id,
        areaSolicitanteId: 1,
        prioridade: Prioridade.alta,
        status: Status.aberta,
      };
      prismaMock.solicitacao.create.mockResolvedValue(mockCreated);

      const result = await service.criar(
        {
          titulo: 'Acesso VPN',
          descricao: 'Liberar acesso VPN',
          areaSolicitanteId: 1,
          prioridade: Prioridade.alta,
        },
        usuarioSolicitante,
      );

      expect(result).toEqual(mockCreated);
      expect(prismaMock.solicitacao.create).toHaveBeenCalledWith({
        data: {
          titulo: 'Acesso VPN',
          descricao: 'Liberar acesso VPN',
          solicitanteId: usuarioSolicitante.id,
          areaSolicitanteId: 1,
          prioridade: Prioridade.alta,
          status: 'aberta',
        },
        include: {
          area: true,
          solicitante: {
            select: usuarioPublicoSelect,
          },
        },
      });
    });

    it('deve lançar BadRequestException se a área não existir', async () => {
      prismaMock.area.findUnique.mockResolvedValue(null);

      await expect(
        service.criar(
          {
            titulo: 'Acesso VPN',
            descricao: 'Liberar acesso VPN',
            areaSolicitanteId: 999,
            prioridade: Prioridade.alta,
          },
          usuarioSolicitante,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listar', () => {
    it('deve filtrar por solicitanteId quando o usuário for solicitante', async () => {
      prismaMock.solicitacao.findMany.mockResolvedValue([
        { id: 'uuid-1', titulo: 'Req 1' },
      ]);
      prismaMock.solicitacao.count.mockResolvedValue(1);

      const result = await service.listar(
        { page: 1, limit: 10 },
        usuarioSolicitante,
      );

      expect(result.data).toHaveLength(1);
      expect(prismaMock.solicitacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dataExclusao: null,
            solicitanteId: usuarioSolicitante.id,
          }),
        }),
      );
    });

    it('não deve filtrar por solicitanteId quando o usuário for gestor', async () => {
      prismaMock.solicitacao.findMany.mockResolvedValue([
        { id: 'uuid-1', titulo: 'Req 1' },
      ]);
      prismaMock.solicitacao.count.mockResolvedValue(1);

      await service.listar({ page: 1, limit: 10 }, usuarioGestor);

      expect(prismaMock.solicitacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            solicitanteId: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar a solicitação se pertencer ao usuário', async () => {
      const mockSolicitacao = {
        id: 'uuid-1',
        titulo: 'Req 1',
        solicitanteId: usuarioSolicitante.id,
      };
      prismaMock.solicitacao.findFirst.mockResolvedValue(mockSolicitacao);

      const result = await service.buscarPorId('uuid-1', usuarioSolicitante);
      expect(result).toEqual(mockSolicitacao);
    });

    it('deve lançar NotFoundException se a solicitação não for encontrada no escopo do usuário', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue(null);

      await expect(
        service.buscarPorId('uuid-non-existent', usuarioSolicitante),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizar', () => {
    it('deve impedir que gestor edite dados cadastrais da solicitação', async () => {
      await expect(
        service.atualizar('uuid-1', { titulo: 'Novo' }, usuarioGestor),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('decidir', () => {
    it('deve lançar BadRequestException se a solicitação já estiver aprovada ou rejeitada', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.aprovada,
      });

      await expect(
        service.decidir(
          'uuid-1',
          {
            status: Status.rejeitada,
            comentario: 'Tentativa de rejeição tardia',
          },
          usuarioGestor,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se a solicitação já estiver em análise e tentar mover para análise novamente', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.analise,
      });

      await expect(
        service.decidir(
          'uuid-1',
          {
            status: Status.analise,
            comentario: 'Tentativa redundante de colocar em análise',
          },
          usuarioGestor,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se tentar retroceder solicitação em análise para aberta', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.analise,
      });

      await expect(
        service.decidir(
          'uuid-1',
          {
            status: Status.aberta,
            comentario: 'Tentativa inválida de reabrir demanda',
          },
          usuarioGestor,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve atualizar o status e salvar o histórico com o ID do gestor autenticado', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.aberta,
      });

      const mockUpdated = {
        id: 'uuid-1',
        status: Status.aprovada,
      };

      const mockHistoricoCreate = vi.fn().mockResolvedValue({});
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = {
          historicoDecisao: { create: mockHistoricoCreate },
          solicitacao: { update: vi.fn().mockResolvedValue(mockUpdated) },
        };
        return callback(tx);
      });

      const result = await service.decidir(
        'uuid-1',
        {
          status: Status.aprovada,
          comentario: 'Aprovado!',
        },
        usuarioGestor,
      );

      expect(result).toEqual(mockUpdated);
      expect(mockHistoricoCreate).toHaveBeenCalledWith({
        data: {
          solicitacaoId: 'uuid-1',
          status: Status.aprovada,
          comentario: 'Aprovado!',
          responsavelId: usuarioGestor.id,
        },
      });
    });
  });

  describe('remover', () => {
    it('deve permitir que solicitante remova a solicitação própria se estiver aberta', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.aberta,
        solicitanteId: usuarioSolicitante.id,
      });
      prismaMock.solicitacao.update.mockResolvedValue({
        id: 'uuid-1',
        dataExclusao: new Date(),
      });

      await service.remover('uuid-1', usuarioSolicitante);

      expect(prismaMock.solicitacao.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: expect.objectContaining({
          dataExclusao: expect.any(Date),
        }),
      });
    });

    it('deve impedir que solicitante remova solicitação que não está aberta', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.analise,
        solicitanteId: usuarioSolicitante.id,
      });

      await expect(
        service.remover('uuid-1', usuarioSolicitante),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
