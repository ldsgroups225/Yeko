import { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input'

/**
 * Type for supported phone number formats.
 */
export type PhoneFormat = 'NATIONAL' | 'INTERNATIONAL'

/**
 * Formats a phone number for display.
 *
 * @param phone - The phone number string (ideally in E.164 format).
 * @param format - The desired format style. Defaults to 'INTERNATIONAL'.
 * @returns The formatted phone number string, or the original string if it cannot be formatted.
 *
 * @example
 * formatPhone('+2250707080901', 'NATIONAL')
 * // => '07 07 08 09 01'
 *
 * formatPhone('+2250707080901', 'INTERNATIONAL')
 * // => '+225 07 07 08 0901'
 */
export function formatPhone(
  phone: string | null | undefined,
  format: PhoneFormat = 'INTERNATIONAL',
): string {
  if (!phone)
    return ''

  try {
    const formatted = format === 'NATIONAL'
      ? formatPhoneNumber(phone)
      : formatPhoneNumberIntl(phone)

    return formatted || phone
  }
  catch {
    return phone
  }
}
