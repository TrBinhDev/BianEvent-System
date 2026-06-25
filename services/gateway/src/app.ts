import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpProxy from "http-proxy";
import { env } from "./config/env";
import { globalRateLimit, authRateLimit } from "./middlewares/rate-limit";
import { authenticate } from "./middlewares/authenticate";
import { authorize } from "./middlewares/authorize";
import { errorHandler } from "./middlewares/error-handler";

const app = express();
const proxy = httpProxy.createProxyServer({});

proxy.on("error", (err, req, res: any) => {
  console.error("Proxy error:", err.message);
  res.status(502).json({ success: false, message: "Service không khả dụng" });
});

proxy.on("proxyReq", (proxyReq, req: any) => {
  if (req.user) {
    proxyReq.setHeader("x-user-id", req.user.userId);
    proxyReq.setHeader("x-user-role", req.user.role);
  }
});

app.use(
  cors({
    origin: ["http://localhost:4000", "http://localhost:4001"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(globalRateLimit);

app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.url}`);
  next();
});

// ── User Service ──────────────────────────────────────────────
app.all("/api/auth/register", authRateLimit, (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/auth/verify-email", (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/auth/resend-otp", (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/auth/login", authRateLimit, (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/auth/logout", authenticate, (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/auth/refresh", (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/auth/forgot-password", authRateLimit, (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/auth/reset-password", (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all(
  "/api/users/me/apply-organizer",
  authenticate,
  authorize("USER"),
  (req, res) => {
    proxy.web(req, res, { target: env.USER_SERVICE_URL });
  },
);
app.all("/api/users/me*", authenticate, (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all("/api/admin/users*", authenticate, authorize("ADMIN"), (req, res) => {
  proxy.web(req, res, { target: env.USER_SERVICE_URL });
});
app.all(
  "/api/admin/organizer-applications*",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    proxy.web(req, res, { target: env.USER_SERVICE_URL });
  },
);

// ── Event Service ──────────────────────────────────────────────
app.all("/api/events/categories", (req, res) => {
  proxy.web(req, res, { target: env.EVENT_SERVICE_URL });
});
app.all("/api/events", (req, res) => {
  proxy.web(req, res, { target: env.EVENT_SERVICE_URL });
});
app.all("/api/events/:id", (req, res) => {
  proxy.web(req, res, { target: env.EVENT_SERVICE_URL });
});
app.all(
  "/api/organizer/events*",
  authenticate,
  authorize("ORGANIZER"),
  (req, res) => {
    proxy.web(req, res, { target: env.EVENT_SERVICE_URL });
  },
);
app.all("/api/admin/events*", authenticate, authorize("ADMIN"), (req, res) => {
  proxy.web(req, res, { target: env.EVENT_SERVICE_URL });
});
app.all(
  "/api/admin/categories*",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    proxy.web(req, res, { target: env.EVENT_SERVICE_URL });
  },
);

// ── Booking Service ──────────────────────────────────────────────
app.all("/api/bookings", authenticate, authorize("USER"), (req, res) => {
  proxy.web(req, res, { target: env.BOOKING_SERVICE_URL });
});
app.all("/api/bookings/my*", authenticate, (req, res) => {
  proxy.web(req, res, { target: env.BOOKING_SERVICE_URL });
});
app.all(
  "/api/admin/bookings*",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    proxy.web(req, res, { target: env.BOOKING_SERVICE_URL });
  },
);

// ── Notification Service ──────────────────────────────────────────────
app.all("/api/notifications*", authenticate, (req, res) => {
  proxy.web(req, res, { target: env.NOTIFICATION_SERVICE_URL });
});

app.use(errorHandler);

const start = () => {
  app.listen(env.PORT, () => {
    console.log(`API Gateway running on port ${env.PORT}`);
  });
};

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

start();
