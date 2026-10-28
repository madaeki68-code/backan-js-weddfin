import { useState, useEffect, useRef } from 'react';
import { SettingsProps, SettingsTabId, TemplateSettingKey } from '../types/settings.types';
import { useSettingsProfile } from './useSettingsProfile';
import { useCategorySettings } from './useCategorySettings';
import { useProjectStatusSettings } from './useProjectStatusSettings';
import { useUserManagement } from './useUserManagement';
import { useChatTemplateSettings } from './useChatTemplateSettings';
import { settingsService } from '../services/settings.service';

export function useSettings(props: SettingsProps) {
  const {
    profile,
    setProfile,
    projects,
    packages,
    setPackages,
    leads,
    users,
    setUsers,
    currentUser,
  } = props;

  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');
  const templateSaveLock = useRef(false);

  // Restore tab from localStorage if set (e.g. from redirect)
  useEffect(() => {
    try {
      const tab = window.localStorage.getItem('weddfin-settings-tab') as SettingsTabId | null;
      if (tab) {
        setActiveTab(tab);
        window.localStorage.removeItem('weddfin-settings-tab');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const profileHook = useSettingsProfile(profile, setProfile);
  const categoryHook = useCategorySettings(profile, setProfile, packages, setPackages, leads);
  const projectStatusHook = useProjectStatusSettings(profile, setProfile, projects);
  const userHook = useUserManagement(users, setUsers, currentUser, activeTab);
  const chatTemplateHook = useChatTemplateSettings(
    profile,
    setProfile,
    (msg: string) => {
      profileHook.triggerSuccess();
    },
  );

  const handleTemplateSave = async (key: TemplateSettingKey, value: string) => {
    if (templateSaveLock.current || profileHook.isSaving) return;
    templateSaveLock.current = true;
    profileHook.setSaveError('');
    try {
      const updated = await settingsService.saveTemplate(profile.id, key, value);
      setProfile(updated);
      profileHook.setLocalProfile(updated);
      profileHook.triggerSuccess();
    } catch (err: unknown) {
      console.error(`[useSettings] Save template ${key} failed:`, err);
      profileHook.setSaveError((err as Error)?.message || 'Gagal menyimpan template.');
    } finally {
      templateSaveLock.current = false;
    }
  };

  return {
    activeTab,
    setActiveTab,
    profileHook,
    categoryHook,
    projectStatusHook,
    userHook,
    chatTemplateHook,
    handleTemplateSave,
  };
}
