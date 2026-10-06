import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Prioridade } from '../../generated/prisma/enums.js';

export class CreateSolicitacaoDto {
  @ApiProperty({ description: 'Título da solicitação', minLength: 3, maxLength: 150 })
  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MinLength(3, { message: 'O título deve ter no mínimo 3 caracteres.' })
  @MaxLength(150, { message: 'O título deve ter no máximo 150 caracteres.' })
  titulo!: string;

  @ApiProperty({ description: 'Descrição detalhada da solicitação', minLength: 5 })
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @MinLength(5, { message: 'A descrição deve ter no mínimo 5 caracteres.' })
  descricao!: string;

  @ApiProperty({ description: 'Nome do solicitante', maxLength: 100 })
  @IsString({ message: 'O solicitante deve ser um texto.' })
  @IsNotEmpty({ message: 'O solicitante é obrigatório.' })
  @MaxLength(100, { message: 'O nome do solicitante deve ter no máximo 100 caracteres.' })
  solicitante!: string;

  @ApiProperty({ description: 'ID da área solicitante (numérico)' })
  @IsInt({ message: 'O ID da área deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID da área deve ser positivo.' })
  areaSolicitanteId!: number;

  @ApiProperty({ enum: Prioridade, description: 'Nível de prioridade' })
  @IsEnum(Prioridade, {
    message: 'A prioridade deve ser uma das opções: baixa, media ou alta.',
  })
  prioridade!: Prioridade;
}

