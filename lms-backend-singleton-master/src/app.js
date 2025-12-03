import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// CORS configuration for cookie-based auth
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
    credentials: true, // Allow cookies to be sent
  })
);

// Webhook endpoint needs raw body - handle it before JSON parsing
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Store raw body for webhook verification
    req.rawBody = req.body;
    next();
  }
);

app.use(express.json());
app.use(cookieParser()); // Parse cookies from request

app.use("/api", router);
app.use(errorHandler);

export default app;
