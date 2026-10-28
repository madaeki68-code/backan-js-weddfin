import React from 'react';
import { LeadStatus } from '../../../types';
import { statusConfig } from '../constants/leads.constants';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status] || {
    title: status,
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${config.badgeClass} ${className}`}
    >
      {config.title}
    </span>
  );
};
