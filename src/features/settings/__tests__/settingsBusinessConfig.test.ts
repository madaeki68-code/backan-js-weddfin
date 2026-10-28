import { describe, it, expect } from 'vitest';
import {
  getBusinessConfig,
  formatCompanyMetaText,
  getBusinessTemplateVariables,
  DEFAULT_BUSINESS_NAME,
  DEFAULT_BRAND_COLOR,
} from '../utils/businessConfigHelper';
import {
  validateBankAccount,
  validateUserForm,
  validateCategoryInput,
  validateProjectStatusInput,
} from '../utils/settingsValidators';
import { Profile, User } from '../../../types';

describe('Settings Business Config Helper', () => {
  it('provides sensible business identity defaults when profile is empty or partial', () => {
    const config = getBusinessConfig(null);
    expect(config.companyName).toBe(DEFAULT_BUSINESS_NAME);
    expect(config.brandColor).toBe(DEFAULT_BRAND_COLOR);
    expect(config.bankAccount).toBe('');
    expect(config.ownerName).toBe('');
    expect(config.termsAndConditions).toBeTruthy();
  });

  it('correctly maps all business fields from profile and publicPageConfig', () => {
    const mockProfile: Partial<Profile> = {
      companyName: 'Vena Wedding Studio',
      fullName: 'Nopian Hadi',
      email: 'nopian@example.com',
      phone: '081234567890',
      secondaryPhone: '08987654321',
      address: 'Jl. Ahmad Yani No. 10, Serang',
      bankAccount: 'BCA 123456789 a.n. Nopian Hadi',
      authorizedSigner: 'Nopian Hadi, S.Kom',
      brandColor: '#ff5722',
      logoBase64: 'https://storage.example.com/logo.png',
      signatureBase64: 'https://storage.example.com/sign.png',
      publicPageConfig: {
        template: 'classic',
        title: 'Vena Wedding Studio',
        introduction: '',
        galleryImages: [],
        socialMedia: {
          instagram: '@venapictures',
          tiktok: '@venaofficial',
        },
      },
    };

    const config = getBusinessConfig(mockProfile);
    expect(config.companyName).toBe('Vena Wedding Studio');
    expect(config.ownerName).toBe('Nopian Hadi');
    expect(config.email).toBe('nopian@example.com');
    expect(config.phone).toBe('081234567890');
    expect(config.bankAccount).toBe('BCA 123456789 a.n. Nopian Hadi');
    expect(config.authorizedSigner).toBe('Nopian Hadi, S.Kom');
    expect(config.brandColor).toBe('#ff5722');
    expect(config.logoUrl).toBe('https://storage.example.com/logo.png');
    expect(config.signatureUrl).toBe('https://storage.example.com/sign.png');
    expect(config.socialMedia.instagram).toBe('@venapictures');
    expect(config.socialMedia.tiktok).toBe('@venaofficial');
  });

  it('formats company meta text consistently for invoices and payment slips', () => {
    const mockProfile: Partial<Profile> = {
      companyName: 'Attera Visual',
      address: 'Jl. Merdeka No. 45',
      phone: '08123456789',
      email: 'info@atteravisual.com',
    };

    const meta = formatCompanyMetaText(mockProfile);
    expect(meta).toBe('Attera Visual | Jl. Merdeka No. 45 | 08123456789 • info@atteravisual.com');
  });

  it('builds consistent template variables for WhatsApp communication', () => {
    const mockProfile: Partial<Profile> = {
      companyName: 'Attera Visual',
      bankAccount: 'Mandiri 987654321 a.n. Attera',
      phone: '08123456789',
      email: 'info@atteravisual.com',
      fullName: 'Rizki Founder',
    };

    const vars = getBusinessTemplateVariables(mockProfile);
    expect(vars.companyName).toBe('Attera Visual');
    expect(vars.bankAccount).toBe('Mandiri 987654321 a.n. Attera');
    expect(vars.companyPhone).toBe('08123456789');
    expect(vars.companyEmail).toBe('info@atteravisual.com');
    expect(vars.ownerName).toBe('Rizki Founder');
  });
});

describe('Settings Validators', () => {
  it('validates bank accounts properly', () => {
    expect(validateBankAccount('').isValid).toBe(true);
    expect(validateBankAccount('BCA 1234567890 a.n. Vendor').isValid).toBe(true);
    expect(validateBankAccount('12').isValid).toBe(false);
  });

  it('validates user form inputs including duplicate emails and password confirmation', () => {
    const existingUsers: User[] = [
      { id: 'user-1', email: 'admin@example.com', password: 'secretpassword', fullName: 'Admin', role: 'Admin' },
    ];

    // Missing full name
    const res1 = validateUserForm(
      { fullName: '', email: 'new@example.com', password: 'password123', confirmPassword: 'password123', role: 'Member', permissions: [] },
      'add',
      existingUsers,
    );
    expect(res1.isValid).toBe(false);
    expect(res1.error).toContain('Nama lengkap');

    // Duplicate email on add
    const res2 = validateUserForm(
      { fullName: 'Dupe', email: 'admin@example.com', password: 'password123', confirmPassword: 'password123', role: 'Member', permissions: [] },
      'add',
      existingUsers,
    );
    expect(res2.isValid).toBe(false);
    expect(res2.error).toContain('sudah digunakan');

    // Mismatched password
    const res3 = validateUserForm(
      { fullName: 'User', email: 'user@example.com', password: 'password123', confirmPassword: 'different', role: 'Member', permissions: [] },
      'add',
      existingUsers,
    );
    expect(res3.isValid).toBe(false);
    expect(res3.error).toContain('tidak cocok');

    // Valid edit
    const res4 = validateUserForm(
      { fullName: 'Admin Updated', email: 'admin@example.com', password: '', confirmPassword: '', role: 'Admin', permissions: [] },
      'edit',
      existingUsers,
      'user-1',
    );
    expect(res4.isValid).toBe(true);
  });

  it('validates category inputs and prevents duplicates', () => {
    const categories = ['Pernikahan', 'Lamaran', 'Pre-Wedding'];

    expect(validateCategoryInput('', categories, null).isValid).toBe(false);
    expect(validateCategoryInput('Pernikahan', categories, null).isValid).toBe(false);
    expect(validateCategoryInput('pernikahan', categories, null).isValid).toBe(false);
    expect(validateCategoryInput('Akad Nikah', categories, null).isValid).toBe(true);
    expect(validateCategoryInput('Pernikahan', categories, 'Pernikahan').isValid).toBe(true);
  });

  it('validates project status names and prevents duplicates', () => {
    const statuses = [
      { id: 'status-1', name: 'Booking DP' },
      { id: 'status-2', name: 'Editing Selesai' },
    ];

    expect(validateProjectStatusInput('', statuses).isValid).toBe(false);
    expect(validateProjectStatusInput('Booking DP', statuses).isValid).toBe(false);
    expect(validateProjectStatusInput('Proses Cetak', statuses).isValid).toBe(true);
    expect(validateProjectStatusInput('Booking DP', statuses, 'status-1').isValid).toBe(true);
  });
});
