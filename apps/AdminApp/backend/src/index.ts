import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler, notFoundHandler } from "@repo/services";
import { adminAuthRouter } from "./routes/auth.routes";
import { adminFormRouter } from "./routes/form.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());

// Mount Admin Auth Routes
app.use("/api/auth", adminAuthRouter);

app.use("/api/forms", adminFormRouter);

// Health Check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Admin Backend running" });
});

// Unmatched routes + centralized error handling (must be registered last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Admin Backend running on http://localhost:${PORT}`);
});
