import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AreasService } from './areas.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('AreasService', () => {
  let service: AreasService;
  let prismaMock: {
    area: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prismaMock = {
      area: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    service = new AreasService(prismaMock as unknown as PrismaService);
  });

  it('deve listar todas as áreas ordenadas por descrição', async () => {
    const mockAreas = [
      { id: 1, descricao: 'Documentos e Cadastros' },
      { id: 2, descricao: 'Tecnologia e Processos' },
    ];
    prismaMock.area.findMany.mockResolvedValue(mockAreas);

    const result = await service.listar();

    expect(result).toEqual(mockAreas);
    expect(prismaMock.area.findMany).toHaveBeenCalledWith({
      orderBy: { descricao: 'asc' },
    });
  });

  it('deve buscar uma área por id', async () => {
    const mockArea = { id: 1, descricao: 'Tecnologia e Processos' };
    prismaMock.area.findUnique.mockResolvedValue(mockArea);

    const result = await service.buscarPorId(1);

    expect(result).toEqual(mockArea);
    expect(prismaMock.area.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
