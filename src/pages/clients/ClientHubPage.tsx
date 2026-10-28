import React from 'react';
import {
  Client,
  Project,
  Transaction,
  Package,
  AddOn,
  ViewType,
  NavigationAction,
  Card,
  Profile,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
  FinancialPocket,
} from '../../types';
import { ArrowLeft } from 'lucide-react';
import WeddingDetailContainer from '../../features/wedding-detail/components/WeddingDetailContainer';

interface ClientHubPageProps {
  client: Client | null;
  projects: Project[];
  transactions: Transaction[];
  packages: Package[];
  addOns?: AddOn[];
  onBack: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onViewInvoice: (project: Project) => void;
  handleNavigation: (view: ViewType, action?: NavigationAction) => void;
  onRecordPayment?: (projectId: string, amount: number, destinationCardId: string) => void;
  cards?: Card[];
  onSharePortal: (client: Client) => void;
  onDeleteProject?: (projectId: string) => void;
  showNotification: (message: string) => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setCards?: React.Dispatch<React.SetStateAction<Card[]>>;
  profile?: Profile;
  teamMembers?: TeamMember[];
  teamProjectPayments?: TeamProjectPayment[];
  setTeamProjectPayments?: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords?: TeamPaymentRecord[];
  pockets?: FinancialPocket[];
  setPockets?: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
}

export const ClientHubPage: React.FC<ClientHubPageProps> = ({
  client,
  projects,
  transactions,
  packages,
  addOns = [],
  onBack,
  onEditClient,
  onDeleteClient,
  onViewReceipt,
  onViewInvoice,
  handleNavigation,
  cards = [],
  onSharePortal,
  showNotification,
  setProjects,
  setTransactions,
  setCards,
  profile,
  teamMembers = [],
  teamProjectPayments = [],
  setTeamProjectPayments,
  teamPaymentRecords = [],
  pockets = [],
  setPockets,
}) => {
  if (!client) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pengantin
        </button>
        <div className="p-8 text-center text-xs text-brand-text-secondary bg-white rounded-2xl border border-brand-border">
          Pengantin tidak ditemukan.
        </div>
      </div>
    );
  }

  const defaultProfile: Profile = profile || {
    name: 'Attera Visual',
    phone: '',
    email: '',
    projectStatusConfig: [],
  } as any;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-text-secondary hover:text-brand-text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pengantin
      </button>

      <WeddingDetailContainer
        client={client}
        profile={defaultProfile}
        projects={projects}
        setProjects={setProjects}
        transactions={transactions}
        setTransactions={setTransactions}
        packages={packages}
        addOns={addOns}
        cards={cards}
        setCards={setCards}
        pockets={pockets}
        setPockets={setPockets}
        teamMembers={teamMembers}
        teamProjectPayments={teamProjectPayments}
        setTeamProjectPayments={setTeamProjectPayments}
        teamPaymentRecords={teamPaymentRecords}
        showNotification={showNotification}
        onEditClient={onEditClient}
        onDeleteClient={onDeleteClient}
        onViewInvoice={onViewInvoice}
        onViewReceipt={onViewReceipt}
        onSharePortal={onSharePortal}
        handleNavigation={handleNavigation}
        onClose={onBack}
      />
    </div>
  );
};

export default ClientHubPage;
