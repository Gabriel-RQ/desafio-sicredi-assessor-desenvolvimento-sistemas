import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';
import { MetricasDashboardDto } from './dto/metricas-dashboard.dto.js';
import { Perfis } from '../auth/decorators/perfis.decorator.js';
import { Perfil } from '../generated/prisma/enums.js';

@ApiBearerAuth()
@ApiTags('dashboard')
@Perfis(Perfil.gestor)
@ApiResponse({ status: 401, description: 'Não autenticado' })
@ApiResponse({ status: 403, description: 'Acesso restrito ao perfil de gestor' })
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

