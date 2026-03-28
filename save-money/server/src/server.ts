import app from "./app.js";
import { pool } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    await pool.query("SELECT 1");

    app.listen(env.port, () => {
      console.log(`API rodando em http://127.0.0.1:${env.port}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar a API:", error);
    process.exit(1);
  }
}

void startServer();
