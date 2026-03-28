import type {
  CreateTransactionInput,
  Transaction,
} from "../types/transaction";
import { apiRequest } from "./api";

export async function getTransactions(): Promise<Transaction[]> {
  const response = await apiRequest<{ transactions: Transaction[] }>(
    "/transactions",
  );

  return response.transactions;
}

export async function saveTransaction(
  transaction: CreateTransactionInput,
): Promise<Transaction> {
  const response = await apiRequest<{ transaction: Transaction }>(
    "/transactions",
    {
      method: "POST",
      body: JSON.stringify(transaction),
    },
  );

  return response.transaction;
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await apiRequest<void>(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}
