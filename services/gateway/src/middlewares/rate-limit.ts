import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export const globalRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
  },
});

export const authRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau",
  },
});
