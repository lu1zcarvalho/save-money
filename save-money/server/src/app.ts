import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import accountRoutes from "./routes/accountRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();

app.use(
  cors({
    origin: [env.clientOrigin, "http://localhost:5173"],
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(errorHandler);

export default app;
