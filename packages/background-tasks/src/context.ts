import type { LogsQueue } from './types'

// Global context storage for the current request
let currentExecutionContext: ExecutionContext | null = null
let currentQueueBinding: LogsQueue | null = null

/**
 * Set the execution context for the current request
 * Call this at the start of each request in your worker
 */
export function setExecutionContext(ctx: ExecutionContext): void {
  currentExecutionContext = ctx
}

/**
 * Get the current execution context
 */
export function getExecutionContext(): ExecutionContext | null {
  return currentExecutionContext
}

/**
 * Set the queue binding for the current request
 * Call this at the start of each request in your worker
 */
export function setQueueBinding(queue: LogsQueue): void {
  currentQueueBinding = queue
}

/**
 * Get the current queue binding
 */
export function getQueueBinding(): LogsQueue | null {
  return currentQueueBinding
}

/**
 * Clear context after request completes (optional cleanup)
 */
export function clearContext(): void {
  currentExecutionContext = null
  currentQueueBinding = null
}
