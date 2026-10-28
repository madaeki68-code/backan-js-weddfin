import type {
  Lead,
  LeadStatus,
  ContactChannel,
  Client,
  Project,
  Package,
  AddOn,
  Transaction,
  Profile,
  Card,
  FinancialPocket,
  PromoCode,
  ViewType,
  NavigationAction,
  ClientType,
} from '../../../types';

export type {
  Lead,
  LeadStatus,
  ContactChannel,
  Client,
  Project,
  Package,
  AddOn,
  Transaction,
  Profile,
  Card,
  FinancialPocket,
  PromoCode,
  ViewType,
  NavigationAction,
  ClientType,
};

export type LeadModalMode = 'add' | 'edit';

export type LeadViewMode = 'kanban' | 'table';

export type LeadStatViewMode = 'insights' | 'pipeline';

export interface LeadCardFilter {
  type: 'city' | 'event_month' | 'source' | 'active' | 'converted';
  label: string;
  value?: string;
}

export interface LeadFilterCriteria {
  searchTerm: string;
  sourceFilter: ContactChannel | 'all';
  cityFilter: string;
  dateFrom: string;
  dateTo: string;
  activeCardFilter: LeadCardFilter | null;
}

export interface LeadFormData {
  name: string;
  contactChannel: ContactChannel;
  location: string;
  address?: string;
  whatsapp?: string;
  notes?: string;
  eventDate?: string;
  date?: string;
  status?: LeadStatus;
}

export interface ConvertLeadFormData {
  clientName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  clientType: ClientType;
  projectName: string;
  projectType: string;
  location: string;
  address?: string;
  date: string;
  packageId: string;
  selectedAddOnIds: string[];
  unitPrice?: number | string;
  durationSelection?: string;
  dp: string | number;
  dpDestinationCardId: string;
  notes?: string;
  promoCodeId?: string;
}

export interface LeadShareState {
  type: 'package' | 'booking';
  lead: Lead;
}

export interface LeadStatsSummary {
  totalLeads: number;
  activeLeads: number;
  discussionLeads: number;
  followUpLeads: number;
  convertedLeads: number;
  rejectedLeads: number;
  conversionRate: number;
  newThisMonth: number;
}

export interface LeadCityStats {
  topCity: string;
  topCount: number;
  hasData: boolean;
  ranking: [string, number][];
}

export interface LeadEventMonthStats {
  topMonth: string;
  topCount: number;
  withDateCount: number;
  hasData: boolean;
  ranking: [string, number][];
}

export interface LeadSourceStats {
  topSource: ContactChannel;
  topCount: number;
  hasData: boolean;
  ranking: [ContactChannel, number][];
}

export interface LeadsPageTotals {
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
}

export interface LeadsPageProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  packages: Package[];
  addOns: AddOn[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userProfile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  showNotification: (message: string, duration?: number) => void;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  pockets: FinancialPocket[];
  setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  handleNavigation?: (view: ViewType, action?: NavigationAction) => void;
  totals?: LeadsPageTotals;
  initialAction?: NavigationAction | null;
  setInitialAction?: React.Dispatch<React.SetStateAction<NavigationAction | null>>;
}
