import type { Category } from "../types/category";
import type { TransactionType } from "../types/transaction";
import { apiRequest } from "./api";

export async function getCategories(
  type?: TransactionType,
): Promise<Category[]> {
  const search = type ? `?type=${type}` : "";
  const response = await apiRequest<{ categories: Category[] }>(
    `/categories${search}`,
  );

  return response.categories;
}
