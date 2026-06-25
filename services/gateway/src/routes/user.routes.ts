import { Router, IRouter } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { authRateLimit } from "../middlewares/rate-limit";
import { env } from "../config/env";

const router: IRouter = Router();

const proxy = createProxyMiddleware({
  target: env.USER_SERVICE_URL,
  changeOrigin: true,
});

// Auth — public
router.post("/auth/register", authRateLimit, proxy);
router.post("/auth/verify-email", proxy);
router.post("/auth/resend-otp", proxy);
router.post("/auth/login", authRateLimit, proxy);
router.post("/auth/logout", authenticate, proxy);
router.post("/auth/refresh", proxy);
router.post("/auth/forgot-password", authRateLimit, proxy);
router.post("/auth/reset-password", proxy);

// Profile
router.get("/users/me", authenticate, proxy);
router.patch("/users/me", authenticate, proxy);
router.patch("/users/me/password", authenticate, proxy);
router.post(
  "/users/me/apply-organizer",
  authenticate,
  authorize("USER"),
  proxy,
);

// Admin
router.get("/admin/users", authenticate, authorize("ADMIN"), proxy);
router.get("/admin/users/:id", authenticate, authorize("ADMIN"), proxy);
router.patch("/admin/users/:id/role", authenticate, authorize("ADMIN"), proxy);
router.patch(
  "/admin/users/:id/status",
  authenticate,
  authorize("ADMIN"),
  proxy,
);
router.get(
  "/admin/organizer-applications",
  authenticate,
  authorize("ADMIN"),
  proxy,
);
router.patch(
  "/admin/organizer-applications/:id/approve",
  authenticate,
  authorize("ADMIN"),
  proxy,
);
router.patch(
  "/admin/organizer-applications/:id/reject",
  authenticate,
  authorize("ADMIN"),
  proxy,
);

export default router;
