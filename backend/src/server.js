import express from "express";
import cors from "cors";

import salesRoutes from "./routes/salesRoutes.js";
import expensesRoutes from "./routes/expensesRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import importsRoutes from "./routes/importsRoutes.js";
import documentsRoutes from "./routes/documentsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost",
      "https://localhost",
      "capacitor://localhost",
      "https://neneye.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/sales", salesRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/imports", importsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/access", accessRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(env.port) || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});