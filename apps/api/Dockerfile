# ==============================================================================
# Dockerfile — Backend API (NestJS + Prisma + PostgreSQL)
# Desafio Técnico Sicredi — Assessor de Desenvolvimento de Sistemas
# ==============================================================================

# ------------------------------------------------------------------------------
# Estágio 1: Instalação de Dependências e Build da Aplicação
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Instalação de dependências de sistema para o Prisma e ferramentas de compilação
RUN apk add --no-cache libc6-compat openssl

# Copiar arquivos de manifesto do monorepo para maximizar o cache de camadas
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Instalação estrita de dependências completas para compilação
RUN npm ci

# Copiar e compilar o pacote de contratos e tipos compartilhados
COPY packages/shared ./packages/shared
RUN npm run build --workspace=@sicredi/shared

# Copiar o código-fonte da API e o schema do Prisma
COPY apps/api ./apps/api

# Geração do cliente Prisma a partir do schema
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Compilação da aplicação NestJS
RUN npm run build --workspace=apps/api

# Criação de link simbólico dist/src -> dist para assegurar compatibilidade
# tanto com inicialização via dist/src/main.js quanto via dist/main.js
RUN ln -s . apps/api/dist/src

# Podar dependências de desenvolvimento para manter apenas pacotes de produção
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Estágio 2: Imagem de Produção Leve e Segura (Runner)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Dependências de runtime mínimas para execução do Prisma e healthcheck
RUN apk add --no-cache libc6-compat openssl curl

# Variáveis de ambiente padrão de produção
ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependências de produção do monorepo e artefatos compilados
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/packages/shared ./packages/shared
COPY --chown=node:node --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/prisma ./apps/api/prisma

# Definir diretório de trabalho no workspace da API
WORKDIR /app/apps/api

# Executar como usuário não-root por conformidade de segurança corporativa
USER node

# Exposição da porta de serviço HTTP
EXPOSE 3000

# Sonda de integridade (Healthcheck) do backend
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Comando de inicialização em produção
CMD ["node", "dist/src/main.js"]
