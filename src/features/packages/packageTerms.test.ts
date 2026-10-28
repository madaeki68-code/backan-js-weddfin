import { describe, expect, it } from 'vitest';
import { DEFAULT_PACKAGE_TERMS, getPackageTerms } from './packageTerms';

describe('getPackageTerms', () => {
  it('uses shared defaults when no terms are configured', () => {
    expect(getPackageTerms()).toBe(DEFAULT_PACKAGE_TERMS);
    expect(getPackageTerms([])).toBe(DEFAULT_PACKAGE_TERMS);
  });

  it('returns configured terms when present', () => {
    const terms = [{ id: 'custom', title: 'Ketentuan khusus', items: ['Berlaku untuk paket ini.'] }];

    expect(getPackageTerms(terms)).toBe(terms);
  });
});
