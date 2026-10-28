import { LeadStatus, ContactChannel } from '../../../types';

export const sourceColors: Record<ContactChannel, string> = {
  [ContactChannel.INSTAGRAM]: '#c13584',
  [ContactChannel.WHATSAPP]: '#25D366',
  [ContactChannel.WEBSITE]: '#3b82f6',
  [ContactChannel.REFERRAL]: '#f59e0b',
  [ContactChannel.PHONE]: '#8b5cf6',
  [ContactChannel.SUGGESTION_FORM]: '#14b8a6',
  [ContactChannel.OTHER]: '#64748b',
};

export interface StatusConfigItem {
  color: string;
  softBg: string;
  badgeClass: string;
  title: string;
  surface: string;
  border: string;
}

export const statusConfig: Record<LeadStatus, StatusConfigItem> = {
  [LeadStatus.DISCUSSION]: {
    color: '#3563E9',
    softBg: '#ECF2FF',
    badgeClass: 'bg-[#ECF2FF] text-[#2348C7] border border-[#CFE0FF]',
    title: 'Diskusi',
    surface: '#F7FAFF',
    border: '#D9E5FF',
  },
  [LeadStatus.FOLLOW_UP]: {
    color: '#8B5CF6',
    softBg: '#F3E8FF',
    badgeClass: 'bg-[#F3E8FF] text-[#6F38D9] border border-[#E2D0FF]',
    title: 'Follow Up',
    surface: '#FAF7FF',
    border: '#E7D8FF',
  },
  [LeadStatus.CONVERTED]: {
    color: '#14A76C',
    softBg: '#EAFBF2',
    badgeClass: 'bg-[#EAFBF2] text-[#0F8C5A] border border-[#CDEEDC]',
    title: 'Dikonversi',
    surface: '#F5FFF9',
    border: '#D2F0E0',
  },
  [LeadStatus.REJECTED]: {
    color: '#EA5A47',
    softBg: '#FCECEC',
    badgeClass: 'bg-[#FCECEC] text-[#C63F31] border border-[#F7C8C8]',
    title: 'Ditolak',
    surface: '#FFF9F8',
    border: '#F7D0CC',
  },
};
