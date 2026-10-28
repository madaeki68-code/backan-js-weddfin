import { TeamMemberFormData, TeamSpecialization } from '../types';

export const TEAM_SPECIALIZATIONS: TeamSpecialization[] = [
  'Makeup Artist',
  'Hair Stylist',
  'Assistant MUA',
  'Hijab Stylist',
  'Beauty Assistant',
  'Fotografer',
  'Videografer',
  'Editor',
  'Lainnya',
];

export const TEAM_CATEGORIES = ['Tim', 'Karyawan', 'Vendor'] as const;

export const TEAM_STATUSES = ['Aktif', 'Nonaktif'] as const;

export const EMPTY_TEAM_MEMBER_FORM: TeamMemberFormData = {
  name: '',
  role: '',
  specialization: 'Makeup Artist',
  category: 'Tim',
  status: 'Aktif',
  email: '',
  phone: '',
  location: '',
  emergencyContact: '',
  standardFee: 0,
  bankName: '',
  noRek: '',
  avatarUrl: '',
};

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];
