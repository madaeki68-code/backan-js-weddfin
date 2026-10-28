/**
 * Standardized Date Formatting and Calculations for Indonesian locale (id-ID)
 */

export const MONTH_NAMES_LONG_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MONTH_NAMES_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Safely parse any date value into a valid Date object or null
 */
export function parseSafeDate(dateVal?: string | number | Date | null): Date | null {
  if (!dateVal) return null;
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Check if a date string or object is valid
 */
export function isValidDate(dateVal?: string | number | Date | null): boolean {
  return parseSafeDate(dateVal) !== null;
}

/**
 * Format date for display in Indonesian format: e.g. "25 Okt 2026"
 */
export function formatDisplayDate(
  dateVal?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseSafeDate(dateVal);
  if (!d) return '-';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return d.toLocaleDateString('id-ID', defaultOptions);
}

/**
 * Format date with full month name: e.g. "25 Oktober 2026"
 */
export function formatDateFull(dateVal?: string | number | Date | null): string {
  return formatDisplayDate(dateVal, { month: 'long' });
}

/**
 * Short date: e.g. "25 Okt"
 */
export function formatDateShort(dateVal?: string | number | Date | null): string {
  const d = parseSafeDate(dateVal);
  if (!d) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/**
 * Date and time: e.g. "25 Okt 2026, 14:30"
 */
export function formatDateTime(dateVal?: string | number | Date | null): string {
  const d = parseSafeDate(dateVal);
  if (!d) return '-';
  const datePart = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart}, ${timePart}`;
}

/**
 * Month and year: e.g. "Oktober 2026"
 */
export function formatMonthYear(dateVal?: string | number | Date | null): string {
  const d = parseSafeDate(dateVal);
  if (!d) return '-';
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

/**
 * Calculate difference in whole days between target date and reference date (default: today)
 * Positive if target is in future, negative if in past, 0 if today.
 */
export function getDaysDifference(
  targetDate: string | number | Date,
  referenceDate: string | number | Date = new Date()
): number {
  const target = parseSafeDate(targetDate);
  const ref = parseSafeDate(referenceDate);
  if (!target || !ref) return 0;

  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const refDay = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();

  return Math.ceil((targetDay - refDay) / (1000 * 60 * 60 * 24));
}

/**
 * Check if target date is in the past relative to reference date (default: today)
 */
export function isDatePast(
  targetDate: string | number | Date,
  referenceDate: string | number | Date = new Date()
): boolean {
  return getDaysDifference(targetDate, referenceDate) < 0;
}

/**
 * Check if target date is today relative to reference date (default: today)
 */
export function isDateToday(
  targetDate: string | number | Date,
  referenceDate: string | number | Date = new Date()
): boolean {
  return getDaysDifference(targetDate, referenceDate) === 0;
}

/**
 * Return friendly countdown string: "Hari Ini", "3 Hari Lagi", or "Selesai"
 */
export function getCountdownText(
  targetDate: string | number | Date,
  referenceDate: string | number | Date = new Date()
): string {
  const days = getDaysDifference(targetDate, referenceDate);
  if (days === 0) return 'Hari Ini';
  if (days > 0) return `${days} Hari Lagi`;
  return 'Selesai';
}
