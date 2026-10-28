import React from 'react';
import { ClientFeedback, SatisfactionLevel } from '../../../types';
import { SatisfactionStats } from '../types/businessReports.types';
import {
  StarIcon,
  SmileIcon,
  ThumbsUpIcon,
  MehIcon,
  FrownIcon,
} from '../../../constants';

interface SatisfactionReportProps {
  feedback: ClientFeedback[];
  satisfactionStats: SatisfactionStats;
  onOpenFeedbackModal: () => void;
  onOpenShareModal: () => void;
}

const StarRatingDisplay: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({
  rating,
  size = 'md',
}) => {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <StarIcon
          key={star}
          className={`${sz} ${
            star <= rating ? 'text-amber-400 fill-current' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
};

const SatisfactionBadge: React.FC<{ satisfaction: SatisfactionLevel }> = ({
  satisfaction,
}) => {
  const config: Record<SatisfactionLevel, { cls: string; icon: React.ReactNode }> = {
    [SatisfactionLevel.VERY_SATISFIED]: {
      cls: 'bg-emerald-100 text-emerald-800',
      icon: <SmileIcon className="w-3 h-3 text-emerald-700" />,
    },
    [SatisfactionLevel.SATISFIED]: {
      cls: 'bg-sky-100 text-sky-800',
      icon: <ThumbsUpIcon className="w-3 h-3 text-sky-700" />,
    },
    [SatisfactionLevel.NEUTRAL]: {
      cls: 'bg-amber-100 text-amber-800',
      icon: <MehIcon className="w-3 h-3 text-amber-700" />,
    },
    [SatisfactionLevel.UNSATISFIED]: {
      cls: 'bg-rose-100 text-rose-800',
      icon: <FrownIcon className="w-3 h-3 text-rose-700" />,
    },
  };
  const { cls, icon } = config[satisfaction] || { cls: 'bg-slate-100 text-slate-700', icon: null };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${cls}`}
    >
      {icon} {satisfaction}
    </span>
  );
};

export const SatisfactionReport: React.FC<SatisfactionReportProps> = ({
  feedback,
  satisfactionStats,
  onOpenFeedbackModal,
  onOpenShareModal,
}) => {
  return (
    <div className="space-y-4">
      {/* ── Metric Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-brand-text-secondary block mb-1">
            Rata-rata Rating
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-brand-text-primary">
              {satisfactionStats.avgRating}
            </span>
            <StarRatingDisplay rating={Math.round(Number(satisfactionStats.avgRating))} />
          </div>
          <span className="text-[10px] text-brand-text-secondary block mt-1">
            Dari {feedback.length} ulasan pengantin
          </span>
        </div>

        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
            Sangat Puas
          </span>
          <span className="text-2xl font-black text-emerald-700">
            {satisfactionStats.counts[SatisfactionLevel.VERY_SATISFIED] || 0}
          </span>
          <span className="text-[10px] text-brand-text-secondary block mt-1">
            {feedback.length > 0
              ? Math.round(
                  ((satisfactionStats.counts[SatisfactionLevel.VERY_SATISFIED] || 0) /
                    feedback.length) *
                    100
                )
              : 0}
            % pengantin
          </span>
        </div>

        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-sky-700 block mb-1">
            Puas & Cukup
          </span>
          <span className="text-2xl font-black text-sky-700">
            {(satisfactionStats.counts[SatisfactionLevel.SATISFIED] || 0) +
              (satisfactionStats.counts[SatisfactionLevel.NEUTRAL] || 0)}
          </span>
          <span className="text-[10px] text-brand-text-secondary block mt-1">
            Rating 3 - 4 Bintang
          </span>
        </div>

        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-rose-600 block mb-1">
            Perlu Perbaikan
          </span>
          <span className="text-2xl font-black text-rose-600">
            {satisfactionStats.counts[SatisfactionLevel.UNSATISFIED] || 0}
          </span>
          <span className="text-[10px] text-brand-text-secondary block mt-1">
            Evaluasi pelayanan
          </span>
        </div>
      </div>

      {/* ── Testimonials List ────────────────────────────────────────────── */}
      <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border/60">
          <div>
            <h4 className="text-sm font-bold text-brand-text-primary">
              Testimoni & Ulasan Pengantin
            </h4>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Kritik, saran, dan apresiasi langsung dari pasangan pengantin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenShareModal}
              className="px-3 py-1.5 rounded-xl border border-brand-border hover:bg-brand-bg text-brand-text-primary text-xs font-bold transition-all cursor-pointer"
            >
              Bagikan Link Form
            </button>
            <button
              type="button"
              onClick={onOpenFeedbackModal}
              className="px-3 py-1.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all cursor-pointer"
            >
              + Tambah Ulasan
            </button>
          </div>
        </div>

        {feedback.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-text-secondary bg-brand-bg rounded-xl">
            Belum ada testimoni atau ulasan pengantin yang dicatat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedback.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-brand-bg border border-brand-border/70 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-brand-text-primary text-sm block">
                        {item.clientName}
                      </span>
                      <span className="text-[10px] text-brand-text-secondary">
                        {item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                    <SatisfactionBadge satisfaction={item.satisfaction} />
                  </div>

                  <div className="mb-2">
                    <StarRatingDisplay rating={item.rating} size="sm" />
                  </div>

                  <p className="text-brand-text-secondary italic leading-relaxed">
                    &ldquo;{item.feedback}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SatisfactionReport;
