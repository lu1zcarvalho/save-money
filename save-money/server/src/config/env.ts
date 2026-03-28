import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });

export const env = {
  port: Number(process.env.PORT ?? 3333),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://save_money_user:save_money_pass@127.0.0.1:5433/save_money",
  jwtSecret: process.env.JWT_SECRET ?? "save-money-dev-secret",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173",
};
