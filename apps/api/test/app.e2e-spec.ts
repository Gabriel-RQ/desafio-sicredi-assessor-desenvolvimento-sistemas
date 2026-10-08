import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let tokenGestor: string;
  let tokenJoao: string;
  let tokenMaria: string;
  let joaoId: string;
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

  describe('Autenticação e Rota Pública', () => {
    it('GET /api/v1/health -> 200 OK (rota pública sem token)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(typeof res.body.timestamp).toBe('string');
        });
    });

    it('POST /api/v1/auth/login -> 401 Credenciais inválidas com senha errada', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'gestor@sicredi.local',
          senha: 'senha-incorreta',
        })
        .expect(401);

      expect(res.body.statusCode).toBe(401);
      expect(res.body.message).toBe('Credenciais inválidas.');
      expect(res.body.path).toBe('/api/v1/auth/login');
    });

    it('POST /api/v1/auth/login -> 200 OK para Gestor, João e Maria', async () => {
      const resGestor = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'gestor@sicredi.local',
          senha: 'Sicredi@2026',
        })
        .expect(200);

      tokenGestor = resGestor.body.accessToken;
      expect(tokenGestor).toBeDefined();
      expect(resGestor.body.usuario.perfil).toBe('gestor');
      expect(resGestor.body.senhaHash).toBeUndefined();

      const resJoao = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'joao@sicredi.local',
          senha: 'Sicredi@2026',
        })
        .expect(200);

      tokenJoao = resJoao.body.accessToken;
      joaoId = resJoao.body.usuario.id;
      expect(tokenJoao).toBeDefined();
      expect(resJoao.body.usuario.perfil).toBe('solicitante');

      const resMaria = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'maria@sicredi.local',
          senha: 'Sicredi@2026',
        })
        .expect(200);

      tokenMaria = resMaria.body.accessToken;
      expect(tokenMaria).toBeDefined();
      expect(resMaria.body.usuario.perfil).toBe('solicitante');
    });

    it('GET /api/v1/auth/me -> 200 OK com dados do usuário autenticado', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${tokenJoao}`)
        .expect(200);

      expect(res.body.id).toBe(joaoId);
      expect(res.body.email).toBe('joao@sicredi.local');
      expect(res.body.nome).toBe('João Solicitante');
      expect(res.body.senhaHash).toBeUndefined();
    });
  });

  describe('Áreas', () => {
    it('GET /api/v1/areas -> 401 Não autenticado sem token', () => {
      return request(app.getHttpServer()).get('/api/v1/areas').expect(401);
    });

    it('GET /api/v1/areas -> 200 OK com lista de áreas', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/areas')
        .set('Authorization', `Bearer ${tokenJoao}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      areaId = res.body[0].id;
    });
  });

  describe('Solicitações e Controle de Acesso', () => {
    it('POST /api/v1/solicitacoes -> 400 Bad Request se enviar solicitante no body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/solicitacoes')
        .set('Authorization', `Bearer ${tokenJoao}`)
        .send({
          titulo: 'Equipamento',
          descricao: 'Descrição detalhada',
          areaSolicitanteId: areaId,
          prioridade: 'alta',
          solicitante: 'Tentativa de passar nome manual',
        })
        .expect(400);
    });

    it('POST /api/v1/solicitacoes -> 201 Created vinculada a João Solicitante', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/solicitacoes')
        .set('Authorization', `Bearer ${tokenJoao}`)
        .send({
          titulo: 'Notebook para novo colaborador',
          descricao: 'Solicitação de equipamento para novo analista de sistemas',
          areaSolicitanteId: areaId,
          prioridade: 'alta',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.titulo).toBe('Notebook para novo colaborador');
      expect(res.body.status).toBe('aberta');
      expect(res.body.solicitante.id).toBe(joaoId);
      expect(res.body.solicitante.nome).toBe('João Solicitante');
      expect(res.body.solicitante.senhaHash).toBeUndefined();
      createdSolicitacaoId = res.body.id;
    });

    it('GET /api/v1/solicitacoes/:id -> 404 para Maria (isolamento de propriedade)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/solicitacoes/${createdSolicitacaoId}`)
        .set('Authorization', `Bearer ${tokenMaria}`)
        .expect(404);
    });

    it('GET /api/v1/solicitacoes -> Maria não lista solicitações de João', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/solicitacoes')
        .set('Authorization', `Bearer ${tokenMaria}`)
        .expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta.total).toBe(0);
    });

    it('GET /api/v1/solicitacoes/:id -> 200 OK para João (dono do recurso)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/solicitacoes/${createdSolicitacaoId}`)
        .set('Authorization', `Bearer ${tokenJoao}`)
        .expect(200);

      expect(res.body.id).toBe(createdSolicitacaoId);
      expect(res.body.solicitante.id).toBe(joaoId);
    });

    it('PATCH /api/v1/solicitacoes/:id/decidir -> 403 Forbidden para Solicitante', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/solicitacoes/${createdSolicitacaoId}/decidir`)
        .set('Authorization', `Bearer ${tokenJoao}`)
        .send({
          status: 'aprovada',
          comentario: 'Solicitante tentando aprovar própria solicitação',
        })
        .expect(403);
    });

    it('GET /api/v1/dashboard -> 403 Forbidden para Solicitante', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${tokenJoao}`)
        .expect(403);
    });

    it('GET /api/v1/dashboard -> 200 OK para Gestor', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${tokenGestor}`)
        .expect(200);

      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.porStatus.aberta).toBeGreaterThan(0);
    });

    it('PATCH /api/v1/solicitacoes/:id/decidir -> 200 OK para Gestor e registra responsável', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/solicitacoes/${createdSolicitacaoId}/decidir`)
        .set('Authorization', `Bearer ${tokenGestor}`)
        .send({
          status: 'aprovada',
          comentario: 'Solicitação aprovada conforme orçamento disponível.',
        })
        .expect(200);

      expect(res.body.status).toBe('aprovada');
      expect(res.body.historicosDecisao).toHaveLength(1);
      expect(res.body.historicosDecisao[0].status).toBe('aprovada');
      expect(res.body.historicosDecisao[0].responsavel.nome).toBe('Gestora Ana');
      expect(
        res.body.historicosDecisao[0].responsavel.senhaHash,
      ).toBeUndefined();
    });

    it('PATCH /api/v1/solicitacoes/:id/decidir -> 400 Bad Request se já finalizada', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/solicitacoes/${createdSolicitacaoId}/decidir`)
        .set('Authorization', `Bearer ${tokenGestor}`)
        .send({
          status: 'rejeitada',
          comentario: 'Tentativa inválida após aprovada',
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });

    it('DELETE /api/v1/solicitacoes/:id -> 204 No Content (soft delete pelo gestor)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/solicitacoes/${createdSolicitacaoId}`)
        .set('Authorization', `Bearer ${tokenGestor}`)
        .expect(204);

      // Consulta subsequente deve retornar 404 Not Found devido ao soft delete
      await request(app.getHttpServer())
        .get(`/api/v1/solicitacoes/${createdSolicitacaoId}`)
        .set('Authorization', `Bearer ${tokenGestor}`)
        .expect(404);
    });
  });
});
