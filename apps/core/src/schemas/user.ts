import { z } from 'zod'

export const getSchoolUsersSchema = z.object({
  schoolId: z.string().uuid(),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  roleId: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export type GetSchoolUsersInput = z.infer<typeof getSchoolUsersSchema>

export const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  schoolId: z.string().uuid(),
})

export type SuspendUserInput = z.infer<typeof suspendUserSchema>

export const removeUserSchema = z.object({
  userId: z.string().uuid(),
  schoolId: z.string().uuid(),
})

export type RemoveUserInput = z.infer<typeof removeUserSchema>
