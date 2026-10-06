import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let prismaMock: {
    solicitacao: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prismaMock = {
      solicitacao: {
        count: vi.fn(),
        groupBy: vi.fn(),
      },
    };

    service = new DashboardService(prismaMock as unknown as PrismaService);
  });

  it('deve calcular as métricas agregadas do dashboard corretamente', async () => {
    prismaMock.solicitacao.count.mockResolvedValue(10);
    prismaMock.solicitacao.groupBy
      .mockResolvedValueOnce([
        { status: 'aberta', _count: { _all: 4 } },
        { status: 'analise', _count: { _all: 2 } },
        { status: 'aprovada', _count: { _all: 3 } },
        { status: 'rejeitada', _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([
        { prioridade: 'baixa', _count: { _all: 3 } },
        { prioridade: 'media', _count: { _all: 5 } },
        { prioridade: 'alta', _count: { _all: 2 } },
      ]);

    const result = await service.obterMetricas();

    expect(result.total).toBe(10);
    expect(result.porStatus).toEqual({
      aberta: 4,
      analise: 2,
      aprovada: 3,
      rejeitada: 1,
    });
    expect(result.porPrioridade).toEqual({
      baixa: 3,
      media: 5,
      alta: 2,
    });
  });
});
