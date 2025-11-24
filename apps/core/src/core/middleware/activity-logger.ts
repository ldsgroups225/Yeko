import { createMiddleware } from '@tanstack/react-start'
// import { logActivity } from '@repo/data-ops'

/**
 * Middleware to log user activities
 * Tracks actions like view, create, update, delete, export
 *
 * TODO: This middleware needs proper auth context integration
 * Currently disabled due to missing context properties
 */
export const activityLoggerMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  // TODO: Implement activity logging when auth context is available
  // const startTime = Date.now()
  return await next({ context: {} })
})

// TODO: Uncomment when activity logging is properly implemented
/*
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
*/
