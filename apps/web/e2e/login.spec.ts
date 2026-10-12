import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação (Login)', () => {
  test('deve exibir a tela de login institucional do Sicredi', async ({ page }) => {
    await page.goto('/login');

    // Valida marca e título
    await expect(page.locator('img[alt="Sicredi"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Gestão de Solicitações Internas/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Acessar Plataforma/i })).toBeVisible();
  });

  test('deve exibir erros de validação ao tentar submeter campos vazios', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /Acessar Plataforma/i }).click();

    await expect(page.getByText('O e-mail é obrigatório.')).toBeVisible();
    await expect(page.getByText('A senha é obrigatória.')).toBeVisible();
  });

  test('deve preencher credenciais ao usar o botão de atalho rápido', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /Perfil Gestor/i }).click();

    await expect(page.getByLabel(/E-mail Corporativo/i)).toHaveValue('gestor@sicredi.local');
    await expect(page.getByLabel(/Senha/i)).toHaveValue('Sicredi@2026');
  });
});
