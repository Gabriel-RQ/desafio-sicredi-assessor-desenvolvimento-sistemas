import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AreasModule } from './areas/areas.module.js';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AreasModule,
    SolicitacoesModule,
    DashboardModule,
  ],
})
export class AppModule {}
