import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (Class Names utility)', () => {
  it('deve mesclar classes css básicas', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('deve resolver conflitos de classes Tailwind com twMerge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('deve ignorar valores nulos, indefinidos ou booleanos falsos', () => {
    expect(cn('bg-white', null, undefined, false && 'hidden', 'text-black')).toBe(
      'bg-white text-black',
    );
  });

  it('deve suportar arrays e objetos de classe', () => {
    expect(cn(['flex', 'items-center'], { 'justify-center': true, hidden: false })).toBe(
      'flex items-center justify-center',
    );
  });
});
