# ==============================================================================
# Dockerfile — Frontend Web (Next.js 16 + React 19 + Tailwind CSS)
# Desafio Técnico Sicredi — Assessor de Desenvolvimento de Sistemas
# ==============================================================================

# ------------------------------------------------------------------------------
# Estágio 1: Instalação de Dependências e Build da Aplicação Next.js
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Instalação de dependências de sistema
RUN apk add --no-cache libc6-compat

# Copiar arquivos de manifesto do monorepo para otimização de cache
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Instalação estrita de dependências completas para compilação
RUN npm ci

# Copiar e compilar o pacote de contratos compartilhados
COPY packages/shared ./packages/shared
RUN npm run build --workspace=@sicredi/shared

# Copiar o código-fonte do frontend
COPY apps/web ./apps/web

# Variáveis de compilação do Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compilação otimizada do Next.js via Turbopack
RUN npm run build --workspace=apps/web

# Podar dependências de desenvolvimento para manter apenas runtime de produção
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Estágio 2: Imagem de Produção Leve e Segura (Runner)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Dependências de runtime mínimas e curl para healthcheck
RUN apk add --no-cache libc6-compat curl

# Variáveis de ambiente de produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV PATH="/app/node_modules/.bin:$PATH"

# Copiar dependências de produção do monorepo e artefatos gerados pelo Next.js
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/packages/shared ./packages/shared
COPY --chown=node:node --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --chown=node:node --from=builder /app/apps/web/public ./apps/web/public
COPY --chown=node:node --from=builder /app/apps/web/.next ./apps/web/.next

# Definir diretório de trabalho no workspace da Web
WORKDIR /app/apps/web

# Executar como usuário não-root por conformidade de segurança
USER node

# Exposição da porta de atendimento HTTP do Next.js
EXPOSE 3001

# Sonda de integridade (Healthcheck) do frontend
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/login || exit 1

# Comando de inicialização do servidor de produção
CMD ["npm", "run", "start"]
