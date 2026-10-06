import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.area.findMany({
      orderBy: {
        descricao: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const area = await this.prisma.area.findUnique({
      where: { id },
    });

    if (!area) {
      throw new NotFoundException('Área não encontrada.');
    }

    return area;
  }
}

