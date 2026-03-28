# Entendendo o banco do projeto

Este arquivo explica a modelagem inicial do sistema financeiro de um jeito pratico.

## Visao geral

O banco foi pensado para crescer com o projeto.

Hoje voce quer:

- cadastrar transacoes
- separar entradas e saidas
- organizar por categoria
- mostrar saldo e resumo

Amanha voce quer:

- login
- varios usuarios
- contas bancarias
- filtros
- mais funcionalidades financeiras

Por isso a modelagem ficou assim:

- `users`: quem usa o sistema
- `accounts`: onde o dinheiro existe
- `categories`: como a transacao sera classificada
- `transactions`: os lancamentos financeiros

## Tabela `users`

Responsabilidade:

- armazenar os dados de login e identificacao do usuario

Campos principais:

- `id`: identificador unico
- `full_name`: nome do usuario
- `email`: login unico
- `password_hash`: senha criptografada

Por que essa tabela existe:

- o sistema precisa saber a quem pertencem contas, categorias personalizadas e transacoes

## Tabela `accounts`

Responsabilidade:

- representar onde o dinheiro esta

Exemplos:

- conta corrente
- poupanca
- carteira
- cartao de credito

Campos principais:

- `user_id`: dono da conta
- `name`: nome da conta
- `type`: tipo da conta
- `initial_balance`: saldo inicial

Relacao:

- um usuario pode ter varias contas
- uma conta pertence a um unico usuario

## Tabela `categories`

Responsabilidade:

- classificar as transacoes

Exemplos:

- Alimentacao
- Transporte
- Salario
- Lazer

Campos principais:

- `user_id`: se for nulo, a categoria e global do sistema
- `name`: nome da categoria
- `type`: `income` ou `expense`
- `is_system`: indica se a categoria veio do seed inicial

Relacao:

- categorias podem ser do sistema inteiro ou personalizadas por usuario

## Tabela `transactions`

Responsabilidade:

- armazenar cada entrada ou saida de dinheiro

Campos principais:

- `user_id`: dono da transacao
- `account_id`: conta usada
- `category_id`: categoria da transacao
- `type`: `income` ou `expense`
- `title`: titulo curto
- `description`: descricao opcional
- `amount`: valor
- `transaction_date`: data da movimentacao

Relacoes:

- uma transacao pertence a um usuario
- uma transacao pertence a uma conta
- uma transacao pode ter uma categoria

## Como as tabelas se conectam

```text
users
  1 -> N accounts
  1 -> N transactions
  1 -> N categories (personalizadas)

accounts
  1 -> N transactions

categories
  1 -> N transactions
```

## Por que nao salvar tudo direto em `transactions`

Poderiamos salvar apenas:

- titulo
- valor
- tipo
- nome da categoria

Mas isso ficaria ruim quando o projeto crescer.

Separar em tabelas ajuda porque:

- evita repeticao de dados
- facilita filtros
- facilita relatorios
- deixa o login e as permissoes mais claros
- prepara o sistema para multiplas contas

## O que acontece no fluxo real

Quando o usuario se registra:

1. cria um registro em `users`
2. cria uma conta padrao em `accounts`

Quando ele cadastra uma transacao:

1. escolhe a conta
2. escolhe a categoria
3. cria um registro em `transactions`

Quando a dashboard abre:

1. o backend busca as transacoes do usuario
2. junta com conta e categoria
3. devolve os dados prontos para o front exibir

## Proximos passos da arquitetura

1. o React deixa de salvar em `localStorage`
2. o backend passa a salvar e buscar no PostgreSQL
3. o login gera um token
4. esse token protege as rotas da API

Esse e o caminho que vamos seguir agora.
