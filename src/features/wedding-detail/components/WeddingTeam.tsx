import React, { useState } from 'react';
import {
  Project,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
  Profile,
  Card,
  FinancialPocket,
  PaymentStatus,
} from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import {
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Printer,
  MessageSquare,
  AlertCircle,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { generateWhatsAppLink } from '../../../utils/whatsapp';
import { downloadPaymentSlipPdf } from '../../team/utils/paymentSlipPdf';

interface WeddingTeamProps {
  activeProject: Project | null;
  teamMembers: TeamMember[];
  teamProjectPayments: TeamProjectPayment[];
  teamPaymentRecords: TeamPaymentRecord[];
  cards: Card[];
  pockets: FinancialPocket[];
  profile: Profile;
  onPayTeamMember: (payment: TeamProjectPayment, sourceId: string) => Promise<void>;
  showNotification: (msg: string) => void;
}

export const WeddingTeam: React.FC<WeddingTeamProps> = ({
  activeProject,
  teamMembers,
  teamProjectPayments,
  teamPaymentRecords,
  cards,
  pockets,
  profile,
  onPayTeamMember,
  showNotification,
}) => {
  const [selectedPaymentToPay, setSelectedPaymentToPay] = useState<TeamProjectPayment | null>(null);
  const [paymentSourceId, setPaymentSourceId] = useState<string>(() => pockets[0]?.id || cards[0]?.id || '');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  if (!activeProject) {
    return (
      <div className="py-12 text-center text-xs text-brand-text-secondary bg-white rounded-2xl border border-brand-border">
        Pilih acara pernikahan untuk melihat penugasan tim.
      </div>
    );
  }

  // Filter payments for this project
  const projectPayments = teamProjectPayments.filter(p => p.projectId === activeProject.id);

  const totalTeamFees = projectPayments.reduce((sum, p) => sum + (p.fee || 0), 0);
  const totalPaid = projectPayments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + (p.fee || 0), 0);
  const totalUnpaid = totalTeamFees - totalPaid;

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentToPay || !paymentSourceId) return;

    setIsProcessingPay(true);
    try {
      await onPayTeamMember(selectedPaymentToPay, paymentSourceId);
      setSelectedPaymentToPay(null);
    } finally {
      setIsProcessingPay(false);
    }
  };

  const handleDownloadSlip = async (payment: TeamProjectPayment) => {
    const member = teamMembers.find(m => m.id === payment.teamMemberId);
    const record: TeamPaymentRecord = teamPaymentRecords.find(r => r.paymentId === payment.id) || {
      id: `slip-${payment.id}`,
      recordNumber: `SLIP-${payment.id.slice(0, 8).toUpperCase()}`,
      teamMemberId: payment.teamMemberId,
      teamMemberName: member?.name || 'Anggota Tim',
      paymentId: payment.id,
      projectPaymentIds: [payment.id],
      totalAmount: payment.fee,
      amount: payment.fee,
      date: payment.paidAt || new Date().toISOString().split('T')[0],
      role: payment.role || 'Crew',
      projectName: activeProject.projectName,
      paymentMethod: payment.paymentSource || 'Transfer Bank',
    };

    try {
      await downloadPaymentSlipPdf({
        record,
        profile,
        teamMembers: member ? [member] : teamMembers,
        teamProjectPayments: projectPayments,
        projects: activeProject ? [activeProject] : [],
      });
      showNotification('Slip pembayaran berhasil diunduh.');
    } catch (err) {
      console.error('[WeddingTeam] Failed to download slip:', err);
      showNotification('Gagal mengunduh slip pembayaran.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Banner ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
            Total Honor Tim & Vendor
          </span>
          <span className="text-xl font-black text-brand-text-primary">
            {formatCurrency(totalTeamFees)}
          </span>
          <span className="text-[11px] text-brand-text-secondary block mt-0.5">
            {projectPayments.length} Anggota Ditugaskan
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
            Honor Sudah Dibayar
          </span>
          <span className="text-xl font-black text-emerald-700">
            {formatCurrency(totalPaid)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
            Honor Menunggu Pembayaran
          </span>
          <span className="text-xl font-black text-amber-700">
            {formatCurrency(totalUnpaid)}
          </span>
        </div>
      </div>

      {/* ── Team List Card ──────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-accent" />
            Daftar Kru & Vendor Acara Ini
          </h3>
          <span className="text-xs font-semibold text-brand-text-secondary">
            {projectPayments.length} Orang
          </span>
        </div>

        {projectPayments.length === 0 ? (
          <div className="py-10 text-center text-xs text-brand-text-secondary bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-brand-text-primary">Belum ada tim yang ditugaskan</p>
            <p className="mt-1">
              Atur penugasan tim melalui form edit acara atau menu Tim & Freelancer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectPayments.map(payment => {
              const member = teamMembers.find(m => m.id === payment.teamMemberId);
              const isPaid = payment.status === 'Paid';

              const phone = member?.phone;
              const briefingMsg = `Halo Kak ${member?.name || 'Tim'},\n\nBerikut briefing tugas untuk acara pernikahan:\n- Acara: ${activeProject.projectName}\n- Tanggal: ${activeProject.date}\n- Lokasi: ${activeProject.location || 'Menyusul'}\n- Peran: ${payment.role || 'Crew'}\n- Honor: ${formatCurrency(payment.fee)}\n\nMohon hadir tepat waktu dan siapkan perlengkapan ya Kak. Terimakasih! 🙏🏻`;
              const waUrl = phone ? generateWhatsAppLink(phone, briefingMsg) : null;

              return (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-brand-accent/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {member?.name ? member.name.charAt(0).toUpperCase() : 'T'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-text-primary">
                          {member?.name || 'Anggota Tim'}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? 'LUNAS' : 'BELUM DIBAYAR'}
                        </span>
                      </div>

                      <div className="text-brand-text-secondary mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span className="font-semibold text-slate-700">Peran: {payment.role || 'Crew'}</span>
                        {member?.phone && <span>Telp/WA: {member.phone}</span>}
                        {isPaid && payment.paymentSource && (
                          <span className="text-emerald-700">Sumber: {payment.paymentSource}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Honor</span>
                      <span className="text-sm font-bold text-brand-text-primary">
                        {formatCurrency(payment.fee)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                          title="Kirim Briefing WA"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {isPaid ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadSlip(payment)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                          title="Cetak Slip Pembayaran"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentToPay(payment)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar Honor</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Bayar Honor Tim ────────────────────────────────────────── */}
      {selectedPaymentToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-brand-border">
            <h3 className="text-base font-bold text-brand-text-primary mb-1">
              Konfirmasi Pembayaran Honor Tim
            </h3>
            <p className="text-xs text-brand-text-secondary mb-4">
              Pembayaran akan memotong saldo rekening/kantong dan otomatis menerbitkan slip honor.
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Penerima Honor:</span>
                  <span className="font-bold text-brand-text-primary">
                    {teamMembers.find(m => m.id === selectedPaymentToPay.teamMemberId)?.name || 'Anggota Tim'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Peran:</span>
                  <span className="font-bold text-brand-text-primary">{selectedPaymentToPay.role || 'Crew'}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-200 mt-1 pt-1">
                  <span className="text-slate-700 font-bold">Total Honor:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {formatCurrency(selectedPaymentToPay.fee)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">
                  Sumber Dana (Potong Saldo Rekening / Kantong) *
                </label>
                <select
                  value={paymentSourceId}
                  onChange={e => setPaymentSourceId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
                >
                  <optgroup label="Kantong / Pockets">
                    {pockets.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.amount || 0)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Rekening / Cards">
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name || `${c.bankName} (${c.cardHolderName})`} ({formatCurrency(c.balance || 0)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentToPay(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPay}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingPay ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingTeam;
