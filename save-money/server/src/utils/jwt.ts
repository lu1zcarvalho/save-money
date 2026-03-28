import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
