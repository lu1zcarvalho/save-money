# Save Money

Sistema financeiro pessoal full stack para controle de entradas, saídas, categorias, saldo e autenticação de usuários.

## Visão geral

O projeto começou como um frontend simples em React e evoluiu para uma arquitetura completa com:

- frontend em React + TypeScript + Vite
- backend em Node.js + Express + TypeScript
- banco PostgreSQL em Docker
- autenticação com JWT

Hoje o sistema permite:

- criar conta de usuário
- fazer login
- manter sessão com token
- listar contas
- listar categorias
- cadastrar transações
- excluir transações
- visualizar resumo financeiro na dashboard

## Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript
- JWT
- Zod
- bcryptjs
- pg

### Banco

- PostgreSQL 17
- Docker
- Beekeeper Studio para visualização

## Estrutura do projeto

```text
save-money/
  database/
    init/
      001_schema.sql
      002_seed_categories.sql
    README.md
    SCHEMA_GUIDE.md
  docs/
    API.md
    ARCHITECTURE.md
    DEVELOPMENT.md
  server/
    src/
      config/
      middlewares/
      routes/
      types/
      utils/
      app.ts
      server.ts
    .env.example
    README.md
    tsconfig.json
  src/
    pages/
    services/
    types/
    utils/
    App.tsx
  docker-compose.yml
  package.json
  vite.config.ts
```

## Leitura recomendada

Para entender o projeto por completo:

- [Arquitetura](/C:/Users/Luiz/Desktop/save-money/save-money/docs/ARCHITECTURE.md)
- [API](/C:/Users/Luiz/Desktop/save-money/save-money/docs/API.md)
- [Fluxo de desenvolvimento](/C:/Users/Luiz/Desktop/save-money/save-money/docs/DEVELOPMENT.md)
- [Banco de dados](/C:/Users/Luiz/Desktop/save-money/save-money/database/README.md)
- [Modelo do banco](/C:/Users/Luiz/Desktop/save-money/save-money/database/SCHEMA_GUIDE.md)
- [Backend](/C:/Users/Luiz/Desktop/save-money/save-money/server/README.md)

## Como rodar localmente

### 1. Subir o PostgreSQL

Na raiz do projeto:

```bash
docker compose up -d
```

Configuração da conexão:

- Host: `127.0.0.1`
- Porta: `5433`
- Banco: `save_money`
- Usuário: `save_money_user`
- Senha: `save_money_pass`

### 2. Configurar o backend

Crie o arquivo `server/.env` a partir do exemplo:

```bash
copy server\\.env.example server\\.env
```

Depois edite `server/.env` com os valores locais de desenvolvimento:

```env
PORT=3333
DATABASE_URL=postgresql://save_money_user:save_money_pass@127.0.0.1:5433/save_money
JWT_SECRET=crie-um-segredo-local-forte
CLIENT_ORIGIN=http://127.0.0.1:5173
```

Importante:

- `server/.env` nao deve ser versionado
- `server/.env.example` existe apenas como modelo
- nunca reutilize esses valores em producao

### 3. Rodar a API

```bash
npm run dev:server
```

API:

- [http://127.0.0.1:3333/api/health](http://127.0.0.1:3333/api/health)

### 4. Rodar o frontend

Em outro terminal:

```bash
npm run dev
```

Frontend:

- [http://127.0.0.1:5173](http://127.0.0.1:5173)

## Scripts úteis

```bash
npm run dev
npm run dev:client
npm run dev:server
npm run build
npm run build:client
npm run build:server
npm run lint
```

## Fluxo da aplicação

1. O usuário cria conta ou faz login.
2. O backend devolve um JWT.
3. O frontend salva esse token no navegador.
4. O frontend chama a API com `Authorization: Bearer <token>`.
5. A API valida o token.
6. A API busca ou grava dados no PostgreSQL.
7. O frontend renderiza a resposta.

## Regras de arquitetura

- o frontend nunca acessa o banco diretamente
- o backend concentra autenticação e regra de negócio
- o PostgreSQL guarda o estado real do sistema
- o frontend consome apenas a API
- os tipos do frontend acompanham o contrato da API

## Publicação segura

Antes de deixar o repositório público:

- mantenha `server/.env` fora do Git
- use segredos reais apenas fora do repositório
- trate as credenciais do `docker-compose` como valores locais de desenvolvimento
- nunca use as configurações de exemplo em produção

## Validação do projeto

Antes de subir mudanças:

```bash
npm run lint
npm run build:server
npm run build:client
```

## Próximos passos sugeridos

- editar transações
- criar categorias personalizadas
- suportar múltiplas contas por usuário
- adicionar filtros por período
- criar gráficos e relatórios
- adicionar testes automatizados
