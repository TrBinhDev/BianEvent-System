import { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'
import { registerDto, verifyEmailDto, resendOtpDto, loginDto, forgotPasswordDto, resetPasswordDto } from './auth.dto'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerDto.parse(req.body)
    const result = await authService.register(body)
    res.status(201).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = verifyEmailDto.parse(req.body)
    const result = await authService.verifyEmail(body.userId, body.otp)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = resendOtpDto.parse(req.body)
    const result = await authService.resendOtp(body.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginDto.parse(req.body)
    const result = await authService.login(body)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ success: true, accessToken: result.accessToken })
  } catch (err) {
    next(err)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) throw new Error('No refresh token')

    await authService.logout(refreshToken)

    res.clearCookie('refreshToken')
    res.json({ success: true, message: 'Đăng xuất thành công' })
  } catch (err) {
    next(err)
  }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) throw new Error('No refresh token')

    const result = await authService.refresh(refreshToken)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ success: true, accessToken: result.accessToken })
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = forgotPasswordDto.parse(req.body)
    const result = await authService.forgotPassword(body)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = resetPasswordDto.parse(req.body)
    const result = await authService.resetPassword(body)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}