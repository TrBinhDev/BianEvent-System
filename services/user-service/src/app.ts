import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectProducer, disconnectProducer } from "./kafka/producer";
import { redis } from "./config/redis";
import { errorHandler } from "./middlewares/error-handler";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import adminRoutes from "./modules/admin/admin.routes";
import internalRoutes from "./internal/internal.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4000", "http://localhost:4001"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/internal", internalRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    await connectProducer();
    app.listen(env.PORT, () => {
      console.log(`User Service running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log("Shutting down...");
  await disconnectProducer();
  await redis.quit();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
