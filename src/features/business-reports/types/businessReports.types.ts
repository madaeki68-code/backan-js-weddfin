import {
  Client,
  Lead,
  Project,
  ClientFeedback,
  SatisfactionLevel,
  ViewType,
  TeamMember,
  Package,
  TeamProjectPayment,
  TeamPaymentRecord,
  Transaction,
  Profile,
} from '../../../types';

export type ReportTab = 'tipe' | 'daerah' | 'paket' | 'tim' | 'leads';

export type StatModalType =
  | 'total'
  | 'active'
  | 'direct-vendor'
  | 'top-cities'
  | 'top-packages'
  | 'top-team'
  | 'lead-conversion'
  | 'very-satisfied'
  | 'satisfied'
  | 'neutral'
  | 'unsatisfied'
  | null;

export type ReportDatePreset = 'all' | 'this-month' | 'this-quarter' | 'this-year';

export interface CityStat {
  name: string;
  clientCount: number;
  leadCount: number;
  projectCount: number;
  totalRevenue: number;
  clients: Client[];
  leads: Lead[];
  percentage: number;
}

export interface PackageStat {
  name: string;
  category: string;
  region: string;
  pricelistPrice: number;
  orderCount: number;
  totalOmzet: number;
  avgRealizedPrice: number;
  revenueContribution: number;
  projects: Project[];
}

export interface TeamStat {
  id: string;
  name: string;
  role: string;
  category: 'Tim' | 'Karyawan' | 'Vendor';
  jobCount: number;
  totalFee: number;
  paidFee: number;
  unpaidFee: number;
  projects: { project: Project; fee: number; role: string }[];
}

export interface LeadConversionStat {
  total: number;
  converted: number;
  discussion: number;
  followUp: number;
  rejected: number;
  rate: string;
  channels: { channel: string; total: number; converted: number; rate: string }[];
}

export interface TypeReportStats {
  typeReportClients: Client[];
  typeReportDirectClients: Client[];
  typeReportVendorClients: Client[];
  typeReportProjects: Project[];
  typeReportDirectProjects: Project[];
  typeReportVendorProjects: Project[];
  typeReportDirectRevenue: number;
  typeReportVendorRevenue: number;
  typeReportRevenue: number;
  typeReportAvgDirectRevenue: number;
  typeReportAvgVendorRevenue: number;
  typeReportAvgRevenuePerClient: number;
  typeReportDirectShare: string;
  typeReportVendorShare: string;
  typeReportDirectRevenueShare: string;
  typeReportVendorRevenueShare: string;
}

export interface SatisfactionStats {
  bySatisfaction: Record<SatisfactionLevel, ClientFeedback[]>;
  counts: Record<SatisfactionLevel, number>;
  avgRating: string;
}

export interface BusinessReportsProps {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  feedback: ClientFeedback[];
  setFeedback: React.Dispatch<React.SetStateAction<ClientFeedback[]>>;
  showNotification: (message: string) => void;
  handleNavigation?: (view: ViewType, action?: unknown) => void;
  teamMembers?: TeamMember[];
  packages?: Package[];
  teamProjectPayments?: TeamProjectPayment[];
  teamPaymentRecords?: TeamPaymentRecord[];
  transactions?: Transaction[];
  profile?: Profile | null;
}
