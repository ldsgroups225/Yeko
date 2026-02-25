import type { LogsQueue } from './types'
import { AsyncLocalStorage } from 'node:async_hooks'

interface TaskContextStore {
  executionContext: ExecutionContext | null
  queueBinding: LogsQueue | null
}

// Request-scoped storage to prevent cross-request I/O leaks in Cloudflare Workers
const requestTaskCtx = new AsyncLocalStorage<TaskContextStore>()

// Global fallback for non-ALS environments
let globalExecutionContext: ExecutionContext | null = null
let globalQueueBinding: LogsQueue | null = null

/**
 * Create a request-scoped task context.
 * Must wrap the entire request lifecycle in CF Workers.
 */
export function withTaskScope<T>(fn: () => T): T {
  return requestTaskCtx.run({ executionContext: null, queueBinding: null }, fn)
}

/**
 * Set the execution context for the current request
 * Call this at the start of each request in your worker
 */
export function setExecutionContext(ctx: ExecutionContext): void {
  const store = requestTaskCtx.getStore()
  if (store) {
    store.executionContext = ctx
  }
  globalExecutionContext = ctx
}

/**
 * Get the current execution context
 */
export function getExecutionContext(): ExecutionContext | null {
  const store = requestTaskCtx.getStore()
  if (store) {
    return store.executionContext
  }
  return globalExecutionContext
}

/**
 * Set the queue binding for the current request
 * Call this at the start of each request in your worker
 */
export function setQueueBinding(queue: LogsQueue): void {
  const store = requestTaskCtx.getStore()
  if (store) {
    store.queueBinding = queue
  }
  globalQueueBinding = queue
}

/**
 * Get the current queue binding
 */
export function getQueueBinding(): LogsQueue | null {
  const store = requestTaskCtx.getStore()
  if (store) {
    return store.queueBinding
  }
  return globalQueueBinding
}

/**
 * Clear context after request completes (optional cleanup)
 */
export function clearContext(): void {
  const store = requestTaskCtx.getStore()
  if (store) {
    store.executionContext = null
    store.queueBinding = null
  }
  globalExecutionContext = null
  globalQueueBinding = null
}
