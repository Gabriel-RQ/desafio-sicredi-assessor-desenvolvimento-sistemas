<div align="center">
  <img src="docs/assets/banner.png" alt="Sistema de Gestão de Solicitações Internas — Sicredi" width="100%" />
</div>

# Sistema de Gestão de Solicitações Internas — Sicredi

> **Desafio Técnico:** Assessor de Desenvolvimento de Sistemas  
> **Candidato:** Gabriel Radzewicz de Queiroz  
> **Data de Entrega:** Outubro de 2026  

---

## 1. Visão Geral da Solução

O **Sistema de Gestão de Solicitações Internas** é uma solução corporativa *full-stack* desenvolvida para modernizar, unificar e governar o fluxo de demandas operacionais e estratégicas dentro do Sicredi. Em substituição ao tráfego descentralizado de solicitações via e-mails, aplicativos de mensagens e planilhas avulsas, a plataforma disponibiliza um ecossistema seguro com rastreabilidade cronológica de decisões, segregação de funções (*Role-Based Access Control* — RBAC), governança de dados e visibilidade operacional em tempo real por meio de indicadores consolidados.

A arquitetura do projeto foi estruturada como um **Monorepo modular** utilizando *npm workspaces* nativo, garantindo integridade de contratos de dados em tempo de compilação, reaproveitamento estrito de tipos e isolamento de responsabilidades entre as camadas de apresentação, serviços e persistência.

---

## 2. Decisões Arquiteturais e Tecnológicas

| Camada | Tecnologia / Padrão | Justificativa Técnica |
| :--- | :--- | :--- |
| **Front-end** | **Next.js 16 (App Router + Turbopack) & React 19** | Renderização híbrida otimizada (*Server & Client Components*), roteamento por convenção, performance com compilador Turbopack, gerenciamento de estado assíncrono via TanStack Query e componentes acessíveis com Tailwind CSS. |
| **Back-end** | **NestJS 12 & TypeScript** | Arquitetura modular corporativa inspirada em conceitos de *Clean Architecture* e *Domain-Driven Design* (DDD), injeção de dependências nativa, validação declarativa de *DTOs* via `class-validator` e middlewares extensíveis. |
| **Persistência** | **PostgreSQL 16 & Prisma ORM 7** | Banco relacional robusto com integridade referencial (*foreign keys*, restrições estritas e índices otimizados para busca e ordenação). Migrações versionadas, reproduzíveis e determinísticas com mapeamento tipado no Prisma Client. |
| **Contratos Compartilhados** | **`@sicredi/shared`** | Pacote interno compartilhado que funciona como fonte única da verdade (*Single Source of Truth*) para interfaces, *payloads*, tipos utilitários e enumerações (`Perfil`, `Status`, `Prioridade`), prevenindo divergências (*drift*) entre API e interface web. |
| **Criptografia & Autenticação** | **`node:crypto` (`scrypt`) & JWT** | Utilização da implementação nativa de `scrypt` com *salts* criptográficos aleatórios (CSPRNG) e verificação contra ataques de temporização (*timing-safe equal*). Evita compilação de binários nativos C++ no ecossistema Node.js e assegura conformidade de segurança. |
| **Tratamento de Erros** | **RFC 7807 (*Problem Details*)** | Padronização global de falhas HTTP na API via `GlobalExceptionFilter`, gerando respostas estruturadas com atributos normativos (`type`, `title`, `status`, `detail`, `instance`). |
| **Identidade Visual** | **Diretrizes Oficiais Sicredi** | Adoção rigorosa da paleta institucional (Verde Corporativo `#146E37`, Verde Digital `#3FA110`, Fundo `#F5F8F4`, Bordas `#D7E6C8`, Textos `#232B23`), semântica visual de status, tipografias **Exo 2.0** e **Nunito**, e ergonomia de interfaces focada no cooperativismo. |
| **Infraestrutura** | **Docker & Podman Compose** | Ambientes reproduzíveis através de *multi-stage builds*, isolamento de rede em bridge privada e verificação contínua de integridade via *healthchecks* interligados por dependências saudáveis (*service_healthy*). |

### 2.1 Uso responsável de IA

