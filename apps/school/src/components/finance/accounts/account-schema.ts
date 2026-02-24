import { z } from 'zod'
import { accountTypes, normalBalances } from '@/schemas/account'

export const accountFormSchema = z.object({
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  nameEn: z.string().max(100).optional(),
  type: z.enum(accountTypes, { message: 'Type de compte invalide' }),
  normalBalance: z.enum(normalBalances, { message: 'Solde normal invalide' }),
  isHeader: z.boolean(),
  description: z.string().max(500).optional(),
})

export type AccountFormData = z.infer<typeof accountFormSchema>

export interface Account extends AccountFormData {
  id: string
}
