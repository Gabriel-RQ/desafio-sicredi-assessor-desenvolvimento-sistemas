/**
 * @file packages/shared/src/index.ts
 * Contratos, tipos e enums compartilhados entre apps/api e apps/web.
 */

// ==========================================
// ENUMS DE DOMÍNIO
// ==========================================

export const Perfil = {
  solicitante: 'solicitante',
  gestor: 'gestor',
} as const;
export type Perfil = (typeof Perfil)[keyof typeof Perfil];

export const Status = {
  aberta: 'aberta',
  analise: 'analise',
  aprovada: 'aprovada',
  rejeitada: 'rejeitada',
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const Prioridade = {
  baixa: 'baixa',
  media: 'media',
  alta: 'alta',
} as const;
export type Prioridade = (typeof Prioridade)[keyof typeof Prioridade];

// ==========================================
// USUÁRIOS E AUTENTICAÇÃO
// ==========================================

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
}

export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiraEm: string;
  usuario: UsuarioResponse;
}

// ==========================================
// ÁREAS
// ==========================================

export interface AreaResponse {
  id: number;
  descricao: string;
}

// ==========================================
// HISTÓRICO DE DECISÃO
// ==========================================

export interface HistoricoDecisao {
  id: number | string;
  solicitacaoId: string;
  responsavelId: string;
  status: Status;
  comentario: string;
  dataDecisao: string;
  responsavel?: UsuarioPublico;
}

// ==========================================
// SOLICITAÇÕES
// ==========================================

export interface Solicitacao {
  id: string;
  titulo: string;
  descricao: string;
  areaSolicitanteId: number;
  prioridade: Prioridade;
  status: Status;
  solicitanteId: string;
  dataSolicitacao: string;
  dataCriacao?: string;
  dataAtualizacao: string;
  dataExclusao?: string | null;
  area?: AreaResponse;
  solicitante?: UsuarioPublico;
  historicosDecisao?: HistoricoDecisao[];
}

export interface CreateSolicitacaoPayload {
  titulo: string;
  descricao: string;
  areaSolicitanteId: number;
  prioridade: Prioridade;
}

export interface UpdateSolicitacaoPayload {
  titulo?: string;
  descricao?: string;
  areaSolicitanteId?: number;
  prioridade?: Prioridade;
}

export interface DecidirSolicitacaoPayload {
  status: 'analise' | 'aprovada' | 'rejeitada';
  comentario: string;
}

export interface QuerySolicitacoesParams {
  page?: number;
  limit?: number;
  status?: Status;
  prioridade?: Prioridade;
  areaId?: number;
  search?: string;
  termo?: string;
  sortBy?: 'dataSolicitacao' | 'dataAtualizacao' | 'titulo' | 'prioridade' | 'status';
  order?: 'asc' | 'desc';
}

export interface MetaPaginacao {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListaSolicitacoesPaginada {
  data: Solicitacao[];
  meta: MetaPaginacao;
}

// ==========================================
// MÉTRICAS E DASHBOARD
// ==========================================

export interface MetricasPorStatus {
  aberta: number;
  analise: number;
  aprovada: number;
  rejeitada: number;
}

export interface MetricasPorPrioridade {
  baixa: number;
  media: number;
  alta: number;
}

export interface MetricasDashboard {
  total: number;
  porStatus: MetricasPorStatus;
  porPrioridade: MetricasPorPrioridade;
}
