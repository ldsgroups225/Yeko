import { getAuth } from '@repo/data-ops/auth/server'
import { getRoleBySlug } from '@repo/data-ops/queries/school-admin/roles'
import { createUserWithSchool } from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { protectedFunctionMiddleware } from '@/core/middleware/auth'

const createSchoolAdminSchema = z.object({
  schoolId: z.uuid(),
  email: z.email(),
  name: z.string().min(2),
})

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
export const createSchoolAdmin = createServerFn()
  .middleware([protectedFunctionMiddleware])
  .inputValidator((data: z.infer<typeof createSchoolAdminSchema>) => {
    return createSchoolAdminSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const { schoolId, email, name } = data
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

      // Get school_administrator role
      const adminRole = await getRoleBySlug('school_administrator')
      if (!adminRole) {
        throw new Error('School administrator role not found')
      }

      // Create user in school system and link to school
      const user = await createUserWithSchool({
        email,
        name,
        authUserId: authUser.user.id,
        schoolId,
        roleIds: [adminRole.id],
      })

      // In development, log credentials to console
      const isDevelopment = import.meta.env.DEV
      if (isDevelopment) {
        console.log('\n==============================================')
        console.log('🔐 NEW SCHOOL ADMINISTRATOR ACCOUNT CREATED')
        console.log('==============================================')
        console.log(`Email:    ${email}`)
        console.log(`Password: ${password}`)
        console.log(`Name:     ${name}`)
        console.log(`School:   ${schoolId}`)
        console.log('==============================================\n')
      }

      // TODO: In production, send email with credentials
      // await sendWelcomeEmail({ email, password, name })

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
    catch (error: any) {
      console.error('Error creating school admin:', error)

      // Handle duplicate email error
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        throw new Error('Un utilisateur avec cet email existe déjà')
      }

      throw new Error(error.message || 'Erreur lors de la création du compte administrateur')
    }
  })
