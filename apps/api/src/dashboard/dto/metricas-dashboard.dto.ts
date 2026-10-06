import { ApiProperty } from '@nestjs/swagger';

export class MetricasPorStatusDto {
  @ApiProperty({ example: 4, description: 'Quantidade de solicitações em status aberta' })
  aberta!: number;

  @ApiProperty({ example: 2, description: 'Quantidade de solicitações em análise' })
  analise!: number;

  @ApiProperty({ example: 5, description: 'Quantidade de solicitações aprovadas' })
  aprovada!: number;

  @ApiProperty({ example: 1, description: 'Quantidade de solicitações rejeitadas' })
  rejeitada!: number;
}

export class MetricasPorPrioridadeDto {
  @ApiProperty({ example: 3, description: 'Quantidade de solicitações com prioridade baixa' })
  baixa!: number;

  @ApiProperty({ example: 6, description: 'Quantidade de solicitações com prioridade média' })
  media!: number;

  @ApiProperty({ example: 3, description: 'Quantidade de solicitações com prioridade alta' })
  alta!: number;
}

export class MetricasDashboardDto {
  @ApiProperty({ example: 12, description: 'Total de solicitações cadastradas ativas' })
  total!: number;

  @ApiProperty({ type: MetricasPorStatusDto, description: 'Métricas agregadas por status' })
  porStatus!: MetricasPorStatusDto;

  @ApiProperty({ type: MetricasPorPrioridadeDto, description: 'Métricas agregadas por prioridade' })
  porPrioridade!: MetricasPorPrioridadeDto;
}
