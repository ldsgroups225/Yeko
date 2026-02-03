import { z } from 'zod'

// Teacher validation schema
export const teacherSchema = z.object({
  userId: z.string().min(1, 'Utilisateur requis'),
  subjectIds: z.array(z.string()).min(1, 'Au moins une matière requise'),
  specialization: z.string().optional().nullable(),
  hireDate: z
    .date()
    .optional()
    .nullable()
    .refine(
      date => !date || date <= new Date(),
      'La date d\'embauche ne peut pas être dans le futur',
    ),
  status: z.enum(['active', 'inactive', 'on_leave'], {
    message: 'Statut invalide',
  }),
})

export const teacherCreateSchema = teacherSchema
export const teacherUpdateSchema = teacherSchema.partial().extend({
  subjectIds: z.array(z.string()).optional(),
})

// Aliases for backward compatibility
export const createTeacherSchema = teacherCreateSchema
export const updateTeacherSchema = teacherUpdateSchema

// Teacher with new user creation
export const teacherWithUserSchema = z.object({
  // IconUser fields
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional().nullable(),
  // Teacher fields
  subjectIds: z.array(z.string()).min(1, 'Au moins une matière requise'),
  specialization: z.string().optional().nullable(),
  hireDate: z.date().optional().nullable(),
  status: z.enum(['active', 'inactive', 'on_leave']),
})

export type TeacherFormData = z.infer<typeof teacherSchema>
export type CreateTeacherData = z.infer<typeof createTeacherSchema>
export type UpdateTeacherData = z.infer<typeof updateTeacherSchema>
export type TeacherWithUserData = z.infer<typeof teacherWithUserSchema>
