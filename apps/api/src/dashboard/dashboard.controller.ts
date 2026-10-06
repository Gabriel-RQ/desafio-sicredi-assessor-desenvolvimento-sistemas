import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { MetricasDashboardDto } from './dto/metricas-dashboard.dto.js';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obter métricas do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Métricas retornadas com sucesso',
    type: MetricasDashboardDto,
  })
  obterMetricas(): Promise<MetricasDashboardDto> {
    return this.dashboardService.obterMetricas();
  }
}

