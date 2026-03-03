export interface AppliedDiscount {
  id: string
  code: string
  name: string
}

export interface PreInscriptionFeeItem {
  id: string
  feeTypeId: string
  name: string
  code: string
  category: string
  originalAmount: number
  discountAmount: number
  amount: number
}

export interface PreInscriptionFeeSummary {
  fees: PreInscriptionFeeItem[]
  totalOriginal: number
  totalDiscount: number
  total: number
  appliedDiscounts: AppliedDiscount[]
}

export interface PreInscriptionFeePersistenceItem {
  feeStructureId: string
  originalAmount: string
  discountAmount: string
  finalAmount: string
}

export interface PreInscriptionFeePlanResult {
  summary: PreInscriptionFeeSummary
  rawStructureCount: number
  persistenceFees: PreInscriptionFeePersistenceItem[]
}
