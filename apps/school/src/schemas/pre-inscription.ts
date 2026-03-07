import { z } from 'zod'

export const preInscriptionIdentificationSchema = z.object({
  schoolCode: z.string().min(1, 'Code établissement requis'),
  matricule: z.string().optional(),
})

export const preInscriptionCreateStudentSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  dob: z.string().min(1, 'La date de naissance est requise'),
  gender: z.enum(['M', 'F', 'other']),
  birthPlace: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
})

export const preInscriptionAcademicSelectionSchema = z.object({
  gradeId: z.string().min(1, 'Niveau requis'),
  classId: z.string().min(1, 'Classe requise'),
  seriesId: z.string().nullable().optional(),
  isOrphan: z.boolean().default(false),
  isStateAssigned: z.boolean().default(false),
  useCanteen: z.boolean().default(false),
  useTransport: z.boolean().default(false),
})

export const preInscriptionPaymentSchema = z.object({
  paymentMethod: z.enum(['mobile_money', 'cash', 'card']),
  mobileProvider: z.enum(['orange', 'mtn', 'moov', 'wave']).optional(),
  phoneNumber: z.string().optional(),
})

export const preInscriptionWizardStateSchema = z.object({
  step: z.number().int().min(1).max(6).default(1),
  identification: preInscriptionIdentificationSchema.optional(),
  student: z.object({
    id: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
    matricule: z.string().optional(),
    photoUrl: z.string().optional(),
    dob: z.string(),
    gender: z.enum(['M', 'F', 'other']),
  }).optional(),
  school: z.object({
    id: z.string(),
    name: z.string(),
    logoUrl: z.string().optional(),
  }).optional(),
  academic: preInscriptionAcademicSelectionSchema.optional(),
  payment: preInscriptionPaymentSchema.optional(),
})

export type PreInscriptionIdentification = z.infer<typeof preInscriptionIdentificationSchema>
export type PreInscriptionCreateStudent = z.infer<typeof preInscriptionCreateStudentSchema>
export type PreInscriptionAcademicSelection = z.infer<typeof preInscriptionAcademicSelectionSchema>
export type PreInscriptionPayment = z.infer<typeof preInscriptionPaymentSchema>
export type PreInscriptionWizardState = z.infer<typeof preInscriptionWizardStateSchema>
