import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { Lead } from '../../../types';
import { LeadCard } from './LeadCard';

export interface LeadsStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export const LeadsStatsModal: React.FC<LeadsStatsModalProps> = ({
  isOpen,
  onClose,
  title,
  leads,
  onSelectLead,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="3xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {leads.length === 0 ? (
          <div className="text-center py-12 text-brand-text-secondary text-sm">
            Tidak ada calon pengantin dalam kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => {
                  onClose();
                  onSelectLead(lead);
                }}
                className="cursor-pointer"
              >
                <LeadCard
                  lead={lead}
                  onClick={() => {
                    onClose();
                    onSelectLead(lead);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
