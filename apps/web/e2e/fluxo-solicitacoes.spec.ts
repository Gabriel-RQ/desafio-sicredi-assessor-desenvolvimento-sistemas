import { test, expect } from '@playwright/test';

test.describe('Fluxo de Navegação e Solicitações', () => {
  test.beforeEach(async ({ context }) => {
    // Configura cookies de autenticação para simular sessão logada
    await context.addCookies([
      {
        name: 'token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
      },
      {
        name: 'user',
        value: JSON.stringify({
          id: 'usr-1',
          nome: 'Carlos Gestor',
          email: 'carlos@sicredi.com.br',
          perfil: 'gestor',
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('deve renderizar o cabeçalho e painel de solicitações', async ({ page }) => {
    // Intercepta rotas da API para testes autônomos
    await page.route('**/api/v1/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 15,
          porStatus: { aberta: 5, analise: 3, aprovada: 5, rejeitada: 2 },
          porPrioridade: { baixa: 5, media: 5, alta: 5 },
        }),
      });
    });

    await page.route('**/api/v1/areas', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, descricao: 'Crédito Rural' },
          { id: 2, descricao: 'Tecnologia da Informação' },
        ]),
      });
    });

    await page.route('**/api/v1/solicitacoes*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'sol-001',
              titulo: 'Expansão de Infraestrutura de Servidores',
              descricao: 'Aquisição de novos nós para processamento',
              status: 'aberta',
              prioridade: 'alta',
              solicitanteId: 'usr-1',
              areaSolicitanteId: 2,
              dataSolicitacao: new Date().toISOString(),
              dataAtualizacao: new Date().toISOString(),
              solicitante: { id: 'usr-1', nome: 'Mariana Lima', email: 'mariana@sicredi.com.br' },
              area: { id: 2, descricao: 'Tecnologia da Informação' },
              historicosDecisao: [],
            },
          ],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });

    await page.goto('/');

    // Verifica nome do usuário no Header
    await expect(page.getByText('Carlos Gestor')).toBeVisible();

    // Verifica Painel e Botão de Nova Solicitação
    await expect(page.getByRole('heading', { name: /Painel de Solicitações Internas/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nova Solicitação/i })).toBeVisible();

    // Verifica item na tabela
    await expect(page.getByText('Expansão de Infraestrutura de Servidores')).toBeVisible();
  });

  test('deve navegar até o formulário de nova solicitação e validar campos', async ({ page }) => {
    await page.route('**/api/v1/areas', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, descricao: 'Crédito Rural' },
          { id: 2, descricao: 'Tecnologia da Informação' },
        ]),
      });
    });

    await page.goto('/solicitacoes/nova');

    await expect(page.getByRole('heading', { name: /Nova Solicitação Interna/i })).toBeVisible();

    // Submete vazio para testar validação
    await page.getByRole('button', { name: /Submeter Solicitação/i }).click();

    await expect(page.getByText('O título deve ter no mínimo 3 caracteres.')).toBeVisible();
    await expect(page.getByText('Selecione uma área solicitante válida.')).toBeVisible();
  });
});
