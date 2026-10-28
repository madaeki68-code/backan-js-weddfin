import React, { useMemo } from 'react';
import { Lead, LeadStatus } from '../../../types';
import TablePagination from '../../../shared/ui/TablePagination';
import { statusConfig } from '../constants/leads.constants';
import { LeadCard } from './LeadCard';

export interface LeadsKanbanProps {
  paginatedLeads: Lead[];
  filteredLeads: Lead[];
  hiddenColumns: Set<LeadStatus>;
  mobileStatusTab: 'all' | LeadStatus;
  setMobileStatusTab: (st: 'all' | LeadStatus) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: LeadStatus) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onNextStatus: (leadId: string, currentStatus: LeadStatus) => void;
  onMoveStatus: (leadId: string, newStatus: LeadStatus) => void;
  onShare: (type: 'package' | 'booking', lead: Lead) => void;
  onViewDetail: (lead: Lead) => void;
}

export const LeadsKanban: React.FC<LeadsKanbanProps> = ({
  paginatedLeads,
  filteredLeads,
  hiddenColumns,
  mobileStatusTab,
  setMobileStatusTab,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
  onNextStatus,
  onMoveStatus,
  onShare,
  onViewDetail,
}) => {
  const leadColumns = useMemo(() => {
    const columns: Record<LeadStatus, Lead[]> = {
      [LeadStatus.DISCUSSION]: [],
      [LeadStatus.FOLLOW_UP]: [],
      [LeadStatus.CONVERTED]: [],
      [LeadStatus.REJECTED]: [],
    };
    filteredLeads.forEach((lead) => {
      columns[lead.status]?.push(lead);
    });
    return columns;
  }, [filteredLeads]);

  const paginatedLeadColumns = useMemo(() => {
    const columns: Record<LeadStatus, Lead[]> = {
      [LeadStatus.DISCUSSION]: [],
      [LeadStatus.FOLLOW_UP]: [],
      [LeadStatus.CONVERTED]: [],
      [LeadStatus.REJECTED]: [],
    };
    paginatedLeads.forEach((lead) => {
      columns[lead.status]?.push(lead);
    });
    return Object.entries(columns).filter(
      ([status]) => !hiddenColumns.has(status as LeadStatus)
    ) as [LeadStatus, Lead[]][];
  }, [paginatedLeads, hiddenColumns]);

  const paginatedMobileColumns = useMemo(() => {
    if (mobileStatusTab === 'all') return paginatedLeadColumns;
    return paginatedLeadColumns.filter(([status]) => status === mobileStatusTab);
  }, [paginatedLeadColumns, mobileStatusTab]);

  return (
    <>
      {/* Mobile column tabs for responsive stage switching */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setMobileStatusTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            mobileStatusTab === 'all'
              ? 'bg-brand-accent text-white shadow-xs'
              : 'bg-white border border-[#EAEFF4] text-[#5A6A85] hover:bg-slate-50'
          }`}
        >
          Semua ({filteredLeads.length})
        </button>
        {Object.values(LeadStatus).map((st) => {
          const conf = statusConfig[st];
          const count = leadColumns[st]?.length || 0;
          const isActive = mobileStatusTab === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setMobileStatusTab(st)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: isActive ? conf.color : conf.softBg,
                color: isActive ? '#ffffff' : conf.color,
                border: `1px solid ${conf.border}`,
              }}
            >
              <span>{conf.title}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-white text-[#2A3547]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile grouped list */}
      <div className="md:hidden space-y-3 -mx-2.5 px-2.5">
        {paginatedMobileColumns.map(([status, leadItems]) => {
          const statusInfo = statusConfig[status as LeadStatus];
          return (
            <div
              key={status}
              className="bg-brand-bg rounded-2xl border border-brand-border overflow-hidden"
            >
              <div
                className="p-3 text-sm font-semibold text-brand-text-light border-b flex justify-between items-center"
                style={{ borderColor: statusInfo.color, borderBottomWidth: 2 }}
              >
                <span className="truncate">{statusInfo.title}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white ml-2 flex-shrink-0"
                  style={{ backgroundColor: statusInfo.color }}
                >
                  {leadItems.length}
                </span>
              </div>
              <div className="p-2 space-y-2">
                {leadItems.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={() => {}}
                    onClick={() => onEdit(lead)}
                    onEdit={() => onEdit(lead)}
                    onDelete={() => onDelete(lead.id)}
                    onNextStatus={() => onNextStatus(lead.id, lead.status)}
                    onMoveStatus={(st) => onMoveStatus(lead.id, st)}
                    onShare={(type) => onShare(type, lead)}
                    onViewDetail={() => onViewDetail(lead)}
                  />
                ))}
                {leadItems.length === 0 && (
                  <p className="text-center py-6 text-xs text-brand-text-secondary">
                    Tidak ada Calon Pengantin.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop kanban columns */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {paginatedLeadColumns.map(([status, leadItems]) => {
          const statusInfo = statusConfig[status as LeadStatus];
          return (
            <div
              key={status}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, status as LeadStatus)}
              className="w-80 flex-shrink-0 rounded-2xl border border-[#EAEFF4] bg-[#F7F9FC] flex flex-col shadow-sm leads-column-container"
            >
              <div
                className="px-4 py-3 font-semibold text-[#2A3547] border-b flex justify-between items-center sticky top-0 rounded-t-2xl z-10 leads-column-header"
                style={{ borderColor: statusInfo.border, backgroundColor: statusInfo.softBg }}
              >
                <span>{statusInfo.title}</span>
                <span
                  className="inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: statusInfo.color }}
                >
                  {leadItems.length}
                </span>
              </div>
              <div className="p-3 space-y-3 h-auto pr-1">
                {leadItems.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={onDragStart}
                    onClick={() => onEdit(lead)}
                    onEdit={() => onEdit(lead)}
                    onDelete={() => onDelete(lead.id)}
                    onNextStatus={() => onNextStatus(lead.id, lead.status)}
                    onMoveStatus={(st) => onMoveStatus(lead.id, st)}
                    onShare={(type) => onShare(type, lead)}
                    onViewDetail={() => onViewDetail(lead)}
                  />
                ))}
                {leadItems.length === 0 && (
                  <p className="text-center py-8 text-sm text-brand-text-secondary">
                    Tidak ada Calon Pengantin.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        label="calon pengantin"
        pageSizeOptions={[10, 20, 50]}
        className="mt-2 rounded-xl border border-brand-border"
      />
    </>
  );
};
