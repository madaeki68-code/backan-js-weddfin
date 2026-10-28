import {
  Project,
  Client,
  Transaction,
  TeamMember,
  Card,
  FinancialPocket,
  Lead,
  TeamProjectPayment,
  ClientFeedback,
  NavigationAction,
  ProjectStatusConfig,
  Profile,
  ViewType,
} from '../../../types';

export interface DashboardTotals {
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

export interface DashboardSummary {
  totalBalance: number;
  activeProjects: number;
  activeClients: number;
  totalTeamMembers: number;
  eventsThisMonth: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  unpaidInvoices: number;
  totalUnpaidReceivables: number;
  totalUnpaidTeamHonor: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
}

export interface UpcomingEventItem {
  id: string;
  projectName: string;
  clientName: string;
  clientId: string;
  projectType: string;
  packageName: string;
  date: string;
  location: string;
  status: string;
  countdownDays: number;
  countdownText: string;
  isToday: boolean;
  totalCost: number;
  amountPaid: number;
  unpaidBalance: number;
}

export interface PendingTaskItem {
  id: string;
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  eventDate?: string;
  deadlineDate?: string;
  isOverdue: boolean;
  daysDiff: number;
}

export interface UpcomingTeamAssignment {
  projectId: string;
  projectName: string;
  eventDate: string;
  memberId: string;
  memberName: string;
  role: string;
  fee: number;
  isPaid: boolean;
}

export interface ChartDataPoint {
  name: string;
  income: number;
  expense: number;
  isProjected: boolean;
  projectedReceivables?: number;
}

export interface HealthMetric {
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  type: 'income' | 'expense' | 'margin';
}

export type DashboardModalType =
  | 'balance'
  | 'projects'
  | 'clients'
  | 'teamMembers'
  | 'payments'
  | 'tasks'
  | null;

export interface DashboardProps {
  projects?: Project[];
  clients?: Client[];
  transactions?: Transaction[];
  teamMembers?: TeamMember[];
  cards?: Card[];
  pockets?: FinancialPocket[];
  handleNavigation: (view: ViewType, action?: NavigationAction) => void;
  leads?: Lead[];
  teamProjectPayments?: TeamProjectPayment[];
  clientFeedback?: ClientFeedback[];
  projectStatusConfig?: ProjectStatusConfig[];
  profile?: Profile;
  totals?: DashboardTotals;
}
