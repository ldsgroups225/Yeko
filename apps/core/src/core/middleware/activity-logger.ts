import type { MiddlewareFn } from '@tanstack/react-start'
import { logActivity } from '@repo/data-ops'

/**
 * Middleware to log user activities
 * Tracks actions like view, create, update, delete, export
 */
export const activityLoggerMiddleware: MiddlewareFn = async ({ next, context }) => {
  const startTime = Date.now()

  try {
    // Execute the handler
    const result = await next()

    // Log successful activity
    if (context.user) {
      const action = determineAction(context)
      const resource = determineResource(context)

      if (action && resource) {
        await logActivity({
          userId: context.user.id,
          schoolId: context.schoolId || null,
          action,
          resource,
          resourceId: context.resourceId || null,
          metadata: {
            path: context.path,
            method: context.method,
            duration: Date.now() - startTime,
          },
          ipAddress: context.ipAddress || null,
          userAgent: context.userAgent || null,
        }).catch((error) => {
          // Don't fail the request if logging fails
          console.error('Failed to log activity:', error)
        })
      }
    }

    return result
  }
  catch (error) {
    // Log failed activity
    if (context.user) {
      await logActivity({
        userId: context.user.id,
        schoolId: context.schoolId || null,
        action: 'error',
        resource: determineResource(context) || 'unknown',
        metadata: {
          path: context.path,
          method: context.method,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
        },
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
      }).catch((logError) => {
        console.error('Failed to log error activity:', logError)
      })
    }

    throw error
  }
}

/**
 * Determine the action from the context
 */
function determineAction(context: any): string | null {
  const method = context.method?.toUpperCase()
  const path = context.path || ''

  if (method === 'GET') {
    if (path.includes('/export'))
      return 'export'
    return 'view'
  }
  if (method === 'POST')
    return 'create'
  if (method === 'PUT' || method === 'PATCH')
    return 'update'
  if (method === 'DELETE')
    return 'delete'

  return null
}

/**
 * Determine the resource from the context
 */
function determineResource(context: any): string | null {
  const path = context.path || ''

  if (path.includes('/schools'))
    return 'school'
  if (path.includes('/analytics'))
    return 'analytics'
  if (path.includes('/catalogs'))
    return 'catalog'
  if (path.includes('/programs'))
    return 'program'
  if (path.includes('/coefficients'))
    return 'coefficient'
  if (path.includes('/grades'))
    return 'grade'
  if (path.includes('/subjects'))
    return 'subject'
  if (path.includes('/tracks'))
    return 'track'
  if (path.includes('/series'))
    return 'series'
  if (path.includes('/dashboard'))
    return 'dashboard'

  return null
}

/**
 * Helper to manually log an activity (for client-side actions)
 */
export async function logUserActivity(params: {
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
}) {
  try {
    // This would be called from a server function
    await logActivity({
      userId: null, // Will be set by middleware
      schoolId: null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || null,
      metadata: params.metadata || null,
      ipAddress: null,
      userAgent: null,
    })
  }
  catch (error) {
    console.error('Failed to log user activity:', error)
  }
}
