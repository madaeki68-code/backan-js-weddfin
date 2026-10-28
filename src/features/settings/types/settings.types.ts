import { Profile, Project, Package, Lead, User, ViewType, ProjectStatusConfig, SubStatusConfig, ChatTemplate, Transaction } from '../../../types';

export type SettingsTabId =
  | 'profile'
  | 'chatTemplates'
  | 'webPush'
  | 'users'
  | 'categories'
  | 'uiText'
  | 'projectStatus';

export interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly: boolean;
}

export type SettingsCategoryKey =
  | 'incomeCategories'
  | 'expenseCategories'
  | 'projectTypes'
  | 'eventTypes'
  | 'packageCategories'
  | 'leadSources';

export type SettingsCategoryDrafts = Partial<Record<SettingsCategoryKey, string[]>>;

export type TemplateSettingKey =
  | 'termsAndConditions'
  | 'packageShareTemplate'
  | 'bookingFormTemplate'
  | 'invoiceShareTemplate'
  | 'receiptShareTemplate'
  | 'expenseShareTemplate'
  | 'portalShareTemplate';

export type BackgroundImageKey =
  | 'clientDetail'
  | 'eventDetail'
  | 'bookingForm'
  | 'portalPengantin'
  | 'leadForm';

export interface VariableChip {
  label: string;
  desc: string;
}

export interface ShareTemplateConfig {
  key: TemplateSettingKey;
  label: string;
  desc: string;
  icon: string;
  color: string;
  placeholder: string;
  defaultValue: string;
  variables: readonly VariableChip[];
}

export interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: User['role'];
  permissions: ViewType[];
}

export interface ProjectStatusFormData {
  name: string;
  color: string;
  note: string;
  defaultProgress?: number;
  subStatuses: SubStatusConfig[];
}

export interface BusinessConfigSummary {
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  website: string;
  address: string;
  bankAccount: string;
  authorizedSigner: string;
  idNumber: string;
  bio: string;
  brandColor: string;
  logoUrl?: string;
  signatureUrl?: string;
  briefingTemplate: string;
  termsAndConditions: string;
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
  };
}

export interface SettingsProps {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  transactions: Transaction[];
  projects: Project[];
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  leads: Lead[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
}