A Inteligência Artificial (IA) é uma tecnologia em alta e com rápida adoção no desenvolvimento de _software_ moderno. Apesar disso, acredito firmemente em um uso consciente e responsável de IA no processo de desenvolvimento, permitindo ciclos mais rápidos e produtivos, em que o humano atua como a "cabeça pensante" - arquiteto e decisor técnico final, responsável por todo o pensamento e elaboração da solução; e a IA atua como o "braço" - responsável por implementações longas de tarefas repetitivas e morosas, exigindo validação e auditoria do humano no processo.

Dessa forma, considerando o curto prazo para desenvolvimento do presente projeto e a intencionalidade de implementação completa de seus requisitos, desenvolvi o mesmo com apoio da ferramenta _Antigravity CLI_, do Google, em um fluxo seguindo ciclos conforme o mencionado acima. As decisões técnicas, arquitetura geral, detalhes da interface web, rotas da API, _schema_ da base de dados, _etc_., foram decididos por mim. A implementação da solução foi feita em partes manualmente por mim, e em partes com auxilio de agentes de IA, atuando no planejamento, validação e implementação do código em ciclos de desenvolvimento.

Utilizei esse projeto como oportunidade de aprender mais sobre IA e desenvolvimento agêntico, e como resultado obtive diversos _insights_ sobre essas ferramentas, que levarei para meu dia a dia no trabalho. Acredito na qualidade da solução apresentada por esse projeto e sua adequação aos requisitos elencados, considerando as limitações quanto a tempo e proficiência nas tecnologias requisitadas, e considero que o uso responsável de IA em sua implementação contribuiu fortemente para sua finalização.

---

## 3. Credenciais de Acesso para Avaliação (Seed)

O banco de dados é inicializado automaticamente com usuários pré-cadastrados para validação imediata dos perfis de controle de acesso (RBAC):

| Perfil | Nome | E-mail de Acesso | Senha Padrão | Permissões no Sistema |
| :--- | :--- | :--- | :--- | :--- |
| **Gestor** | Gestora Ana | `gestor@sicredi.local` | `Sicredi@2026` | Criar solicitações, consultar listagem global, aplicar filtros e ordenações, analisar e deliberar (Aprovar/Rejeitar) com justificativa e visualizar indicadores do Dashboard. |
| **Solicitante** | João Solicitante | `joao@sicredi.local` | `Sicredi@2026` | Criar solicitações de sua área, acompanhar o andamento de suas demandas e consultar pareceres emitidos. Sem permissão de deliberação. |
| **Solicitante** | Maria Solicitante | `maria@sicredi.local` | `Sicredi@2026` | Perfil solicitante alternativo para simulação de múltiplas áreas solicitantes e concorrência de usuários. |

---

## 4. Matriz de Conformidade com o Edital

A solução contempla 100% dos requisitos obrigatórios e diferenciais técnicos previstos no edital:

| Requisito do Edital | Descrição da Implementação |
| :--- | :---: |
| **§ 4.1 Cadastro de Solicitações** | Formulário com validação em tempo real (Zod/React Hook Form) contendo: Título, Descrição, Solicitante, Área Solicitante (select dinâmico via API), Prioridade (Baixa, Média, Alta), Data da solicitação e Status inicial definido como Aberta. |
| **§ 4.2 Consulta de Solicitações** | Tabela rica com paginação assíncrona, busca textual por termo (título/descrição), filtros combinados por Status e Prioridade, e ordenação dinâmica por data de solicitação ou atualização. | **Concluído** |
| **§ 4.3 Análise e Decisão** | Fluxo restrito ao perfil de Gestor: transição atômica de status para Aprovada ou Rejeitada com justificativa/comentário obrigatório, registro de data/hora e *timeline* cronológica auditável de eventos. |
| **§ 4.4 Dashboard de Indicadores** | Painel analítico exibindo métricas consolidadas: Total de solicitações, Abertas, Aprovadas, Rejeitadas e distribuição gráfica/percentual detalhada por Prioridade (Baixa, Média e Alta). |
| **§ 5 API RESTful & Códigos HTTP** | Arquitetura REST completa com endpoints (`/api/v1/solicitacoes`, `/decidir`, `/dashboard`, `/areas`, `/auth`), verbos adequados (GET, POST, PATCH, DELETE), DTOs tipados e conformidade RFC 7807. |
| **§ 6 Persistência Relacional** | Modelagem relacional no PostgreSQL 16 com chaves estrangeiras, índices B-Tree compostos para busca/status/data, *soft delete* (`dataExclusao`) e migrações idempotentes do Prisma. |
| **§ 10 Diferenciais Técnicos** | Orquestração com Docker/Podman Compose; 99 testes automatizados (unitários e de integração); autenticação JWT com RBAC; rate limiting; logs estruturados com contexto; padronização de commits semânticos em português. |

