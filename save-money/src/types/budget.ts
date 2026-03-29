export interface CategoryBudget {
  id: string;
  categoryId: string;
  category: string;
  amount: number;
  month: string;
}

export interface SaveCategoryBudgetInput {
  categoryId: string;
  month: string;
  amount: number;
}
