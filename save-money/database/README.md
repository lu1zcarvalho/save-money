# Banco de dados do projeto

Este projeto usa PostgreSQL local em Docker para desenvolvimento.

## Arquivos desta pasta

- [`init/001_schema.sql`](/C:/Users/Luiz/Desktop/save-money/save-money/database/init/001_schema.sql): cria tipos, tabelas, indices e triggers
- [`init/002_seed_categories.sql`](/C:/Users/Luiz/Desktop/save-money/save-money/database/init/002_seed_categories.sql): insere categorias padrao
- [`scripts/001_seed_demo_transactions.sql`](/C:/Users/Luiz/Desktop/save-money/save-money/database/scripts/001_seed_demo_transactions.sql): popula meses de demonstracao para visualizar o dashboard
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

## Configuracao da conexao

O container foi publicado na porta `5433` porque a maquina ja tinha outro PostgreSQL local na `5432`.

Use estes dados:

- Host: `127.0.0.1`
- Porta: `5433`
- Banco: `save_money`
- Usuario: `save_money_user`
- Senha: `save_money_pass`

Esses valores existem apenas para desenvolvimento local.
Nao use essas credenciais em ambiente de producao.

## Beekeeper Studio

Crie uma conexao PostgreSQL com esses dados.

Depois de conectar, voce deve ver:

- `users`
- `accounts`
- `categories`
- `transactions`

## Consultas uteis

Listar categorias:

```sql
SELECT * FROM categories;
```

Listar transacoes:

```sql
SELECT * FROM transactions;
```

Listar usuarios:

```sql
SELECT id, full_name, email, created_at
FROM users;
```

## Popular dados de demonstracao

Para visualizar o dashboard com mais meses preenchidos, rode:

```bash
docker exec -i save-money-db psql -U save_money_user -d save_money < database/scripts/001_seed_demo_transactions.sql
```

Esse script adiciona lancamentos em:

- janeiro de 2025
- fevereiro de 2025
- dezembro de 2025

Ele foi feito para poder ser executado mais de uma vez sem duplicar as mesmas transacoes.

## Papel do banco no sistema

O PostgreSQL e a fonte de verdade da aplicacao.

Fluxo real:

1. o frontend chama a API
2. a API valida o token e os dados
3. a API le ou grava no PostgreSQL
4. o frontend renderiza o resultado
