import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import {
  hashPassword,
  comparePassword,
  hashSHA256,
  compareSHA256,
} from "../../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/token";
import { generateOtp, verifyOtp } from "../../utils/otp";
import { AppError } from "../../middlewares/error-handler";
import { kafkaProducer } from "../../kafka/producer";
import type {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./auth.dto";
import crypto from "crypto";

const OTP_TTL = 600; // 10 phút
const OTP_RATE_TTL = 60; // 1 phút
const RESET_TOKEN_TTL = 600; // 10 phút
const REFRESH_TOKEN_TTL_DAYS = 7;

export const register = async (dto: RegisterDto) => {
  const existing = await prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (existing) throw new AppError(409, "Email đã được sử dụng");

  const passwordHash = await hashPassword(dto.password);

  const user = await prisma.user.create({
    data: {
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    },
  });

  const otp = generateOtp(user.id);
  await redis.set(`otp:${user.id}`, otp, "EX", OTP_TTL);

  await kafkaProducer.send({
    topic: "user.registered",
    messages: [
      {
        value: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          otp,
        }),
      },
    ],
  });

  return {
    userId: user.id,
    message: "Đăng ký thành công, vui lòng kiểm tra email để xác thực",
  };
};

export const verifyEmail = async (userId: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Người dùng không tồn tại");
  if (user.status === "ACTIVE")
    throw new AppError(400, "Tài khoản đã được xác thực");

  const storedOtp = await redis.get(`otp:${userId}`);
  if (!storedOtp) throw new AppError(400, "OTP đã hết hạn, vui lòng gửi lại");
  if (storedOtp !== otp) throw new AppError(400, "OTP không đúng");

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await redis.del(`otp:${userId}`);

  return { message: "Xác thực email thành công" };
};

export const resendOtp = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Người dùng không tồn tại");
  if (user.status === "ACTIVE")
    throw new AppError(400, "Tài khoản đã được xác thực");

  const rateLimitKey = `otp_rate:${userId}`;
  const isRateLimited = await redis.get(rateLimitKey);
  if (isRateLimited)
    throw new AppError(429, "Vui lòng chờ 1 phút trước khi gửi lại");

  const otp = generateOtp(user.id);
  await redis.set(`otp:${userId}`, otp, "EX", OTP_TTL);
  await redis.set(rateLimitKey, "1", "EX", OTP_RATE_TTL);

  await kafkaProducer.send({
    topic: "user.registered",
    messages: [
      {
        value: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          otp,
        }),
      },
    ],
  });

  return { message: "Đã gửi lại OTP, vui lòng kiểm tra email" };
};

export const login = async (dto: LoginDto) => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new AppError(401, "Email hoặc mật khẩu không đúng");

  const isMatch = await comparePassword(dto.password, user.passwordHash);
  if (!isMatch) throw new AppError(401, "Email hoặc mật khẩu không đúng");

  if (user.status === "UNVERIFIED")
    throw new AppError(403, "Vui lòng xác thực email trước khi đăng nhập");
  if (user.status === "BANNED") throw new AppError(403, "Tài khoản đã bị khoá");

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  const tokenHash = hashSHA256(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

export const logout = async (refreshToken: string) => {
  const tokenHash = hashSHA256(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  return { message: "Đăng xuất thành công" };
};

export const refresh = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashSHA256(refreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash, userId: payload.sub },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token không hợp lệ hoặc đã hết hạn");
  }

  // Dùng deleteMany thay vì delete — không throw lỗi nếu không tìm thấy
  await prisma.refreshToken.deleteMany({ where: { id: stored.id } });

  const newAccessToken = signAccessToken({
    sub: stored.user.id,
    role: stored.user.role,
  });
  const newRefreshToken = signRefreshToken(stored.user.id);
  const newTokenHash = hashSHA256(newRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId: stored.user.id,
      tokenHash: newTokenHash,
      expiresAt,
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const forgotPassword = async (dto: ForgotPasswordDto) => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user)
    return {
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
    };

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSHA256(resetToken);

  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL * 1000);

  await prisma.passwordReset.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  await kafkaProducer.send({
    topic: "notification.send",
    messages: [
      {
        value: JSON.stringify({
          to: user.email,
          type: "RESET_PASSWORD",
          data: {
            resetLink: `${process.env.WEB_URL}/reset-password?token=${resetToken}`,
          },
        }),
      },
    ],
  });

  return {
    message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
  };
};

export const resetPassword = async (dto: ResetPasswordDto) => {
  const tokenHash = hashSHA256(dto.token);

  const record = await prisma.passwordReset.findFirst({
    where: { tokenHash, used: false },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(400, "Token không hợp lệ hoặc đã hết hạn");
  }

  const passwordHash = await hashPassword(dto.newPassword);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  await prisma.passwordReset.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { message: "Đặt lại mật khẩu thành công" };
};
