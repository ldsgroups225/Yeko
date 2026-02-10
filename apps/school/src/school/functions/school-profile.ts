import { Result as R } from '@praha/byethrow'
import {
  getSchoolProfile as getSchoolProfileQuery,
  updateSchoolLogo as updateSchoolLogoQuery,
  updateSchoolProfile as updateSchoolProfileQuery,
  updateSchoolSettings as updateSchoolSettingsQuery,
} from '@repo/data-ops/queries/schools'
import { z } from 'zod'
import {
  defaultSchoolSettings,
  schoolSettingsSchema,
  updateSchoolProfileSchema,
} from '@/schemas/school-profile'
import { authServerFn } from '../lib/server-fn'

/**
 * Get current school profile
 */
export const getSchoolProfile = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  const { schoolId } = context.school

  const _result1 = await getSchoolProfileQuery(schoolId)
  if (R.isFailure(_result1))
    return { success: false as const, error: _result1.error.message || 'Erreur lors de la récupération du profil' }

  if (!_result1.value)
    return { success: false as const, error: 'Établissement non trouvé' }

  // Merge default settings with stored settings
  const settings = {
    ...defaultSchoolSettings,
    ...((_result1.value.settings as Record<string, unknown>) ?? {}),
  }

  return {
    success: true as const,
    data: {
      ..._result1.value,
      settings,
    },
  }
})

/**
 * Update school profile (name, address, phone, email)
 */
export const updateSchoolProfile = authServerFn
  .inputValidator(updateSchoolProfileSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result2 = await updateSchoolProfileQuery(context.school.schoolId, {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
    })
    if (R.isFailure(_result2))
      return { success: false as const, error: _result2.error.message || 'Erreur lors de la mise à jour' }

    if (!_result2.value)
      return { success: false as const, error: 'Erreur lors de la mise à jour' }

    return {
      success: true as const,
      data: {
        ..._result2.value,
        settings: _result2.value.settings as Record<string, any> | null,
      },
    }
  })

/**
 * Update school settings (JSONB)
 */
export const updateSchoolSettings = authServerFn
  .inputValidator(schoolSettingsSchema.partial())
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result3 = await updateSchoolSettingsQuery(context.school.schoolId, {
      ...defaultSchoolSettings,
      ...data,
    })
    if (R.isFailure(_result3))
      return { success: false as const, error: _result3.error.message || 'Erreur lors de la mise à jour des paramètres' }

    if (!_result3.value)
      return { success: false as const, error: 'Erreur lors de la mise à jour' }

    return {
      success: true as const,
      data: {
        ..._result3.value,
        settings: _result3.value.settings as Record<string, any> | null,
      },
    }
  })

/**
 * Update school logo
 */
export const updateSchoolLogo = authServerFn
  .inputValidator(z.object({ logoUrl: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result4 = await updateSchoolLogoQuery(context.school.schoolId, data.logoUrl)
    if (R.isFailure(_result4))
      return { success: false as const, error: _result4.error.message || 'Erreur lors de la mise à jour du logo' }

    if (!_result4.value)
      return { success: false as const, error: 'Erreur lors de la mise à jour' }

    return {
      success: true as const,
      data: {
        ..._result4.value,
        settings: _result4.value.settings as Record<string, any> | null,
      },
    }
  })

/**
 * Remove school logo
 */
export const removeSchoolLogo = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  const _result5 = await updateSchoolLogoQuery(context.school.schoolId, null)
  if (R.isFailure(_result5))
    return { success: false as const, error: _result5.error.message || 'Erreur lors de la suppression du logo' }

  if (!_result5.value)
    return { success: false as const, error: 'Erreur lors de la mise à jour' }

  return {
    success: true as const,
    data: {
      ..._result5.value,
      settings: _result5.value.settings as Record<string, any> | null,
    },
  }
})
