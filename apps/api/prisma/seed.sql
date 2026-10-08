-- Seed das Áreas de Coordenações Internas do Sicredi
INSERT INTO "area" ("descricao")
SELECT v.d
FROM (
  VALUES
    ('Tecnologia e Processos'),
    ('Operações de Crédito'),
    ('Estratégia e Inovação'),
    ('Documentos e Cadastros'),
    ('Comunicação e Marketing'),
    ('Gestão de Pessoas'),
    ('Controladoria e Finanças'),
    ('Riscos e Compliance'),
    ('Recuperação de Crédito'),
    ('Negócios e Desenvolvimento'),
    ('Atendimento e Relacionamento'),
    ('Jurídico e Governança')
) AS v(d)
WHERE NOT EXISTS (
  SELECT 1 FROM "area" WHERE "descricao" = v.d
);

-- Seed de Usuários Iniciais (Senha padrão: Sicredi@2026)
INSERT INTO "usuario" ("id", "nome", "email", "senha_hash", "perfil", "ativo")
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Gestora Ana',
    'gestor@sicredi.local',
    'scrypt$431e1922e2f1e0fb7bc09bd5cebe2a5b$c47ce77ccaed9803fb69a4062e8febe6f11cba8913269e19178c0d0d26eabbec8047ffb123a57723a2fd1e092a9dc545ffcc23ff2801a147ff00688a46d3cc65',
    'gestor',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'João Solicitante',
    'joao@sicredi.local',
    'scrypt$431e1922e2f1e0fb7bc09bd5cebe2a5b$c47ce77ccaed9803fb69a4062e8febe6f11cba8913269e19178c0d0d26eabbec8047ffb123a57723a2fd1e092a9dc545ffcc23ff2801a147ff00688a46d3cc65',
    'solicitante',
    true
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'Maria Solicitante',
    'maria@sicredi.local',
    'scrypt$431e1922e2f1e0fb7bc09bd5cebe2a5b$c47ce77ccaed9803fb69a4062e8febe6f11cba8913269e19178c0d0d26eabbec8047ffb123a57723a2fd1e092a9dc545ffcc23ff2801a147ff00688a46d3cc65',
    'solicitante',
    true
  )
ON CONFLICT ("email") DO NOTHING;
