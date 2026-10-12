#!/bin/sh
set -e

# ==============================================================================
# Entrypoint — API NestJS
# Garante a execução idempotente de migrações e seeds antes da inicialização
# ==============================================================================

echo "[api-entrypoint] Aguardando banco de dados e aplicando migrações do Prisma..."
MAX_RETRIES=15
RETRY_COUNT=0

until npx prisma migrate deploy --config prisma7.config.ts; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "[api-entrypoint] ERRO: Falha crítica ao conectar ao banco ou aplicar migrações após $MAX_RETRIES tentativas."
    exit 1
  fi
  echo "[api-entrypoint] Banco ainda indisponível. Tentativa $RETRY_COUNT/$MAX_RETRIES — aguardando 2s..."
  sleep 2
done

echo "[api-entrypoint] Migrações aplicadas com sucesso."

echo "[api-entrypoint] Executando sementes iniciais (seed.sql)..."
npx prisma db execute --file prisma/seed.sql --config prisma7.config.ts || {
  echo "[api-entrypoint] AVISO: Falha não bloqueante ao executar seed (dados podem já existir)."
}

echo "[api-entrypoint] Inicialização do banco concluída. Iniciando aplicação NestJS..."
exec "$@"
