import { z } from 'zod'

// Account types
export const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
export type AccountType = (typeof accountTypes)[number]

// Normal balance types
export const normalBalances = ['debit', 'credit'] as const
export type NormalBalance = (typeof normalBalances)[number]

// Account status
export const accountStatuses = ['active', 'inactive'] as const
export type AccountStatus = (typeof accountStatuses)[number]

// Create account schema
export const createAccountSchema = z.object({
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  nameEn: z.string().max(100).optional(),
  type: z.enum(accountTypes, { message: 'IconTypography de compte invalide' }),
  parentId: z.string().optional().nullable(),
  isHeader: z.boolean().default(false),
  normalBalance: z.enum(normalBalances, { message: 'Solde normal invalide' }),
  description: z.string().max(500).optional(),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>

// Update account schema
export const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.string().min(1),
  status: z.enum(accountStatuses).optional(),
})

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>

// Account type labels (French)
export const accountTypeLabels: Record<AccountType, string> = {
  asset: 'Actif',
  liability: 'Passif',
  equity: 'Capitaux propres',
  revenue: 'Produits',
  expense: 'Charges',
}

// Normal balance labels (French)
export const normalBalanceLabels: Record<NormalBalance, string> = {
  debit: 'Débit',
  credit: 'Crédit',
}
