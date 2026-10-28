import React from 'react';
import { Lead, LeadStatus } from '../../../types';
import TablePagination from '../../../shared/ui/TablePagination';
import { LightbulbIcon } from '../../../constants';
import { customizeUiText, useUiTextOverrides } from '../../../utils/uiTextCustomization';
import { statusConfig } from '../constants/leads.constants';
import { LeadRow } from './LeadRow';

export interface LeadsTableProps {
  leads: Lead[];
  filteredLeads: Lead[];
  paginatedLeads: Lead[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onViewLead: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onNextStatus: (leadId: string, currentStatus: LeadStatus) => void;
  onOpenConvertModal: (lead: Lead) => void;
  onOpenShareModal: (type: 'package' | 'booking', lead: Lead) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  filteredLeads,
  paginatedLeads,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onViewLead,
  onEdit,
  onDelete,
  onNextStatus,
  onOpenConvertModal,
  onOpenShareModal,
}) => {
  const uiTextOverrides = useUiTextOverrides();
  const tableText = (key: string, fallback: string) =>
    customizeUiText(`table.leads.${key}`, fallback, uiTextOverrides);

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border shadow-lg overflow-hidden">
      {/* Table summary bar */}
      <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm font-semibold text-brand-text-light">
          {filteredLeads.length} Calon Pengantin
          {filteredLeads.length !== leads.length && (
            <span className="text-brand-text-secondary font-normal">
              {' '}
              dari {leads.length} total
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.values(LeadStatus).map((s) => {
            const sc = statusConfig[s];
            if (!sc) return null;
            const count = filteredLeads.filter((l) => l.status === s).length;
            return count > 0 ? (
              <span
                key={s}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: sc.color }}
              >
                {sc.title}: {count}
              </span>
            ) : null;
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm !border-0">
          <thead>
            <tr className="bg-brand-bg text-left">
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border w-10">
                {tableText('number', '#')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border">
                {tableText('name', 'Nama')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border hidden sm:table-cell">
                {tableText('contact', 'WA / Kontak')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border hidden md:table-cell">
                {tableText('location', 'Lokasi')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border hidden lg:table-cell">
                {tableText('source', 'Sumber')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border hidden lg:table-cell">
                {tableText('contactDate', 'Tgl Kontak')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border hidden xl:table-cell">
                {tableText('eventDate', 'Tgl Acara')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border">
                {tableText('status', 'Status')}
              </th>
              <th className="px-4 py-3 text-xs font-bold text-brand-text-secondary uppercase tracking-wider !border-0 border-b border-brand-border text-right">
                {tableText('actions', 'Aksi')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-brand-text-secondary !border-0"
                >
                  <LightbulbIcon className="mx-auto w-8 h-8 mb-2 opacity-40" />
                  <p>Tidak ada Calon Pengantin yang cocok dengan filter.</p>
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead, idx) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  index={idx}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onViewDetail={onViewLead}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onNextStatus={onNextStatus}
                  onOpenConvertModal={onOpenConvertModal}
                  onOpenShareModal={onOpenShareModal}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        label="calon pengantin"
        pageSizeOptions={[10, 20]}
      />
    </div>
  );
};
