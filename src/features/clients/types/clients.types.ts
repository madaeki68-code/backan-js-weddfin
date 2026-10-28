import {
  ClientStatus,
  ClientType,
  PaymentStatus,
  ViewType,
  TransactionType,
} from '../../../types';

import type {
  Client,
  Project,
  Package,
  AddOn,
  Transaction,
  Profile,
  NavigationAction,
  Card,
  FinancialPocket,
  ClientFeedback,
  PromoCode,
  Notification,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
} from '../../../types';

export {
  ClientStatus,
  ClientType,
  PaymentStatus,
  ViewType,
  TransactionType,
};

export type {
  Client,
  Project,
  Package,
  AddOn,
  Transaction,
  Profile,
  NavigationAction,
  Card,
  FinancialPocket,
  ClientFeedback,
  PromoCode,
  Notification,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
};

export type ClientTabType = 'active' | 'inactive' | 'all' | 'no-date' | 'this-month';

export type ClientViewSection = 'clients' | 'dues' | 'analytics' | 'finance-recap';

export type StatModalType = 'total' | 'active' | 'receivables' | 'location' | null;

export interface ClientWithSummary extends Client {
  projects: Project[];
  totalProjectValue: number;
  balanceDue: number;
  PackageTerbaru: string;
  overallPaymentStatus: PaymentStatus | null;
  mostRecentProject: Project | null;
}

export interface ClientStatsSummary {
  totalClients: number;
  activeClients: number;
  totalReceivables: string;
  mostFrequentLocation: string;
}

export interface ClientFilterState {
  searchTerm: string;
  statusFilter: string;
  monthFilter: string;
  dateFrom: string;
  dateTo: string;
  clientTab: ClientTabType;
  activeViewSection: ClientViewSection;
  showAllDues: boolean;
}

export interface ClientsTotals {
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

export interface ClientsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  packages: Package[];
  addOns: AddOn[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userProfile: Profile;
  showNotification: (message: string) => void;
  initialAction: NavigationAction | null;
  setInitialAction: (action: NavigationAction | null) => void;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  pockets: FinancialPocket[];
  setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  teamMembers: TeamMember[];
  teamProjectPayments: TeamProjectPayment[];
  setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords?: TeamPaymentRecord[];
  handleNavigation: (view: ViewType, action: NavigationAction) => void;
  clientFeedback?: ClientFeedback[];
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  onSignInvoice: (projectId: string, signatureDataUrl: string) => void;
  onSignTransaction: (transactionId: string, signatureDataUrl: string) => void;
  onRecordPayment: (projectId: string, amount: number, destinationCardId: string, proofUrl?: string) => Promise<void>;
  addNotification?: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  totals: ClientsTotals;
}

export interface ExtraChargeTemplate {
  name: string;
  category: string;
  defaultAmount: number;
  badge?: string;
}

export interface QrModalContent {
  title: string;
  url: string;
  clientName?: string;
  clientPhone?: string;
}

export interface SharePreviewContent {
  title: string;
  message: string;
  phone?: string;
}

export interface LedgerLineItem {
  label: string;
  amount: number;
}

export interface LedgerProject {
  id: string;
  name: string;
  total: number;
  items: LedgerLineItem[];
}

export interface LedgerExpenseGroup {
  id: string;
  name: string;
  total: number;
  items: LedgerLineItem[];
}
