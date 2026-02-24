import { z } from 'zod'

export const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['M', 'F', 'other']).optional(),
  photoUrl: z.string().optional(),
  matricule: z.string().max(20).optional(),
  birthPlace: z.string().max(100).optional(),
  nationality: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(100).optional(),
  emergencyPhone: z.string().max(20).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  medicalNotes: z.string().max(1000).optional(),
  previousSchool: z.string().max(200).optional(),
  admissionDate: z.string().optional(),
})

export type StudentFormData = z.infer<typeof studentSchema>

export interface StudentFormProps {
  student?: StudentFormData & { id: string }
  mode: 'create' | 'edit'
}
