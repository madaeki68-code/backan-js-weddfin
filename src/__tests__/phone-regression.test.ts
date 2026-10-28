import { describe, it, expect } from 'vitest';
import * as CorePhone from '../utils/phone';
import * as CommPhone from '../features/client-communication/utils/phone';

describe('Phone & WhatsApp Utilities — Regression Audit', () => {
  const testCases = [
    { input: '08123456789', expectedNormalized: '628123456789', expectedDisplay: '+62 812-3456-789', isValid: true },
    { input: '+62 812 3456 789', expectedNormalized: '628123456789', expectedDisplay: '+62 812-3456-789', isValid: true },
    { input: '00628123456789', expectedNormalized: '628123456789', expectedDisplay: '+62 812-3456-789', isValid: true },
    { input: '628123456789', expectedNormalized: '628123456789', expectedDisplay: '+62 812-3456-789', isValid: true },
    { input: '8123456789', expectedNormalized: '628123456789', expectedDisplay: '+62 812-3456-789', isValid: true },
    { input: '', expectedNormalized: '', expectedDisplay: '-', isValid: false },
    { input: null, expectedNormalized: '', expectedDisplay: '-', isValid: false },
    { input: undefined, expectedNormalized: '', expectedDisplay: '-', isValid: false },
    { input: 'abc', expectedNormalized: '', expectedDisplay: '-', isValid: false },
    { input: '12345', expectedNormalized: '12345', expectedDisplay: '+12345', isValid: false },
  ];

  it('Core utils and Client Communication utils yield identical results for all phone cases', () => {
    testCases.forEach(({ input, expectedNormalized, expectedDisplay, isValid }) => {
      const coreNorm = CorePhone.normalizeWhatsAppNumber(input);
      const commNorm = CommPhone.normalizeWhatsAppNumber(input);
      expect(coreNorm).toBe(expectedNormalized);
      expect(commNorm).toBe(expectedNormalized);

      const coreDisp = CorePhone.formatDisplayPhoneNumber(input);
      const commDisp = CommPhone.formatDisplayPhoneNumber(input);
      expect(coreDisp).toBe(expectedDisplay);
      expect(commDisp).toBe(expectedDisplay);

      const coreValid = CorePhone.isValidWhatsAppNumber(input);
      const commValid = CommPhone.isValidWhatsAppNumber(input);
      expect(coreValid).toBe(isValid);
      expect(commValid).toBe(isValid);
    });
  });
});
