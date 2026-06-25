import { z } from 'zod'

export const updateUserRoleDto = z.object({
  role: z.enum(['USER', 'ORGANIZER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role không hợp lệ' }),
  }),
})

export const updateUserStatusDto = z.object({
  status: z.enum(['ACTIVE', 'BANNED'], {
    errorMap: () => ({ message: 'Status không hợp lệ' }),
  }),
})

export const getUsersQueryDto = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
  role: z.enum(['USER', 'ORGANIZER', 'ADMIN']).optional(),
  status: z.enum(['UNVERIFIED', 'ACTIVE', 'BANNED']).optional(),
})

export const getApplicationsQueryDto = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
})

export type UpdateUserRoleDto = z.infer<typeof updateUserRoleDto>
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusDto>
export type GetUsersQueryDto = z.infer<typeof getUsersQueryDto>
export type GetApplicationsQueryDto = z.infer<typeof getApplicationsQueryDto>