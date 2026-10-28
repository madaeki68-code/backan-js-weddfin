import {
    Transaction,
    FinancialPocket,
    Profile,
    Project,
    Card,
    TeamMember,
    TeamProjectPayment,
    TeamPaymentRecord,
} from '../../../types';

export type FinanceTabType =
    | 'transactions'
    | 'pockets'
    | 'cards'
    | 'cashflow'
    | 'laporan'
    | 'report-clients'
    | 'report-categories'
    | 'balance-sheet'
    | 'labaAcara Pernikahan';

export interface FinanceProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    profile: Profile;
    cards: Card[];
    setCards: React.Dispatch<React.SetStateAction<Card[]>>;
    teamMembers: TeamMember[];
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    teamPaymentRecords: TeamPaymentRecord[];
    setTeamPaymentRecords: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
}

export type FinanceModalType = null | 'transaction' | 'pocket' | 'card' | 'transfer' | 'topup-cash';

export interface CashflowChartItem {
    label: string;
    income: number;
    expense: number;
    balance: number;
    isProjected?: boolean;
    projectedReceivables?: number;
    net: number;
}

export interface DecisionInsight {
    projectedNetTotal: number;
    projectedEndBalance: number;
    minProjectedBalance: number;
    upcomingReceivablesTotal: number;
    avgMonthlySurplus: number;
    status: 'healthy' | 'caution' | 'warning';
}

export interface CategoryTotals {
    income: Record<string, number>;
    expense: Record<string, number>;
}
