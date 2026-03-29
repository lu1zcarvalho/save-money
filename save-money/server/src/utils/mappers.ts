interface UserRow {
  id: string;
  full_name: string;
  email: string;
}

interface AccountRow {
  id: string;
  name: string;
  type: string;
  initial_balance: string | number;
}

interface CategoryRow {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  is_system: boolean;
}

interface TransactionRow {
  id: string;
  title: string;
  description: string | null;
  amount: string | number;
  type: "income" | "expense";
  date: string;
  category_id: string | null;
  category_name: string | null;
  account_id: string;
  account_name: string;
}

interface CategoryBudgetRow {
  id: string;
  category_id: string;
  category_name: string;
  amount: string | number;
  reference_month: string;
}

export function mapUserRow(row: UserRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
  };
}

export function mapAccountRow(row: AccountRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    initialBalance: Number(row.initial_balance),
  };
}

export function mapCategoryRow(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    isSystem: row.is_system,
  };
}

export function mapTransactionRow(row: TransactionRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    amount: Number(row.amount),
    type: row.type,
    date: row.date,
    categoryId: row.category_id,
    category: row.category_name ?? "Sem categoria",
    accountId: row.account_id,
    accountName: row.account_name,
  };
}

export function mapCategoryBudgetRow(row: CategoryBudgetRow) {
  return {
    id: row.id,
    categoryId: row.category_id,
    category: row.category_name,
    amount: Number(row.amount),
    month: row.reference_month.slice(0, 7),
  };
}
