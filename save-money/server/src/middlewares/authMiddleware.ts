import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Token nao enviado." });
    return;
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    request.auth = verifyToken(token);
    next();
  } catch {
    response.status(401).json({ message: "Token invalido ou expirado." });
  }
}
