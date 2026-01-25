/**
 * Logger configuration and utilities for Yeko Core App
 */

import type { UserRole, YekoLogger } from '@repo/logger'
import { createClientLogger, initClientLogging, setupGlobalErrorHandling, UserInteractionLogger } from '@repo/logger'
import { useEffect, useState } from 'react'

// Initialize client-side logging when the module loads
let isInitialized = false
let mainLogger: YekoLogger
let userLogger: UserInteractionLogger

/**
 * Initialize the logging system for the Yeko Core app
 */
export async function initializeLogger(userId?: string, userRole?: UserRole) {
  if (isInitialized)
    return

  // Initialize the logging system
  await initClientLogging({
    level: import.meta.env.DEV ? 'debug' : 'info',
    enableColors: import.meta.env.DEV,
    enableStructuredLogging: !import.meta.env.DEV,
    defaultContext: {
      service: 'yeko-core',
      environment: import.meta.env.MODE,
    },
  })

  // Create main app logger
  mainLogger = createClientLogger(['yeko-core'])

  // Create user interaction logger
  userLogger = new UserInteractionLogger(userId, userRole)

  // Set up global error handling
  setupGlobalErrorHandling()

  isInitialized = true

  mainLogger.info('Yeko Core logging system initialized', {
    userId,
    userRole,
    environment: import.meta.env.MODE,
  })
}

/**
 * Get the main application logger
 */
export function getLogger(): YekoLogger {
  if (!isInitialized) {
    throw new Error('Logger not initialized. Call initializeLogger() first.')
  }
  return mainLogger
}

/**
 * Get the user interaction logger
 */
export function getUserLogger(): UserInteractionLogger {
  if (!isInitialized) {
    throw new Error('Logger not initialized. Call initializeLogger() first.')
  }
  return userLogger
}

/**
 * Update user context in the logger
 */
export function updateUserContext(userId: string, userRole: UserRole) {
  if (!isInitialized)
    return

  mainLogger = mainLogger.withUser(userId, userRole)
  userLogger = userLogger.withUser(userId, userRole)

  mainLogger.info('User context updated', { userId, userRole })
}

/**
 * Convenience function for logging user actions
 */
export function logUserAction(action: string, element?: string, context?: Record<string, unknown>) {
  if (!isInitialized)
    return

  getUserLogger().logAction(action, element, context)
}

/**
 * Convenience function for logging navigation
 */
export function logNavigation(from: string, to: string) {
  if (!isInitialized)
    return

  getUserLogger().logNavigation(from, to)
}

/**
 * Convenience function for logging errors
 */
export function logError(error: Error, context?: string) {
  if (!isInitialized)
    return

  getUserLogger().logError(error, context)
}

/**
 * Convenience function for logging form submissions
 */
export function logFormSubmission(formName: string, fields?: string[]) {
  if (!isInitialized)
    return

  getUserLogger().logFormSubmission(formName, fields)
}

/**
 * React hook for using the logger in components
 */
export function useLogger() {
  // Initialize state directly from the module variable
  // This avoids needing to sync state in an effect
  const [isReady, setIsReady] = useState(() => isInitialized)

  useEffect(() => {
    // Only set up a check if not already initialized
    if (!isInitialized) {
      // Poll for initialization (this handles async initialization)
      const checkInterval = setInterval(() => {
        if (isInitialized) {
          setIsReady(true)
          clearInterval(checkInterval)
        }
      }, 100)

      return () => clearInterval(checkInterval)
    }
  }, [])

  // Return safe fallbacks when not initialized (e.g., during SSR)
  if (!isInitialized || !isReady) {
    return {
      logger: {
        debug: () => { },
        info: () => { },
        warning: () => { },
        error: () => { },
        fatal: () => { },
        audit: () => { },
        performance: () => { },
        security: () => { },
        withContext: () => ({} as any),
        withUser: () => ({} as any),
        withSchool: () => ({} as any),
        withAcademicContext: () => ({} as any),
        child: () => ({} as any),
      },
      userLogger: {
        logAction: () => { },
        logNavigation: () => { },
        logError: () => { },
        logFormSubmission: () => { },
        withUser: () => ({} as any),
      },
      logUserAction: () => { },
      logNavigation: () => { },
      logError: () => { },
      logFormSubmission: () => { },
      isReady: false,
    }
  }

  return {
    logger: getLogger(),
    userLogger: getUserLogger(),
    logUserAction,
    logNavigation,
    logError,
    logFormSubmission,
    isReady,
  }
}
