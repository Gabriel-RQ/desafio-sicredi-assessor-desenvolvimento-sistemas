# Diretrizes do Projeto: Desafio Técnico Sicredi

## 1. Padrões de Git e Versionamento
- **Commits Semânticos e Atômicos:** Seguir a especificação Conventional Commits (`feat(...)`, `fix(...)`, `test(...)`, `docs(...)`, `build(...)`), separando as mudanças em unidades lógicas atômicas e incrementais.
- **Acentuação Correta:** Todas as mensagens de commit, resumos e documentações em português devem manter a acentuação correta e ortografia formal da língua portuguesa (ex.: *autenticação*, *usuários*, *permissões*, *módulos*, *áreas*, *visão*).

## 2. Identidade Visual e Design Corporativo Sicredi
- **Paleta Oficial:**
  - Verde Corporativo / Institucional: `#146E37` (Pantone 7733 C).
  - Verde Digital / Ação Primária: `#3FA110` (Pantone 361 C).
  - Superfícies e Fundos: `#FFFFFF` (cards) e `#F5F8F4` / `#F7FBF6` (fundo cooperativo).
  - Bordas e Divisores: `#D7E6C8` (Pantone 7485 C) e neutros claros.
  - Textos: `#232B23` (alto contraste para leitura) e `#5A645A` (apoio/legendas).
- **Semântica de Status:**
  - *Aberta:* `#FFCD00` / `#FFF9E6` (Amarelo Sicredi).
  - *Em Análise:* `#1E78D4` / `#EBF4FC` (Azul Corporativo).
  - *Aprovada:* `#146E37` / `#EAF6EC` (Verde Sicredi).
  - *Rejeitada:* `#C0392B` / `#FDF0F2` (Bordô/Ruby).
- **Tipografia Institucional:**
  - Títulos e Identidade: **Exo 2.0** (Google Fonts).
  - Interfaces, Tabelas e Dados: **Nunito** (Google Fonts).
- **Ergonomia e UX:**
  - Evitar repetição massiva de botões de ação primária em tabelas.
  - Usar ações contextuais pelo estado da solicitação: `Avaliar` (apenas para pendentes), `Ver Parecer` (para aprovadas) e `Justificativa` (para rejeitadas).
  - Respeitar perfis RBAC na interface (distinguir perfil *Gestor* de perfil *Solicitante*).

## 3. Diretrizes de Arquitetura e Código
- **Autenticação e Criptografia:** Utilizar a implementação nativa de `scrypt` de `node:crypto` para hash e validação de senhas, evitando dependências com compilação nativa C++ propensas a bloqueios de script no npm.
- **Validação e Integridade:** Manter DTOs com `class-validator`, Exception Filters centralizados para padronização RFC 7807 e integridade referencial nas migrations do Prisma.
