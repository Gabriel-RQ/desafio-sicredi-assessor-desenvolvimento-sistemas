-- CreateEnum
CREATE TYPE "prioridade" AS ENUM ('baixa', 'media', 'alta');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('aberta', 'analise', 'aprovada', 'rejeitada');

-- CreateTable
CREATE TABLE "area" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacao" (
    "id" UUID NOT NULL,
    "area_solicitante_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "solicitante" TEXT NOT NULL,
    "prioridade" "prioridade" NOT NULL,
    "status" "status" NOT NULL DEFAULT 'aberta',
    "data_solicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_exclusao" TIMESTAMP(3),

    CONSTRAINT "solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_decisao" (
    "id" SERIAL NOT NULL,
    "solicitacao_id" UUID NOT NULL,
    "status" "status" NOT NULL,
    "comentario" TEXT,
    "responsavel_decisao" TEXT NOT NULL,
    "data_decisao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_decisao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitacao_status_idx" ON "solicitacao"("status");

-- CreateIndex
CREATE INDEX "solicitacao_prioridade_idx" ON "solicitacao"("prioridade");

-- CreateIndex
CREATE INDEX "solicitacao_data_solicitacao_idx" ON "solicitacao"("data_solicitacao");

-- CreateIndex
CREATE INDEX "solicitacao_area_solicitante_id_idx" ON "solicitacao"("area_solicitante_id");

-- CreateIndex
CREATE INDEX "historico_decisao_solicitacao_id_idx" ON "historico_decisao"("solicitacao_id");

-- AddForeignKey
ALTER TABLE "solicitacao" ADD CONSTRAINT "solicitacao_area_solicitante_id_fkey" FOREIGN KEY ("area_solicitante_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_decisao" ADD CONSTRAINT "historico_decisao_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
