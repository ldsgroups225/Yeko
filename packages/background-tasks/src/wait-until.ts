import { getExecutionContext } from './context'

/**
 * Run a function in the background using waitUntil
 * The function will continue running after the response is sent
 *
 * @param fn - Async function to run in background
 */
export function runInBackground(fn: () => Promise<void>): void {
  const ctx = getExecutionContext()

  if (ctx) {
    // Use waitUntil for guaranteed execution after response
    ctx.waitUntil(
      fn().catch((error) => {
        console.error('[background-task] Error in background task:', error)
      }),
    )
  }
  else {
    // Fallback to fire-and-forget if no context (e.g., in tests)
    fn().catch((error) => {
      console.error('[background-task] Error in background task (no ctx):', error)
    })
  }
}
