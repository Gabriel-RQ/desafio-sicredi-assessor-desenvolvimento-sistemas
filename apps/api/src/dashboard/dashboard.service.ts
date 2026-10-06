import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MetricasDashboardDto } from './dto/metricas-dashboard.dto.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obterMetricas(): Promise<MetricasDashboardDto> {
    const whereNotDeleted = { dataExclusao: null };

    const [total, statusGroup, prioridadeGroup] = await Promise.all([
      this.prisma.solicitacao.count({ where: whereNotDeleted }),
      this.prisma.solicitacao.groupBy({
        by: ['status'],
        where: whereNotDeleted,
        _count: { _all: true },
      }),
      this.prisma.solicitacao.groupBy({
        by: ['prioridade'],
        where: whereNotDeleted,
        _count: { _all: true },
      }),
    ]);

    const porStatus = {
      aberta: 0,
      analise: 0,
      aprovada: 0,
      rejeitada: 0,
    };

    for (const item of statusGroup) {
      if (item.status in porStatus) {
        porStatus[item.status as keyof typeof porStatus] = item._count._all;
      }
    }

    const porPrioridade = {
      baixa: 0,
      media: 0,
      alta: 0,
    };

    for (const item of prioridadeGroup) {
      if (item.prioridade in porPrioridade) {
        porPrioridade[item.prioridade as keyof typeof porPrioridade] =
          item._count._all;
      }
    }

    return {
      total,
      porStatus,
      porPrioridade,
    };
  }
}

