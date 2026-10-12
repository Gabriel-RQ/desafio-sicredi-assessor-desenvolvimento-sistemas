# Portal de Gestão de Solicitações Internas — Sicredi Web

Interface web corporativa desenvolvida em **Next.js 16 (App Router + Turbopack)** e **React 19** para o Desafio Técnico de Assessor de Desenvolvimento de Sistemas do Sicredi.

O portal disponibiliza uma experiência ágil, acessível e aderente à identidade corporativa do Sicredi, integrando fluxos de autenticação por perfil (RBAC), acompanhamento em tempo real por indicadores de desempenho, abertura e triagem de demandas e esteira auditável de deliberações com histórico cronológico em *Timeline*.

---

## 🎨 Identidade Visual e Design Corporativo Sicredi

A interface foi concebida seguindo rigorosamente o manual de identidade visual e as diretrizes corporativas da cooperativa:

### 1. Paleta de Cores Institucional
- **Verde Corporativo / Institucional:** `#146E37` (Pantone 7733 C) — Barras de navegação, cabeçalhos, botões secundários institucionais e bordas selecionadas.
- **Verde Digital / Ação Primária:** `#3FA110` (Pantone 361 C) — Botões de ação principal (`+ Nova Solicitação`, `Submeter Solicitação`, `Acessar Plataforma`).
- **Superfícies e Cartões:** `#FFFFFF` (cards, modais e containers de dados) e `#F5F8F4` / `#F7FBF6` (fundo cooperativo acolhedor).
- **Bordas e Linhas Divisórias:** `#D7E6C8` (Pantone 7485 C) e neutros suaves `#E2E8F0`.
- **Tipografia e Alto Contraste:** `#232B23` (textos principais para máxima legibilidade) e `#5A645A` (legendas e metadados).

### 2. Semântica Oficial de Status
- **Aberta:** `#FFCD00` (texto/borda) sobre `#FFF9E6` (fundo suave) — Amarelo Sicredi para demandas recém-protocoladas.
- **Em Análise:** `#1E78D4` sobre `#EBF4FC` — Azul Corporativo indicando triagem ou avaliação em andamento.
- **Aprovada:** `#146E37` sobre `#EAF6EC` — Verde Institucional para propostas deferidas.
- **Rejeitada:** `#C0392B` sobre `#FDF0F2` — Bordô/Ruby para demandas indeferidas com justificativa.

### 3. Tipografia Institucional (Google Fonts)
- **Títulos e Identidade Institucional:** **Exo 2.0** — Tipografia geométrica, moderna e expressiva utilizada em logotipos, títulos de páginas e números de destaque nos cartões KPI.
- **Corpo, Tabelas e Dados:** **Nunito** — Tipografia arredondada de leitura fluida, aplicada a formulários, tabelas, filtros e textos descritivos.

### 4. Ergonomia UX e Ações Contextuais
- **Eliminação de Ruído Cognitivo:** Evita a repetição indiscriminada de botões verdes de ação primária em cada linha de tabela.
- **Ações Baseadas no Estado da Demanda:**
  - *Solicitações Pendentes (`Aberta`/`Em Análise`):* Botão destacado `Avaliar` visível para Gestores.
  - *Solicitações Deferidas (`Aprovada`):* Link contextual `Ver Parecer` em tom verde sutil.
  - *Solicitações Indeferidas (`Rejeitada`):* Ação informativa `Justificativa` para inspeção do motivo de recusa.
- **Adaptação por Perfil (RBAC):** Solicitantes visualizam apenas ações de acompanhamento (`Ver Detalhes`) e têm seus formulários ajustados para não exibir esteiras de deliberação.

---

## 🏗️ Arquitetura e Estrutura de Páginas

A aplicação utiliza o **App Router** do Next.js com segregação clara de responsabilidades:

```text
apps/web/
├── app/
│   ├── (auth)/
│   │   └── login/                     # Autenticação com e-mail/senha e atalhos rápidos
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Layout corporativo com Header Sicredi e Rodapé institucional
│   │   ├── page.tsx                   # Painel principal: KPI cards, filtros e tabela de solicitações
│   │   └── solicitacoes/
│   │       ├── nova/                  # Formulário de cadastro de nova solicitação
│   │       └── [id]/                  # Detalhes da demanda, histórico em Timeline e parecer
│   ├── globals.css                    # Importação de fontes Google Fonts e tokens de cores
│   └── layout.tsx                     # Provedor global de query client, autenticação e sonner
├── components/
│   ├── dashboard/
│   │   ├── kpi-cards.tsx              # Cartões de métricas consolidadas e distribuição por prioridade
│   │   └── requests-table.tsx         # Tabela dinâmica com paginação, filtros e ordenação
│   ├── layout/
│   │   └── header.tsx                 # Barra superior com logo Sicredi, identificação e botão sair
│   └── ui/
│       └── badge.tsx                  # Badges semânticos de status e prioridade
├── lib/
│   ├── api.ts                         # Cliente HTTP Axios com interceptor de autorização JWT
│   ├── auth-context.tsx               # Contexto React com useSyncExternalStore para hidratação segura
│   ├── providers.tsx                  # Envoltório de provedores (TanStack Query + Auth)
│   └── utils.ts                       # Formatadores de data, helpers de classe CSS e utilitários
├── proxy.ts                           # Roteamento seguro de autenticação (Next.js 16 Proxy)
├── vitest.config.mts                  # Configuração de testes unitários com jsdom e vitest
└── playwright.config.ts               # Configuração de testes end-to-end de navegador
```

