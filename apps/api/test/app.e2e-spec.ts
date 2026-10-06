import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let createdSolicitacaoId: string;
  let areaId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health -> 200 OK', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(typeof res.body.timestamp).toBe('string');
      });
  });

  it('GET /api/v1/areas -> 200 OK com lista de áreas', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/areas')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    areaId = res.body[0].id;
  });

  it('POST /api/v1/solicitacoes -> 201 Created', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/solicitacoes')
      .send({
        titulo: 'Notebook para novo colaborador',
        descricao: 'Solicitação de equipamento para novo analista de sistemas',
        solicitante: 'Gabriel Queiroz',
        areaSolicitanteId: areaId,
        prioridade: 'alta',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.titulo).toBe('Notebook para novo colaborador');
    expect(res.body.status).toBe('aberta');
    expect(res.body.area.id).toBe(areaId);
    createdSolicitacaoId = res.body.id;
  });

  it('POST /api/v1/solicitacoes -> 400 Bad Request com dados inválidos', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/solicitacoes')
      .send({
        titulo: 'No', // muito curto
        descricao: 'Eq', // muito curto
        solicitante: '',
        areaSolicitanteId: -1,
        prioridade: 'invalida',
      })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
    expect(res.body.error).toBe('Bad Request');
    expect(Array.isArray(res.body.message)).toBe(true);
    expect(res.body.path).toBe('/api/v1/solicitacoes');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/solicitacoes -> 200 OK com paginação e busca', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/solicitacoes')
      .query({ search: 'Notebook', page: 1, limit: 10 })
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('GET /api/v1/solicitacoes/:id -> 200 OK', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/solicitacoes/${createdSolicitacaoId}`)
      .expect(200);

    expect(res.body.id).toBe(createdSolicitacaoId);
    expect(res.body.area).toBeDefined();
  });

  it('PATCH /api/v1/solicitacoes/:id/decidir -> 200 OK com decisão e histórico', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/solicitacoes/${createdSolicitacaoId}/decidir`)
      .send({
        status: 'aprovada',
        comentario: 'Solicitação aprovada conforme orçamento disponível.',
        responsavelDecisao: 'Gestor de TI',
      })
      .expect(200);

    expect(res.body.status).toBe('aprovada');
    expect(res.body.historicosDecisao).toHaveLength(1);
    expect(res.body.historicosDecisao[0].status).toBe('aprovada');
    expect(res.body.historicosDecisao[0].comentario).toBe(
      'Solicitação aprovada conforme orçamento disponível.',
    );
  });

  it('PATCH /api/v1/solicitacoes/:id/decidir -> 400 Bad Request se já finalizada', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/solicitacoes/${createdSolicitacaoId}/decidir`)
      .send({
        status: 'rejeitada',
        comentario: 'Tentativa inválida após aprovada',
        responsavelDecisao: 'Outro Gestor',
      })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
    expect(res.body.error).toBe('Bad Request');
    expect(res.body.message).toBe(
      'Esta solicitação já foi finalizada e não pode receber novas decisões.',
    );
    expect(res.body.path).toBe(
      `/api/v1/solicitacoes/${createdSolicitacaoId}/decidir`,
    );
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/dashboard -> 200 OK com métricas', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .expect(200);

    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.porStatus.aprovada).toBeGreaterThan(0);
    expect(res.body.porPrioridade).toBeDefined();
  });

  it('DELETE /api/v1/solicitacoes/:id -> 204 No Content (soft delete)', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/solicitacoes/${createdSolicitacaoId}`)
      .expect(204);

    // Consulta subsequente deve retornar 404 Not Found devido ao soft delete
    await request(app.getHttpServer())
      .get(`/api/v1/solicitacoes/${createdSolicitacaoId}`)
      .expect(404);
  });
});
