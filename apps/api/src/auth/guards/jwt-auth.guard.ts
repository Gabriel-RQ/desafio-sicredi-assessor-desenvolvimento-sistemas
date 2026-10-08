import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/publico.decorator.js';
import { UsuarioAutenticado } from '../types/usuario-autenticado.js';

interface JwtPayload {
  sub: string;
  nome: string;
  perfil: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extrairTokenDoCabecalho(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.usuario = {
        id: payload.sub,
        nome: payload.nome,
        perfil: payload.perfil,
      } as UsuarioAutenticado;
    } catch {
      throw new UnauthorizedException('Token ausente, inválido ou expirado.');
    }

    return true;
  }

  private extrairTokenDoCabecalho(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
