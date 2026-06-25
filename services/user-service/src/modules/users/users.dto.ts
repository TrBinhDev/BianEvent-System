import { z } from 'zod'

export const updateProfileDto = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').optional(),
  avatarUrl: z.string().url('URL không hợp lệ').optional()
})

export const changePasswordDto = z.object({
  oldPassword: z.string().min(8, 'Mật khẩu cũ tối thiểu 8 ký tự'),
  newPassword: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
})

export const applyOrganizerDto = z.object({
  organization: z.string().min(2, 'Tên tổ chức tối thiểu 2 ký tự'),
  description: z.string().optional(),
  contactPhone: z.string().optional(),
})

export type UpdateProfileDto = z.infer<typeof updateProfileDto>
export type ChangePasswordDto = z.infer<typeof changePasswordDto>
export type ApplyOrganizerDto = z.infer<typeof applyOrganizerDto>