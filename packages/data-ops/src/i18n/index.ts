import frErrors from './fr/errors'
import { i18nObject } from './i18n-util'
import { loadLocale } from './i18n-util.sync'

loadLocale('fr')

export const LL = i18nObject('fr')

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
    const keyParts = key.split('.')
    let current: unknown = categoryObj

    for (const part of keyParts) {
      if (
        current
        && typeof current === 'object'
        && current !== null
        && part in current
      ) {
        current = (current as Record<string, unknown>)[part]
      }
      else {
        current = undefined
        break
      }
    }

    const message = current as string | undefined

    if (message && typeof message === 'string') {
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
