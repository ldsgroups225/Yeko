/**
 * Generate a UUID v4 (Universally Unique Identifier) using the native crypto API.
 *
 * @returns {string} A UUID v4 string.
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}
