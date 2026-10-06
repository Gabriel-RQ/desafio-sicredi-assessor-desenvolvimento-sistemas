import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { Prioridade, Status } from '../generated/prisma/enums.js';

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

  describe('create', () => {
    it('deve criar uma solicitação com status aberta com sucesso', async () => {
      prismaMock.area.findUnique.mockResolvedValue({ id: 1, descricao: 'Tecnologia' });
      const mockCreated = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        titulo: 'Acesso VPN',
        descricao: 'Liberar acesso VPN',
        solicitante: 'Maria Silva',
        areaSolicitanteId: 1,
        prioridade: Prioridade.alta,
        status: Status.aberta,
      };
      prismaMock.solicitacao.create.mockResolvedValue(mockCreated);

      const result = await service.criar({
        titulo: 'Acesso VPN',
        descricao: 'Liberar acesso VPN',
        solicitante: 'Maria Silva',
        areaSolicitanteId: 1,
        prioridade: Prioridade.alta,
      });

      expect(result).toEqual(mockCreated);
      expect(prismaMock.solicitacao.create).toHaveBeenCalledWith({
        data: {
          titulo: 'Acesso VPN',
          descricao: 'Liberar acesso VPN',
          solicitante: 'Maria Silva',
          areaSolicitanteId: 1,
          prioridade: Prioridade.alta,
          status: 'aberta',
        },
        include: { area: true },
      });
    });

    it('deve lançar BadRequestException se a área não existir', async () => {
      prismaMock.area.findUnique.mockResolvedValue(null);

      await expect(
        service.criar({
          titulo: 'Acesso VPN',
          descricao: 'Liberar acesso VPN',
          solicitante: 'Maria Silva',
          areaSolicitanteId: 999,
          prioridade: Prioridade.alta,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista paginada e os metadados de total', async () => {
      prismaMock.solicitacao.findMany.mockResolvedValue([{ id: 'uuid-1', titulo: 'Req 1' }]);
      prismaMock.solicitacao.count.mockResolvedValue(1);

      const result = await service.listar({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar a solicitação com área e histórico', async () => {
      const mockSolicitacao = { id: 'uuid-1', titulo: 'Req 1', historicosDecisao: [] };
      prismaMock.solicitacao.findFirst.mockResolvedValue(mockSolicitacao);

      const result = await service.buscarPorId('uuid-1');

      expect(result).toEqual(mockSolicitacao);
    });

    it('deve lançar NotFoundException se a solicitação não for encontrada', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue(null);

      await expect(service.buscarPorId('uuid-non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('decidir', () => {
    it('deve lançar BadRequestException se a solicitação já estiver aprovada ou rejeitada', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.aprovada,
      });

      await expect(
        service.decidir('uuid-1', {
          status: Status.rejeitada,
          comentario: 'Tentativa de rejeição tardia',
          responsavelDecisao: 'Gestor',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve atualizar o status e salvar o histórico em transação', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.aberta,
      });

      const mockUpdated = {
        id: 'uuid-1',
        status: Status.aprovada,
        historicosDecisao: [
          { status: Status.aprovada, comentario: 'Aprovado!', responsavelDecisao: 'Gestor' },
        ],
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = {
          historicoDecisao: { create: vi.fn().mockResolvedValue({}) },
          solicitacao: { update: vi.fn().mockResolvedValue(mockUpdated) },
        };
        return callback(tx);
      });

      const result = await service.decidir('uuid-1', {
        status: Status.aprovada,
        comentario: 'Aprovado!',
        responsavelDecisao: 'Gestor',
      });

      expect(result).toEqual(mockUpdated);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve realizar soft delete setando dataExclusao', async () => {
      prismaMock.solicitacao.findFirst.mockResolvedValue({
        id: 'uuid-1',
        status: Status.aberta,
      });
      prismaMock.solicitacao.update.mockResolvedValue({
        id: 'uuid-1',
        dataExclusao: new Date(),
      });

      await service.remover('uuid-1');

      expect(prismaMock.solicitacao.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: expect.objectContaining({
          dataExclusao: expect.any(Date),
        }),
      });
    });
  });
});
