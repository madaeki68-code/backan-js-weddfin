import React from 'react';
import {
  Client,
  Project,
  Package,
  AddOn,
  Transaction,
  Card,
  ViewType,
  NavigationAction,
  Profile,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
  FinancialPocket,
} from '../../../types';
import { DEFAULT_CHARGE_TEMPLATES, POPULAR_PRESET_CHIPS } from '../constants';
import type { ExtraChargeTemplate } from '../types';
import WeddingDetailContainer from '../../wedding-detail/components/WeddingDetailContainer';

export { DEFAULT_CHARGE_TEMPLATES, POPULAR_PRESET_CHIPS };
export type { ExtraChargeTemplate };

export interface ClientDetailModalProps {
  client: Client | null;
  profile: Profile;
  projects: Project[];
  transactions: Transaction[];
  packages: Package[];
  addOns?: AddOn[];
  onClose: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onViewInvoice: (project: Project) => void;
  handleNavigation: (view: ViewType, action?: NavigationAction) => void;
  onRecordPayment: (projectId: string, amount: number, destinationCardId: string, proofUrl?: string) => void | Promise<void>;
  cards: Card[];
  onSharePortal: (client: Client) => void;
  onDeleteProject: (projectId: string) => void;
  showNotification: (message: string) => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  teamMembers: TeamMember[];
  teamProjectPayments: TeamProjectPayment[];
  setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords?: TeamPaymentRecord[];
  pockets: FinancialPocket[];
  setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  profile,
  projects,
  transactions,
  packages,
  addOns = [],
  onClose,
  onEditClient,
  onDeleteClient,
  onViewReceipt,
  onViewInvoice,
  handleNavigation,
  cards,
  onSharePortal,
  showNotification,
  setProjects,
  setTransactions,
  setCards,
  teamMembers,
  teamProjectPayments,
  setTeamProjectPayments,
  teamPaymentRecords = [],
  pockets,
  setPockets,
}) => {
  return (
    <WeddingDetailContainer
      client={client}
      profile={profile}
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
      onClose={onClose}
    />
  );
};

export default ClientDetailModal;
