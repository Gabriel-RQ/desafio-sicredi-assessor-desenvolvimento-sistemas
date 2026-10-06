import { ApiProperty } from '@nestjs/swagger';

export class AreaResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único da área' })
  id!: number;

  @ApiProperty({ example: 'Tecnologia e Processos', description: 'Nome/descrição da área de coordenação' })
  descricao!: string;
}