---

## 5. Guia de Execução Rápida

### 5.1 Execução via Docker / Podman Compose (Recomendada)

A maneira mais rápida e consistente para avaliar a aplicação é utilizar o arquivo `compose.yml` que orquestra o banco PostgreSQL, a API NestJS e o portal Next.js com *healthchecks* encadeados.

1. **Clonar o repositório e entrar no diretório raiz:**
   ```bash
   git clone https://github.com/Gabriel-RQ/desafio-sicredi-assessor-desenvolvimento-sistemas.git
   cd desafio-sicredi-assessor-desenvolvimento-sistemas
   ```

2. **Inicializar a pilha de containers:**
   - Com **Podman Compose**:
     ```bash
     podman compose up --build -d
     ```
   - Com **Docker Compose**:
     ```bash
     docker compose up --build -d
     ```

3. **Acompanhar a inicialização e logs:**
   ```bash
   # Podman
   podman compose logs -f
   # Docker
   docker compose logs -f
   ```

4. **Acessar os serviços nos navegadores:**
   - **Portal Web (Next.js):** [http://localhost:3001](http://localhost:3001)
   - **API REST (NestJS):** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
   - **Healthcheck da API:** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

---

### 5.2 Execução em Modo de Desenvolvimento Local

Caso deseje executar os serviços diretamente na máquina host:

#### Pré-requisitos
- **Node.js:** Versão 20.x ou superior (LTS recomendada)
- **npm:** Versão 10.x ou superior
- **PostgreSQL:** Versão 16.x em execução na porta `5432`

#### Passo a Passo

1. **Instalação das dependências do monorepo:**
   ```bash
   npm install
   ```

2. **Compilação do pacote compartilhado:**
   ```bash
   npm --prefix packages/shared run build
   ```

3. **Configuração de Variáveis de Ambiente:**
   - Crie o arquivo `apps/api/.env`:
     ```env
     PORT=3000
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sicredi?schema=public"
     JWT_SECRET="segredo-super-seguro-desafio-sicredi-2026-com-mais-de-32-chars"
     JWT_EXPIRES_IN="8h"
     ```
   - Crie o arquivo `apps/web/.env.local`:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
     ```

4. **Execução das Migrações e _seeds_ do Banco:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Inicialização simultânea dos serviços:**
   - Em um terminal, inicie a API:
     ```bash
     npm run dev:api
     ```
   - Em outro terminal, inicie o Front-end:
     ```bash
     npm run dev:web
     ```

---

## 6. Guia de Testes Automatizados e Qualidade

O projeto conta com uma cobertura rigorosa de testes unitários e de integração implementados com **Vitest** e **Testing Library**, totalizando **99 testes automatizados** (36 testes no backend e 63 testes no frontend), sem mocks artificiais e cobrindo cenários positivos e negativos.

### 6.1 Executar Todos os Testes do Monorepo
Para disparar a suíte completa de testes de todos os workspaces em sequência:
```bash
npm test
```

### 6.2 Executar Testes Específicos por Workspace
- **Testes da API NestJS (36 testes):**
  ```bash
  npm run test:api
  ```
- **Testes do Front-end Next.js (63 testes):**
  ```bash
  npm run test:web
  ```

### 6.3 Relatórios de Cobertura de Código
- **Cobertura da API:**
  ```bash
  npm run test:cov:api
  ```
- **Cobertura do Front-end:**
  ```bash
  npm run test:cov:web
  ```

### 6.4 Validação de Compilação Geral (*Typecheck & Build*)
Para certificar que todo o código TypeScript compila estritamente sem erros em todos os 3 workspaces:
```bash
npm run build
```

---

## 7. Premissas Adotadas e Limitações Técnicas

### Premissas Adotadas
1. **Controle de Exclusão por *Soft Delete*:** A exclusão de solicitações preenche o atributo `dataExclusao` em conformidade com políticas corporativas de governança e auditoria, preservando a integridade histórica de deliberações/pareceres e rastreabilidade.
2. **Segurança por Princípio do Menor Privilégio:** Usuários com perfil `solicitante` possuem permissão restrita de consulta e inclusão. Apenas o perfil `gestor` visualiza as opções ativas de análise e deliberação (`/decidir`), sendo essa barreira reforçada tanto na interface quanto via `PerfisGuard` no backend.
3. **Imutabilidade do Histórico:** Cada decisão registrada cria uma nova linha na tabela `historico_decisao` com vínculo relacional direto à solicitação e ao gestor deliberador, compondo uma linha do tempo auditável que nunca é sobrescrita.
4. **Ergonomia e Acessibilidade:** A interface adota feedback contextual (notificações *toast* via Sonner), estados de carregamento estruturados (*skeletons* e desabilitação preventiva de botões) e tratamento amigável de mensagens de validação normatizadas.

### Limitações da Entrega Atual
1. **Anexos e Documentos Binários:** Nesta versão do protótipo, o escopo priorizou o fluxo transacional de dados cadastrais, deliberações e indicadores. O upload de arquivos comprobatórios (PDF/imagens) não foi incluído, sendo possível para integração com *Object Storage* (como AWS S3) nas próximas fases.
2. **Paginação do Histórico de Decisões:** A linha do tempo carrega integralmente os eventos da solicitação específica no detalhamento, o que é plenamente adequado para o ciclo de vida típico de deliberações internas.

---

## 8. Considerações Arquiteturais (Edital — Seção 8.2)

### 8.2.1 Evolução da Solução

#### 1. Quais mudanças arquiteturais seriam necessárias para suportar o crescimento da solução?
Para suportar uma evolução exponencial de volumetria — como a expansão para todas as cooperativas e agências do ecossistema Sicredi — a solução evoluiria do atual monólito modular para uma arquitetura orientada a **Microsserviços e Bounded Contexts (DDD)**:
- **Serviço de Solicitações:** Focado exclusivamente na gestão, validação de regras de negócio de abertura e ciclo de vida cadastral das demandas.
- **Serviço de Governança e Deliberação:** Isolamento dos fluxos de análise, esteiras de aprovação multinível, registro de pareceres e compliance.
- **Serviço de Analytics e Métricas:** Camada orientada a leitura (*CQRS*), com modelos de dados desnormalizados otimizados para agregação de indicadores gerenciais sem onerar a base transacional de escrita.
- **Serviço de Comunicação e Notificações:** Responsável por despachar e-mails, notificações *push* e alertas institucionais aos solicitantes e gestores.

#### 2. Quais seriam os principais riscos técnicos identificados?
- **Gargalo no Banco de Dados Relacional:** Alta concorrência de escritas e leituras simultâneas competindo pelo mesmo pool de conexões do PostgreSQL durante picos de encerramento de ciclos operacionais.
- **Condições de Corrida (*Race Conditions*) em Deliberações:** Dois gestores avaliando simultaneamente a mesma solicitação e gerando estados inconsistentes de aprovação e rejeição.
- **Degradação por Consultas Complexas:** Consultas de busca textual com filtros combinados operando sobre milhões de registros sem estratégia de particionamento ou indexação.

#### 3. Como garantir escalabilidade, disponibilidade e manutenibilidade da aplicação?
- **Escalabilidade Horizontal & Orquestração:**
  - Implantação em **Kubernetes (K8s)** utilizando *Horizontal Pod Autoscaler* (HPA) baseado em métricas de CPU, memória e taxa de requisições HTTP, complementado por *Vertical Pod Autoscaler* (VPA) para dimensionamento preditivo.
- **Alta Disponibilidade e Otimização de Banco de Dados:**
  - Adoção de **PgBouncer** para *Connection Pooling* em modo transacional, eliminando sobrecarga de abertura de sockets TCP no PostgreSQL.
  - Arquitetura de banco com **PostgreSQL Primary (Escrita)** e múltiplas **Read Replicas (Leitura)** com replicação assíncrona/síncrona de baixa latência, distribuindo as consultas do front-end e relatórios analíticos. (Necessário/útil apenas caso a aplicação cresça muito)
  - Implementação de **Optimistic Concurrency Control (OCC)** nas solicitações através de um atributo de versão (`version`), impedindo sobrescritas concorrentes com falha amigável de conflito (HTTP 409).
- **Camada de Cache Distribuído:**
  - Introdução do **Redis Cluster** aplicando o padrão *Cache-Aside* para armazenar resultados de indicadores de dashboard, listagens de áreas e sessões ativas. Invalidação baseada em eventos (ex.: alteração de status de solicitação expira a chave de cache correspondente).
- **Manutenibilidade:**
  - Aplicação rigorosa de *Clean Architecture*, cobertura de testes acima de 85% com pirâmide de testes contínua (unitários, integração e testes de contrato), além de *pipelines* de CI/CD automatizadas com análise estática de código (SonarQube).

#### 4. Quais componentes ou camadas poderiam ser adicionados em uma evolução futura da arquitetura?
- **API Gateway Distribuído (ex.: Kong):** Centralização de autenticação corporativa mTLS, rate limiting, roteamento dinâmico e proteção contra ameaças.
- **Busca Especializada (OpenSearch / Elasticsearch):** Desacoplamento da busca textual de solicitações, habilitando buscas fonéticas, autocompletar e filtros multifacetados com respostas em milissegundos.
- **Observabilidade Unificada com OpenTelemetry (OTel):** Instrumentação de código para envio de rastros (*traces* distribuídos), métricas e logs estruturados em formato JSON para uma pilha moderna (Grafana, Loki, Prometheus), permitindo correlacionar transações do front-end ao banco de dados.

---

### 8.2.2 Integração com Sistemas Externos (Pós-Aprovação)

#### 1. Como realizaria esta integração?
A integração após a aprovação de uma solicitação seria desenhada sob o paradigma de **Arquitetura Orientada a Eventos (*Event-Driven Architecture* — EDA)** de forma estritamente assíncrona. A aprovação da demanda no domínio do sistema interno conclui a etapa transacional local e emite um evento de negócio tipado (`SolicitacaoAprovadaEvent`), que é publicado em um barramento de mensageria corporativo para consumo pelos sistemas integradores.

#### 2. Quais padrões ou tecnologias utilizaria?
- **Message Broker Corporativo:** **Apache Kafka** (para cenários de alto rendimento, particionamento ordenado por cooperativa e retenção de eventos em *log compaction*)
- **Transactional Outbox Pattern com Change Data Capture (CDC):**
  - Para eliminar o risco crítico de falha por escrita dupla (*Dual-Write Problem* — quando a solicitação é aprovada no banco de dados, mas a chamada de rede ao broker falha), a aprovação da solicitação e a inserção do evento na tabela de eventos ocorrem na **mesma transação ACID** do PostgreSQL.
  - Um conector de **CDC (ex.: Debezium Engine)** monitora o *Write-Ahead Log* (WAL) do PostgreSQL e despacha os eventos para o tópico do Kafka com garantia de entrega *At-Least-Once*, sem dependência de processos periódicos de *polling*.

#### 3. Como trataria falhas de comunicação?
- **Retentativas Inteligentes com Backoff Exponencial e Jitter:** Configuração de políticas de reenvio nos consumidores/produtores com recuo exponencial e ruído aleatório (*jitter*) para evitar o fenômeno de efeito manada.
- **Padrão Circuit Breaker:** Implementação de disjuntores lógicos na comunicação HTTP com o serviço externo. Ao detectar taxa de erro superior a 50%, o circuito abre temporariamente, evitando esgotamento de *threads* e recursos internos.
- **Dead Letter Queue (DLQ):** Caso uma mensagem atinja o limite máximo de retentativas (ex.: 5 tentativas sem sucesso), ela é automaticamente desviada para uma fila de mensagens mortas (*Dead Letter Queue*). Esse canal conta com alarmes automáticos, observabilidade dedicada e um painel operacional de sustentação para reconciliação e reprocessamento posterior.

#### 4. Como garantiria rastreabilidade das operações realizadas?
- **W3C Trace Context (Rastreamento Distribuído):** Injeção dos cabeçalhos normativos `traceparent` e `tracestate` em todas as publicações no broker e chamadas REST aos sistemas externos. Isso viabiliza o rastreamento ponto a ponto (Next.js -> API NestJS -> Kafka -> Consumidor Externo) em ferramentas como Jaeger e Grafana Tempo.
- **Idempotency-Key (Chave de Idempotência):** Cada solicitação aprovada gera uma chave de idempotência exclusiva baseada no seu identificador e versão (`Idempotency-Key: solicitacao-uuid-v1`). O sistema consumidor armazena as chaves processadas em um armazenamento de baixa latência (Redis com TTL de 48h) com verificação atômica, assegurando processamento único mesmo em cenários de retransmissão de mensagens.
- **Logs de Auditoria Estruturados:** Registro de logs em formato JSON contendo `correlationId`, `solicitacaoId`, `responsavelId`, `timestamp`, `sistemaDestino` e `statusEnvio`.

#### 5. Como evitaria impacto na experiência do usuário caso o sistema externo estivesse indisponível?
- **Desacoplamento Temporal Completo:** A deliberação do gestor é concluída de forma não bloqueante. O gestor recebe a confirmação imediata da aprovação no front-end  (HTTP 200/202), com o registro gravado localmente com sucesso.
- **Transparência de Status de Sincronização:** O modelo de dados e a interface disponibilizam um indicador visual de integração (ex.: *Status de Sincronização: Pendente / Sincronizado / Falha Temporária*).
- **Atualização Reativa:** O front-end Next.js pode receber atualizações em tempo real do processamento externo através de *Server-Sent Events* (SSE) ou WebSockets, atualizando o badge de status na interface sem exigir que o usuário recarregue a página ou aguarde respostas síncronas de sistemas terceiros.

---

## 9. Estrutura do Repositório (Monorepo Layout)

```text
desafio-sicredi-assessor-desenvolvimento-sistemas/
├── apps/
│   ├── api/                           # Back-end NestJS 12
│   │   ├── prisma/                    # Schema relacional, migrations e seed.sql
│   │   ├── src/
│   │   │   ├── areas/                 # Módulo de áreas solicitantes
│   │   │   ├── auth/                  # Autenticação JWT, guards e decorators RBAC
│   │   │   ├── common/                # Filtros globais RFC 7807 (Problem Details)
│   │   │   ├── dashboard/             # Consolidação de indicadores e métricas
│   │   │   ├── solicitacoes/          # Gestão do ciclo de vida e deliberação
│   │   │   └── usuarios/              # Hashing scrypt nativo e gestão de usuários
│   │   ├── Dockerfile                 # Multi-stage build da API
│   │   └── package.json
│   │
│   └── web/                           # Front-end Next.js 16 (App Router + React 19)
│       ├── app/                       # Páginas, layouts e rotas de aplicação
│       │   ├── (auth)/login/          # Tela de login corporativa Sicredi
│       │   └── (dashboard)/           # Layout principal, listagem, formulário e detalhe
│       ├── components/                # Componentes de UI, KPI cards, tabelas e modais
│       ├── lib/                       # Contexto de autenticação, API client e utilitários
│       ├── Dockerfile                 # Multi-stage build do portal web
│       └── package.json
│
├── packages/
│   └── shared/                        # Pacote compartilhado TypeScript (@sicredi/shared)
│       ├── src/index.ts               # Interfaces, DTOs e enums (Status, Prioridade, Perfil)
│       └── package.json
│
├── .env.example                       # Exemplo de variáveis de ambiente
├── compose.yml                        # Orquestração de containers (Postgres, API, Web)
├── package.json                       # Configuração de workspaces e scripts raiz
└── README.md                          # Documentação oficial do projeto
```

---

## 10. Considerações Finais

O projeto foi construído respeitando as melhores práticas da engenharia de software, combinando segurança nativa, rigor de tipagem estrita de ponta a ponta, fidelidade visual à marca Sicredi e uma fundamentação arquitetural sólida para crescimento sustentável e integração corporativa.

Agradeço à equipe de avaliação do Sicredi pela oportunidade e coloco-me à inteira disposição para aprofundar qualquer detalhe técnico durante a etapa de apresentação.
