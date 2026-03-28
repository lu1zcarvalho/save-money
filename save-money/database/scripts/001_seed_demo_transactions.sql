-- Seed de demonstracao para visualizar o dashboard com varios meses.
-- Este script insere lancamentos em jan/2025, fev/2025 e dez/2025
-- para todos os usuarios que possuam ao menos uma conta ativa.

WITH target_accounts AS (
  SELECT DISTINCT ON (accounts.user_id)
    accounts.user_id,
    accounts.id AS account_id
  FROM accounts
  WHERE accounts.is_active = TRUE
  ORDER BY accounts.user_id, accounts.created_at, accounts.id
),
demo_rows AS (
  SELECT *
  FROM (
    VALUES
      ('income', 'Salario janeiro', 'Recebimento principal do mes.', 9200.00::numeric, '2025-01-05'::date, 'Salario'),
      ('income', 'Freelance landing page', 'Projeto freelancer entregue em janeiro.', 850.00::numeric, '2025-01-18'::date, 'Freelance'),
      ('expense', 'Aluguel janeiro', 'Pagamento fixo da moradia.', 2400.00::numeric, '2025-01-08'::date, 'Moradia'),
      ('expense', 'Mercado janeiro', 'Compras do mes no supermercado.', 980.00::numeric, '2025-01-12'::date, 'Alimentacao'),
      ('expense', 'Internet e streaming', 'Assinaturas recorrentes do mes.', 180.00::numeric, '2025-01-15'::date, 'Assinaturas'),
      ('expense', 'Transporte janeiro', 'Combustivel e deslocamentos.', 320.00::numeric, '2025-01-21'::date, 'Transporte'),
      ('expense', 'Lazer janeiro', 'Cinema e jantar do fim de semana.', 210.00::numeric, '2025-01-25'::date, 'Lazer'),
      ('income', 'Salario fevereiro', 'Recebimento principal do mes.', 9200.00::numeric, '2025-02-05'::date, 'Salario'),
      ('income', 'Reembolso corporativo', 'Reembolso de despesas profissionais.', 240.00::numeric, '2025-02-13'::date, 'Reembolso'),
      ('expense', 'Aluguel fevereiro', 'Pagamento fixo da moradia.', 2400.00::numeric, '2025-02-08'::date, 'Moradia'),
      ('expense', 'Mercado fevereiro', 'Compras do mes no supermercado.', 910.00::numeric, '2025-02-11'::date, 'Alimentacao'),
      ('expense', 'Farmacia fevereiro', 'Medicamentos e itens de saude.', 145.00::numeric, '2025-02-14'::date, 'Saude'),
      ('expense', 'Transporte fevereiro', 'Aplicativos e deslocamentos.', 290.00::numeric, '2025-02-18'::date, 'Transporte'),
      ('expense', 'Curso online', 'Parcela de curso para especializacao.', 199.00::numeric, '2025-02-20'::date, 'Educacao'),
      ('expense', 'Jantar aniversario', 'Saida especial de comemoracao.', 260.00::numeric, '2025-02-22'::date, 'Lazer'),
      ('income', 'Salario dezembro', 'Recebimento principal do mes.', 9800.00::numeric, '2025-12-05'::date, 'Salario'),
      ('income', 'Bonus fim de ano', 'Pagamento adicional de dezembro.', 2500.00::numeric, '2025-12-20'::date, 'Outras entradas'),
      ('income', 'Freelance natal', 'Projeto extra entregue antes das festas.', 1400.00::numeric, '2025-12-23'::date, 'Freelance'),
      ('expense', 'Aluguel dezembro', 'Pagamento fixo da moradia.', 2400.00::numeric, '2025-12-08'::date, 'Moradia'),
      ('expense', 'Ceia de natal', 'Compras para a ceia em familia.', 780.00::numeric, '2025-12-18'::date, 'Alimentacao'),
      ('expense', 'Presentes familia', 'Presentes comprados para dezembro.', 1350.00::numeric, '2025-12-19'::date, 'Compras'),
      ('expense', 'Viagem fim de ano', 'Passeio e hospedagem de ferias.', 2200.00::numeric, '2025-12-27'::date, 'Lazer'),
      ('expense', 'Impostos anuais', 'Taxas e impostos pagos no fechamento do ano.', 430.00::numeric, '2025-12-28'::date, 'Impostos')
  ) AS rows (
    type,
    title,
    description,
    amount,
    transaction_date,
    category_name
  )
),
expanded_rows AS (
  SELECT
    target_accounts.user_id,
    target_accounts.account_id,
    categories.id AS category_id,
    demo_rows.type::transaction_type AS type,
    demo_rows.title,
    demo_rows.description,
    demo_rows.amount,
    demo_rows.transaction_date
  FROM target_accounts
  CROSS JOIN demo_rows
  LEFT JOIN categories
    ON categories.name = demo_rows.category_name
   AND categories.type = demo_rows.type::transaction_type
   AND categories.user_id IS NULL
)
INSERT INTO transactions (
  user_id,
  account_id,
  category_id,
  type,
  title,
  description,
  amount,
  transaction_date
)
SELECT
  expanded_rows.user_id,
  expanded_rows.account_id,
  expanded_rows.category_id,
  expanded_rows.type,
  expanded_rows.title,
  expanded_rows.description,
  expanded_rows.amount,
  expanded_rows.transaction_date
FROM expanded_rows
WHERE NOT EXISTS (
  SELECT 1
  FROM transactions
  WHERE transactions.user_id = expanded_rows.user_id
    AND transactions.account_id = expanded_rows.account_id
    AND transactions.type = expanded_rows.type
    AND transactions.title = expanded_rows.title
    AND transactions.amount = expanded_rows.amount
    AND transactions.transaction_date = expanded_rows.transaction_date
);
