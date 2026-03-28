import type { Transaction } from "../types/transaction";

interface TransactionSummary {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
}

export interface MonthlyTransactionSummary extends TransactionSummary {
  monthKey: string;
  monthLabel: string;
  expensePercentage: number | null;
  transactions: Transaction[];
  incomes: Transaction[];
  expenses: Transaction[];
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

export function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split("-");

  if (!year || !month) {
    return monthKey;
  }

  const parsedDate = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function calculateMonthlyTransactionSummaries(
  transactions: Transaction[],
): MonthlyTransactionSummary[] {
  const monthlyMap = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const monthKey = transaction.date.slice(0, 7);
    const currentTransactions = monthlyMap.get(monthKey) ?? [];

    currentTransactions.push(transaction);
    monthlyMap.set(monthKey, currentTransactions);
  }

  return Array.from(monthlyMap.entries())
    .sort((firstMonth, secondMonth) => firstMonth[0].localeCompare(secondMonth[0]))
    .map(([monthKey, monthTransactions]) => {
      const summary = calculateTransactionSummary(monthTransactions);
      const incomes = monthTransactions.filter(
        (transaction) => transaction.type === "income",
      );
      const expenses = monthTransactions.filter(
        (transaction) => transaction.type === "expense",
      );

      return {
        monthKey,
        monthLabel: formatMonthYear(monthKey),
        incomeTotal: summary.incomeTotal,
        expenseTotal: summary.expenseTotal,
        balance: summary.balance,
        expensePercentage:
          summary.incomeTotal > 0
            ? (summary.expenseTotal / summary.incomeTotal) * 100
            : null,
        transactions: monthTransactions,
        incomes,
        expenses,
      };
    });
}
