import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  void _next;

  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Dados invalidos.",
      issues: error.issues,
    });
    return;
  }

  if (error instanceof Error) {
    response.status(500).json({ message: error.message });
    return;
  }

  response.status(500).json({ message: "Erro interno do servidor." });
}
