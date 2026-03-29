import type {
  CategoryBudget,
  SaveCategoryBudgetInput,
} from "../types/budget";
import { apiRequest } from "./api";

export async function getBudgets(month: string): Promise<CategoryBudget[]> {
  const response = await apiRequest<{ budgets: CategoryBudget[] }>(
    `/budgets?month=${month}`,
  );

  return response.budgets;
}

export async function saveBudget(
  budget: SaveCategoryBudgetInput,
): Promise<CategoryBudget> {
  const response = await apiRequest<{ budget: CategoryBudget }>("/budgets", {
    method: "POST",
    body: JSON.stringify(budget),
  });

  return response.budget;
}
