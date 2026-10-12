import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalExceptionFilter } from './global-exception.filter.js';
import { Prisma } from '../../generated/prisma/client.js';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockGetResponse: ReturnType<typeof vi.fn>;
  let mockGetRequest: ReturnType<typeof vi.fn>;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockJson = vi.fn();
    mockStatus = vi.fn().mockImplementation(() => ({ json: mockJson }));
    mockGetResponse = vi.fn().mockReturnValue({ status: mockStatus });
    mockGetRequest = vi.fn().mockReturnValue({
      url: '/api/v1/teste',
      originalUrl: '/api/v1/teste',
    });

    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    };
  });

  it('deve formatar HttpException padrão (404 NotFound)', () => {
    const exception = new NotFoundException('Recurso não encontrado');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://developer.sicredi.com.br/errors/not-found',
        title: 'Not Found',
        status: HttpStatus.NOT_FOUND,
        detail: 'Recurso não encontrado',
        instance: '/api/v1/teste',
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Recurso não encontrado',
        path: '/api/v1/teste',
      }),
    );
  });

  it('deve formatar erro de validação (ValidationPipe) com array de mensagens', () => {
    const validationErrors = ['O título é obrigatório', 'A descrição é obrigatória'];
    const exception = new BadRequestException({
      statusCode: 400,
      message: validationErrors,
      error: 'Bad Request',
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://developer.sicredi.com.br/errors/bad-request',
        title: 'Bad Request',
        status: HttpStatus.BAD_REQUEST,
        detail: 'O título é obrigatório; A descrição é obrigatória',
        instance: '/api/v1/teste',
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: validationErrors,
        path: '/api/v1/teste',
      }),
    );
  });

  it('deve formatar erro Prisma P2002 (violação de unicidade)', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { target: ['titulo'] },
      },
    );

    filter.catch(prismaError, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://developer.sicredi.com.br/errors/conflict',
        title: 'Conflict',
        status: HttpStatus.CONFLICT,
        detail: 'Violação de unicidade no(s) campo(s): titulo.',
        instance: '/api/v1/teste',
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'Violação de unicidade no(s) campo(s): titulo.',
        path: '/api/v1/teste',
      }),
    );
  });

  it('deve formatar erro genérico inesperado (500)', () => {
    const genericError = new Error('Falha inesperada no servidor');

    filter.catch(genericError, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://developer.sicredi.com.br/errors/internal-server-error',
        title: 'Internal Server Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: 'Ocorreu um erro interno no servidor.',
        instance: '/api/v1/teste',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Ocorreu um erro interno no servidor.',
        path: '/api/v1/teste',
      }),
    );
  });
});
