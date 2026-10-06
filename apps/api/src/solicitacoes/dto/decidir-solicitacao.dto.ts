import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../../generated/prisma/enums.js';

export class DecidirSolicitacaoDto {
  @ApiProperty({ enum: Status, description: 'Novo status da decisão (analise, aprovada, rejeitada)' })
  @IsEnum(Status, {
    message: 'O status da decisão deve ser: analise, aprovada ou rejeitada.',
  })
  status!: Status;

  @ApiProperty({ description: 'Comentário ou justificativa da decisão', maxLength: 1000 })
  @IsString({ message: 'O comentário deve ser um texto.' })
  @IsNotEmpty({ message: 'O comentário da decisão é obrigatório.' })
  @MaxLength(1000, { message: 'O comentário deve ter no máximo 1000 caracteres.' })
  comentario!: string;

  @ApiProperty({ description: 'Nome do responsável pela decisão', maxLength: 100 })
  @IsString({ message: 'O responsável pela decisão deve ser informado.' })
  @IsNotEmpty({ message: 'O responsável pela decisão é obrigatório.' })
  @MaxLength(100, { message: 'O responsável pela decisão deve ter no máximo 100 caracteres.' })
  responsavelDecisao!: string;
}

