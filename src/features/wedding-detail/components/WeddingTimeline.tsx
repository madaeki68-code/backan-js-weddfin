import React from 'react';
import { Project, Client, Transaction, TransactionType, PaymentStatus } from '../../../types';
import { ProjectMeeting } from '../../../services/calendarEvents';
import { WeddingFinancialSummary } from '../types/weddingDetail.types';
import { formatCurrency } from '../../../utils/currency';
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Heart,
  Camera,
  FolderCheck,
  CalendarDays,
} from 'lucide-react';

interface WeddingTimelineProps {
  client: Client;
  activeProject: Project | null;
  financial: WeddingFinancialSummary;
  projectTransactions: Transaction[];
  meetings: ProjectMeeting[];
}

export const WeddingTimeline: React.FC<WeddingTimelineProps> = ({
  client,
  activeProject,
  financial,
  projectTransactions,
  meetings,
}) => {
  if (!activeProject) {
    return (
      <div className="py-12 text-center text-xs text-brand-text-secondary bg-white rounded-2xl border border-brand-border">
        Pilih acara pernikahan untuk melihat timeline.
      </div>
    );
  }

  // Compile timeline events
  const events = [];

  // 1. Client registered
  events.push({
    title: 'Pengantin Terdaftar',
    date: client.since || 'Awal',
    description: `Data kontak dan akun pengantin ${client.name} resmi terdaftar.`,
    icon: <Heart className="w-4 h-4 text-brand-accent" />,
    isDone: true,
  });

  // 2. DP or First Payment
  const firstPayment = projectTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (firstPayment) {
    events.push({
      title: 'Pembayaran DP / Awal Masuk',
      date: firstPayment.date,
      description: `DP sebesar ${formatCurrency(firstPayment.amount)} berhasil diterima.`,
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      isDone: true,
    });
  } else {
    events.push({
      title: 'Menunggu Pembayaran DP',
      date: 'Menunggu',
      description: 'DP belum tercatat untuk acara ini.',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      isDone: false,
    });
  }

  // 3. Meetings
  meetings.forEach(m => {
    const meetingDate = m.event.date || m.event.startAt.split('T')[0];
    const meetingTime = m.event.startAt.includes('T') ? m.event.startAt.split('T')[1].substring(0, 5) : '';
    const isPast = new Date(meetingDate).getTime() < new Date().setHours(0, 0, 0, 0);
    events.push({
      title: `Meeting: ${m.event.title}`,
      date: `${meetingDate}${meetingTime ? ` (${meetingTime})` : ''}`,
      description: m.metadata.location || m.event.location || m.metadata.resultNotes || m.event.notes || 'Koordinasi teknis',
      icon: <CalendarDays className="w-4 h-4 text-blue-500" />,
      isDone: isPast,
    });
  });

  // 4. Wedding Day
  if (activeProject.date) {
    const isWeddingPast = new Date(activeProject.date).getTime() < new Date().setHours(0, 0, 0, 0);
    events.push({
      title: `Hari H: ${activeProject.projectName}`,
      date: activeProject.date,
      description: `Pelaksanaan dokumentasi di ${activeProject.location || 'venue acara'}.`,
      icon: <Camera className="w-4 h-4 text-purple-600" />,
      isDone: isWeddingPast,
    });
  }

  // 5. Full Payment
  const isFullPaid = financial.paymentStatus === PaymentStatus.LUNAS;
  events.push({
    title: isFullPaid ? 'Pelunasan Biaya Lunas' : 'Pelunasan Biaya Acara',
    date: isFullPaid ? 'Selesai' : 'Menunggu Pelunasan',
    description: isFullPaid
      ? `Seluruh tagihan ${formatCurrency(financial.totalCost)} telah terlunasi.`
      : `Sisa tagihan yang harus dibayar: ${formatCurrency(financial.remainingBalance)}.`,
    icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
    isDone: isFullPaid,
  });

  // 6. Deliverables / Final link
  const hasDriveLink = Boolean(activeProject.finalDriveLink);
  events.push({
    title: 'Penyerahan File Hasil Jadi',
    date: hasDriveLink ? 'Selesai' : 'Proses Editing',
    description: hasDriveLink
      ? 'Tautan Google Drive hasil foto & video telah diserahkan.'
      : 'File masih dalam tahapan post-processing atau seleksi.',
    icon: <FolderCheck className="w-4 h-4 text-brand-accent" />,
    isDone: hasDriveLink,
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
      <div className="pb-3 mb-6 border-b border-slate-100">
        <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-accent" />
          Alur & Timeline Perjalanan Pernikahan
        </h3>
        <p className="text-xs text-brand-text-secondary mt-0.5">
          Kronologis tahapan dari pendaftaran, pembayaran, pertemuan, hingga penyerahan hasil akhir
        </p>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((ev, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white shadow-xs ${
                ev.isDone
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-slate-300 text-slate-300'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${ev.isDone ? 'bg-emerald-500' : 'bg-slate-300'}`}
              />
            </div>

            {/* Event Content */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-brand-accent/30 transition-all text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <span className="font-bold text-sm text-brand-text-primary flex items-center gap-2">
                  {ev.icon}
                  {ev.title}
                </span>
                <span className="text-[11px] font-semibold text-brand-accent px-2 py-0.5 rounded-md bg-brand-accent/5 self-start sm:self-auto">
                  {ev.date}
                </span>
              </div>
              <p className="text-brand-text-secondary mt-1 leading-relaxed">{ev.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeddingTimeline;
