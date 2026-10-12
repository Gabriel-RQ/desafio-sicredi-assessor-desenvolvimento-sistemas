import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

describe('Proxy (Next.js 16 Request Gatekeeper)', () => {
  it('deve permitir acesso a rotas estáticas e api sem redirecionamento', () => {
    const reqNext = new NextRequest('http://localhost:3001/_next/static/chunks/main.js');
    const resNext = proxy(reqNext);
    expect(resNext.headers.get('location')).toBeNull();

    const reqFavicon = new NextRequest('http://localhost:3001/favicon.ico');
    const resFavicon = proxy(reqFavicon);
    expect(resFavicon.headers.get('location')).toBeNull();

    const reqStatic = new NextRequest('http://localhost:3001/sicredi_logo.svg');
    const resStatic = proxy(reqStatic);
    expect(resStatic.headers.get('location')).toBeNull();
  });

  it('deve redirecionar usuário não autenticado para /login ao tentar acessar rotas privadas', () => {
    const req = new NextRequest('http://localhost:3001/');
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3001/login');
  });

  it('deve permitir acesso à página /login para usuário não autenticado', () => {
    const req = new NextRequest('http://localhost:3001/login');
    const res = proxy(req);

    expect(res.headers.get('location')).toBeNull();
  });

  it('deve redirecionar usuário autenticado para / ao tentar acessar /login', () => {
    const req = new NextRequest('http://localhost:3001/login', {
      headers: {
        cookie: 'token=mock-valid-token',
      },
    });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3001/');
  });

  it('deve permitir acesso às páginas protegidas para usuário autenticado', () => {
    const req = new NextRequest('http://localhost:3001/solicitacoes/nova', {
      headers: {
        cookie: 'token=mock-valid-token',
      },
    });
    const res = proxy(req);

    expect(res.headers.get('location')).toBeNull();
  });
});
