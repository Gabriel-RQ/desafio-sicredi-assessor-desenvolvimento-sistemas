import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AreasModule } from './areas/areas.module.js';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { PerfisGuard } from './auth/guards/perfis.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, any>) => {
        if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
          throw new Error(
            'A variável de ambiente JWT_SECRET é obrigatória e deve ter pelo menos 32 caracteres.',
          );
        }
        return config;
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    UsuariosModule,
    AuthModule,
    HealthModule,
    AreasModule,
    SolicitacoesModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PerfisGuard,
    },
  ],
})
export class AppModule {}
