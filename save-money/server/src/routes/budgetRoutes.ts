import { Router } from "express";
import { z } from "zod";
import { pool } from "../config/database.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { mapCategoryBudgetRow } from "../utils/mappers.js";

const router = Router();

const monthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Informe o mes no formato YYYY-MM.");

const upsertBudgetSchema = z.object({
  categoryId: z.uuid("Categoria invalida."),
  month: monthSchema,
  amount: z.number().positive("Informe um valor de orcamento maior que zero."),
});

function monthToReferenceDate(month: string): string {
  return `${month}-01`;
}

router.use(requireAuth);

router.get("/", async (request, response) => {
  const monthQuery =
    typeof request.query.month === "string" ? request.query.month : undefined;

  if (!monthQuery) {
    response
      .status(400)
      .json({ message: "Informe o mes para listar os orcamentos." });
    return;
  }

  const month = monthSchema.parse(monthQuery);

  const result = await pool.query(
    `
      SELECT
        b.id,
        b.category_id,
        c.name AS category_name,
        b.amount,
        b.reference_month::text AS reference_month
      FROM category_budgets b
      INNER JOIN categories c ON c.id = b.category_id
      WHERE b.user_id = $1
        AND b.reference_month = $2
      ORDER BY c.name ASC
    `,
    [request.auth!.userId, monthToReferenceDate(month)],
  );

  response.json({
    budgets: result.rows.map(mapCategoryBudgetRow),
  });
});

router.post("/", async (request, response) => {
  const data = upsertBudgetSchema.parse(request.body);

  const categoryResult = await pool.query(
    `
      SELECT id, name
      FROM categories
      WHERE id = $1
        AND (user_id IS NULL OR user_id = $2)
        AND type = 'expense'
    `,
    [data.categoryId, request.auth!.userId],
  );

  if (!categoryResult.rowCount) {
    response
      .status(404)
      .json({ message: "Categoria de saida nao encontrada." });
    return;
  }

  const upsertResult = await pool.query(
    `
      INSERT INTO category_budgets (user_id, category_id, reference_month, amount)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category_id, reference_month)
      DO UPDATE SET amount = EXCLUDED.amount
      RETURNING id, category_id, amount, reference_month::text AS reference_month
    `,
    [
      request.auth!.userId,
      data.categoryId,
      monthToReferenceDate(data.month),
      data.amount,
    ],
  );

  const budgetResult = await pool.query(
    `
      SELECT
        b.id,
        b.category_id,
        c.name AS category_name,
        b.amount,
        b.reference_month::text AS reference_month
      FROM category_budgets b
      INNER JOIN categories c ON c.id = b.category_id
      WHERE b.id = $1 AND b.user_id = $2
    `,
    [upsertResult.rows[0].id, request.auth!.userId],
  );

  response.status(201).json({
    budget: mapCategoryBudgetRow(budgetResult.rows[0]),
  });
});

export default router;
