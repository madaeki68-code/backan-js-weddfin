import React from 'react';
import { SettingsProps } from '../types/settings.types';
import { SETTINGS_TABS } from '../constants/settings.constants';
import { useSettings } from '../hooks/useSettings';
import { BusinessProfileTab } from './tabs/BusinessProfileTab';
import { ChatTemplatesTab } from './tabs/ChatTemplatesTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { ProjectStatusTab } from './tabs/ProjectStatusTab';
import { UserManagementTab } from './tabs/UserManagementTab';
import UiTextCustomizationPanel from '../../../pages/settings/components/UiTextCustomizationPanel';
import WebPushNotificationPanel from '../../../pages/settings/components/WebPushNotificationPanel';

export const SettingsContainer: React.FC<SettingsProps> = props => {
  const { profile, setProfile, users, currentUser } = props;
  const {
    activeTab,
    setActiveTab,
    profileHook,
    categoryHook,
    projectStatusHook,
    userHook,
    chatTemplateHook,
    handleTemplateSave,
  } = useSettings(props);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <BusinessProfileTab
            profileHook={profileHook}
            profile={profile}
            setProfile={setProfile}
            onSaveTemplate={handleTemplateSave}
          />
        );
      case 'chatTemplates':
        return (
          <ChatTemplatesTab
            chatHook={chatTemplateHook}
            profile={profile}
            setProfile={setProfile}
            showSuccess={() => profileHook.triggerSuccess()}
          />
        );
      case 'webPush':
        return <WebPushNotificationPanel profile={profile} currentUser={currentUser} />;
      case 'users':
        return (
          <UserManagementTab
            userHook={userHook}
            users={users}
            currentUser={currentUser}
          />
        );
      case 'categories':
        return <CategoriesTab categoryHook={categoryHook} />;
      case 'uiText':
        return <UiTextCustomizationPanel />;
      case 'projectStatus':
        if (currentUser?.role !== 'Admin') {
          return (
            <p className="text-sm md:text-base text-brand-text-secondary">
              Anda tidak memiliki akses ke halaman ini.
            </p>
          );
        }
        return <ProjectStatusTab statusHook={projectStatusHook} profile={profile} />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-page space-y-4 md:space-y-6">
      <nav
        aria-label="Bagian pengaturan"
        className="w-full rounded-xl border border-brand-border bg-white p-2 shadow-sm md:rounded-2xl md:p-3"
      >
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
          {SETTINGS_TABS.filter(
            tab => !(tab.adminOnly && currentUser?.role !== 'Admin'),
          ).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-12 w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight transition-all sm:px-3 sm:text-sm ${
                  isActive
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 whitespace-normal break-words">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <main className="min-h-[60vh] w-full rounded-xl border border-brand-border bg-white p-3 shadow-sm md:rounded-2xl md:p-5 lg:p-6">
        {renderTabContent()}
      </main>
    </div>
  );
};
