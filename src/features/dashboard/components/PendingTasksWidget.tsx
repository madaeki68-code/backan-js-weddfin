import React from 'react';
import { ViewType, NavigationAction } from '../../../types';
import { AlertCircleIcon, CheckIcon } from '../../../constants';
import { PendingTaskItem } from '../types';

interface PendingTasksWidgetProps {
  tasks: PendingTaskItem[];
  onNavigate: (view: ViewType, action?: NavigationAction) => void;
  onOpenAllTasksModal: () => void;
}

export const PendingTasksWidget: React.FC<PendingTasksWidgetProps> = ({
  tasks,
  onNavigate,
  onOpenAllTasksModal,
}) => {
  const displayedTasks = tasks.slice(0, 5);

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-[#2A3547]">Tugas & Checklist Acara</h3>
            {tasks.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {tasks.length} Pending
              </span>
            )}
          </div>
          {tasks.length > 5 && (
            <button
              type="button"
              onClick={onOpenAllTasksModal}
              className="p-2 text-sm font-semibold text-brand-accent hover:underline rounded-lg hover:bg-brand-accent/10 cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {displayedTasks.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                onNavigate(ViewType.CLIENTS, {
                  type: 'VIEW_CLIENT_DETAILS',
                  id: item.clientId,
                })
              }
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#EAEFF4] cursor-pointer transition-all duration-150"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    item.isOverdue
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-slate-300 text-slate-400 bg-white'
                  }`}
                >
                  {item.isOverdue ? (
                    <AlertCircleIcon className="w-3 h-3" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2A3547] truncate">{item.taskName}</p>
                  <p className="text-[10px] text-[#5A6A85] truncate mt-0.5">
                    {item.projectName} · {item.clientName}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isOverdue
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.isOverdue
                    ? `Terlambat ${Math.abs(item.daysDiff)}h`
                    : item.daysDiff === 0
                    ? 'Hari Ini'
                    : `${item.daysDiff}h lagi`}
                </span>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-8 text-center text-[#5A6A85]">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckIcon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-[#2A3547]">Semua tugas telah selesai!</p>
              <p className="text-xs text-[#5A6A85] mt-1">
                Tidak ada checklist atau task pending untuk acara aktif saat ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
