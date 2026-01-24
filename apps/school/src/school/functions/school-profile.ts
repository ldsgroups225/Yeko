import {
  getSchoolProfile as getSchoolProfileQuery,
  updateSchoolLogo as updateSchoolLogoQuery,
  updateSchoolProfile as updateSchoolProfileQuery,
  updateSchoolSettings as updateSchoolSettingsQuery,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  defaultSchoolSettings,
  schoolSettingsSchema,
  updateSchoolProfileSchema,
} from '@/schemas/school-profile'
import { getSchoolContext } from '../middleware/school-context'

/**
 * Get current school profile
 */
export const getSchoolProfile = createServerFn().handler(async () => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')

  const school = await getSchoolProfileQuery(context.schoolId)

  if (!school)
    throw new Error('School not found')

  // Merge default settings with stored settings
  const settings = {
    ...defaultSchoolSettings,
    ...((school.settings as Record<string, unknown>) ?? {}),
  }

  return {
    ...school,
    settings,
  }
})

/**
 * Update school profile (name, address, phone, email)
 */
export const updateSchoolProfile = createServerFn()
  .inputValidator(updateSchoolProfileSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const updated = await updateSchoolProfileQuery(context.schoolId, {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email || null,
    })

    if (!updated)
      return undefined
    return {
      ...updated,
      settings: updated.settings as Record<string, any> | null,
    }
  })

/**
 * Update school settings (JSONB)
 */
export const updateSchoolSettings = createServerFn()
  .inputValidator(schoolSettingsSchema.partial())
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const updated = await updateSchoolSettingsQuery(context.schoolId, {
      ...defaultSchoolSettings,
      ...data,
    })

    if (!updated)
      return undefined
    return {
      ...updated,
      settings: updated.settings as Record<string, any> | null,
    }
  })

/**
 * IconUpload school logo
 */
export const updateSchoolLogo = createServerFn()
  .inputValidator(z.object({ logoUrl: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const updated = await updateSchoolLogoQuery(context.schoolId, data.logoUrl)

    if (!updated)
      return undefined
    return {
      ...updated,
      settings: updated.settings as Record<string, any> | null,
    }
  })

/**
 * Remove school logo
 */
export const removeSchoolLogo = createServerFn().handler(async () => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')

  const updated = await updateSchoolLogoQuery(context.schoolId, null)

  if (!updated)
    return undefined
  return {
    ...updated,
    settings: updated.settings as Record<string, any> | null,
  }
})
