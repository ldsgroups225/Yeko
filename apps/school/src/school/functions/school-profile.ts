import { eq, getDb, schools } from '@repo/data-ops'
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

  const db = getDb()
  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, context.schoolId))
    .limit(1)

  if (!school)
    throw new Error('School not found')

  // Merge default settings with stored settings
  const settings = {
    ...defaultSchoolSettings,
    ...(school.settings as Record<string, unknown> ?? {}),
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

    const db = getDb()
    const [updated] = await db
      .update(schools)
      .set({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email || null,
      })
      .where(eq(schools.id, context.schoolId))
      .returning()

    if (!updated)
      return undefined
    return { ...updated, settings: updated.settings as Record<string, any> | null }
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

    const db = getDb()
    // Get current settings
    const [school] = await db
      .select({ settings: schools.settings })
      .from(schools)
      .where(eq(schools.id, context.schoolId))
      .limit(1)

    // Merge with new settings
    const currentSettings = (school?.settings as Record<string, unknown>) ?? {}
    const newSettings = {
      ...defaultSchoolSettings,
      ...currentSettings,
      ...data,
    }

    const [updated] = await db
      .update(schools)
      .set({ settings: newSettings })
      .where(eq(schools.id, context.schoolId))
      .returning()

    if (!updated)
      return undefined
    return { ...updated, settings: updated.settings as Record<string, any> | null }
  })

/**
 * Upload school logo
 */
export const updateSchoolLogo = createServerFn()
  .inputValidator(z.object({ logoUrl: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const db = getDb()
    const [updated] = await db
      .update(schools)
      .set({ logoUrl: data.logoUrl })
      .where(eq(schools.id, context.schoolId))
      .returning()

    if (!updated)
      return undefined
    return { ...updated, settings: updated.settings as Record<string, any> | null }
  })

/**
 * Remove school logo
 */
export const removeSchoolLogo = createServerFn().handler(async () => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')

  const db = getDb()
  const [updated] = await db
    .update(schools)
    .set({ logoUrl: null })
    .where(eq(schools.id, context.schoolId))
    .returning()

  if (!updated)
    return undefined
  return { ...updated, settings: updated.settings as Record<string, any> | null }
})
