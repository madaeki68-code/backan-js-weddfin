import { DashboardTotals, DashboardModalType } from '../types';

export const EMPTY_DASHBOARD_TOTALS: DashboardTotals = {
  projects: 0,
  activeProjects: 0,
  clients: 0,
  activeClients: 0,
  leads: 0,
  discussionLeads: 0,
  followUpLeads: 0,
  teamMembers: 0,
  transactions: 0,
  revenue: 0,
  expense: 0,
};

export const DASHBOARD_MODAL_TITLES: Record<NonNullable<DashboardModalType>, string> = {
  balance: 'Rincian Saldo Kas & Bank',
  projects: 'Daftar Acara Pernikahan Aktif',
  clients: 'Daftar Pengantin Aktif',
  teamMembers: 'Daftar Tim & Vendor',
  payments: 'Rincian Sisa Honor Tim',
  tasks: 'Daftar Tugas / Task Pending & Terlambat',
};

export const STATUS_COLOR_MAP: Record<string, string> = {
  '#10b981': 'solid-green text-white',
  '#3b82f6': 'solid-blue text-white',
  '#8b5cf6': 'solid-purple text-white',
  '#f97316': 'solid-orange text-white',
  '#06b6d4': 'solid-cyan text-white',
  '#eab308': 'bg-amber-500 text-white',
  '#6366f1': 'solid-indigo text-white',
  '#ef4444': 'bg-red-600 text-white',
};

export const MONTH_NAMES_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const LEAD_SOURCE_COLORS = [
  '#2563EB',
  '#0891B2',
  '#16A34A',
  '#EA580C',
  '#DB2777',
  '#8B5CF6',
  '#F59E0B',
];
