/**
 * Generate a UUID v4 (Universally Unique Identifier) using crypto-safe random values when available.
 *
 * @returns {string} A UUID v4 string.
 */
export function generateUUID(): string {
  // Fallback to Math.random if crypto is unavailable (e.g., in some older RN environments)
  const getRandomValues
    = typeof globalThis.crypto?.getRandomValues === 'function'
      ? globalThis.crypto.getRandomValues.bind(globalThis.crypto)
      : (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256)
          }
          return arr
        }

  const bytes = new Uint8Array(16)
  getRandomValues(bytes)

  // Per RFC 4122 v4 guidelines
  bytes[6] = (bytes[6]! & 0x0F) | 0x40 // Version 4
  bytes[8] = (bytes[8]! & 0x3F) | 0x80 // Variant 10xxxxxx

  const byteToHex = (byte: number): string => {
    return (byte + 0x100).toString(16).substring(1)
  }

  return [
    byteToHex(bytes[0]!),
    byteToHex(bytes[1]!),
    byteToHex(bytes[2]!),
    byteToHex(bytes[3]!),
    '-',
    byteToHex(bytes[4]!),
    byteToHex(bytes[5]!),
    '-',
    byteToHex(bytes[6]!),
    byteToHex(bytes[7]!),
    '-',
    byteToHex(bytes[8]!),
    byteToHex(bytes[9]!),
    '-',
    byteToHex(bytes[10]!),
    byteToHex(bytes[11]!),
    byteToHex(bytes[12]!),
    byteToHex(bytes[13]!),
    byteToHex(bytes[14]!),
    byteToHex(bytes[15]!),
  ].join('')
}
