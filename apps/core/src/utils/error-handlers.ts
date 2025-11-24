export function parseServerFnError(error: any, fallback: string = 'Une erreur est survenue'): string {
  if (!error)
    return fallback

  const errorMessage = typeof error === 'string' ? error : error.message || ''

  // Handle network/connection errors
  if (errorMessage.includes('Network connection lost')
    || errorMessage.includes('fetch failed')
    || errorMessage.includes('NetworkError')) {
    return 'Connexion perdue. Veuillez réessayer une fois la connexion rétablie.'
  }

  // Handle timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return 'La requête a expiré. Veuillez réessayer.'
  }

  // Handle authentication errors
  if (errorMessage.includes('unauthorized') || errorMessage.includes('Unauthorized')) {
    return 'Session expirée. Veuillez vous reconnecter.'
  }

  try {
    // Try to find a JSON array in the string (Zod errors)
    const start = errorMessage.indexOf('[')
    if (start !== -1) {
      // Simple bracket counting to find the matching closing bracket
      let end = -1
      let depth = 0

      for (let i = start; i < errorMessage.length; i++) {
        if (errorMessage[i] === '[')
          depth++
        else if (errorMessage[i] === ']')
          depth--

        if (depth === 0) {
          end = i
          break
        }
      }

      if (end !== -1) {
        const jsonString = errorMessage.substring(start, end + 1)
        const issues = JSON.parse(jsonString)

        if (Array.isArray(issues) && issues.length > 0) {
          // Check if it looks like a Zod error array (objects with message property)
          const messages = issues
            .filter((i: any) => i && typeof i.message === 'string')
            .map((i: any) => i.message)

          if (messages.length > 0) {
            return messages.join(', ')
          }
        }
      }
    }
  }
  catch (e) {
    console.warn('Failed to parse error JSON', e)
  }

  // If parsing failed or no JSON found, return the clean message or fallback
  // Remove common prefixes and whitespace
  const cleanMessage = errorMessage
    .replace(/^Server Fn Error!\s*/, '')
    .replace(/^ZodError:\s*/, '')
    .replace(/^Error:\s*/, '')
    .trim()

  // Return clean message if it's meaningful, otherwise use fallback
  return cleanMessage && cleanMessage.length > 0 && cleanMessage.length < 200
    ? cleanMessage
    : fallback
}
