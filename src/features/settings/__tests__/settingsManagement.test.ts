import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../services/settings.service';
import { Profile, Package } from '../../../types';

const mockProfileOps = vi.hoisted(() => ({
  upsertProfile: vi.fn(),
  updatePackage: vi.fn(),
}));

vi.mock('../../../services/profile', () => ({
  upsertProfile: mockProfileOps.upsertProfile,
  buildProfilePatch: (saved: any, next: any) => {
    const patch: any = { id: next.id || saved.id };
    Object.keys(next).forEach(k => {
      if (k !== 'id' && next[k] !== saved[k]) {
        patch[k] = next[k];
      }
    });
    return patch;
  },
}));

vi.mock('../../../services/packages', () => ({
  updatePackage: mockProfileOps.updatePackage,
}));

describe('Settings Management Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProfile: Profile = {
    id: 'profile-1',
    adminUserId: 'admin-1',
    fullName: 'Owner Name',
    companyName: 'Studio Foto',
    website: '',
    email: 'studio@example.com',
    phone: '0812345678',
    address: 'Jl. Melati No. 1',
    bankAccount: 'BCA 12345678',
    authorizedSigner: 'Owner Name',
    bio: '',
    incomeCategories: ['DP', 'Pelunasan'],
    expenseCategories: ['Honor Tim', 'Cetak Album'],
    projectTypes: ['Pernikahan'],
    eventTypes: ['Meeting'],
    assetCategories: [],
    sopCategories: [],
    packageCategories: ['Wedding Premium', 'Prewedding'],
    leadSources: ['Instagram'],
    projectStatusConfig: [],
    notificationSettings: {
      newProject: true,
      paymentConfirmation: true,
      deadlineReminder: true,
    },
    securitySettings: {
      twoFactorEnabled: false,
    },
    briefingTemplate: '',
    termsAndConditions: 'Default Terms',
    publicPageConfig: {
      template: 'classic',
      title: 'Studio Foto',
      introduction: '',
      galleryImages: [],
      backgroundImages: {},
    },
  };

  it('computes differential patches and updates business profile without redundant writes', async () => {
    mockProfileOps.upsertProfile.mockImplementation(async (patch: Partial<Profile>) => ({
      ...baseProfile,
      ...patch,
    }));

    const result = await settingsService.updateBusinessProfile(baseProfile, {
      id: 'profile-1',
      companyName: 'Attera Visual New',
    });

    expect(mockProfileOps.upsertProfile).toHaveBeenCalledWith({
      id: 'profile-1',
      companyName: 'Attera Visual New',
    });
    expect(result.companyName).toBe('Attera Visual New');
  });

  it('propagates package category rename across all affected packages when saving category changes', async () => {
    const packages: Package[] = [
      { id: 'pkg-1', name: 'Paket Diamond', category: 'Wedding Premium' } as Package,
      { id: 'pkg-2', name: 'Paket Platinum', category: 'Wedding Premium' } as Package,
      { id: 'pkg-3', name: 'Paket Prewed Basic', category: 'Prewedding' } as Package,
    ];

    mockProfileOps.updatePackage.mockImplementation(async (id: string, patch: Partial<Package>) => ({
      ...packages.find(p => p.id === id)!,
      ...patch,
    }));

    mockProfileOps.upsertProfile.mockImplementation(async (patch: Partial<Profile>) => ({
      ...baseProfile,
      ...patch,
    }));

    const renames = { 'Wedding Premium': 'Wedding Ultra Premium' };
    const newCategories = ['Wedding Ultra Premium', 'Prewedding'];

    const { updatedProfile, updatedPackages } = await settingsService.saveCategoryChanges(
      'profile-1',
      'packageCategories',
      newCategories,
      renames,
      packages,
    );

    expect(mockProfileOps.updatePackage).toHaveBeenCalledTimes(2);
    expect(mockProfileOps.updatePackage).toHaveBeenCalledWith('pkg-1', { category: 'Wedding Ultra Premium' });
    expect(mockProfileOps.updatePackage).toHaveBeenCalledWith('pkg-2', { category: 'Wedding Ultra Premium' });
    expect(mockProfileOps.upsertProfile).toHaveBeenCalledWith({
      id: 'profile-1',
      packageCategories: newCategories,
    });
    expect(updatedPackages?.length).toBe(2);
    expect(updatedProfile.packageCategories).toEqual(newCategories);
  });

  it('toggles notification preference properly', async () => {
    mockProfileOps.upsertProfile.mockImplementation(async (patch: Partial<Profile>) => ({
      ...baseProfile,
      ...patch,
    }));

    await settingsService.toggleNotificationSetting(
      'profile-1',
      baseProfile.notificationSettings,
      'newProject',
    );

    expect(mockProfileOps.upsertProfile).toHaveBeenCalledWith({
      id: 'profile-1',
      notificationSettings: {
        newProject: false,
        paymentConfirmation: true,
        deadlineReminder: true,
      },
    });
  });

  it('toggles two-factor authentication security setting properly', async () => {
    mockProfileOps.upsertProfile.mockImplementation(async (patch: Partial<Profile>) => ({
      ...baseProfile,
      ...patch,
    }));

    await settingsService.toggleTwoFactorSecurity(
      'profile-1',
      baseProfile.securitySettings,
    );

    expect(mockProfileOps.upsertProfile).toHaveBeenCalledWith({
      id: 'profile-1',
      securitySettings: {
        twoFactorEnabled: true,
      },
    });
  });

  it('saves template settings for invoice terms and conditions', async () => {
    mockProfileOps.upsertProfile.mockImplementation(async (patch: Partial<Profile>) => ({
      ...baseProfile,
      ...patch,
    }));

    const newTerms = '1. DP 50% saat booking\n2. Pelunasan H-7 acara';
    const result = await settingsService.saveTemplate('profile-1', 'termsAndConditions', newTerms);

    expect(mockProfileOps.upsertProfile).toHaveBeenCalledWith({
      id: 'profile-1',
      termsAndConditions: newTerms,
    });
    expect(result.termsAndConditions).toBe(newTerms);
  });
});
