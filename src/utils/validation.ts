/**
 * Standardized Form and Value Validations
 */

export function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isPositiveNumber(val: unknown): boolean {
  const num = Number(val);
  return Number.isFinite(num) && num > 0;
}

export function isNonNegativeNumber(val: unknown): boolean {
  const num = Number(val);
  return Number.isFinite(num) && num >= 0;
}

export function validateRequired(val: unknown, fieldName = 'Bidang ini'): string | null {
  if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
    return `${fieldName} wajib diisi`;
  }
  return null;
}

export function validateEmailField(email: string | null | undefined): string | null {
  if (!email || email.trim() === '') {
    return 'Alamat email wajib diisi';
  }
  if (!isValidEmail(email)) {
    return 'Format alamat email tidak valid';
  }
  return null;
}
