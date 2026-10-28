import type {
  TeamMember as BaseTeamMember,
  TeamProjectPayment as BaseTeamProjectPayment,
  TeamPaymentRecord as BaseTeamPaymentRecord,
  AssignedTeamMember as BaseAssignedTeamMember,
  PerformanceNote,
  PerformanceNoteType,
  Project,
  Card,
  FinancialPocket,
  Profile,
  Transaction,
  NavigationAction,
} from '../../../types';

export type TeamMemberStatus = 'Aktif' | 'Nonaktif';

export type TeamMemberCategory = 'Tim' | 'Karyawan' | 'Vendor';

export type TeamSpecialization =
  | 'Makeup Artist'
  | 'Hair Stylist'
  | 'Assistant MUA'
  | 'Hijab Stylist'
  | 'Beauty Assistant'
  | 'Fotografer'
  | 'Videografer'
  | 'Editor'
  | 'Lainnya'
  | string;

export interface TeamMember extends BaseTeamMember {
  status?: TeamMemberStatus;
}

export type TeamProjectPayment = BaseTeamProjectPayment;
export type TeamPaymentRecord = BaseTeamPaymentRecord;
export type AssignedTeamMember = BaseAssignedTeamMember;
export type { PerformanceNote, PerformanceNoteType };

export interface TeamMemberFormData {
  name: string;
  role: string;
  specialization?: string;
  category: TeamMemberCategory;
  status?: TeamMemberStatus;
  phone: string;
  email: string;
  location?: string; // Alamat / Domisili
  emergencyContact?: string;
  standardFee: number;
  bankName?: string;
  noRek: string;
  avatarUrl?: string;
}

export type DetailTab = 'projects' | 'salary' | 'payments' | 'performance' | 'create-payment';

export type MainTab = 'team' | 'employee' | 'vendor' | 'unpaid' | 'bukti' | 'analytics';

export interface QrModalContent {
  title: string;
  url: string;
}

export interface MemberGroups {
  team: TeamMember[];
  employee: TeamMember[];
  vendor: TeamMember[];
}

export interface SectionStats {
  totalMembers: number;
  totalUnpaid: string;
  topRatedName: string;
  topRatedRating: string;
  totalWeddingEvents: number;
  totalPaid: string;
  totalUnpaidRaw: string;
  totalPaidCount: number;
  totalUnpaidCount: number;
  avgRating: string;
  performanceNotesCount: number;
}

export interface OverallStats {
  totalPayout: string;
  totalProjectsHandled: number;
  avgRating: string;
}

export interface UnpaidPaymentItem {
  payment: TeamProjectPayment;
  member: TeamMember | undefined;
  project: Project | undefined;
}

export interface FreelancersProps {
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  teamProjectPayments: TeamProjectPayment[];
  setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords: TeamPaymentRecord[];
  setTeamPaymentRecords: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userProfile: Profile;
  showNotification: (message: string) => void;
  initialAction: NavigationAction | null;
  setInitialAction: (action: NavigationAction | null) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  pockets: FinancialPocket[];
  setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  onSignPaymentRecord: (recordId: string, signatureDataUrl: string) => void;
  totals: {
    projects: number;
    activeProjects: number;
    clients: number;
    activeClients: number;
    leads: number;
    discussionLeads: number;
    followUpLeads: number;
    teamMembers: number;
    transactions: number;
    revenue: number;
    expense: number;
  };
}
