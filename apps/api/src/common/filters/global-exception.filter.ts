import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'Ocorreu um erro interno no servidor.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj['message'] as string | string[]) || exception.message;
        error = (resObj['error'] as string) || exception.name;
      } else if (typeof res === 'string') {
        message = res;
        error = exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          error = 'Not Found';
          message = 'Registro solicitado não foi encontrado.';
          break;
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          error = 'Conflict';
          const target = (exception.meta?.target as string[]) || [];
          message = target.length > 0
            ? `Violação de unicidade no(s) campo(s): ${target.join(', ')}.`
            : 'Violação de unicidade de dados.';
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          const field = (exception.meta?.field_name as string) || 'chave estrangeira';
          message = `Restrição de integridade violada: ${field}. Verifique se a referência informada existe.`;
          break;
        }
        default:
          this.logger.error(`Erro Prisma [${exception.code}]: ${exception.message}`);
          message = 'Ocorreu um erro interno no banco de dados.';
          break;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Erro inesperado: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Erro desconhecido capturado:', exception);
    }

    const detail = Array.isArray(message)
      ? message.join('; ')
      : typeof message === 'string'
        ? message
        : String(message);

    const type = this.resolveTypeUri(error);
    const requestUrl = request.originalUrl || request.url;

    response.status(status).json({
      // RFC 7807 Problem Details
      type,
      title: error,
      status,
      detail,
      instance: requestUrl,

      // Retrocompatibilidade total com clientes e testes existentes
      statusCode: status,
      error,
      message,
      path: requestUrl,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Resolve a URI de tipo canônica da RFC 7807 para a taxonomia de erros do Sicredi.
   */
  private resolveTypeUri(errorTitle: string): string {
    const slug = errorTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return slug
      ? `https://developer.sicredi.com.br/errors/${slug}`
      : 'about:blank';
  }
}
