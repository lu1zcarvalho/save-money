# Banco de dados do projeto

Este projeto usa PostgreSQL local em Docker para desenvolvimento.

## Arquivos desta pasta

- [`init/001_schema.sql`](/C:/Users/Luiz/Desktop/save-money/save-money/database/init/001_schema.sql): cria tipos, tabelas, índices e triggers
- [`init/002_seed_categories.sql`](/C:/Users/Luiz/Desktop/save-money/save-money/database/init/002_seed_categories.sql): insere categorias padrão
- [`SCHEMA_GUIDE.md`](/C:/Users/Luiz/Desktop/save-money/save-money/database/SCHEMA_GUIDE.md): explica a modelagem do banco

## Como subir o banco

Na raiz do projeto:

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

## Configuração da conexão

O container foi publicado na porta `5433` porque a máquina já tinha outro PostgreSQL local na `5432`.

Use estes dados:

- Host: `127.0.0.1`
- Porta: `5433`
- Banco: `save_money`
- Usuário: `save_money_user`
- Senha: `save_money_pass`

Esses valores existem apenas para desenvolvimento local.
Nao use essas credenciais em ambiente de producao.

## Beekeeper Studio

Crie uma conexão PostgreSQL com esses dados.

Depois de conectar, você deve ver:

- `users`
- `accounts`
- `categories`
- `transactions`

## Consultas úteis

Listar categorias:

```sql
SELECT * FROM categories;
```

Listar transações:

```sql
SELECT * FROM transactions;
```

Listar usuários:

```sql
SELECT id, full_name, email, created_at
FROM users;
```

## Papel do banco no sistema

O PostgreSQL é a fonte de verdade da aplicação.

Fluxo real:

1. o frontend chama a API
2. a API valida o token e os dados
3. a API lê ou grava no PostgreSQL
4. o frontend renderiza o resultado
