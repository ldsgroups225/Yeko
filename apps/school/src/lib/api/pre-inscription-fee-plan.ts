import type { Discount, FeeType } from '@repo/data-ops/drizzle/school-schema'
import type { FeeStructureWithDetails } from '@repo/data-ops/queries/fee-structures'
import type { PreInscriptionAcademicSelection } from '../../schemas/pre-inscription'
import type {
  AppliedDiscount,
  PreInscriptionFeePlanResult,
} from './pre-inscription-fee-plan.types'
import { Result as R } from '@praha/byethrow'
import { getDiscounts } from '@repo/data-ops/queries/discounts'
import { getFeeStructuresWithTypes } from '@repo/data-ops/queries/fee-structures'
import { getFeeTypes } from '@repo/data-ops/queries/fee-types'

interface FeeLineComputation {
  feeStructureId: string
  feeTypeId: string
  name: string
  code: string
  category: string
  displayOrder: number
  originalAmountCents: number
  discountAmountCents: number
  finalAmountCents: number
}
const ORPHAN_KEYWORDS = ['orphan', 'orphelin', 'orpheline', 'orphelinat', 'orp']
const STATE_ASSIGNED_KEYWORDS = ['etat', 'state', 'bours', 'scholar', 'assign', 'subvention', 'gouvern']
function toCents(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0)
  if (!Number.isFinite(parsed)) {
    return 0
  }
  return Math.max(0, Math.round(parsed * 100))
}
const fromCents = (value: number) => Number((value / 100).toFixed(2))
const formatDecimal = (value: number) => (value / 100).toFixed(2)
function normalizeText(value: string | null | undefined): string {
  if (!value) {
    return ''
  }
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}
function includesAnyKeyword(value: string, keywords: string[]): boolean {
  return keywords.some(keyword => value.includes(keyword))
}
function shouldIncludeFeeType(feeType: FeeType, academic: PreInscriptionAcademicSelection): boolean {
  if (feeType.category === 'transport') {
    return academic.useTransport
  }
  if (feeType.category === 'meals') {
    return academic.useCanteen
  }
  return true
}
function matchesSeries(structureSeriesId: string | null, selectedSeriesId: string | null | undefined): boolean {
  if (!selectedSeriesId) {
    return !structureSeriesId
  }
  return !structureSeriesId || structureSeriesId === selectedSeriesId
}
function isDiscountInsideValidityWindow(discount: Discount, referenceDate: Date): boolean {
  const day = referenceDate.toISOString().slice(0, 10)
  if (discount.validFrom && discount.validFrom > day) {
    return false
  }
  if (discount.validUntil && discount.validUntil < day) {
    return false
  }
  return true
}
function isDiscountEligibleForAcademic(discount: Discount, academic: PreInscriptionAcademicSelection): boolean {
  const normalized = normalizeText(`${discount.code} ${discount.name} ${discount.nameEn ?? ''}`)
  const targetsOrphan = includesAnyKeyword(normalized, ORPHAN_KEYWORDS)
  const targetsStateAssigned = includesAnyKeyword(normalized, STATE_ASSIGNED_KEYWORDS)
  if (targetsOrphan && !academic.isOrphan) {
    return false
  }
  if (targetsStateAssigned && !academic.isStateAssigned) {
    return false
  }
  if (targetsOrphan || targetsStateAssigned) {
    return true
  }
  if (discount.type === 'financial_aid' || discount.type === 'scholarship') {
    return academic.isOrphan || academic.isStateAssigned || Boolean(discount.autoApply)
  }
  return Boolean(discount.autoApply)
}
function allocateByWeight(totalCents: number, weights: number[]): number[] {
  if (totalCents <= 0 || weights.length === 0) {
    return weights.map(() => 0)
  }
  const positiveWeights = weights.map(weight => Math.max(weight, 0))
  const sumWeights = positiveWeights.reduce((sum, value) => sum + value, 0)
  if (sumWeights <= 0) {
    return weights.map(() => 0)
  }
  const rawAllocations = positiveWeights.map(weight => (totalCents * weight) / sumWeights)
  const allocations = rawAllocations.map(value => Math.floor(value))
  let remainder = totalCents - allocations.reduce((sum, value) => sum + value, 0)
  const byFraction = rawAllocations
    .map((value, index) => ({ index, fraction: value - allocations[index]! }))
    .sort((a, b) => b.fraction - a.fraction)
  let cursor = 0
  while (remainder > 0 && byFraction.length > 0) {
    const target = byFraction[cursor % byFraction.length]!.index
    allocations[target] = (allocations[target] ?? 0) + 1
    remainder--
    cursor++
  }
  return allocations
}
function applyDiscounts(
  feeLines: FeeLineComputation[],
  discounts: Discount[],
): { feeLines: FeeLineComputation[], appliedDiscounts: AppliedDiscount[] } {
  const computedLines = feeLines.map(line => ({ ...line }))
  const appliedDiscounts: AppliedDiscount[] = []
  for (const discount of discounts) {
    const applicableIndexes = computedLines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) =>
        !discount.appliesToFeeTypes
        || discount.appliesToFeeTypes.length === 0
        || discount.appliesToFeeTypes.includes(line.feeTypeId),
      )
      .filter(({ line }) => line.finalAmountCents > 0)
      .map(item => item.index)
    if (applicableIndexes.length === 0) {
      continue
    }
    const availableByIndex = applicableIndexes.map((index) => {
      const line = computedLines[index]!
      return Math.max(0, line.originalAmountCents - line.discountAmountCents)
    })
    const totalAvailable = availableByIndex.reduce((sum, value) => sum + value, 0)
    if (totalAvailable <= 0) {
      continue
    }
    const maxDiscountCents = toCents(discount.maxDiscountAmount)
    let allocations: number[] = []
    if (discount.calculationType === 'percentage') {
      const percentage = Math.min(Math.max(Number(discount.value), 0), 100) / 100
      if (percentage <= 0) {
        continue
      }
      const rawWeights = availableByIndex.map(value => Math.round(value * percentage))
      let requestedTotal = rawWeights.reduce((sum, value) => sum + value, 0)
      if (maxDiscountCents > 0) {
        requestedTotal = Math.min(requestedTotal, maxDiscountCents)
      }
      requestedTotal = Math.min(requestedTotal, totalAvailable)
      if (requestedTotal <= 0) {
        continue
      }
      allocations = requestedTotal === rawWeights.reduce((sum, value) => sum + value, 0)
        ? rawWeights
        : allocateByWeight(requestedTotal, rawWeights.some(value => value > 0) ? rawWeights : availableByIndex)
    }
    else {
      let requestedTotal = toCents(discount.value)
      if (maxDiscountCents > 0) {
        requestedTotal = Math.min(requestedTotal, maxDiscountCents)
      }
      requestedTotal = Math.min(requestedTotal, totalAvailable)
      if (requestedTotal <= 0) {
        continue
      }
      allocations = allocateByWeight(requestedTotal, availableByIndex)
    }
    let appliedTotal = 0
    allocations.forEach((allocation, localIndex) => {
      const lineIndex = applicableIndexes[localIndex]
      if (lineIndex === undefined || allocation <= 0) {
        return
      }
      const line = computedLines[lineIndex]
      if (!line) {
        return
      }
      const remaining = line.originalAmountCents - line.discountAmountCents
      const applied = Math.min(allocation, remaining)
      if (applied <= 0) {
        return
      }
      line.discountAmountCents += applied
      line.finalAmountCents = line.originalAmountCents - line.discountAmountCents
      appliedTotal += applied
    })
    if (appliedTotal > 0) {
      appliedDiscounts.push({
        id: discount.id,
        code: discount.code,
        name: discount.name,
      })
    }
  }
  return { feeLines: computedLines, appliedDiscounts }
}
export async function computePreInscriptionFeePlan(params: {
  schoolId: string
  schoolYearId: string
  gradeId: string
  seriesId?: string | null
  academic: PreInscriptionAcademicSelection
  isNewStudent: boolean
}): Promise<{ success: true, data: PreInscriptionFeePlanResult } | { success: false, error: string }> {
  const structuresResult = await getFeeStructuresWithTypes({
    schoolId: params.schoolId,
    schoolYearId: params.schoolYearId,
    gradeId: params.gradeId,
  })
  if (R.isFailure(structuresResult)) {
    return { success: false as const, error: 'Impossible de récupérer la grille des frais' }
  }
  const feeTypesResult = await getFeeTypes({ schoolId: params.schoolId })
  if (R.isFailure(feeTypesResult)) {
    return { success: false as const, error: 'Impossible de récupérer les types de frais' }
  }
  const feeTypeMap = new Map<string, FeeType>(feeTypesResult.value.map(feeType => [feeType.id, feeType]))
  const scopedStructures = (structuresResult.value as FeeStructureWithDetails[]).filter(structure =>
    matchesSeries(structure.seriesId ?? null, params.seriesId),
  )
  const initialFeeLines: FeeLineComputation[] = []
  for (const structure of scopedStructures) {
    const feeType = feeTypeMap.get(structure.feeTypeId)
    if (!feeType || !shouldIncludeFeeType(feeType, params.academic)) {
      continue
    }
    const sourceAmount = params.isNewStudent && structure.newStudentAmount ? structure.newStudentAmount : structure.amount
    const originalAmountCents = toCents(sourceAmount)
    initialFeeLines.push({
      feeStructureId: structure.id,
      feeTypeId: structure.feeTypeId,
      name: structure.feeTypeName,
      code: structure.feeTypeCode,
      category: feeType.category,
      displayOrder: feeType.displayOrder ?? 0,
      originalAmountCents,
      discountAmountCents: 0,
      finalAmountCents: originalAmountCents,
    })
  }
  initialFeeLines.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'fr'))
  const discountsResult = await getDiscounts({ schoolId: params.schoolId })
  if (R.isFailure(discountsResult)) {
    return { success: false as const, error: 'Impossible de récupérer les réductions' }
  }
  const now = new Date()
  const applicableDiscounts = discountsResult.value.filter(discount =>
    !discount.requiresApproval
    && isDiscountInsideValidityWindow(discount, now)
    && isDiscountEligibleForAcademic(discount, params.academic),
  )
  const { feeLines: discountedLines, appliedDiscounts } = applyDiscounts(initialFeeLines, applicableDiscounts)
  const totalOriginalCents = discountedLines.reduce((sum, line) => sum + line.originalAmountCents, 0)
  const totalDiscountCents = discountedLines.reduce((sum, line) => sum + line.discountAmountCents, 0)
  const totalFinalCents = discountedLines.reduce((sum, line) => sum + line.finalAmountCents, 0)
  return {
    success: true as const,
    data: {
      rawStructureCount: scopedStructures.length,
      summary: {
        fees: discountedLines.map(line => ({
          id: line.feeStructureId,
          feeTypeId: line.feeTypeId,
          name: line.name,
          code: line.code,
          category: line.category,
          originalAmount: fromCents(line.originalAmountCents),
          discountAmount: fromCents(line.discountAmountCents),
          amount: fromCents(line.finalAmountCents),
        })),
        totalOriginal: fromCents(totalOriginalCents),
        totalDiscount: fromCents(totalDiscountCents),
        total: fromCents(totalFinalCents),
        appliedDiscounts,
      },
      persistenceFees: discountedLines.map(line => ({
        feeStructureId: line.feeStructureId,
        originalAmount: formatDecimal(line.originalAmountCents),
        discountAmount: formatDecimal(line.discountAmountCents),
        finalAmount: formatDecimal(line.finalAmountCents),
      })),
    },
  }
}