---

## ⚡ Fluxos Funcionais Implementados

### 1. Autenticação e Gestão de Sessão (`/login`)
- Formulário validado com React Hook Form e Zod.
- Armazenamento seguro de token JWT em *cookies* e `localStorage`.
- Seção de **Acesso Rápido para Avaliação (Demonstração)** com preenchimento em 1 clique para os perfis `Gestora Ana` (`gestor`) e `João Solicitante` (`solicitante`).
- Interceptor HTTP que anexa automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as requisições à API.

### 2. Dashboard e Indicadores Executivos (`/`)
- **Cartões de Indicadores (KPIs):** Total Geral, Abertas, Em Análise, Aprovadas e Rejeitadas.
- **Distribuição por Prioridade:** Bloco visual quantitativo detalhando volume de demandas em prioridade Alta (`#C0392B`), Média (`#FFCD00`) e Baixa (`#146E37`).
- **Filtros e Busca em Tempo Real:** Campo de pesquisa textual, seleção por Status, Área e ordenação por data.
- **Paginação Assíncrona:** Navegação por páginas com metadados integrados fornecidos pela API.

### 3. Abertura de Solicitações (`/solicitacoes/nova`)
- Cadastro com Título, Nível de Prioridade (*Baixa, Média, Alta*), Área Solicitante (carregada dinamicamente via `/api/v1/areas`) e Descrição Detalhada.
- Validação síncrona com indicação visual de campos obrigatórios.
- Redirecionamento automático com feedback via *Toast* (Sonner) após criação bem-sucedida.

### 4. Análise, Deliberação e Histórico em Timeline (`/solicitacoes/[id]`)
- Exibição de metadados da solicitação (protocolo UUID, prioridade, status, área e autor).
- **Histórico em Timeline Auditável:** Componente cronológico detalhando status, data/hora da deliberação, nome do gestor responsável e parecer formal.
- **Formulário de Deliberação:** Exclusivo para o perfil Gestor, permitindo avançar para *Em Análise*, *Aprovada* ou *Rejeitada* com justificativa obrigatória.
- **Bloqueio Automático:** Quando a solicitação atinge o estado final (*Aprovada* ou *Rejeitada*), o formulário de deliberação é automaticamente desabilitado e substituído pelo alerta institucional de encerramento de ciclo.

---

## 🚀 Executando o Frontend Localmente

### Pré-requisitos
- Node.js 20+ ou Node.js 24+
- API NestJS rodando na porta `3000` (ou via Docker Compose)

### Variáveis de Ambiente
Crie ou ajuste o arquivo `.env.local` na raiz de `apps/web`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
PORT=3001
```

### Inicialização
```bash
# A partir do diretório raiz do monorepo:
npm run dev:web

# Ou diretamente dentro de apps/web:
npm run dev
```

Acesse a interface no navegador em:
```text
http://localhost:3001
```

### Compilação de Produção
```bash
npm run build
npm run start
```

---

## 🧪 Suíte de Testes Automatizados

O frontend conta com uma suíte de **63 testes automatizados** cobrindo todos os componentes, fluxos de autenticação, formulários, tabelas e renderização:

```bash
# Executar todos os testes do front-end com Vitest:
npm run test:web

# Executar com relatório de cobertura (coverage):
npm run test:cov:web

# Executar testes em modo interativo (watch):
npm --prefix apps/web run test:watch
```

### Módulos Cobertos pelos Testes:
- `app/(auth)/login/page.test.tsx`: Renderização visual, validações de campos e submissão de login.
- `app/(dashboard)/page.test.tsx`: Cabeçalho, breadcrumbs e botão de abertura de demanda.
- `components/dashboard/kpi-cards.test.tsx`: Cálculo de métricas e distribuição visual de prioridades.
- `components/dashboard/requests-table.test.tsx`: Tabela de demandas, paginação, filtros e links contextuais.
- `app/(dashboard)/solicitacoes/nova/page.test.tsx`: Validação do formulário de abertura e envio de dados.
- `app/(dashboard)/solicitacoes/[id]/detalhe-solicitacao-client.test.tsx`: Exibição de detalhes, deliberações e bloqueio pós-encerramento.
- `app/(dashboard)/solicitacoes/[id]/historico-timeline.test.tsx`: Renderização do componente cronológico de timeline.
- `components/ui/badge.test.tsx`: Aplicação de cores e estilos corporativos Sicredi para cada status e prioridade.
- `lib/auth-context.test.tsx`: Ciclo de vida da sessão e persistência de credenciais.
- `proxy.test.ts`: Controle de rotas protegidas e redirecionamento.
