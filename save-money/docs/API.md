# API do projeto

Base URL local:

- `http://127.0.0.1:3333/api`

## Health check

### `GET /health`

Resposta:

```json
{
  "status": "ok"
}
```

## Autenticação

### `POST /auth/register`

Cria um usuário e também cria a conta padrão do sistema.

Body:

```json
{
  "fullName": "Luiz da Silva",
  "email": "luiz@email.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "fullName": "Luiz da Silva",
    "email": "luiz@email.com"
  }
}
```

### `POST /auth/login`

Body:

```json
{
  "email": "luiz@email.com",
  "password": "123456"
}
```

### `GET /auth/me`

Header:

```text
Authorization: Bearer <token>
```

## Contas

### `GET /accounts`

Lista as contas do usuário autenticado.

## Categorias

### `GET /categories`

Lista categorias globais e categorias do usuário.

### `GET /categories?type=income`

Filtra categorias de entrada.

### `GET /categories?type=expense`

Filtra categorias de saída.

## Transações

### `GET /transactions`

Lista transações do usuário autenticado.

### `POST /transactions`

Body:

```json
{
  "title": "Mercado",
  "amount": 125.5,
  "type": "expense",
  "accountId": "uuid",
  "categoryId": "uuid",
  "date": "2026-03-28",
  "description": "Compra do mes"
}
```

### `DELETE /transactions/:id`

Remove uma transação do usuário autenticado.

## Erros

Formato padrão:

```json
{
  "message": "Mensagem do erro"
}
```

Quando a validação do `zod` falha, a API também devolve `issues`.
