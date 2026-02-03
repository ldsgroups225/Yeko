import { z } from 'zod'

// Staff positions
export const staffPositions = [
  'academic_coordinator',
  'discipline_officer',
  'accountant',
  'cashier',
  'registrar',
  'other',
] as const

// Staff validation schema
export const staffSchema = z.object({
  userId: z.string().min(1, 'Utilisateur requis'),
  position: z.enum(staffPositions, {
    message: 'Poste invalide',
  }),
  department: z.string().optional().nullable(),
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

export const createStaffSchema = staffSchema

export const updateStaffSchema = staffSchema.partial()

// Staff with new user creation
export const staffWithUserSchema = z.object({
  // IconUser fields
  name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional().nullable(),
  // Staff fields
  position: z.enum(staffPositions),
  department: z.string().optional().nullable(),
  hireDate: z.date().optional().nullable(),
  status: z.enum(['active', 'inactive', 'on_leave']),
})

export type StaffFormData = z.infer<typeof staffSchema>
export type CreateStaffData = z.infer<typeof createStaffSchema>
export type UpdateStaffData = z.infer<typeof updateStaffSchema>
export type StaffWithUserData = z.infer<typeof staffWithUserSchema>
export type StaffPosition = (typeof staffPositions)[number]
