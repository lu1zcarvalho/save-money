# Backend

O backend deste projeto foi criado para intermediar o frontend e o PostgreSQL.

## Responsabilidades

- autenticar usuários
- validar dados
- proteger rotas privadas
- acessar o banco
- devolver respostas HTTP para o frontend

## Estrutura

```text
server/
  src/
    config/
      database.ts
      env.ts
    middlewares/
      authMiddleware.ts
      errorHandler.ts
    routes/
      accountRoutes.ts
      authRoutes.ts
      categoryRoutes.ts
      transactionRoutes.ts
    types/
      express.d.ts
    utils/
      jwt.ts
      mappers.ts
    app.ts
    server.ts
```

## Arquivos principais

- [`server.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/server.ts): sobe a API
- [`app.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/app.ts): registra middlewares e rotas
- [`config/database.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/config/database.ts): conexão com PostgreSQL
- [`middlewares/authMiddleware.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/middlewares/authMiddleware.ts): valida JWT
- [`routes/authRoutes.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/routes/authRoutes.ts): login, cadastro e usuário logado
- [`routes/transactionRoutes.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/routes/transactionRoutes.ts): transações

## Variáveis de ambiente

Use como base:

- [`server/.env.example`](/C:/Users/Luiz/Desktop/save-money/save-money/server/.env.example)

Principais variáveis:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_ORIGIN`

Exemplo local de desenvolvimento:

```env
PORT=3333
DATABASE_URL=postgresql://save_money_user:save_money_pass@127.0.0.1:5433/save_money
JWT_SECRET=crie-um-segredo-local-forte
CLIENT_ORIGIN=http://127.0.0.1:5173
```

Importante:

- `server/.env` nao deve ir para o Git
- o backend agora exige `DATABASE_URL` e `JWT_SECRET`
- se essas variaveis nao existirem, a API falha ao iniciar

## Como rodar

```bash
npm run dev:server
```

## Como validar

```bash
npm run build:server
npm run lint
```

## Como a autenticação funciona

1. o usuário faz login ou cadastro
2. o backend gera um token JWT
3. o frontend salva o token
4. o token vai no header `Authorization`
5. o middleware lê o token
6. as rotas privadas usam `request.auth.userId`
