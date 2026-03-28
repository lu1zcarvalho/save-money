# Arquitetura do projeto

## Visão geral

O sistema é dividido em três camadas:

- frontend
- backend
- banco de dados

Cada camada tem uma responsabilidade clara.

## Frontend

Local:

- [`src`](/C:/Users/Luiz/Desktop/save-money/save-money/src)

Responsabilidades:

- exibir interface
- capturar ações do usuário
- chamar a API
- armazenar apenas o token da sessão

Organização:

- [`src/pages`](/C:/Users/Luiz/Desktop/save-money/save-money/src/pages): telas principais
- [`src/services`](/C:/Users/Luiz/Desktop/save-money/save-money/src/services): chamadas HTTP e autenticação
- [`src/types`](/C:/Users/Luiz/Desktop/save-money/save-money/src/types): contratos de dados
- [`src/utils`](/C:/Users/Luiz/Desktop/save-money/save-money/src/utils): regras auxiliares

## Backend

Local:

- [`server/src`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src)

Responsabilidades:

- validar autenticação
- validar entradas
- aplicar regras de negócio
- acessar o PostgreSQL
- devolver respostas HTTP para o frontend

Organização:

- [`server/src/config`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/config)
- [`server/src/middlewares`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/middlewares)
- [`server/src/routes`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/routes)
- [`server/src/types`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/types)
- [`server/src/utils`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/utils)

## Banco de dados

Local:

- [`database`](/C:/Users/Luiz/Desktop/save-money/save-money/database)

Responsabilidades:

- guardar o estado real da aplicação
- relacionar usuários, contas, categorias e transações

## Fluxo de uma transação

1. O usuário preenche a tela [`NewTransaction.tsx`](/C:/Users/Luiz/Desktop/save-money/save-money/src/pages/NewTransaction.tsx).
2. O frontend chama [`transactionService.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/src/services/transactionService.ts).
3. O serviço usa [`api.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/src/services/api.ts) para enviar um `POST /api/transactions`.
4. O backend valida o token em [`authMiddleware.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/middlewares/authMiddleware.ts).
5. A rota [`transactionRoutes.ts`](/C:/Users/Luiz/Desktop/save-money/save-money/server/src/routes/transactionRoutes.ts) valida os dados e salva no PostgreSQL.
6. A API devolve a transação criada.
7. O frontend atualiza a dashboard.

## Por que essa arquitetura

- o frontend não deve acessar o banco direto
- o backend protege as regras de negócio
- o banco fica desacoplado da interface
- fica mais fácil crescer com login, relatórios e novas telas

## Como pensar manutenção

Se mudar o dado:

- veja banco e tipos

Se mudar a regra:

- veja backend

Se mudar a interface:

- veja frontend
