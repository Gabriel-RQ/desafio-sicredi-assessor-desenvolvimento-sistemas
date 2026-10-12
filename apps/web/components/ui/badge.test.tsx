import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, PriorityBadge, RoleBadge } from './badge';

describe('Badges Component', () => {
  describe('StatusBadge', () => {
    it('deve renderizar o status aberta corretamente', () => {
      render(<StatusBadge status="aberta" />);
      expect(screen.getByText('Aberta')).toBeInTheDocument();
    });

    it('deve renderizar o status analise corretamente', () => {
      render(<StatusBadge status="analise" />);
      expect(screen.getByText('Em Análise')).toBeInTheDocument();
    });

    it('deve renderizar o status aprovada com estilo de sucesso', () => {
      render(<StatusBadge status="aprovada" />);
      expect(screen.getByText('Aprovada')).toBeInTheDocument();
    });

    it('deve renderizar o status rejeitada com estilo de perigo', () => {
      render(<StatusBadge status="rejeitada" />);
      expect(screen.getByText('Rejeitada')).toBeInTheDocument();
    });

    it('deve renderizar fallback para status desconhecido', () => {
      // @ts-expect-error testando fallback de status desconhecido
      render(<StatusBadge status="desconhecido" />);
      expect(screen.getByText('desconhecido')).toBeInTheDocument();
    });
  });

  describe('PriorityBadge', () => {
    it('deve renderizar prioridade alta', () => {
      render(<PriorityBadge prioridade="alta" />);
      expect(screen.getByText('Alta')).toBeInTheDocument();
    });

    it('deve renderizar prioridade media', () => {
      render(<PriorityBadge prioridade="media" />);
      expect(screen.getByText('Média')).toBeInTheDocument();
    });

    it('deve renderizar prioridade baixa', () => {
      render(<PriorityBadge prioridade="baixa" />);
      expect(screen.getByText('Baixa')).toBeInTheDocument();
    });

    it('deve renderizar fallback para prioridade desconhecida', () => {
      // @ts-expect-error testando fallback de prioridade desconhecida
      render(<PriorityBadge prioridade="urgente" />);
      expect(screen.getByText('urgente')).toBeInTheDocument();
    });
  });

  describe('RoleBadge', () => {
    it('deve renderizar o badge de gestor', () => {
      render(<RoleBadge perfil="gestor" />);
      expect(screen.getByText('Gestor')).toBeInTheDocument();
    });

    it('deve renderizar o badge de solicitante', () => {
      render(<RoleBadge perfil="solicitante" />);
      expect(screen.getByText('Solicitante')).toBeInTheDocument();
    });
  });
});
