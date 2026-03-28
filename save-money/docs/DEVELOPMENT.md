# Fluxo de desenvolvimento

## Setup inicial

1. subir o banco com Docker
2. criar `server/.env`
3. rodar a API
4. rodar o frontend

## Comandos

### Banco

```bash
docker compose up -d
docker compose down
```

### Backend

```bash
npm run dev:server
npm run build:server
```

### Frontend

```bash
npm run dev
npm run build:client
```

### Qualidade

```bash
npm run lint
```

## Como testar manualmente

1. abra o frontend
2. crie uma conta
3. faça login
4. cadastre uma transação
5. veja a dashboard atualizar
6. exclua a transação
7. confira no Beekeeper Studio se os dados estão no banco

## Como pensar novas funcionalidades

Se for banco:

- veja [`database/init/001_schema.sql`](/C:/Users/Luiz/Desktop/save-money/save-money/database/init/001_schema.sql)
- veja [`database/SCHEMA_GUIDE.md`](/C:/Users/Luiz/Desktop/save-money/save-money/database/SCHEMA_GUIDE.md)

Se for regra de negócio:

- veja [`server/src/routes`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/routes)
- veja [`server/src/middlewares`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/middlewares)

Se for interface:

- veja [`src/pages`](/C:/Users/Luiz/Desktop/save-money/save-money/src/pages)
- veja [`src/services`](/C:/Users/Luiz/Desktop/save-money/save-money/src/services)

## Ordem saudável de trabalho

1. ajustar banco
2. ajustar backend
3. ajustar frontend
4. validar manualmente
5. rodar lint e build
6. commitar
