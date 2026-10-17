/**
 * AuraLune Phone Normalization and Masking Utilities
 * 
 * Provides robust validation and normalization for Iranian mobile phone numbers.
 * Supports Persian/Arabic digits, standard national formats (09xxxxxxxxx),
 * canonical international E.164 formats (+989xxxxxxxxx), and safe logging masks.
 */

export interface NormalizedPhone {
  isValid: boolean;
  canonical: string;  // e.g. "+989123456789"
  national: string;   // e.g. "09123456789"
  tenDigits: string;  // e.g. "9123456789"
  error?: string;
}

/**
 * Converts Persian and Arabic numerals to standard Latin/ASCII digits.
 */
export function convertToAsciiDigits(input: string): string {
  if (!input) return '';
  return input
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}

/**
 * Normalizes any Iranian mobile number input into standard formats.
 */
export function normalizeIranianPhone(rawPhone: string): NormalizedPhone {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      canonical: '',
      national: '',
      tenDigits: '',
      error: 'شماره تلفن وارد نشده است.'
    };
  }

  // 1. Convert Persian/Arabic digits and remove whitespace/special characters
  let clean = convertToAsciiDigits(rawPhone).replace(/[^\d+]/g, '');

  // 2. Remove leading "+" if present
  if (clean.startsWith('+')) {
    clean = clean.slice(1);
  }

  // 3. Handle international prefixes: 0098 or 98
  if (clean.startsWith('0098')) {
    clean = clean.slice(4);
  } else if (clean.startsWith('98') && clean.length > 10) {
    clean = clean.slice(2);
  }

  // 4. Handle leading national trunk 0
  if (clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  // 5. Must now be exactly 10 digits starting with 9
  const isTenDigits = /^\d{10}$/.test(clean);
  const startsWithNine = clean.startsWith('9');

  if (!isTenDigits || !startsWithNine) {
    return {
      isValid: false,
      canonical: '',
      national: '',
      tenDigits: '',
      error: 'شماره موبایل وارد شده نامعتبر است. فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹'
    };
  }

  return {
    isValid: true,
    canonical: `+98${clean}`,
    national: `0${clean}`,
    tenDigits: clean
  };
}

/**
 * Masks a phone number for secure display and logging.
 * Example: "09123456789" -> "0912***6789"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '***';
  const clean = convertToAsciiDigits(phone).replace(/[^\d]/g, '');
  if (clean.length < 7) return '***';
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start}***${end}`;
}
