import { Profile, ProjectStatusConfig, Package, ChatTemplate, User, ViewType } from '../../../types';
import { upsertProfile, buildProfilePatch } from '../../../services/profile';
import { uploadImageAsset, deleteGalleryImage } from '../../../services/storage';
import { updatePackage } from '../../../services/packages';
import { listUsers, createUser, updateUser, deleteUser } from '../../../services/users';
import { BackgroundImageKey, SettingsCategoryKey, TemplateSettingKey } from '../types/settings.types';
import { SHARE_TEMPLATE_CONFIGS } from '../constants/settings.constants';

export const settingsService = {
  /**
   * Saves partial business profile changes using differential patch calculation
   */
  async updateBusinessProfile(
    savedProfile: Profile,
    nextProfile: Partial<Profile> & { id: string },
  ): Promise<Profile> {
    const patch = buildProfilePatch(savedProfile, nextProfile);
    const changedKeys = Object.keys(patch).filter(k => k !== 'id');
    if (changedKeys.length === 0) {
      return savedProfile;
    }
    return await upsertProfile(patch);
  },

  /**
   * Uploads background image for public and detail pages into Supabase Storage
   */
  async uploadBackgroundAsset(
    key: BackgroundImageKey,
    file: File,
    currentProfile: Profile,
  ): Promise<{ profile: Profile; url: string }> {
    const url = await uploadImageAsset(file, 'portal-assets');

    const nextBackgroundImages = {
      ...(currentProfile.publicPageConfig?.backgroundImages || {}),
      [key]: url,
    };

    const nextPublicPageConfig = {
      ...currentProfile.publicPageConfig,
      backgroundImages: nextBackgroundImages,
    };

    const updatedProfile = await upsertProfile({
      id: currentProfile.id,
      publicPageConfig: nextPublicPageConfig,
    } as Partial<Profile> & { id: string });

    return { profile: updatedProfile, url };
  },

  /**
   * Removes background image from public config and deletes from storage
   */
  async removeBackgroundAsset(
    key: BackgroundImageKey,
    imageUrl: string,
    currentProfile: Profile,
  ): Promise<Profile> {
    const nextBackgroundImages = { ...(currentProfile.publicPageConfig?.backgroundImages || {}) };
    delete nextBackgroundImages[key];

    const nextPublicPageConfig = {
      ...currentProfile.publicPageConfig,
      backgroundImages: nextBackgroundImages,
    };

    const updatedProfile = await upsertProfile({
      id: currentProfile.id,
      publicPageConfig: nextPublicPageConfig,
    } as Partial<Profile> & { id: string });

    try {
      await deleteGalleryImage(imageUrl);
    } catch (storageError) {
      console.warn('[SettingsService] Background file deletion failed in storage:', storageError);
    }

    return updatedProfile;
  },

  /**
   * Saves category values and propagates package category renames across packages
   */
  async saveCategoryChanges(
    profileId: string,
    key: SettingsCategoryKey,
    values: string[],
    packageCategoryRenames?: Record<string, string>,
    packages?: Package[],
  ): Promise<{ updatedProfile: Profile; updatedPackages?: Package[] }> {
    let updatedPackagesResult: Package[] | undefined = undefined;

    if (key === 'packageCategories' && packageCategoryRenames && packages) {
      const affectedPackages = packages.filter(pkg => packageCategoryRenames[pkg.category]);
      const results = await Promise.allSettled(
        affectedPackages.map(pkg =>
          updatePackage(pkg.id, { category: packageCategoryRenames[pkg.category] }),
        ),
      );

      const successfulPackages = results.flatMap(result =>
        result.status === 'fulfilled' ? [result.value] : [],
      );

      if (successfulPackages.length > 0) {
        updatedPackagesResult = successfulPackages;
      }

      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(
          `${failures.length} paket gagal diperbarui. Draft kategori tetap disimpan agar dapat dicoba lagi.`,
        );
      }
    }

    const updatedProfile = await upsertProfile({
      id: profileId,
      [key]: values,
    } as Partial<Profile> & { id: string });

    return { updatedProfile, updatedPackages: updatedPackagesResult };
  },

  /**
   * Saves project status configuration
   */
  async saveProjectStatusConfig(
    profileId: string,
    config: ProjectStatusConfig[],
  ): Promise<Profile> {
    return await upsertProfile({
      id: profileId,
      projectStatusConfig: config,
    } as Partial<Profile> & { id: string });
  },

  /**
   * Saves an individual template string (e.g. termsAndConditions, briefingTemplate)
   */
  async saveTemplate(
    profileId: string,
    key: TemplateSettingKey,
    value: string,
  ): Promise<Profile> {
    return await upsertProfile({
      id: profileId,
      [key]: value,
    } as Partial<Profile> & { id: string });
  },

  /**
   * Saves all WhatsApp share templates in bulk
   */
  async saveAllShareTemplates(profile: Profile): Promise<Profile> {
    const updates: Partial<Profile> & { id: string } = {
      id: profile.id,
      packageShareTemplate: profile.packageShareTemplate,
      bookingFormTemplate: profile.bookingFormTemplate,
      invoiceShareTemplate: profile.invoiceShareTemplate,
      receiptShareTemplate: profile.receiptShareTemplate,
      expenseShareTemplate: profile.expenseShareTemplate,
      portalShareTemplate: profile.portalShareTemplate,
    };
    return await upsertProfile(updates);
  },

  /**
   * Saves chat templates
   */
  async saveChatTemplates(profileId: string, templates: ChatTemplate[]): Promise<Profile> {
    return await upsertProfile({
      id: profileId,
      chatTemplates: templates,
    } as Partial<Profile> & { id: string });
  },

  /**
   * Saves billing templates
   */
  async saveBillingTemplates(profileId: string, templates: ChatTemplate[]): Promise<Profile> {
    return await upsertProfile({
      id: profileId,
      billingTemplates: templates,
    } as Partial<Profile> & { id: string });
  },

  /**
   * Toggles notification preference setting
   */
  async toggleNotificationSetting(
    profileId: string,
    current: Profile['notificationSettings'],
    key: keyof Profile['notificationSettings'],
  ): Promise<Profile> {
    const base = current ?? { newProject: false, paymentConfirmation: false, deadlineReminder: false };
    const next = { ...base, [key]: !(current?.[key] ?? false) };
    return await upsertProfile({
      id: profileId,
      notificationSettings: next,
    } as Partial<Profile> & { id: string });
  },

  /**
   * Toggles 2FA security setting
   */
  async toggleTwoFactorSecurity(
    profileId: string,
    current: Profile['securitySettings'],
  ): Promise<Profile> {
    const base = current ?? { twoFactorEnabled: false };
    const next = { ...base, twoFactorEnabled: !base.twoFactorEnabled };
    return await upsertProfile({
      id: profileId,
      securitySettings: next,
    } as Partial<Profile> & { id: string });
  },

  /**
   * User management
   */
  async listUsers(): Promise<User[]> {
    return await listUsers();
  },

  async createUser(userData: {
    fullName: string;
    email: string;
    password?: string;
    role: User['role'];
    permissions: ViewType[];
  }): Promise<User> {
    return await createUser({
      ...userData,
      password: userData.password || '',
    });
  },

  async updateUser(
    id: string,
    userData: {
      fullName?: string;
      email?: string;
      password?: string;
      role?: User['role'];
      permissions?: ViewType[];
    },
  ): Promise<User> {
    return await updateUser(id, userData);
  },

  async deleteUser(id: string): Promise<void> {
    return await deleteUser(id);
  },
};
