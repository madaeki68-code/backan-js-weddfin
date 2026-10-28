import React from 'react';
import {
  TrendingUpIcon,
  MapPinIcon,
  CalendarIcon,
  TargetIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  UsersIcon,
  ChevronRightIcon,
  Share2Icon,
} from '../../../constants';
import { ModernStatCard } from '../../../components/modernize/ModernStatCard';
import type {
  LeadCardFilter,
  LeadCityStats,
  LeadEventMonthStats,
  LeadSourceStats,
  LeadStatsSummary,
  LeadStatViewMode,
} from '../types/leads.types';

export interface LeadsStatsCardsProps {
  statCardView: LeadStatViewMode;
  setStatCardView: (mode: LeadStatViewMode) => void;
  activeCardFilter: LeadCardFilter | null;
  cityStats: LeadCityStats;
  eventMonthStats: LeadEventMonthStats;
  sourceStats: LeadSourceStats;
  statsSummary: LeadStatsSummary;
  onCardClick: (
    type:
      | 'city'
      | 'event_month'
      | 'source'
      | 'active'
      | 'converted'
      | 'all'
      | 'discussion'
      | 'followup'
      | 'rejected'
  ) => void;
}

export const LeadsStatsCards: React.FC<LeadsStatsCardsProps> = ({
  statCardView,
  setStatCardView,
  activeCardFilter,
  cityStats,
  eventMonthStats,
  sourceStats,
  statsSummary,
  onCardClick,
}) => {
  const {
    totalLeads,
    activeLeads,
    discussionLeads,
    followUpLeads,
    convertedLeads,
    rejectedLeads,
    conversionRate,
    newThisMonth,
  } = statsSummary;

  return (
    <div className="space-y-4">
      {/* ── Stat Cards Header & Mode Switcher ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#2A3547] flex items-center gap-1.5">
            <TrendingUpIcon className="w-4 h-4 text-[#5D87FF]" />
            <span>Leds Klien</span>
            {activeCardFilter && (
              <span className="text-[10px] font-semibold bg-[#5D87FF]/10 text-[#5D87FF] px-2 py-0.5 rounded-full border border-[#5D87FF]/30">
                1 Filter Aktif
              </span>
            )}
          </h3>
          <p className="text-xs text-[#5A6A85]">
            {statCardView === 'insights'
              ? 'Klik kartu untuk memfilter data '
              : 'Pantau pergerakan prospek di tiap tahapan pipeline (Diskusi, Follow Up, Deal)'}
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto bg-[#EEF2F7] p-1 rounded-xl self-start sm:self-auto border border-[#E0E6ED]">
            <button
              type="button"
              onClick={() => setStatCardView('insights')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statCardView === 'insights'
                  ? 'bg-white text-[#3563E9] shadow-xs'
                  : 'text-[#5A6A85] hover:text-[#2A3547]'
              }`}
            >
              Rekap &amp; Leds
            </button>
            <button
              type="button"
              onClick={() => setStatCardView('pipeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statCardView === 'pipeline'
                  ? 'bg-white text-[#3563E9] shadow-xs'
                  : 'text-[#5A6A85] hover:text-[#2A3547]'
              }`}
            >
              Tahapan Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Row ──────────────────────────────────────────────── */}
      {statCardView === 'insights' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <ModernStatCard
            icon={<MapPinIcon className="w-5 h-5" />}
            title="Kota Terbanyak"
            value={cityStats.topCity}
            subtitle={
              cityStats.hasData
                ? `${cityStats.topCount} prospek (${Math.round(
                    (cityStats.topCount / (totalLeads || 1)) * 100
                  )}%) • Klik lihat data`
                : 'Belum ada data'
            }
            iconColorVariant="primary"
            badge={
              activeCardFilter?.type === 'city'
                ? { text: 'Filter Aktif', variant: 'primary' }
                : cityStats.ranking.length > 1
                ? { text: `${cityStats.ranking.length} Kota`, variant: 'info' }
                : undefined
            }
            className={
              activeCardFilter?.type === 'city'
                ? 'ring-2 ring-[#5D87FF] border-[#5D87FF] bg-[#5D87FF]/5'
                : ''
            }
            onClick={() => onCardClick('city')}
          />
          <ModernStatCard
            icon={<CalendarIcon className="w-5 h-5" />}
            title="Acara Terbanyak"
            value={eventMonthStats.topMonth}
            subtitle={
              eventMonthStats.hasData
                ? `${eventMonthStats.topCount} acara di bulan ini • ${eventMonthStats.withDateCount} ada jadwal`
                : `${eventMonthStats.withDateCount} prospek ada tanggal`
            }
            iconColorVariant="secondary"
            badge={
              activeCardFilter?.type === 'event_month'
                ? { text: 'Filter Aktif', variant: 'secondary' }
                : eventMonthStats.withDateCount > 0
                ? { text: `${eventMonthStats.withDateCount} Acara`, variant: 'secondary' }
                : undefined
            }
            className={
              activeCardFilter?.type === 'event_month'
                ? 'ring-2 ring-[#49BEFF] border-[#49BEFF] bg-[#49BEFF]/5'
                : ''
            }
            onClick={() => onCardClick('event_month')}
          />
          <ModernStatCard
            icon={<TargetIcon className="w-5 h-5" />}
            title="Sumber Utama"
            value={sourceStats.topSource}
            subtitle={
              sourceStats.hasData
                ? `${sourceStats.topCount} prospek (${Math.round(
                    (sourceStats.topCount / (totalLeads || 1)) * 100
                  )}%) • Klik lihat data`
                : 'Belum ada data'
            }
            iconColorVariant="warning"
            badge={
              activeCardFilter?.type === 'source'
                ? { text: 'Filter Aktif', variant: 'warning' }
                : undefined
            }
            className={
              activeCardFilter?.type === 'source'
                ? 'ring-2 ring-[#FFAE1F] border-[#FFAE1F] bg-[#FFAE1F]/5'
                : ''
            }
            onClick={() => onCardClick('source')}
          />
          <ModernStatCard
            icon={<MessageSquareIcon className="w-5 h-5" />}
            title="Perlu Tindakan"
            value={String(activeLeads)}
            subtitle={`${discussionLeads} diskusi • ${followUpLeads} follow up`}
            iconColorVariant="error"
            badge={
              activeCardFilter?.type === 'active'
                ? { text: 'Filter Aktif', variant: 'error' }
                : activeLeads > 0
                ? { text: 'Follow Up', variant: 'error' }
                : undefined
            }
            className={
              activeCardFilter?.type === 'active'
                ? 'ring-2 ring-[#FA896B] border-[#FA896B] bg-[#FDEDE8]'
                : ''
            }
            onClick={() => onCardClick('active')}
          />
          <ModernStatCard
            icon={<CheckCircleIcon className="w-5 h-5" />}
            title="Dikonversi"
            value={`${conversionRate}%`}
            subtitle={`${convertedLeads} dari ${totalLeads} prospek deal`}
            iconColorVariant="success"
            change={convertedLeads > 0 ? `${convertedLeads} deal` : undefined}
            changeType="increase"
            badge={
              activeCardFilter?.type === 'converted'
                ? { text: 'Filter Aktif', variant: 'success' }
                : undefined
            }
            className={
              activeCardFilter?.type === 'converted'
                ? 'ring-2 ring-[#13DEB9] border-[#13DEB9] bg-[#E6FFFA]'
                : ''
            }
            onClick={() => onCardClick('converted')}
          />
          <ModernStatCard
            icon={<UsersIcon className="w-5 h-5" />}
            title="Total Prospek"
            value={String(totalLeads)}
            subtitle={
              activeCardFilter
                ? 'Klik untuk reset filter'
                : `+${newThisMonth} bulan ini • Lihat semua`
            }
            iconColorVariant="primary"
            badge={activeCardFilter ? { text: 'Reset', variant: 'secondary' } : undefined}
            onClick={() => onCardClick('all')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <ModernStatCard
            icon={<UsersIcon className="w-5 h-5" />}
            title="Total Prospek"
            value={String(totalLeads)}
            subtitle={
              activeCardFilter
                ? 'Klik untuk reset filter'
                : `+${newThisMonth} bulan ini • Lihat semua`
            }
            iconColorVariant="primary"
            onClick={() => onCardClick('all')}
          />
          <ModernStatCard
            icon={<TargetIcon className="w-5 h-5" />}
            title="Aktif"
            value={String(activeLeads)}
            subtitle="Diskusi + Follow Up"
            iconColorVariant="primary"
            badge={
              activeCardFilter?.type === 'active'
                ? { text: 'Filter Aktif', variant: 'primary' }
                : undefined
            }
            className={
              activeCardFilter?.type === 'active'
                ? 'ring-2 ring-[#5D87FF] border-[#5D87FF] bg-[#5D87FF]/5'
                : ''
            }
            onClick={() => onCardClick('active')}
          />
          <ModernStatCard
            icon={<MessageSquareIcon className="w-5 h-5" />}
            title="Sedang Diskusi"
            value={String(discussionLeads)}
            subtitle="Perlu tindakan • Lihat data"
            iconColorVariant="warning"
            onClick={() => onCardClick('discussion')}
          />
          <ModernStatCard
            icon={<ChevronRightIcon className="w-5 h-5" />}
            title="Follow Up"
            value={String(followUpLeads)}
            subtitle="Menunggu respons • Lihat data"
            iconColorVariant="error"
            onClick={() => onCardClick('followup')}
          />
          <ModernStatCard
            icon={<CheckCircleIcon className="w-5 h-5" />}
            title="Dikonversi"
            value={String(convertedLeads)}
            subtitle={`${conversionRate}% konversi`}
            iconColorVariant="success"
            changeType="increase"
            change={`${conversionRate}%`}
            badge={
              activeCardFilter?.type === 'converted'
                ? { text: 'Filter Aktif', variant: 'success' }
                : undefined
            }
            className={
              activeCardFilter?.type === 'converted'
                ? 'ring-2 ring-[#13DEB9] border-[#13DEB9] bg-[#E6FFFA]'
                : ''
            }
            onClick={() => onCardClick('converted')}
          />
          <ModernStatCard
            icon={<Share2Icon className="w-5 h-5" />}
            title="Ditolak"
            value={String(rejectedLeads)}
            subtitle="Tidak berlanjut • Lihat data"
            iconColorVariant="error"
            onClick={() => onCardClick('rejected')}
          />
        </div>
      )}
    </div>
  );
};
