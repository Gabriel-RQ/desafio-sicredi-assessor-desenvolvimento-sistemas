import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prioridade, Status } from '../../generated/prisma/enums.js';

export class QuerySolicitacaoDto {
  @ApiPropertyOptional({ description: 'Termo de busca (título, descrição, solicitante)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Status, description: 'Filtrar por status' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({ enum: Prioridade, description: 'Filtrar por prioridade' })
  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;

  @ApiPropertyOptional({ description: 'Filtrar por ID da área solicitante' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  areaId?: number;

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    enum: ['dataSolicitacao', 'dataAtualizacao', 'titulo', 'prioridade', 'status'],
    default: 'dataSolicitacao',
  })
  @IsOptional()
  @IsIn(['dataSolicitacao', 'dataAtualizacao', 'titulo', 'prioridade', 'status'])
  sortBy?: 'dataSolicitacao' | 'dataAtualizacao' | 'titulo' | 'prioridade' | 'status' =
    'dataSolicitacao';

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Número da página', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

