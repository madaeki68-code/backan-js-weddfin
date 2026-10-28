import React from 'react';
import {
  Client,
  Project,
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
import { WeddingDetailTab } from '../types/weddingDetail.types';
import { useWeddingDetail } from '../hooks/useWeddingDetail';
import { useWeddingPayment } from '../hooks/useWeddingPayment';
import { formatCurrency } from '../../../utils/currency';
import WeddingDetailHeader from './WeddingDetailHeader';
import WeddingOverview from './WeddingOverview';
import WeddingSchedule from './WeddingSchedule';
import WeddingPackage from './WeddingPackage';
import WeddingPayment from './WeddingPayment';
import WeddingInvoice from './WeddingInvoice';
import WeddingTeam from './WeddingTeam';
import WeddingTasks from './WeddingTasks';
import WeddingTimeline from './WeddingTimeline';
import CommunicationHub from '../../client-communication/components/CommunicationHub';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  CreditCard,
  FileText,
  Users,
  CheckSquare,
  Clock,
  MessageSquare,
  X,
} from 'lucide-react';

export interface WeddingDetailContainerProps {
  client: Client | null;
  profile: Profile;
  projects: Project[];
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  transactions: Transaction[];
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  packages: Package[];
  addOns?: AddOn[];
  cards: Card[];
  setCards?: React.Dispatch<React.SetStateAction<Card[]>>;
  pockets: FinancialPocket[];
  setPockets?: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  teamMembers: TeamMember[];
  teamProjectPayments: TeamProjectPayment[];
  setTeamProjectPayments?: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords?: TeamPaymentRecord[];
  setTeamPaymentRecords?: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
  showNotification: (message: string) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onViewInvoice: (project: Project) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onSharePortal: (client: Client) => void;
  handleNavigation?: (view: ViewType, action?: NavigationAction) => void;
  onClose?: () => void;
  initialProjectId?: string;
  initialTab?: WeddingDetailTab;
}

