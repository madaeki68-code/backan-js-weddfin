import React from 'react';
import {
  Project,
  Client,
  TeamMember,
  Card,
  FinancialPocket,
  TeamProjectPayment,
  ViewType,
  NavigationAction,
  ProjectStatusConfig,
} from '../../../types';
import {
  DollarSignIcon,
  FolderKanbanIcon,
  UsersIcon,
  BriefcaseIcon,
  AlertCircleIcon,
} from '../../../constants';
import StatCardModal from '../../../shared/ui/StatCardModal';
import Modal from '../../../shared/ui/Modal';
import { DashboardModalType, PendingTaskItem } from '../types';
import { DASHBOARD_MODAL_TITLES } from '../constants';
import { formatCurrency, getStatusClass, getSubStatusDisplay } from '../utils';

interface DashboardModalsProps {
  activeModal: DashboardModalType;
  onClose: () => void;
  cards: Card[];
  pockets: FinancialPocket[];
  projects: Project[];
  clients: Client[];
  teamMembers: TeamMember[];
  activeProjectsList: Project[];
  activeClientsList: Client[];
  unpaidTeamPaymentsList: TeamProjectPayment[];
  pendingTasks: PendingTaskItem[];
  projectStatusConfig: ProjectStatusConfig[];
  totalBalance: number;
  totalActiveProjects: number;
  totalActiveClients: number;
  totalTeamMembers: number;
  onNavigate: (view: ViewType, action?: NavigationAction) => void;
}

