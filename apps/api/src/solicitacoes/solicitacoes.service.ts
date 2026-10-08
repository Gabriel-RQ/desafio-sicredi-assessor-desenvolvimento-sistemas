import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto.js';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto.js';
import { DecidirSolicitacaoDto } from './dto/decidir-solicitacao.dto.js';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto.js';
import { Perfil, Prisma } from '../generated/prisma/client.js';
import { UsuarioAutenticado } from '../auth/types/usuario-autenticado.js';
import { usuarioPublicoSelect } from '../usuarios/usuarios.service.js';

@Injectable()
export class SolicitacoesService {
  constructor(private readonly prisma: PrismaService) {}

  private escopoDoUsuario(
    usuario: UsuarioAutenticado,
  ): Prisma.SolicitacaoWhereInput {
    return usuario.perfil === Perfil.gestor
      ? {}
      : { solicitanteId: usuario.id };
  }

  async criar(createDto: CreateSolicitacaoDto, usuario: UsuarioAutenticado) {
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
        solicitanteId: usuario.id,
        areaSolicitanteId: createDto.areaSolicitanteId,
        prioridade: createDto.prioridade,
        status: 'aberta',
      },
      include: {
        area: true,
        solicitante: {
          select: usuarioPublicoSelect,
        },
      },
    });
  }

  async listar(query: QuerySolicitacaoDto, usuario: UsuarioAutenticado) {
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
      ...this.escopoDoUsuario(usuario),
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
        {
          solicitante: {
            nome: { contains: term, mode: 'insensitive' },
          },
        },
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
          solicitante: {
            select: usuarioPublicoSelect,
          },
          historicosDecisao: {
            orderBy: {
              dataDecisao: 'desc',
            },
            take: 1,
            include: {
              responsavel: {
                select: usuarioPublicoSelect,
              },
            },
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

  async buscarPorId(id: string, usuario: UsuarioAutenticado) {
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where: {
        id,
        dataExclusao: null,
        ...this.escopoDoUsuario(usuario),
      },
      include: {
        area: true,
        solicitante: {
          select: usuarioPublicoSelect,
        },
        historicosDecisao: {
          orderBy: {
            dataDecisao: 'desc',
          },
          include: {
            responsavel: {
              select: usuarioPublicoSelect,
            },
          },
        },
      },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    return solicitacao;
  }

  async atualizar(
    id: string,
    updateDto: UpdateSolicitacaoDto,
    usuario: UsuarioAutenticado,
  ) {
    if (usuario.perfil === Perfil.gestor) {
      throw new ForbiddenException(
        'Gestores não editam solicitações de usuários. Utilize o fluxo de decisão.',
      );
    }

    const solicitacao = await this.buscarPorId(id, usuario);

    if (solicitacao.status !== 'aberta') {
      throw new BadRequestException(
        'Solicitações já em análise ou finalizadas não podem ser alteradas.',
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
        solicitante: {
          select: usuarioPublicoSelect,
        },
      },
    });
  }

  async decidir(
    id: string,
    decidirDto: DecidirSolicitacaoDto,
    usuario: UsuarioAutenticado,
  ) {
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where: {
        id,
        dataExclusao: null,
      },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada.');
    }

    const novoStatus = decidirDto.status;

    if (solicitacao.status === 'aprovada' || solicitacao.status === 'rejeitada') {
      throw new BadRequestException(
        'Esta solicitação já foi finalizada e não pode receber novas decisões.',
      );
    }

    if (solicitacao.status === 'analise' && novoStatus === 'analise') {
      throw new BadRequestException('A solicitação já está em análise.');
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
          responsavelId: usuario.id,
        },
      });

      return tx.solicitacao.update({
        where: { id },
        data: {
          status: novoStatus,
        },
        include: {
          area: true,
          solicitante: {
            select: usuarioPublicoSelect,
          },
          historicosDecisao: {
            orderBy: {
              dataDecisao: 'desc',
            },
            include: {
              responsavel: {
                select: usuarioPublicoSelect,
              },
            },
          },
        },
      });
    });
  }

  async remover(id: string, usuario: UsuarioAutenticado) {
    const solicitacao = await this.buscarPorId(id, usuario);

    if (usuario.perfil === Perfil.solicitante && solicitacao.status !== 'aberta') {
      throw new BadRequestException(
        'Apenas solicitações abertas podem ser excluídas pelo solicitante.',
      );
    }

    return this.prisma.solicitacao.update({
      where: { id },
      data: {
        dataExclusao: new Date(),
      },
    });
  }
}
