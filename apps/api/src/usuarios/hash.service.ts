import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;
const SALT_LEN = 16;

@Injectable()
export class HashService {
  async gerar(senha: string): Promise<string> {
    const salt = randomBytes(SALT_LEN).toString('hex');
    const derivedKey = (await scryptAsync(senha, salt, KEY_LEN)) as Buffer;
    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  async comparar(senha: string, hashArmazenado: string): Promise<boolean> {
    const partes = hashArmazenado.split('$');
    if (partes.length !== 3 || partes[0] !== 'scrypt') {
      return false;
    }

    const [, salt, hashHex] = partes;
    const derivedKey = (await scryptAsync(senha, salt, KEY_LEN)) as Buffer;
    const hashOriginalBuffer = Buffer.from(hashHex, 'hex');

    if (derivedKey.length !== hashOriginalBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, hashOriginalBuffer);
  }
}