export const DashboardModals: React.FC<DashboardModalsProps> = ({
  activeModal,
  onClose,
  cards,
  pockets,
  projects,
  clients,
  teamMembers,
  activeProjectsList,
  activeClientsList,
  unpaidTeamPaymentsList,
  pendingTasks,
  projectStatusConfig,
  totalBalance,
  totalActiveProjects,
  totalActiveClients,
  totalTeamMembers,
  onNavigate,
}) => {
  return (
    <>
      {/* 1. Modal Saldo Kas & Bank */}
      <StatCardModal
        isOpen={activeModal === 'balance'}
        onClose={onClose}
        icon={<DollarSignIcon className="w-6 h-6" />}
        title="Total Saldo"
        value={formatCurrency(totalBalance)}
        subtitle="Saldo semua kartu & kas"
        colorVariant="blue"
        description={`Total saldo mencakup semua kartu bank, kartu kredit, dan uang tunai yang Anda miliki.\n\nRincian:\n• Kartu Bank: ${
          cards.filter((c) => c.cardType === 'Debit').length
        } kartu\n• Kartu Kredit: ${
          cards.filter((c) => c.cardType === 'Kredit').length
        } kartu\n• Tunai: ${
          cards.filter((c) => c.cardType === 'Tunai').length
        } akun\n\nSaldo ini diperbarui secara real-time berdasarkan transaksi yang Anda catat.`}
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-brand-text-light border-b border-brand-border pb-2">
            Kartu & Tunai
          </h4>
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-3 bg-brand-bg rounded-lg flex justify-between items-center hover:bg-brand-input transition-colors"
              >
                <p className="font-semibold text-brand-text-light">
                  {card.bankName}{' '}
                  {card.id !== 'CARD_CASH' ? `**** ${card.lastFourDigits}` : '(Tunai)'}
                </p>
                <p className="font-semibold text-brand-accent">{formatCurrency(card.balance)}</p>
              </div>
            ))}
          </div>
          {pockets.length > 0 && (
            <>
              <h4 className="font-semibold text-brand-text-light border-b border-brand-border pb-2 mt-6">
                Kantong
              </h4>
              <div className="space-y-3">
                {pockets.map((pocket) => (
                  <div
                    key={pocket.id}
                    className="p-3 bg-brand-bg rounded-lg flex justify-between items-center hover:bg-brand-input transition-colors"
                  >
                    <p className="font-semibold text-brand-text-light">{pocket.name}</p>
                    <p className="font-semibold text-brand-accent">
                      {formatCurrency(pocket.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </StatCardModal>

      {/* 2. Modal Acara Aktif */}
      <StatCardModal
        isOpen={activeModal === 'projects'}
        onClose={onClose}
        icon={<FolderKanbanIcon className="w-6 h-6" />}
        title="Acara Pernikahan Aktif"
        value={totalActiveProjects.toString()}
        subtitle="Acara Pernikahan yang sedang berjalan"
        colorVariant="purple"
        description={`Acara Pernikahan aktif adalah Acara Pernikahan yang statusnya bukan "Selesai" atau "Dibatalkan".\n\nAcara Pernikahan aktif memerlukan perhatian dan tindak lanjut untuk memastikan penyelesaian tepat waktu.`}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {activeProjectsList.map((project) => (
            <div
              key={project.id}
              className="p-4 bg-brand-bg rounded-lg hover:bg-brand-input transition-colors cursor-pointer"
              onClick={() => {
                onClose();
                onNavigate(ViewType.CLIENTS, {
                  type: 'VIEW_CLIENT_DETAILS',
                  id: project.clientId,
                });
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-brand-text-light">{project.projectName}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-accent/20 text-brand-accent">
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-brand-text-secondary">
                {clients.find((c) => c.id === project.clientId)?.name || 'Unknown Client'}
              </p>
              <p className="text-sm text-brand-accent font-semibold mt-2">
                {formatCurrency(project.totalCost)}
              </p>
            </div>
          ))}
          {activeProjectsList.length === 0 && (
            <p className="text-center text-sm text-[#5A6A85] py-8">
              Tidak ada Acara Pernikahan aktif.
            </p>
          )}
        </div>
      </StatCardModal>

      {/* 3. Modal Pengantin Aktif */}
      <StatCardModal
        isOpen={activeModal === 'clients'}
        onClose={onClose}
        icon={<UsersIcon className="w-6 h-6" />}
        title="Pengantin Aktif"
        value={totalActiveClients.toString()}
        subtitle="Pengantin dengan Acara Pernikahan berjalan"
        colorVariant="green"
        description={`Pengantin aktif adalah pengantin yang memiliki minimal satu Acara Pernikahan yang sedang berjalan.\n\nMempertahankan hubungan baik dengan pengantin aktif sangat penting untuk bisnis Anda.`}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {activeClientsList.map((client) => {
            const clientProjects = projects.filter(
              (p) =>
                p.clientId === client.id &&
                p.status !== 'Selesai' &&
                p.status !== 'Dibatalkan'
            );
            return (
              <div
                key={client.id}
                className="p-4 bg-brand-bg rounded-lg hover:bg-brand-input transition-colors cursor-pointer"
                onClick={() => {
                  onClose();
                  onNavigate(ViewType.CLIENTS);
                }}
              >
                <p className="font-semibold text-brand-text-light">{client.name}</p>
                <p className="text-sm text-brand-text-secondary mt-1">
                  {clientProjects.length} Acara Pernikahan aktif
                </p>
                <p className="text-xs text-brand-text-secondary mt-1">{client.email}</p>
              </div>
            );
          })}
          {activeClientsList.length === 0 && (
            <p className="text-center text-sm text-[#5A6A85] py-8">
              Tidak ada pengantin aktif.
            </p>
          )}
        </div>
      </StatCardModal>

      {/* 4. Modal Tim & Vendor */}
      <StatCardModal
        isOpen={activeModal === 'teamMembers'}
        onClose={onClose}
        icon={<BriefcaseIcon className="w-6 h-6" />}
        title="Total Tim / Vendor"
        value={totalTeamMembers.toString()}
        subtitle="Anggota tim terdaftar"
        colorVariant="orange"
        description={`Total Tim / Vendor mencakup semua anggota tim yang terdaftar dalam sistem Anda.\n\nTim / Vendor dapat ditugaskan ke berbagai Acara Pernikahan dan menerima pembayaran sesuai pekerjaan mereka.`}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {teamMembers.map((member) => {
            const unpaidPayments = unpaidTeamPaymentsList.filter(
              (p) => p.teamMemberId === member.id
            );
            const totalUnpaid = unpaidPayments.reduce(
              (sum, p) => sum + (Number(p.fee) || 0),
              0
            );
            return (
              <div
                key={member.id}
                className="p-4 bg-brand-bg rounded-lg hover:bg-brand-input transition-colors cursor-pointer"
                onClick={() => {
                  onClose();
                  onNavigate(ViewType.TEAM);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-brand-text-light">{member.name}</p>
                    <p className="text-sm text-brand-text-secondary">{member.role}</p>
                  </div>
                  {totalUnpaid > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full solid-orange text-white">
                      {formatCurrency(totalUnpaid)} belum dibayar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {teamMembers.length === 0 && (
            <p className="text-center text-sm text-[#5A6A85] py-8">
              Belum ada anggota tim terdaftar.
            </p>
          )}
        </div>
      </StatCardModal>

      {/* 5. Modal Sisa Pembayaran Tim & 6. Modal Tasks */}
      <Modal
        isOpen={activeModal === 'payments' || activeModal === 'tasks'}
        onClose={onClose}
        title={activeModal ? DASHBOARD_MODAL_TITLES[activeModal] || '' : ''}
        size="2xl"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {activeModal === 'payments' && (
            <div className="space-y-3">
              {unpaidTeamPaymentsList.length > 0 ? (
                unpaidTeamPaymentsList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-brand-bg rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-brand-text-light">{p.teamMemberName}</p>
                      <p className="text-sm text-brand-text-secondary">
                        Acara Pernikahan:{' '}
                        {projects.find((proj) => proj.id === p.projectId)?.projectName || 'N/A'}
                      </p>
                    </div>
                    <p className="font-semibold text-brand-danger">
                      {formatCurrency(p.fee)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-brand-text-secondary py-8">
                  Tidak ada pembayaran honor yang tertunda.
                </p>
              )}
            </div>
          )}

          {activeModal === 'tasks' && (
            <div className="space-y-3">
              {pendingTasks.length > 0 ? (
                pendingTasks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      onNavigate(ViewType.CLIENTS, {
                        type: 'VIEW_CLIENT_DETAILS',
                        id: item.clientId,
                      });
                    }}
                    className="p-3.5 bg-brand-bg hover:bg-brand-input rounded-xl border border-brand-border flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Terlambat
                          </span>
                        )}
                        <p className="font-bold text-sm text-brand-text-light truncate">
                          {item.taskName}
                        </p>
                      </div>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        {item.projectName} · {item.clientName}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        item.isOverdue ? 'text-red-600' : 'text-slate-600'
                      }`}
                    >
                      {item.isOverdue
                        ? `${Math.abs(item.daysDiff)} hari lewat`
                        : item.daysDiff === 0
                        ? 'Hari ini'
                        : `${item.daysDiff} hari lagi`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-brand-text-secondary">
                  <p className="font-semibold text-brand-text-light">Semua tugas selesai!</p>
                  <p className="text-sm mt-1">Tidak ada checklist aktif yang tertunda.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