export const WeddingDetailContainer: React.FC<WeddingDetailContainerProps> = ({
  client,
  profile,
  projects,
  setProjects,
  transactions,
  setTransactions,
  packages,
  addOns = [],
  cards,
  setCards,
  pockets,
  setPockets,
  teamMembers,
  teamProjectPayments,
  setTeamProjectPayments,
  teamPaymentRecords = [],
  setTeamPaymentRecords,
  showNotification,
  onEditClient,
  onDeleteClient,
  onViewInvoice,
  onViewReceipt,
  onSharePortal,
  handleNavigation = () => undefined,
  onClose,
  initialProjectId,
  initialTab = 'overview',
}) => {
  const detail = useWeddingDetail({
    client,
    projects,
    setProjects,
    transactions,
    packages,
    teamMembers,
    teamProjectPayments,
    teamPaymentRecords,
    cards,
    pockets,
    profile,
    showNotification,
    initialProjectId,
    initialTab,
  });

  const payment = useWeddingPayment({
    client,
    activeProject: detail.activeProject,
    setProjects,
    transactions,
    setTransactions,
    cards,
    setCards,
    pockets,
    setPockets,
    teamMembers,
    teamProjectPayments,
    setTeamProjectPayments,
    teamPaymentRecords,
    setTeamPaymentRecords,
    showNotification,
  });

  // Sub-tab state for Acara
  const [acaraSubTab, setAcaraSubTab] = React.useState<WeddingDetailTab>(() => {
    if (['overview', 'schedule', 'package', 'team', 'tasks', 'timeline', 'communication'].includes(initialTab)) {
      return initialTab;
    }
    return 'overview';
  });

  // Sync acaraSubTab when detail.activeTab is updated to an event sub-tab
  React.useEffect(() => {
    if (
      detail.activeTab &&
      ['overview', 'schedule', 'package', 'team', 'tasks', 'timeline', 'communication'].includes(detail.activeTab)
    ) {
      setAcaraSubTab(detail.activeTab);
    }
  }, [detail.activeTab]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-brand-text-secondary">
        <p className="font-semibold text-brand-text-primary text-sm mb-1">Pengantin tidak ditemukan</p>
        <p>Silakan pilih kembali pengantin dari daftar.</p>
      </div>
    );
  }

  // Primary 3-tab layout state
  const isPaymentTab = detail.activeTab === 'payment' || detail.activeTab === 'pembayaran';
  const isInvoiceTab = detail.activeTab === 'invoice';
  const primaryTab: 'acara' | 'pembayaran' | 'invoice' = isPaymentTab
    ? 'pembayaran'
    : isInvoiceTab
    ? 'invoice'
    : 'acara';


  const handleSelectPrimaryTab = (tab: 'acara' | 'pembayaran' | 'invoice') => {
    if (tab === 'pembayaran') {
      detail.setActiveTab('payment');
    } else if (tab === 'invoice') {
      detail.setActiveTab('invoice');
    } else {
      detail.setActiveTab(acaraSubTab);
    }
  };

  const handleSelectAcaraSubTab = (subTabKey: WeddingDetailTab) => {
    setAcaraSubTab(subTabKey);
    detail.setActiveTab(subTabKey);
  };

  const invoiceNumber = detail.activeProject
    ? `INV-${detail.activeProject.id.slice(0, 6).toUpperCase()}`
    : 'INV-NEW';

  // 3 Primary Tabs
  const primaryTabs = [
    {
      key: 'acara' as const,
      label: 'Acara',
      sublabel: 'Rundown, Paket & Tim',
      icon: <Calendar className="w-4 h-4" />,
      badge: detail.activeProject?.status || 'Terjadwal',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      key: 'pembayaran' as const,
      label: 'Pembayaran',
      sublabel: 'DP, Pelunasan & Kas',
      icon: <CreditCard className="w-4 h-4" />,
      badge:
        detail.financial.remainingBalance > 0
          ? `Sisa ${formatCurrency(detail.financial.remainingBalance)}`
          : 'Lunas ✅',
      badgeColor:
        detail.financial.remainingBalance > 0
          ? 'bg-amber-100 text-amber-800'
          : 'bg-emerald-100 text-emerald-800',
    },
    {
      key: 'invoice' as const,
      label: 'Invoice',
      sublabel: 'Tagihan & Kirim WA',
      icon: <FileText className="w-4 h-4" />,
      badge: invoiceNumber,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
  ];

  // Sub-tabs inside Acara
  const acaraSubTabs: { key: WeddingDetailTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { key: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    {
      key: 'schedule',
      label: 'Jadwal & Rundown',
      icon: <Calendar className="w-3.5 h-3.5" />,
      badge: detail.meetings.length > 0 ? detail.meetings.length : undefined,
    },
    { key: 'package', label: 'Paket & Layanan', icon: <Sparkles className="w-3.5 h-3.5" /> },
    {
      key: 'team',
      label: 'Tim & Kru',
      icon: <Users className="w-3.5 h-3.5" />,
      badge:
        detail.teamProjectPayments.filter(p => p.projectId === detail.activeProject?.id).length ||
        undefined,
    },
    {
      key: 'tasks',
      label: 'Progres & Tugas',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      badge: `${detail.progress.percent}%`,
    },
    { key: 'timeline', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'communication', label: 'Komunikasi', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ── Header Card ─────────────────────────────────────────────────── */}
      <WeddingDetailHeader
        client={client}
        activeProject={detail.activeProject}
        projects={detail.clientProjects}
        activeProjectId={detail.activeProjectId}
        onSelectProject={detail.setActiveProjectId}
        profile={profile}
        financial={detail.financial}
        onEditClient={onEditClient}
        onSharePortal={onSharePortal}
        onClose={onClose}
      />

      {/* ── Primary 3 Main Tabs ──────────────────────────────────────────── */}
      <div className="p-1.5 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {primaryTabs.map(tab => {
            const isActive = primaryTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleSelectPrimaryTab(tab.key)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10'
                    : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-black block tracking-tight">{tab.label}</span>
                    <span
                      className={`text-[10px] block truncate ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {tab.sublabel}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 truncate max-w-[120px] ${
                    isActive ? 'bg-white/20 text-white' : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Secondary Sub-tabs (Inside Tab Acara) ───────────────────────── */}
      {primaryTab === 'acara' && (
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-50 border border-brand-border/70 overflow-x-auto no-scrollbar">
          {acaraSubTabs.map(subTab => {
            const isSubActive = acaraSubTab === subTab.key;
            return (
              <button
                key={subTab.key}
                type="button"
                onClick={() => handleSelectAcaraSubTab(subTab.key)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isSubActive
                    ? 'bg-brand-accent text-white shadow-xs'
                    : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-white/80'
                }`}
              >
                {subTab.icon}
                <span>{subTab.label}</span>
                {subTab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isSubActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {subTab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Tab Content Views ────────────────────────────────────────────── */}
      <div className="pt-1 animate-fade-in">
        {/* 1. Tab Acara Views */}
        {primaryTab === 'acara' && (
          <>
            {acaraSubTab === 'overview' && (
              <WeddingOverview
                client={client}
                activeProject={detail.activeProject}
                selectedPackage={detail.selectedPackage}
                financial={detail.financial}
                progress={detail.progress}
                meetings={detail.meetings}
                projectTransactions={detail.projectTransactions}
                onNavigateTab={(tab) => {
                  if (tab === 'payment') {
                    handleSelectPrimaryTab('pembayaran');
                  } else if (tab === 'invoice') {
                    handleSelectPrimaryTab('invoice');
                  } else {
                    handleSelectAcaraSubTab(tab);
                  }
                }}
                onViewInvoice={onViewInvoice}
                onEditClient={onEditClient}
              />
            )}

            {acaraSubTab === 'schedule' && (
              <WeddingSchedule
                activeProject={detail.activeProject}
                meetings={detail.meetings}
                loadingMeetings={detail.loadingMeetings}
                onAddMeeting={detail.onAddMeeting}
                onDeleteMeeting={detail.onDeleteMeeting}
              />
            )}

            {acaraSubTab === 'package' && (
              <WeddingPackage
                activeProject={detail.activeProject}
                selectedPackage={detail.selectedPackage}
                addOns={addOns}
                profile={profile}
              />
            )}

            {acaraSubTab === 'team' && (
              <WeddingTeam
                activeProject={detail.activeProject}
                teamMembers={teamMembers}
                teamProjectPayments={teamProjectPayments}
                teamPaymentRecords={teamPaymentRecords}
                cards={cards}
                pockets={pockets}
                profile={profile}
                onPayTeamMember={payment.payTeamMember}
                showNotification={showNotification}
              />
            )}

            {acaraSubTab === 'tasks' && (
              <WeddingTasks
                client={client}
                activeProject={detail.activeProject}
                profile={profile}
                progress={detail.progress}
                onUpdateProjectStatus={detail.onUpdateProjectStatus}
                onToggleSubStatus={detail.onToggleSubStatus}
                onSaveFinalDriveLink={detail.onSaveFinalDriveLink}
                onUpdateNotes={detail.onUpdateNotes}
              />
            )}

            {acaraSubTab === 'timeline' && (
              <WeddingTimeline
                client={client}
                activeProject={detail.activeProject}
                financial={detail.financial}
                projectTransactions={detail.projectTransactions}
                meetings={detail.meetings}
              />
            )}

            {acaraSubTab === 'communication' && (
              <CommunicationHub
                client={client}
                projects={detail.clientProjects}
                profile={profile}
                showNotification={showNotification}
              />
            )}
          </>
        )}

        {/* 2. Tab Pembayaran Focus */}
        {primaryTab === 'pembayaran' && (
          <WeddingPayment
            client={client}
            activeProject={detail.activeProject}
            financial={detail.financial}
            projectTransactions={detail.projectTransactions}
            cards={cards}
            pockets={pockets}
            isRecordingPayment={payment.isRecordingPayment}
            isAddingExpense={payment.isAddingExpense}
            onRecordPayment={payment.recordPayment}
            onAddExtraCharge={payment.addExtraCharge}
            onDeleteExtraCharge={payment.deleteExtraCharge}
            onAddProjectExpense={payment.addProjectExpense}
            onDeleteProjectExpense={payment.deleteProjectExpense}
            onViewReceipt={onViewReceipt}
          />
        )}

        {/* 3. Tab Invoice Focus */}
        {primaryTab === 'invoice' && (
          <WeddingInvoice
            client={client}
            activeProject={detail.activeProject}
            selectedPackage={detail.selectedPackage}
            financial={detail.financial}
            profile={profile}
            onViewInvoice={onViewInvoice}
            onNavigateToPayment={() => handleSelectPrimaryTab('pembayaran')}
          />
        )}
      </div>
    </div>
  );
};

export default WeddingDetailContainer;
