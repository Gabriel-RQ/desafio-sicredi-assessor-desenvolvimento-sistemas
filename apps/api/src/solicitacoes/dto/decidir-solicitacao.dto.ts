import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '../../generated/prisma/enums.js';

export const STATUS_PERMITIDOS_DECISAO = ['analise', 'aprovada', 'rejeitada'] as const;

export class DecidirSolicitacaoDto {
  @ApiProperty({
    enum: STATUS_PERMITIDOS_DECISAO,
    description: 'Novo status da decisão (analise, aprovada, rejeitada)',
  })
  @IsIn(STATUS_PERMITIDOS_DECISAO, {
    message: 'O status da decisão deve ser: analise, aprovada ou rejeitada.',
  })
  status!: Status;

  @ApiProperty({ description: 'Comentário ou justificativa da decisão', maxLength: 1000 })
  @IsString({ message: 'O comentário deve ser um texto.' })
  @IsNotEmpty({ message: 'O comentário da decisão é obrigatório.' })
  @MaxLength(1000, { message: 'O comentário deve ter no máximo 1000 caracteres.' })
  comentario!: string;
}


