import { describe, it, expect } from 'vitest';
import {
  formatDisplayDate,
  formatDateShort,
  formatDateFull,
  formatDateTime,
  formatMonthYear,
  getDaysDifference,
  isDatePast,
  isDateToday,
  getCountdownText,
  parseSafeDate,
  isValidDate,
} from '../utils/date';
import {
  normalizeWhatsAppNumber,
  formatDisplayPhoneNumber,
  isValidWhatsAppNumber,
  cleanPhoneNumber,
  buildWhatsAppChatUrl,
} from '../utils/phone';
import {
  formatCurrency,
  formatCurrencyCSV,
  formatIdNumber,
  formatRupiahCompact,
} from '../utils/currency';
import {
  isValidEmail,
  isPositiveNumber,
  isNonNegativeNumber,
  validateRequired,
  validateEmailField,
  isNonEmptyString,
} from '../utils/validation';
import { parseTimestamp, compareTimestampsDesc, compareTimestampsAsc } from '../utils/sorting';

describe('Shared Architecture — Utilities & Logic', () => {
  describe('Date Utilities (id-ID locale)', () => {
    const refDate = new Date('2026-10-25T12:00:00Z');

    it('safely parses dates', () => {
      expect(parseSafeDate('2026-10-25')).toBeInstanceOf(Date);
      expect(parseSafeDate(null)).toBeNull();
      expect(parseSafeDate('invalid-date')).toBeNull();
      expect(isValidDate('2026-10-25')).toBe(true);
      expect(isValidDate('invalid')).toBe(false);
    });

    it('formats display date correctly', () => {
      const formatted = formatDisplayDate('2026-10-25T00:00:00Z');
      expect(formatted).toContain('2026');
      expect(formatDisplayDate(null)).toBe('-');
    });

    it('formats short and full dates', () => {
      const short = formatDateShort('2026-10-25T00:00:00Z');
      expect(short).toContain('25');
      const full = formatDateFull('2026-10-25T00:00:00Z');
      expect(full).toContain('2026');
    });

    it('formats date and time', () => {
      const dateTime = formatDateTime('2026-10-25T14:30:00Z');
      expect(dateTime).toContain('2026');
      expect(formatDateTime(null)).toBe('-');
    });

    it('formats month and year', () => {
      const my = formatMonthYear('2026-10-25T00:00:00Z');
      expect(my).toContain('2026');
      expect(formatMonthYear(null)).toBe('-');
    });

    it('calculates days difference and countdown text', () => {
      // Same day
      expect(getDaysDifference('2026-10-25', refDate)).toBe(0);
      expect(isDateToday('2026-10-25', refDate)).toBe(true);
      expect(getCountdownText('2026-10-25', refDate)).toBe('Hari Ini');

      // Future event (3 days later)
      expect(getDaysDifference('2026-10-28', refDate)).toBe(3);
      expect(isDatePast('2026-10-28', refDate)).toBe(false);
      expect(getCountdownText('2026-10-28', refDate)).toBe('3 Hari Lagi');

      // Past event (2 days ago)
      expect(getDaysDifference('2026-10-23', refDate)).toBe(-2);
      expect(isDatePast('2026-10-23', refDate)).toBe(true);
      expect(getCountdownText('2026-10-23', refDate)).toBe('Selesai');
    });
  });

  describe('Phone and WhatsApp Utilities', () => {
    it('normalizes local 08 prefix to standard 62', () => {
      expect(normalizeWhatsAppNumber('08123456789')).toBe('628123456789');
      expect(cleanPhoneNumber('08123456789')).toBe('628123456789');
    });

    it('normalizes numbers without 0 prefix (e.g. 812...)', () => {
      expect(normalizeWhatsAppNumber('81234567890')).toBe('6281234567890');
    });

    it('handles formatted numbers with symbols and international +62', () => {
      expect(normalizeWhatsAppNumber('+62 812-3456-7890')).toBe('6281234567890');
      expect(normalizeWhatsAppNumber('006281234567890')).toBe('6281234567890');
    });

    it('formats clean display phone string', () => {
      expect(formatDisplayPhoneNumber('081234567890')).toBe('+62 812-3456-7890');
      expect(formatDisplayPhoneNumber(null)).toBe('-');
      expect(formatDisplayPhoneNumber('')).toBe('-');
    });

    it('validates WhatsApp number length', () => {
      expect(isValidWhatsAppNumber('08123456789')).toBe(true);
      expect(isValidWhatsAppNumber('123')).toBe(false);
      expect(isValidWhatsAppNumber(null)).toBe(false);
    });

    it('builds standard WhatsApp click-to-chat links', () => {
      const link = buildWhatsAppChatUrl('08123456789', 'Halo Attera Visual');
      expect(link).toBe('https://wa.me/628123456789?text=Halo%20Attera%20Visual');

      const blankLink = buildWhatsAppChatUrl(null, 'Halo');
      expect(blankLink).toBe('https://wa.me/?text=Halo');
    });
  });

  describe('Currency and Compact Formatting', () => {
    it('formats standard currency string', () => {
      expect(formatCurrency(15000000)).toContain('15.000.000');
      expect(formatCurrencyCSV(15000000)).toBe('Rp 15.000.000');
      expect(formatIdNumber(500000)).toBe('500.000');
    });

    it('formats compact Rupiah for mobile widgets', () => {
      expect(formatRupiahCompact(15000000)).toBe('Rp 15 Jt');
      expect(formatRupiahCompact(2500000000)).toBe('Rp 2.5 M');
      expect(formatRupiahCompact(750000)).toBe('Rp 750 Rb');
      expect(formatRupiahCompact(500)).toBe('Rp 500');
      expect(formatRupiahCompact(-1500000)).toBe('-Rp 1.5 Jt');
      expect(formatRupiahCompact(NaN)).toBe('Rp 0');
    });
  });

  describe('Form Validation Utilities', () => {
    it('validates non-empty string and required fields', () => {
      expect(isNonEmptyString('Studio')).toBe(true);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);

      expect(validateRequired('Ada')).toBeNull();
      expect(validateRequired('', 'Nama')).toBe('Nama wajib diisi');
      expect(validateRequired(null, 'Email')).toBe('Email wajib diisi');
    });

    it('validates email addresses', () => {
      expect(isValidEmail('admin@atteravisual.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);

      expect(validateEmailField('user@test.com')).toBeNull();
      expect(validateEmailField('invalid')).toBe('Format alamat email tidak valid');
      expect(validateEmailField('')).toBe('Alamat email wajib diisi');
    });

    it('validates numbers', () => {
      expect(isPositiveNumber(100)).toBe(true);
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-10)).toBe(false);
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(50)).toBe(true);
      expect(isNonNegativeNumber(-1)).toBe(false);
    });
  });

  describe('Sorting and Timestamp Utilities', () => {
    it('parses timestamps safely and compares them', () => {
      expect(parseTimestamp('2026-10-25T00:00:00Z')).toBeGreaterThan(0);
      expect(parseTimestamp(null)).toBe(0);

      const desc = compareTimestampsDesc('2026-10-20', '2026-10-25');
      expect(desc).toBeGreaterThan(0); // 2026-10-25 comes before 2026-10-20 in DESC

      const asc = compareTimestampsAsc('2026-10-20', '2026-10-25');
      expect(asc).toBeLessThan(0); // 2026-10-20 comes before 2026-10-25 in ASC
    });
  });
});
