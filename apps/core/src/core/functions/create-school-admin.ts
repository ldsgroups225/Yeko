import { R } from '@praha/byethrow'
import { getAuth } from '@repo/data-ops/auth/server'
import { getRoleBySlug } from '@repo/data-ops/queries/school-admin/roles'
import { createUserWithSchool } from '@repo/data-ops/queries/school-admin/users'
import { getSchoolById } from '@repo/data-ops/queries/schools'
import { sendWelcomeEmail } from '@repo/data-ops/services/email'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

/**
 * Generate a random password
 */
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += charset[array[i]! % charset.length]
  }
  return password
}

/**
 * Create a school administrator account
 * Creates auth user with email/password and links to school with admin role
 */
export const createSchoolAdmin = createServerFn({ method: 'POST' })
  .middleware([protectedFunctionMiddleware])
  .inputValidator(
    (data: unknown) => z.object({
      schoolId: z.string(),
      email: z.email(),
      name: z.string().min(2),
      message: z.string().optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { email, name, schoolId } = data
    const auth = getAuth()

    try {
      // Generate random password
      const password = generateRandomPassword()

      // Create auth user with email/password
      const authUser = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      })

      if (!authUser?.user) {
        throw new Error('Failed to create auth user')
      }

      // Get school_director role
      const adminRole = await getRoleBySlug('school_director')

      if (!adminRole) {
        throw new Error('School director role not found')
      }

      // Create user in school system and link to school
      const user = await createUserWithSchool({
        email,
        name,
        authUserId: authUser.user.id,
        schoolId,
        roleIds: [adminRole.id],
      })

      // Get school name for email
      const schoolResult = await getSchoolById(schoolId)
      if (R.isFailure(schoolResult))
        throw schoolResult.error
      const school = schoolResult.value
      const schoolName = school?.name || 'Votre école'

      // In development, log credentials to console
      const isDevelopment = import.meta.env.DEV
      if (isDevelopment) {
        console.warn('\n==============================================')
        console.warn('🔐 NEW SCHOOL ADMINISTRATOR ACCOUNT CREATED')
        console.warn('==============================================')
        console.warn(`Email:    ${email}`)
        console.warn(`Password: ${password}`)
        console.warn(`Name:     ${name}`)
        console.warn(`School:   ${schoolName}`)
        console.warn('==============================================\n')
      }
      else {
        // Production: Send welcome email with credentials
        const loginUrl = `${import.meta.env.APP_URL || 'https://school.yeko.app'}/login`
        const emailResult = await sendWelcomeEmail({
          to: email,
          name,
          email,
          password,
          schoolName,
          loginUrl,
        })

        if (!emailResult.success) {
          // Log error but don't throw - user is created, just log the failure
          console.error('Failed to send welcome email:', emailResult.error)
        }
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        // Only return password in development
        ...(isDevelopment && { password }),
      }
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Error creating school admin:', error)

      // Handle duplicate email error
      if (message.includes('duplicate') || message.includes('unique')) {
        throw new Error('Un utilisateur avec cet email existe déjà')
      }

      throw new Error(message || 'Erreur lors de la création du compte administrateur')
    }
  })
