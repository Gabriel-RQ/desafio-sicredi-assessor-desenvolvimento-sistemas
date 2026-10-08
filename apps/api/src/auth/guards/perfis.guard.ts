import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERFIS_KEY } from '../decorators/perfis.decorator.js';
import { Perfil } from '../../generated/prisma/enums.js';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisExigidos = this.reflector.getAllAndOverride<Perfil[]>(
      PERFIS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!perfisExigidos || perfisExigidos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const usuario = request.usuario;

    if (!usuario || !perfisExigidos.includes(usuario.perfil)) {
      throw new ForbiddenException(
        'Seu perfil não tem permissão para esta operação.',
      );
    }

    return true;
  }
}
