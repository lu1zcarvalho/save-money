import { Router } from "express";
import { pool } from "../config/database.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { mapCategoryRow } from "../utils/mappers.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (request, response) => {
  const type = typeof request.query.type === "string" ? request.query.type : undefined;

  const values: string[] = [request.auth!.userId];
  let typeFilter = "";

  if (type === "income" || type === "expense") {
    values.push(type);
    typeFilter = "AND type = $2";
  }

  const result = await pool.query(
    `
      SELECT id, name, type, color, icon, is_system
      FROM categories
      WHERE (user_id IS NULL OR user_id = $1)
      ${typeFilter}
      ORDER BY is_system DESC, name ASC
    `,
    values,
  );

  response.json({
    categories: result.rows.map(mapCategoryRow),
  });
});

export default router;
