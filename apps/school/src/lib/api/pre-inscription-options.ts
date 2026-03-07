import type { Discount, FeeType } from '@repo/data-ops/drizzle/school-schema'
import type { FeeStructureWithDetails } from '@repo/data-ops/queries/fee-structures'
import { Result as R } from '@praha/byethrow'
import { getDiscounts } from '@repo/data-ops/queries/discounts'
import { getFeeStructuresWithTypes } from '@repo/data-ops/queries/fee-structures'
import { getFeeTypes } from '@repo/data-ops/queries/fee-types'

export const PRE_INSCRIPTION_OPTION_KEYS = [
  'useTransport',
  'useCanteen',
  'isOrphan',
  'isStateAssigned',
] as const

export type PreInscriptionOptionKey = typeof PRE_INSCRIPTION_OPTION_KEYS[number]

interface ClassFinanceContext {
  classId: string
  gradeId: string
  seriesId: string | null
}

const ORPHAN_KEYWORDS = ['orphan', 'orphelin', 'orpheline', 'orphelinat', 'orp']
const STATE_ASSIGNED_KEYWORDS = ['etat', 'state', 'bours', 'scholar', 'assign', 'subvention', 'gouvern']

function normalizeText(value: string | null | undefined): string {
  if (!value) {
    return ''
  }
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '').toLowerCase()
}

function includesAnyKeyword(value: string, keywords: string[]): boolean {
  return keywords.some(keyword => value.includes(keyword))
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

function resolveDiscountTargets(discount: Discount): { isOrphan: boolean, isStateAssigned: boolean } {
  const normalized = normalizeText(`${discount.code} ${discount.name} ${discount.nameEn ?? ''}`)

  return {
    isOrphan: includesAnyKeyword(normalized, ORPHAN_KEYWORDS),
    isStateAssigned: includesAnyKeyword(normalized, STATE_ASSIGNED_KEYWORDS),
  }
}

function matchesSeries(structureSeriesId: string | null, classSeriesId: string | null): boolean {
  if (!classSeriesId) {
    return !structureSeriesId
  }
  return !structureSeriesId || structureSeriesId === classSeriesId
}

function intersects(first: Set<string>, second: string[]): boolean {
  return second.some(item => first.has(item))
}

export async function resolvePreInscriptionOptionsByClass(params: {
  schoolId: string
  schoolYearId: string
  classes: ClassFinanceContext[]
}): Promise<
  { success: true, data: Map<string, PreInscriptionOptionKey[]> }
  | { success: false, error: string }
> {
  if (params.classes.length === 0) {
    return { success: true as const, data: new Map() }
  }

  const [structuresResult, feeTypesResult, discountsResult] = await Promise.all([
    getFeeStructuresWithTypes({
      schoolId: params.schoolId,
      schoolYearId: params.schoolYearId,
    }),
    getFeeTypes({
      schoolId: params.schoolId,
    }),
    getDiscounts({
      schoolId: params.schoolId,
    }),
  ])

  if (R.isFailure(structuresResult)) {
    return { success: false as const, error: 'Impossible de récupérer les structures de frais' }
  }
  if (R.isFailure(feeTypesResult)) {
    return { success: false as const, error: 'Impossible de récupérer les types de frais' }
  }
  if (R.isFailure(discountsResult)) {
    return { success: false as const, error: 'Impossible de récupérer les réductions' }
  }

  const feeTypeMap = new Map<string, FeeType>(
    feeTypesResult.value.map(feeType => [feeType.id, feeType]),
  )
  const structures = structuresResult.value as FeeStructureWithDetails[]
  const now = new Date()

  const optionsByClass = new Map<string, PreInscriptionOptionKey[]>()

  for (const cls of params.classes) {
    const classStructures = structures.filter(structure =>
      structure.gradeId === cls.gradeId
      && matchesSeries(structure.seriesId ?? null, cls.seriesId),
    )

    const classFeeTypeIds = new Set(classStructures.map(structure => structure.feeTypeId))
    const classFeeTypes = classStructures
      .map(structure => feeTypeMap.get(structure.feeTypeId))
      .filter((feeType): feeType is FeeType => Boolean(feeType))

    const available = new Set<PreInscriptionOptionKey>()

    if (classFeeTypes.some(feeType => feeType.category === 'transport')) {
      available.add('useTransport')
    }
    if (classFeeTypes.some(feeType => feeType.category === 'meals')) {
      available.add('useCanteen')
    }

    for (const discount of discountsResult.value) {
      if (discount.requiresApproval) {
        continue
      }
      if (!isDiscountInsideValidityWindow(discount, now)) {
        continue
      }

      const appliesToFeeTypes = discount.appliesToFeeTypes ?? []
      if (appliesToFeeTypes.length > 0 && !intersects(classFeeTypeIds, appliesToFeeTypes)) {
        continue
      }

      const targets = resolveDiscountTargets(discount)
      if (targets.isOrphan) {
        available.add('isOrphan')
      }
      if (targets.isStateAssigned) {
        available.add('isStateAssigned')
      }
    }

    optionsByClass.set(
      cls.classId,
      PRE_INSCRIPTION_OPTION_KEYS.filter(option => available.has(option)),
    )
  }

  return { success: true as const, data: optionsByClass }
}
