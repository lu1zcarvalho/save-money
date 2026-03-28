export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  category: string;
  accountId: string;
  accountName: string;
  date: string;
  description?: string;
}

export interface CreateTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  categoryId?: string | null;
  accountId: string;
  date: string;
  description?: string;
}
