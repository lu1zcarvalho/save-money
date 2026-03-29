CREATE TABLE IF NOT EXISTS category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  reference_month DATE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_category_budgets_reference_month
    CHECK (reference_month = date_trunc('month', reference_month::timestamp)::date),
  CONSTRAINT uq_category_budgets_user_category_month
    UNIQUE (user_id, category_id, reference_month)
);

CREATE INDEX IF NOT EXISTS idx_category_budgets_user_id
  ON category_budgets (user_id);

CREATE INDEX IF NOT EXISTS idx_category_budgets_reference_month
  ON category_budgets (reference_month DESC);

DROP TRIGGER IF EXISTS trg_category_budgets_updated_at ON category_budgets;
CREATE TRIGGER trg_category_budgets_updated_at
BEFORE UPDATE ON category_budgets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
