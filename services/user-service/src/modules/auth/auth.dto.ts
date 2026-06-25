import { z } from 'zod'

export const registerDto = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  fullName: z.string().min(2, "Họ và tên không được để trống"),
})

export const verifyEmailDto = z.object({ 
  userId: z.string().uuid("User ID không hợp lệ"),
  otp: z.string().length(6, "OTP phải có 6 ký tự")
})

export const resendOtpDto = z.object({
  userId: z.string().uuid("User ID không hợp lệ"),
})

export const loginDto = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
})

export const forgotPasswordDto = z.object({
  email: z.string().email("Email không hợp lệ"),
})

export const resetPasswordDto = z.object({
  token: z.string().min(1, "Token không được để trống"),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
})

export type RegisterDto = z.infer<typeof registerDto>
export type VerifyEmailDto = z.infer<typeof verifyEmailDto>
export type ResendOtpDto = z.infer<typeof resendOtpDto>
export type LoginDto = z.infer<typeof loginDto>
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>


