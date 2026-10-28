import { Profile } from '../../../types';
import { DEFAULT_TERMS_AND_CONDITIONS } from '../../../constants';
import { BusinessConfigSummary } from '../types/settings.types';

export const DEFAULT_BUSINESS_NAME = 'Attera Visual';
export const DEFAULT_BRAND_COLOR = '#5d87ff';

/**
 * Returns a normalized, unified business configuration summary from a Profile.
 * Guarantees consistent fallback values across all modules (Finance, Wedding, Invoice,
 * Payment Slip, WhatsApp, Leads, and Clients).
 */
export function getBusinessConfig(profile: Partial<Profile> | null | undefined): BusinessConfigSummary {
  const safe = profile || {};
  const social = safe.publicPageConfig?.socialMedia || {};

  return {
    companyName: (safe.companyName && safe.companyName.trim()) || DEFAULT_BUSINESS_NAME,
    ownerName: (safe.fullName && safe.fullName.trim()) || '',
    email: (safe.email && safe.email.trim()) || '',
    phone: (safe.phone && safe.phone.trim()) || '',
    secondaryPhone: (safe.secondaryPhone && safe.secondaryPhone.trim()) || (safe.publicPageConfig?.secondaryPhone && safe.publicPageConfig.secondaryPhone.trim()) || '',
    website: (safe.website && safe.website.trim()) || '',
    address: (safe.address && safe.address.trim()) || '',
    bankAccount: (safe.bankAccount && safe.bankAccount.trim()) || '',
    authorizedSigner: (safe.authorizedSigner && safe.authorizedSigner.trim()) || (safe.fullName && safe.fullName.trim()) || '',
    idNumber: (safe.idNumber && safe.idNumber.trim()) || '',
    bio: (safe.bio && safe.bio.trim()) || '',
    brandColor: safe.brandColor || DEFAULT_BRAND_COLOR,
    logoUrl: safe.logoBase64 || undefined,
    signatureUrl: safe.signatureBase64 || undefined,
    briefingTemplate: safe.briefingTemplate || '',
    termsAndConditions: safe.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS,
    socialMedia: {
      instagram: safe.instagram || social.instagram || undefined,
      tiktok: safe.tiktok || social.tiktok || undefined,
      facebook: safe.facebook || social.facebook || undefined,
      youtube: safe.youtube || social.youtube || undefined,
    },
  };
}

/**
 * Helper to build company meta string for invoices and payment slips.
 * E.g. "Attera Visual | Jl. Raya No. 12 | 08123456789 • info@atteravisual.com"
 */
export function formatCompanyMetaText(profile: Partial<Profile> | null | undefined): string {
  const config = getBusinessConfig(profile);
  const parts: string[] = [];
  if (config.companyName) parts.push(config.companyName);
  if (config.address) parts.push(config.address);
  const contact: string[] = [];
  if (config.phone) contact.push(config.phone);
  if (config.email) contact.push(config.email);
  if (contact.length > 0) parts.push(contact.join(' • '));
  return parts.join(' | ');
}

/**
 * Returns standardized WhatsApp template variable replacements based on business config
 */
export function getBusinessTemplateVariables(profile: Partial<Profile> | null | undefined): Record<string, string> {
  const config = getBusinessConfig(profile);
  return {
    companyName: config.companyName,
    bankAccount: config.bankAccount,
    ownerName: config.ownerName,
    companyPhone: config.phone,
    companyEmail: config.email,
  };
}
