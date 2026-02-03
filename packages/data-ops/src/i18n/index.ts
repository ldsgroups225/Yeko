import frErrors from './fr/errors'

export type ErrorKey = keyof typeof frErrors.errors

export function getErrorMessage(
  key: ErrorKey,
  params?: Record<string, string | number>,
): string {
  const message = frErrors.errors[key] || frErrors.errors.generic

  if (params && typeof message === 'string') {
    return Object.entries(params).reduce<string>(
      (msg, [k, v]) => msg.replace(`{${k}}`, String(v)),
      message,
    )
  }

  return message as string
}

export function getNestedErrorMessage(
  category: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  const categoryObj = (frErrors.errors as Record<string, unknown>)[category]

  if (categoryObj && typeof categoryObj === 'object') {
    const message = (categoryObj as Record<string, string>)[key]
    if (message) {
      if (params) {
        return Object.entries(params).reduce<string>(
          (msg, [k, v]) => msg.replace(`{${k}}`, String(v)),
          message,
        )
      }
      return message
    }
  }

  return frErrors.errors.generic
}

export { frErrors }
export type { ErrorTranslations } from './fr/errors'
