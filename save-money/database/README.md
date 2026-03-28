# Banco de dados do projeto

Este projeto agora possui uma base local de PostgreSQL para desenvolvimento.

## O que existe aqui

- `docker-compose.yml`: sobe um container do PostgreSQL.
- `database/init/001_schema.sql`: cria a estrutura inicial do banco.
- `database/init/002_seed_categories.sql`: cadastra categorias iniciais do sistema.

## Como subir o banco

No diretório raiz do projeto, execute:

```bash
docker compose up -d
```

Para parar:

```bash
docker compose down
```

Para parar e remover os dados persistidos:

```bash
docker compose down -v
```

## Como conectar no Beekeeper Studio

Use estes dados:

- Host: `127.0.0.1`
- Porta: `5432`
- Banco: `save_money`
- Usuário: `save_money_user`
- Senha: `save_money_pass`

## Observação importante

O front-end ainda está usando `localStorage`.
Este banco já deixa o projeto preparado para a próxima etapa: criar uma API/backend e migrar a persistência real para o PostgreSQL.
