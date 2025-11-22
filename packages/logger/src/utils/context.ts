/**
 * Context management utilities for Yeko logging
 */

import type { UserRole, YekoLogContext } from '../types'

/**
 * Creates a new context object by merging contexts
 */
export function mergeContext(
  base?: YekoLogContext,
  additional?: YekoLogContext,
): YekoLogContext | undefined {
  if (!base && !additional)
    return undefined
  if (!base)
    return additional
  if (!additional)
    return base

  const merged: YekoLogContext = { ...base, ...additional }

  // Merge metadata if present
  if (base.metadata && additional.metadata) {
    merged.metadata = {
      ...base.metadata,
      ...additional.metadata,
    }
  }
  else if (additional.metadata) {
    merged.metadata = additional.metadata
  }
  else if (base.metadata) {
    merged.metadata = base.metadata
  }

  return merged
}

/**
 * Creates a user context object
 */
export function createUserContext(
  userId: string,
  role: UserRole,
  additional?: Partial<YekoLogContext>,
): YekoLogContext {
  return {
    userId,
    userRole: role,
    ...additional,
  }
}

/**
 * Creates a school/organization context
 */
export function createSchoolContext(
  schoolId: string,
  organizationId?: string,
): YekoLogContext {
  return {
    schoolId,
    organizationId,
  }
}

/**
 * Creates an academic context
 */
export function createAcademicContext(
  academicYearId: string,
  semesterId?: string,
  courseId?: string,
  subjectId?: string,
): YekoLogContext {
  return {
    academicYearId,
    semesterId,
    courseId,
    subjectId,
  }
}

/**
 * Creates a request context for HTTP requests
 */
export function createRequestContext(
  requestId: string,
  ip?: string,
  userAgent?: string,
): YekoLogContext {
  return {
    requestId,
    ip,
    userAgent,
  }
}

/**
 * Creates a performance context
 */
export function createPerformanceContext(
  duration: number,
  memoryUsage?: number,
): YekoLogContext {
  return {
    duration,
    memoryUsage,
  }
}

/**
 * Validates and normalizes a context object
 */
export function normalizeContext(context?: YekoLogContext): YekoLogContext | undefined {
  if (!context)
    return undefined

  const normalized: YekoLogContext = {}

  // Copy only valid fields
  if (context.schoolId)
    normalized.schoolId = context.schoolId
  if (context.organizationId)
    normalized.organizationId = context.organizationId
  if (context.userId)
    normalized.userId = context.userId
  if (context.userRole)
    normalized.userRole = context.userRole
  if (context.sessionId)
    normalized.sessionId = context.sessionId
  if (context.academicYearId)
    normalized.academicYearId = context.academicYearId
  if (context.semesterId)
    normalized.semesterId = context.semesterId
  if (context.courseId)
    normalized.courseId = context.courseId
  if (context.subjectId)
    normalized.subjectId = context.subjectId
  if (context.requestId)
    normalized.requestId = context.requestId
  if (context.ip)
    normalized.ip = context.ip
  if (context.userAgent)
    normalized.userAgent = context.userAgent
  if (typeof context.duration === 'number')
    normalized.duration = context.duration
  if (typeof context.memoryUsage === 'number')
    normalized.memoryUsage = context.memoryUsage

  // Copy additional fields
  Object.keys(context).forEach((key) => {
    if (!(key in normalized) && context[key] !== undefined) {
      normalized[key] = context[key]
    }
  })

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

/**
 * Masks sensitive information in context
 */
export function maskSensitiveData(context?: YekoLogContext): YekoLogContext | undefined {
  if (!context)
    return undefined

  const masked = { ...context }

  // Mask sensitive fields
  if (masked.ip) {
    // Mask IP addresses (show only first 2 octets)
    masked.ip = masked.ip.replace(/(\d+\.\d+\.)\d+\.\d+/, '$1xxx.xxx')
  }

  // Remove or mask other sensitive fields
  if (masked.userAgent) {
    // Keep only browser name and version, remove detailed info
    const ua = masked.userAgent
    const chromeMatch = ua.match(/Chrome\/(\d+)/)
    const firefoxMatch = ua.match(/Firefox\/(\d+)/)
    const safariMatch = ua.match(/Safari\/(\d+)/)

    if (chromeMatch) {
      masked.userAgent = `Chrome/${chromeMatch[1]}`
    }
    else if (firefoxMatch) {
      masked.userAgent = `Firefox/${firefoxMatch[1]}`
    }
    else if (safariMatch) {
      masked.userAgent = `Safari/${safariMatch[1]}`
    }
    else {
      masked.userAgent = 'Unknown Browser'
    }
  }

  return masked
}
