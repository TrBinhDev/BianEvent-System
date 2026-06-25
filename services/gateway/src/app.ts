import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { globalRateLimit } from "./middlewares/rate-limit";
import { errorHandler } from "./middlewares/error-handler";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import bookingRoutes from "./routes/booking.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4000", "http://localhost:4001"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimit);

app.use("/api", userRoutes);
app.use("/api", eventRoutes);
app.use("/api", bookingRoutes);
app.use("/api", notificationRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`API Gateway running on port ${env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start gateway:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

start();
