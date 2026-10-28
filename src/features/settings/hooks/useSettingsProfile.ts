import React, { useState, useEffect, useRef } from 'react';
import { Profile } from '../../../types';
import { settingsService } from '../services/settings.service';
import { BackgroundImageKey } from '../types/settings.types';

export const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

export function useSettingsProfile(
  profile: Profile,
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
) {
  const [localProfile, setLocalProfile] = useState<Profile>(profile);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingBackground, setUploadingBackground] = useState<BackgroundImageKey | null>(null);
  const [failedBackgroundPreviews, setFailedBackgroundPreviews] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState<string | null>(null);
  const profileSaveLock = useRef(false);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const triggerSuccess = (durationMs = 3000) => {
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), durationMs);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setLocalProfile(prev => ({ ...prev, logoBase64: base64 }));
    } catch (err) {
      console.error('[useSettingsProfile] Logo read failed:', err);
      setSaveError('Gagal membaca file logo.');
    }
  };

  const handleRemoveLogo = () => {
    setLocalProfile(prev => ({ ...prev, logoBase64: '' }));
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setLocalProfile(prev => ({ ...prev, signatureBase64: base64 }));
    } catch (err) {
      console.error('[useSettingsProfile] Signature read failed:', err);
      setSaveError('Gagal membaca file tanda tangan.');
    }
  };

  const handleRemoveSignature = () => {
    setLocalProfile(prev => ({ ...prev, signatureBase64: '' }));
  };

  const handleBackgroundUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: BackgroundImageKey,
  ) => {
    const file = e.target.files?.[0];
    if (!file || uploadingBackground) return;

    setUploadingBackground(key);
    setSaveError('');
    try {
      const { profile: updatedProfile } = await settingsService.uploadBackgroundAsset(
        key,
        file,
        localProfile,
      );
      setProfile(updatedProfile);
      setLocalProfile(updatedProfile);
      setFailedBackgroundPreviews(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      triggerSuccess();
    } catch (err: unknown) {
      console.error('[useSettingsProfile] Background upload failed:', err);
      setSaveError((err as Error)?.message || 'Gagal mengunggah background.');
    } finally {
      setUploadingBackground(null);
    }
  };

  const handleRemoveBackground = async (
    key: BackgroundImageKey,
    imageUrl: string,
  ) => {
    if (uploadingBackground) return;
    const labelMap: Record<BackgroundImageKey, string> = {
      clientDetail: 'Detail Pengantin',
      eventDetail: 'Detail Acara',
      bookingForm: 'Form Booking',
      portalPengantin: 'Portal Pengantin',
      leadForm: 'Form Inquiry',
    };
    if (
      !window.confirm(
        `Hapus background ${labelMap[key]}? File akan dihapus dari penyimpanan dan pengaturan.`,
      )
    ) {
      return;
    }

    setUploadingBackground(key);
    setSaveError('');
    try {
      const updatedProfile = await settingsService.removeBackgroundAsset(
        key,
        imageUrl,
        localProfile,
      );
      setProfile(updatedProfile);
      setLocalProfile(updatedProfile);
      setFailedBackgroundPreviews(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      triggerSuccess();
    } catch (err: unknown) {
      console.error('[useSettingsProfile] Background removal failed:', err);
      setSaveError((err as Error)?.message || 'Gagal menghapus background.');
    } finally {
      setUploadingBackground(null);
    }
  };

  const persistSettingsToggle = async (
    key: 'notificationSettings' | 'securitySettings',
    value: Profile['notificationSettings'] | Profile['securitySettings'],
  ) => {
    if (settingsSaving) return;
    setSettingsSaving(key);
    setSaveError('');
    try {
      if (key === 'notificationSettings') {
        const updated = await settingsService.updateBusinessProfile(profile, {
          id: profile.id,
          notificationSettings: value as Profile['notificationSettings'],
        });
        setProfile(updated);
        setLocalProfile(updated);
      } else {
        const updated = await settingsService.updateBusinessProfile(profile, {
          id: profile.id,
          securitySettings: value as Profile['securitySettings'],
        });
        setProfile(updated);
        setLocalProfile(updated);
      }
    } catch (err: unknown) {
      console.error(`[useSettingsProfile] Toggle ${key} failed:`, err);
      setSaveError('Gagal menyimpan pengaturan: ' + ((err as Error)?.message || 'Coba lagi.'));
    } finally {
      setSettingsSaving(null);
    }
  };

  const handleNotificationChange = (key: keyof Profile['notificationSettings']) => {
    const base = profile.notificationSettings ?? {
      newProject: false,
      paymentConfirmation: false,
      deadlineReminder: false,
    };
    const next = { ...base, [key]: !(profile.notificationSettings?.[key] ?? false) };
    void persistSettingsToggle('notificationSettings', next);
  };

  const handleTwoFactorChange = () => {
    const base = profile.securitySettings ?? { twoFactorEnabled: false };
    const next = { twoFactorEnabled: !base.twoFactorEnabled };
    void persistSettingsToggle('securitySettings', next);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileSaveLock.current || isSaving) return;
    profileSaveLock.current = true;
    setIsSaving(true);
    setSaveError('');
    try {
      const updated = await settingsService.updateBusinessProfile(profile, localProfile);
      setProfile(updated);
      setLocalProfile(updated);
      triggerSuccess();
    } catch (err: unknown) {
      console.error('[useSettingsProfile] Save profile failed:', err);
      setSaveError((err as Error)?.message || 'Gagal menyimpan profil.');
    } finally {
      profileSaveLock.current = false;
      setIsSaving(false);
    }
  };

  return {
    localProfile,
    setLocalProfile,
    showSuccess,
    triggerSuccess,
    isSaving,
    saveError,
    setSaveError,
    uploadingBackground,
    failedBackgroundPreviews,
    setFailedBackgroundPreviews,
    settingsSaving,
    handleInputChange,
    handleLogoChange,
    handleRemoveLogo,
    handleSignatureChange,
    handleRemoveSignature,
    handleBackgroundUpload,
    handleRemoveBackground,
    handleNotificationChange,
    handleTwoFactorChange,
    handleProfileSubmit,
  };
}
