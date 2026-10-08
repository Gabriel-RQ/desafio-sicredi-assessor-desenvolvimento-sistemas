# API de Gestão de Solicitações - Sicredi Conexão

API REST desenvolvida em **NestJS** com **Prisma 7** e **PostgreSQL** para o Desafio Técnico de Assessor de Desenvolvimento de Sistemas.

---

## 🔐 Autenticação e Autorização

A API utiliza autenticação **Stateless baseada em JWT (JSON Web Tokens)** transmitidos via cabeçalho HTTP:
```http
Authorization: Bearer <seu-token-jwt>
```

### Arquitetura de Segurança
1. **Seguro por Padrão (*Secure by Default*):** Todas as rotas da API exigem autenticação obrigatória, a menos que sejam explicitamente marcadas com o decorador `@Publico()` (ex.: `/health` e `/auth/login`).
2. **Controle de Acesso Baseado em Papéis (RBAC):** Rotas administrativas e de decisão utilizam `@Perfis(Perfil.gestor)`.
3. **Isolamento de Propriedade de Recursos:** O perfil `solicitante` só pode visualizar, editar e excluir suas próprias solicitações em aberto. A tentativa de acessar solicitações de terceiros responde com **404 Not Found** (evitando enumeração de IDs por atacantes).
4. **Criptografia com `node:crypto` (scrypt):** Senhas são derivadas usando `scrypt` nativo com salt aleatório de 16 bytes e chave de 64 bytes, comparadas em tempo constante com `timingSafeEqual`.
5. **Mitigação de Ataques de Temporização:** Tentativas de login para e-mails inexistentes executam uma verificação sintética contra um hash fictício, garantindo tempo de resposta constante.
6. **Rate Limiting (Proteção contra Força Bruta):** O endpoint de login é protegido por `@Throttle` com limite de **5 tentativas por minuto por IP** (`429 Too Many Requests`).

---

## 👥 Usuários Pré-cadastrados (Seed)

| Nome | E-mail | Senha Padrão | Perfil | Permissões |
|---|---|---|---|---|
| **Gestora Ana** | `gestor@sicredi.local` | `Sicredi@2026` | `gestor` | Acesso total, visualização de todas as solicitações, decisão/análise e dashboard |
| **João Solicitante** | `joao@sicredi.local` | `Sicredi@2026` | `solicitante` | Criar solicitações, visualizar e gerenciar apenas suas próprias demandas |
| **Maria Solicitante** | `maria@sicredi.local` | `Sicredi@2026` | `solicitante` | Criar solicitações, visualizar e gerenciar apenas suas próprias demandas |

---

## 📋 Matriz de Permissões

| Rota | Método | Público | Solicitante | Gestor | Descrição |
|---|:---:|:---:|:---:|:---:|---|
| `/api/v1/health` | GET | ✅ | ✅ | ✅ | Verificação de disponibilidade |
| `/api/v1/auth/login` | POST | ✅ | ✅ | ✅ | Autenticação e obtenção do JWT |
| `/api/v1/auth/me` | GET | ❌ | ✅ | ✅ | Perfil do usuário autenticado |
| `/api/v1/areas` | GET | ❌ | ✅ | ✅ | Listagem de áreas internas |
| `/api/v1/solicitacoes` | POST | ❌ | ✅ | ✅ | Cadastro (autor vira o usuário logado) |
| `/api/v1/solicitacoes` | GET | ❌ | Próprias | Todas | Listagem paginada com filtros e busca |
| `/api/v1/solicitacoes/:id` | GET | ❌ | Própria (404) | Qualquer | Detalhes da solicitação |
| `/api/v1/solicitacoes/:id` | PUT/PATCH | ❌ | Própria (aberta) | ❌ 403 | Edição cadastral |
| `/api/v1/solicitacoes/:id` | DELETE | ❌ | Própria (aberta) | Qualquer | Exclusão lógica (*soft delete*) |
| `/api/v1/solicitacoes/:id/decidir` | PATCH | ❌ | ❌ 403 | ✅ | Transição de estado e histórico |
| `/api/v1/dashboard` | GET | ❌ | ❌ 403 | ✅ | Métricas agregadas por status/prioridade |

---

## 📖 Documentação Interativa (Swagger)

A especificação OpenAPI está disponível em:
```text
http://localhost:3000/api/docs
```
Para testar rotas protegidas pelo Swagger UI:
1. Realize uma requisição em `POST /api/v1/auth/login` com as credenciais de um usuário da tabela acima.
2. Copie o valor do campo `accessToken`.
3. Clique no botão **Authorize** no topo do Swagger UI e insira o token JWT.
4. Execute as requisições protegidas diretamente pela interface.

---

## 🛠️ Executando o Projeto

### Pré-requisitos
- Node.js 20+ (ou Node.js 24)
- Podman ou Docker

### Subir o Banco de Dados
```bash
podman compose up -d
```

### Instalar Dependências e Executar Migrations
```bash
npm install
npm run prisma:migrate
npm run prisma:seed
```

### Iniciar a Aplicação
```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

### Executar Testes
```bash
# Testes Unitários
npm run test

# Testes End-to-End (E2E contra banco PostgreSQL)
npm run test:e2e

# Validação do Linter
npm run lint
```

---

## 🏛️ Considerações Arquiteturais & Próximos Passos
- **Rotação de Refresh Tokens:** Para ambientes de alta escala, implementar refresh tokens armazenados com rotação e revogação em cache distribuído (Redis).
- **Single Sign-On (SSO):** No contexto corporativo do Sicredi, a camada de autenticação pode ser facilmente estendida para suportar provedores OpenID Connect (OIDC) como Azure AD / Keycloak.
