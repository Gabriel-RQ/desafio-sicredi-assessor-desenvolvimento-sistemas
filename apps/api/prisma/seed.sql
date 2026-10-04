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
