export interface FeeBreakdownItem {
  feeStructureId: string
  feeTypeId: string
  feeTypeName: string
  feeTypeCategory: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  isNewStudent: boolean
}

export interface FeeItem {
  fee_structures: {
    id: string
    amount: string | number
    newStudentAmount?: string | number | null
    gradeId: string | null
    seriesId: string | null
  }
  fee_types: {
    id: string
    name: string
    category: string
  }
}

export interface StudentDiscountItem {
  discount: {
    id: string
    appliesToFeeTypes: string[] | null
    calculationType: 'percentage' | 'fixed'
    value: string | number
    maxDiscountAmount?: string | number | null
  }
  calculatedAmount?: string | number
}
