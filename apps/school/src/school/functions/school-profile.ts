import {
  getSchoolProfile as getSchoolProfileQuery,
  updateSchoolLogo as updateSchoolLogoQuery,
  updateSchoolProfile as updateSchoolProfileQuery,
  updateSchoolSettings as updateSchoolSettingsQuery,
} from '@repo/data-ops'
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

  return (await getSchoolProfileQuery(schoolId)).match(
    (school) => {
      if (!school)
        return { success: false as const, error: 'Établissement non trouvé' }

      // Merge default settings with stored settings
      const settings = {
        ...defaultSchoolSettings,
        ...((school.settings as Record<string, unknown>) ?? {}),
      }

      return {
        success: true as const,
        data: {
          ...school,
          settings,
        },
      }
    },
    error => ({ success: false as const, error: error.message || 'Erreur lors de la récupération du profil' }),
  )
})

/**
 * Update school profile (name, address, phone, email)
 */
export const updateSchoolProfile = authServerFn
  .inputValidator(updateSchoolProfileSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await updateSchoolProfileQuery(context.school.schoolId, {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
    })).match(
      (updated) => {
        if (!updated)
          return { success: false as const, error: 'Erreur lors de la mise à jour' }
        return {
          success: true as const,
          data: {
            ...updated,
            settings: updated.settings as Record<string, any> | null,
          },
        }
      },
      error => ({ success: false as const, error: error.message || 'Erreur lors de la mise à jour' }),
    )
  })

/**
 * Update school settings (JSONB)
 */
export const updateSchoolSettings = authServerFn
  .inputValidator(schoolSettingsSchema.partial())
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await updateSchoolSettingsQuery(context.school.schoolId, {
      ...defaultSchoolSettings,
      ...data,
    })).match(
      (updated) => {
        if (!updated)
          return { success: false as const, error: 'Erreur lors de la mise à jour' }
        return {
          success: true as const,
          data: {
            ...updated,
            settings: updated.settings as Record<string, any> | null,
          },
        }
      },
      error => ({ success: false as const, error: error.message || 'Erreur lors de la mise à jour des paramètres' }),
    )
  })

/**
 * Update school logo
 */
export const updateSchoolLogo = authServerFn
  .inputValidator(z.object({ logoUrl: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await updateSchoolLogoQuery(context.school.schoolId, data.logoUrl)).match(
      (updated) => {
        if (!updated)
          return { success: false as const, error: 'Erreur lors de la mise à jour' }
        return {
          success: true as const,
          data: {
            ...updated,
            settings: updated.settings as Record<string, any> | null,
          },
        }
      },
      error => ({ success: false as const, error: error.message || 'Erreur lors de la mise à jour du logo' }),
    )
  })

/**
 * Remove school logo
 */
export const removeSchoolLogo = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  return (await updateSchoolLogoQuery(context.school.schoolId, null)).match(
    (updated) => {
      if (!updated)
        return { success: false as const, error: 'Erreur lors de la mise à jour' }
      return {
        success: true as const,
        data: {
          ...updated,
          settings: updated.settings as Record<string, any> | null,
        },
      }
    },
    error => ({ success: false as const, error: error.message || 'Erreur lors de la suppression du logo' }),
  )
})
