import { describe, expect, it } from 'vitest';
import { HashService } from './hash.service.js';

describe('HashService', () => {
  const service = new HashService();

  it('deve gerar hash e validar senha com sucesso', async () => {
    const senha = 'MinhaSenhaSegura123!';
    const hash = await service.gerar(senha);

    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);

    const valida = await service.comparar(senha, hash);
    expect(valida).toBe(true);
  });

  it('deve falhar a comparação com senha incorreta', async () => {
    const hash = await service.gerar('SenhaCorreta');
    const valida = await service.comparar('SenhaIncorreta', hash);
    expect(valida).toBe(false);
  });

  it('deve produzir hashes distintos para a mesma senha devido ao salt aleatório', async () => {
    const senha = 'MesmaSenha';
    const hash1 = await service.gerar(senha);
    const hash2 = await service.gerar(senha);

    expect(hash1).not.toBe(hash2);
    expect(await service.comparar(senha, hash1)).toBe(true);
    expect(await service.comparar(senha, hash2)).toBe(true);
  });

  it('deve retornar false para hash mal formatado', async () => {
    const valida = await service.comparar('qualquer', 'invalido$sem$padrao');
    expect(valida).toBe(false);
  });
});
