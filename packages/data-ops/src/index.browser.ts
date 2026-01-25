/**
 * Client-safe exports for @repo/data-ops
 *
 * This file exports ONLY types and schemas that can be safely used
 * in browser/client code. It does NOT export any query functions
 * or database setup code that would pull in Node.js-only dependencies
 * like 'pg', 'events', or 'Buffer'.
 *
 * Usage in client code:
 *   import type { School, Grade, Subject } from '@repo/data-ops/types'
 *   import { hasPermission } from '@repo/data-ops/types'
 */

// Auth permissions (no database dependency)
export * from './auth/permissions'

// Schema types from drizzle (re-export everything - types are safe)
export * from './drizzle/auth-schema'
export * from './drizzle/core-schema'
export * from './drizzle/school-schema'
export * from './drizzle/support-schema'
