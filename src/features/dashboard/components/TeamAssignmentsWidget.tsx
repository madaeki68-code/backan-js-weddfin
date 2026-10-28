import React from 'react';
import { ViewType, NavigationAction } from '../../../types';
import { BriefcaseIcon } from '../../../constants';
import { UpcomingTeamAssignment } from '../types';
import { formatCurrency } from '../utils';

interface TeamAssignmentsWidgetProps {
  assignments: UpcomingTeamAssignment[];
  totalUnpaidHonor: number;
  onNavigate: (view: ViewType, action?: NavigationAction) => void;
  onOpenPaymentsModal: () => void;
}

export const TeamAssignmentsWidget: React.FC<TeamAssignmentsWidgetProps> = ({
  assignments,
  totalUnpaidHonor,
  onNavigate,
  onOpenPaymentsModal,
}) => {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-[#2A3547]">Penugasan Tim Mendatang</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(ViewType.TEAM)}
            className="p-2 text-sm font-semibold text-brand-accent hover:underline rounded-lg hover:bg-brand-accent/10 cursor-pointer"
          >
            Semua Tim &rarr;
          </button>
        </div>

        <div className="space-y-3">
          {assignments.map((item, idx) => (
            <div
              key={`${item.projectId}-${item.memberId}-${idx}`}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#EAEFF4] bg-[#F8FAFC]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#2A3547]">{item.memberName}</p>
                <p className="text-xs text-[#5A6A85] truncate mt-0.5">
                  {item.role} · {item.projectName}
                </p>
                <p className="text-[10px] text-brand-accent font-semibold mt-0.5">
                  {new Date(item.eventDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-bold text-[#2A3547]">
                  {formatCurrency(item.fee)}
                </span>
              </div>
            </div>
          ))}

          {assignments.length === 0 && (
            <div className="py-6 text-center text-sm text-[#5A6A85]">
              <BriefcaseIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>Belum ada penugasan kru untuk acara mendatang.</p>
            </div>
          )}
        </div>
      </div>

      {totalUnpaidHonor > 0 && (
        <div className="mt-4 pt-3 border-t border-[#EAEFF4] flex items-center justify-between">
          <span className="text-xs text-[#5A6A85]">Honor belum terbayar:</span>
          <button
            type="button"
            onClick={onOpenPaymentsModal}
            className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
          >
            {formatCurrency(totalUnpaidHonor)} &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
