import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler, notFoundHandler } from "@repo/services";
import { pilotAuthRouter } from "./routes/auth.routes";
import { formRouter } from "./routes/form.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Mount Pilot Auth Routes
app.use("/api/auth", pilotAuthRouter);

// Mount Pilot Form Routes
app.use("/api/forms", formRouter);

// Health Check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Pilot Backend running" });
});

// Unmatched routes + centralized error handling (must be registered last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Pilot Backend running on http://localhost:${PORT}`);
});
