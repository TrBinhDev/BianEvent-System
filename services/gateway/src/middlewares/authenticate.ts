import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { env } from "../config/env";
import { AppError } from "./error-handler";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Vui lòng đăng nhập");
    }

    const { data } = await axios.post(
      `${env.USER_SERVICE_URL}/internal/users/verify-token`,
      {},
      {
        headers: {
          Authorization: authHeader,
          "x-internal-key": env.INTERNAL_API_KEY,
        },
      },
    );

    req.user = {
      userId: data.data.userId,
      role: data.data.role,
    };

    next();
  } catch (err: any) {
    if (err instanceof AppError) return next(err);
    if (err.response?.status === 403)
      return next(new AppError(403, "Tài khoản đã bị khoá"));
    next(new AppError(401, "Token không hợp lệ hoặc đã hết hạn"));
  }
};
