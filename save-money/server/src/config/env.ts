import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });

function getRequiredEnv(variableName: string): string {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(
      `A variavel de ambiente ${variableName} nao foi definida. Crie o arquivo server/.env com base em server/.env.example.`,
    );
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3333),
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173",
};
