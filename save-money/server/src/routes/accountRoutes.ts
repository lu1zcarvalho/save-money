import { Router } from "express";
import { pool } from "../config/database.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { mapAccountRow } from "../utils/mappers.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (request, response) => {
  const result = await pool.query(
    `
      SELECT id, name, type, initial_balance
      FROM accounts
      WHERE user_id = $1 AND is_active = TRUE
      ORDER BY created_at ASC
    `,
    [request.auth?.userId],
  );

  response.json({
    accounts: result.rows.map(mapAccountRow),
  });
});

export default router;
