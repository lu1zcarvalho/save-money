import type { TransactionType } from "./transaction";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string | null;
  icon?: string | null;
  isSystem: boolean;
}
