import type { Transaction } from "../types/transaction";

const STORAGE_KEY = "save-money:transactions";

export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsedData: unknown = JSON.parse(data);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData as Transaction[];
  } catch {
    return [];
  }
}

export function saveTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  const updatedTransactions = [...transactions, transaction];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
}
