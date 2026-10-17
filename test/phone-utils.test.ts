import { describe, it, expect } from 'vitest';
import {
  normalizeIranianPhone,
  maskPhoneNumber,
  convertToAsciiDigits
} from '../supabase/functions/_shared/phone-utils';

describe('AuraLune Phone Normalization & Masking Utilities', () => {
  it('converts Persian and Arabic digits to ASCII digits', () => {
    expect(convertToAsciiDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    expect(convertToAsciiDigits('٠٩١٢٣٤٥٦٧٨٩')).toBe('09123456789');
    expect(convertToAsciiDigits('09123456789')).toBe('09123456789');
  });

  it('normalizes local Iranian mobile format (09xxxxxxxxx)', () => {
    const res = normalizeIranianPhone('09123456789');
    expect(res.isValid).toBe(true);
    expect(res.national).toBe('09123456789');
    expect(res.canonical).toBe('+989123456789');
    expect(res.tenDigits).toBe('9123456789');
  });

  it('normalizes international format with +98', () => {
    const res = normalizeIranianPhone('+989123456789');
    expect(res.isValid).toBe(true);
    expect(res.national).toBe('09123456789');
    expect(res.canonical).toBe('+989123456789');
    expect(res.tenDigits).toBe('9123456789');
  });

  it('normalizes international format with 0098 and 98', () => {
    const res1 = normalizeIranianPhone('00989123456789');
    expect(res1.isValid).toBe(true);
    expect(res1.national).toBe('09123456789');

    const res2 = normalizeIranianPhone('989123456789');
    expect(res2.isValid).toBe(true);
    expect(res2.national).toBe('09123456789');
  });

  it('normalizes 10-digit format without leading 0', () => {
    const res = normalizeIranianPhone('9123456789');
    expect(res.isValid).toBe(true);
    expect(res.national).toBe('09123456789');
    expect(res.canonical).toBe('+989123456789');
  });

  it('normalizes Persian numerals with spaces and dashes', () => {
    const res = normalizeIranianPhone(' ۰۹۱۲-۳۴۵-۶۷۸۹ ');
    expect(res.isValid).toBe(true);
    expect(res.national).toBe('09123456789');
    expect(res.canonical).toBe('+989123456789');
  });

  it('rejects invalid, landline, or non-Iranian numbers', () => {
    expect(normalizeIranianPhone('02188776655').isValid).toBe(false); // Tehran landline
    expect(normalizeIranianPhone('12345').isValid).toBe(false); // Too short
    expect(normalizeIranianPhone('0912345678999').isValid).toBe(false); // Too long
    expect(normalizeIranianPhone('+14155552671').isValid).toBe(false); // US number
    expect(normalizeIranianPhone('').isValid).toBe(false);
  });

  it('masks phone numbers securely without leaking full PII', () => {
    expect(maskPhoneNumber('09123456789')).toBe('0912***6789');
    expect(maskPhoneNumber('+989351234567')).toBe('9893***4567');
    expect(maskPhoneNumber('')).toBe('***');
  });
});
