import {
  Client,
  Project,
  PaymentStatus,
  Package,
  AddOn,
  Transaction,
  Card,
  Profile,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
  FinancialPocket,
  NavigationAction,
  ViewType,
} from '../../../types';
import { ProjectMeeting } from '../../../services/calendarEvents';

export type PrimaryWeddingDetailTab = 'acara' | 'pembayaran' | 'invoice';

export type WeddingDetailTab =
  | 'overview'
  | 'schedule'
  | 'package'
  | 'payment'
  | 'invoice'
  | 'team'
  | 'tasks'
  | 'timeline'
  | 'communication'
  | 'acara'
  | 'pembayaran';


export interface WeddingFinancialSummary {
  totalCost: number;
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  isOverdue: boolean;
  overdueDays: number;
  totalTeamFees: number;
  totalExpenses: number;
  estimatedProfit: number;
}

export interface WeddingProgressSummary {
  currentStatus: string;
  completedSubStatuses: number;
  totalSubStatuses: number;
  percent: number;
}

export interface WeddingDetailContextValue {
  client: Client;
  activeProject: Project | null;
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  selectedPackage: Package | null;
  addOns?: AddOn[];
  transactions: Transaction[];
  projectTransactions: Transaction[];
  teamMembers: TeamMember[];
  teamProjectPayments: TeamProjectPayment[];
  teamPaymentRecords: TeamPaymentRecord[];
  cards: Card[];
  pockets: FinancialPocket[];
  profile: Profile;
  meetings: ProjectMeeting[];
  financial: WeddingFinancialSummary;
  progress: WeddingProgressSummary;
  // Actions
  onUpdateProjectStatus: (status: string) => Promise<void>;
  onToggleSubStatus: (subStatusName: string, active: boolean) => Promise<void>;
  onSaveFinalDriveLink: (link: string) => Promise<void>;
  onRecordPayment: (amount: number, destinationCardId: string, proofFile?: File | null) => Promise<void>;
  onAddExtraCharge: (name: string, amount: number) => Promise<void>;
  onDeleteExtraCharge: (chargeId: string) => Promise<void>;
  onAddProjectExpense: (data: { date: string; description: string; amount: number; category: string; sourceId: string }) => Promise<void>;
  onDeleteProjectExpense: (txId: string) => Promise<void>;
  onPayTeamMember: (payment: TeamProjectPayment, sourceId: string) => Promise<void>;
  onAddMeeting: (meeting: Omit<ProjectMeeting, 'id' | 'projectId'>) => Promise<void>;
  onDeleteMeeting: (meetingId: string) => Promise<void>;
  onUpdateNotes: (notes: string) => Promise<void>;
  // Navigation / callbacks
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onViewInvoice: (project: Project) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onSharePortal: (client: Client) => void;
  handleNavigation: (view: ViewType, action?: NavigationAction) => void;
  showNotification: (message: string) => void;
  onClose?: () => void;
}
