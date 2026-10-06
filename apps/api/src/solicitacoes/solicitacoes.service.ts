import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto.js';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto.js';
import { DecidirSolicitacaoDto } from './dto/decidir-solicitacao.dto.js';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class SolicitacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(createDto: CreateSolicitacaoDto) {
    const area = await this.prisma.area.findUnique({
      where: { id: createDto.areaSolicitanteId },
    });

    if (!area) {
      throw new BadRequestException('A área solicitante informada não existe.');
    }

    return this.prisma.solicitacao.create({
      data: {
        titulo: createDto.titulo,
        descricao: createDto.descricao,
        solicitante: createDto.solicitante,
        areaSolicitanteId: createDto.areaSolicitanteId,
        prioridade: createDto.prioridade,
        status: 'aberta',
      },
      include: {
        area: true,
      },
    });
  }

  async listar(query: QuerySolicitacaoDto) {
    const {
      search,
      status,
      prioridade,
      areaId,
      sortBy = 'dataSolicitacao',
      order = 'desc',
      page,
      limit,
    } = query;

    const where: Prisma.SolicitacaoWhereInput = {
      dataExclusao: null,
    };

    if (status) {
      where.status = status;
    }

    if (prioridade) {
      where.prioridade = prioridade;
    }

    if (areaId) {
      where.areaSolicitanteId = areaId;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { titulo: { contains: term, mode: 'insensitive' } },
        { descricao: { contains: term, mode: 'insensitive' } },
        { solicitante: { contains: term, mode: 'insensitive' } },
      ];
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.SolicitacaoOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      this.prisma.solicitacao.findMany({
        where,
        include: {
          area: true,
          historicosDecisao: {
            orderBy: {
              dataDecisao: 'desc',
            },
            take: 1,
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.solicitacao.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async buscarPorId(id: string) {
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where: {
        id,
        dataExclusao: null,
      },
      include: {
        area: true,
        historicosDecisao: {
          orderBy: {
            dataDecisao: 'desc',
          },
        },
      },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    return solicitacao;
  }

  async atualizar(id: string, updateDto: UpdateSolicitacaoDto) {
    const solicitacao = await this.buscarPorId(id);

    if (solicitacao.status === 'aprovada' || solicitacao.status === 'rejeitada') {
      throw new BadRequestException(
        'Solicitações já finalizadas (aprovadas ou rejeitadas) não podem ser alteradas.',
      );
    }

    if (updateDto.areaSolicitanteId) {
      const area = await this.prisma.area.findUnique({
        where: { id: updateDto.areaSolicitanteId },
      });

      if (!area) {
        throw new BadRequestException('A área solicitante informada não existe.');
      }
    }

    return this.prisma.solicitacao.update({
      where: { id },
      data: updateDto,
      include: {
        area: true,
      },
    });
  }

  async decidir(id: string, decidirDto: DecidirSolicitacaoDto) {
    const solicitacao = await this.buscarPorId(id);
    const novoStatus = decidirDto.status;

    if (solicitacao.status === 'aprovada' || solicitacao.status === 'rejeitada') {
      throw new BadRequestException(
        'Esta solicitação já foi finalizada e não pode receber novas decisões.',
      );
    }

    if (solicitacao.status === 'analise' && novoStatus === 'analise') {
      throw new BadRequestException(
        'A solicitação já está em análise.',
      );
    }

    if (solicitacao.status === 'analise' && novoStatus === 'aberta') {
      throw new BadRequestException(
        'Não é possível voltar uma solicitação em análise para aberta.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.historicoDecisao.create({
        data: {
          solicitacaoId: id,
          status: novoStatus,
          comentario: decidirDto.comentario,
          responsavelDecisao: decidirDto.responsavelDecisao,
        },
      });

      return tx.solicitacao.update({
        where: { id },
        data: {
          status: novoStatus,
        },
        include: {
          area: true,
          historicosDecisao: {
            orderBy: {
              dataDecisao: 'desc',
            },
          },
        },
      });
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);

    return this.prisma.solicitacao.update({
      where: { id },
      data: {
        dataExclusao: new Date(),
      },
    });
  }
}

