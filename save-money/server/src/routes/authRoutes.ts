import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { pool } from "../config/database.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { generateToken } from "../utils/jwt.js";
import { mapUserRow } from "../utils/mappers.js";

const router = Router();
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Muitas tentativas de autenticacao. Aguarde alguns minutos antes de tentar novamente.",
  },
});

const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .regex(/[A-Z]/, "A senha precisa ter pelo menos uma letra maiuscula.")
  .regex(/[a-z]/, "A senha precisa ter pelo menos uma letra minuscula.")
  .regex(/\d/, "A senha precisa ter pelo menos um numero.");

const registerSchema = z.object({
  fullName: z.string().min(3, "Informe seu nome completo."),
  email: z.email("Informe um email valido."),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.email("Informe um email valido."),
  password: z.string().min(1, "Informe sua senha."),
});

router.post("/register", authRateLimiter, async (request, response) => {
  const { fullName, email, password } = registerSchema.parse(request.body);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()],
    );

    if (existingUser.rowCount) {
      await client.query("ROLLBACK");
      response.status(409).json({ message: "Ja existe um usuario com esse email." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, full_name, email
      `,
      [fullName.trim(), email.toLowerCase(), passwordHash],
    );

    const user = userResult.rows[0];

    await client.query(
      `
        INSERT INTO accounts (user_id, name, type, initial_balance)
        VALUES ($1, $2, $3, $4)
      `,
      [user.id, "Conta principal", "checking", 0],
    );

    await client.query("COMMIT");

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    response.status(201).json({
      token,
      user: mapUserRow(user),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

router.post("/login", authRateLimiter, async (request, response) => {
  const { email, password } = loginSchema.parse(request.body);

  const userResult = await pool.query(
    `
      SELECT id, full_name, email, password_hash
      FROM users
      WHERE email = $1 AND is_active = TRUE
    `,
    [email.toLowerCase()],
  );

  const user = userResult.rows[0];

  if (!user) {
    response.status(401).json({ message: "Email ou senha invalidos." });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    response.status(401).json({ message: "Email ou senha invalidos." });
    return;
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  response.json({
    token,
    user: mapUserRow(user),
  });
});

router.get("/me", requireAuth, async (request, response) => {
  const userResult = await pool.query(
    `
      SELECT id, full_name, email
      FROM users
      WHERE id = $1
    `,
    [request.auth?.userId],
  );

  const user = userResult.rows[0];

  if (!user) {
    response.status(404).json({ message: "Usuario nao encontrado." });
    return;
  }

  response.json({
    user: mapUserRow(user),
  });
});

export default router;
