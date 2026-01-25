import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

// Helper to load ops dynamically
const loadDataOps = () => import('@repo/data-ops')
const loadAuth = () => import('@repo/data-ops/auth/server')

/**
 *
 * Middleware to log user activities
 * Tracks actions like view, create, update, delete, export
 * Uses batch processing to avoid blocking requests
 */

// Activity log queue for batch processing
const activityQueue: Array<{
  userId: string
  schoolId: string | null
  action: string
  resource: string
  resourceId: string | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
}> = []

// Flush interval (5 seconds)
let flushTimeout: ReturnType<typeof setTimeout> | null = null
const FLUSH_INTERVAL = 5000
const MAX_QUEUE_SIZE = 50

async function flushActivityQueue() {
  if (activityQueue.length === 0)
    return

  const logsToInsert = [...activityQueue]
  activityQueue.length = 0 // Clear queue

  // Insert logs in batch (fire and forget)
  for (const log of logsToInsert) {
    try {
      const { logActivity } = await loadDataOps()
      await logActivity(log)
    }
    catch (error) {
      // Log error but don't throw - activity logging should never break app
      console.error('Failed to log activity:', error)
    }
  }
}

function scheduleFlush() {
  if (flushTimeout)
    return

  flushTimeout = setTimeout(() => {
    flushTimeout = null
    flushActivityQueue().catch(console.error)
  }, FLUSH_INTERVAL)
}

function queueActivity(data: typeof activityQueue[0]) {
  activityQueue.push(data)

  // Flush immediately if queue is full
  if (activityQueue.length >= MAX_QUEUE_SIZE) {
    flushActivityQueue().catch(console.error)
  }
  else {
    scheduleFlush()
  }
}

function determineAction(method: string, path: string): string | null {
  const methodUpper = method.toUpperCase()

  // Export actions
  if (path.includes('/export'))
    return 'export'

  // CRUD actions
  if (methodUpper === 'GET')
    return 'view'
  if (methodUpper === 'POST')
    return 'create'
  if (methodUpper === 'PUT' || methodUpper === 'PATCH')
    return 'update'
  if (methodUpper === 'DELETE')
    return 'delete'

  return null
}

function determineResource(path: string): string | null {
  // Match resource from path
  if (path.includes('/schools'))
    return 'school'
  if (path.includes('/analytics'))
    return 'analytics'
  if (path.includes('/coefficients'))
    return 'coefficient'
  if (path.includes('/programs'))
    return 'program'
  if (path.includes('/subjects'))
    return 'subject'
  if (path.includes('/grades'))
    return 'grade'
  if (path.includes('/series'))
    return 'series'
  if (path.includes('/tracks'))
    return 'track'
  if (path.includes('/dashboard'))
    return 'dashboard'
  if (path.includes('/catalogs'))
    return 'catalog'
  if (path.includes('/students'))
    return 'student'
  if (path.includes('/teachers'))
    return 'teacher'
  if (path.includes('/classes'))
    return 'class'

  return null
}

function extractResourceId(path: string): string | null {
  // Extract UUID/ID from path like /schools/abc-123-def
  const uuidPattern = /\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?:\/|$)/i
  const match = path.match(uuidPattern)
  if (match?.[1]) {
    return match[1]
  }
  return null
}

export const activityLoggerMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const startTime = Date.now()

  let request: Request | null = null
  let session: { user?: { id: string } } | null = null

  try {
    request = getRequest()
  }
  catch {
    // Request not available in this context
  }

  // Try to get session
  if (request) {
    try {
      const { getAuth } = await loadAuth()
      const auth = getAuth()
      session = await auth.api.getSession({ headers: request.headers })
    }
    catch {
      // Continue without session (public routes or auth not initialized)
    }
  }

  // Execute the actual request
  const result = await next({ context: {} })

  // Calculate response time
  const responseTime = Date.now() - startTime

  // Log activity (async, don't await to avoid blocking)
  if (request && session?.user) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    const action = determineAction(method, path)
    const resource = determineResource(path)

    if (action && resource) {
      queueActivity({
        userId: session.user.id,
        schoolId: null, // Could be extracted from context if available
        action,
        resource,
        resourceId: extractResourceId(path),
        metadata: {
          method,
          path,
          responseTime,
          query: Object.fromEntries(url.searchParams),
        },
        ipAddress: request.headers.get('x-forwarded-for')
          || request.headers.get('x-real-ip')
          || null,
        userAgent: request.headers.get('user-agent') || null,
      })
    }
  }

  return result
})

/**
 * Helper function to manually log user activity from server functions
 */
export async function logUserActivity(params: {
  userId: string
  action: string
  resource: string
  resourceId?: string
  schoolId?: string
  metadata?: Record<string, unknown>
}) {
  try {
    const { logActivity } = await loadDataOps()
    await logActivity({
      userId: params.userId,
      schoolId: params.schoolId || null,
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
