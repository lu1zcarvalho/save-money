import { Router } from "express";
import { z } from "zod";
import { pool } from "../config/database.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { mapTransactionRow } from "../utils/mappers.js";

const router = Router();

const transactionSchema = z.object({
  title: z.string().min(2, "Informe um titulo valido."),
  amount: z.number().positive("Informe um valor maior que zero."),
  type: z.enum(["income", "expense"]),
  accountId: z.uuid("Conta invalida."),
  categoryId: z.uuid("Categoria invalida.").nullable().optional(),
  date: z.iso.date("Informe uma data valida."),
  description: z.string().max(500).optional(),
});

router.use(requireAuth);

router.get("/", async (request, response) => {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.amount,
        t.type,
        t.transaction_date::text AS date,
        t.category_id,
        c.name AS category_name,
        t.account_id,
        a.name AS account_name
      FROM transactions t
      INNER JOIN accounts a ON a.id = t.account_id
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `,
    [request.auth?.userId],
  );

  response.json({
    transactions: result.rows.map(mapTransactionRow),
  });
});

router.post("/", async (request, response) => {
  const data = transactionSchema.parse(request.body);

  const accountResult = await pool.query(
    `
      SELECT id, name
      FROM accounts
      WHERE id = $1 AND user_id = $2 AND is_active = TRUE
    `,
    [data.accountId, request.auth?.userId],
  );

  if (!accountResult.rowCount) {
    response.status(404).json({ message: "Conta nao encontrada." });
    return;
  }

  if (data.categoryId) {
    const categoryResult = await pool.query(
      `
        SELECT id
        FROM categories
        WHERE id = $1
          AND (user_id IS NULL OR user_id = $2)
          AND type = $3
      `,
      [data.categoryId, request.auth?.userId, data.type],
    );

    if (!categoryResult.rowCount) {
      response.status(404).json({ message: "Categoria nao encontrada." });
      return;
    }
  }

  const insertResult = await pool.query(
    `
      INSERT INTO transactions (
        user_id,
        account_id,
        category_id,
        type,
        title,
        description,
        amount,
        transaction_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      request.auth?.userId,
      data.accountId,
      data.categoryId ?? null,
      data.type,
      data.title.trim(),
      data.description?.trim() || null,
      data.amount,
      data.date,
    ],
  );

  const transactionId = insertResult.rows[0].id;

  const transactionResult = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.amount,
        t.type,
        t.transaction_date::text AS date,
        t.category_id,
        c.name AS category_name,
        t.account_id,
        a.name AS account_name
      FROM transactions t
      INNER JOIN accounts a ON a.id = t.account_id
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.id = $1 AND t.user_id = $2
    `,
    [transactionId, request.auth?.userId],
  );

  response.status(201).json({
    transaction: mapTransactionRow(transactionResult.rows[0]),
  });
});

router.delete("/:id", async (request, response) => {
  const transactionId = request.params.id;

  const result = await pool.query(
    `
      DELETE FROM transactions
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `,
    [transactionId, request.auth?.userId],
  );

  if (!result.rowCount) {
    response.status(404).json({ message: "Transacao nao encontrada." });
    return;
  }

  response.status(204).send();
});

export default router;
