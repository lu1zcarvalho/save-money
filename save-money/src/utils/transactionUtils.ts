import type { Transaction } from "../types/transaction";

interface TransactionSummary {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
}

export function calculateTransactionSummary(
  transactions: Transaction[],
): TransactionSummary {
  return transactions.reduce<TransactionSummary>(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.incomeTotal += transaction.amount;
        summary.balance += transaction.amount;
      } else {
        summary.expenseTotal += transaction.amount;
        summary.balance -= transaction.amount;
      }

      return summary;
    },
    {
      incomeTotal: 0,
      expenseTotal: 0,
      balance: 0,
    },
  );
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}
