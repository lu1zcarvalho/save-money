import type { Account } from "../types/account";
import { apiRequest } from "./api";

export async function getAccounts(): Promise<Account[]> {
  const response = await apiRequest<{ accounts: Account[] }>("/accounts");
  return response.accounts;
}
