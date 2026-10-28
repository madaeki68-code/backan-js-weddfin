import React from 'react';
import { ViewType, NavigationAction, ProjectStatusConfig } from '../../../types';
import { MapPinIcon } from '../../../constants';
import { UpcomingEventItem } from '../types';
import { getStatusClass } from '../utils';

interface UpcomingEventsWidgetProps {
  events: UpcomingEventItem[];
  projectStatusConfig?: ProjectStatusConfig[];
  onNavigate: (view: ViewType, action?: NavigationAction) => void;
}

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  events,
  projectStatusConfig = [],
  onNavigate,
}) => {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-[#2A3547] flex items-center gap-2">
            Acara Pernikahan Mendatang
          </h3>
          <button
            type="button"
            onClick={() => onNavigate(ViewType.CALENDAR)}
            className="p-2 text-sm font-semibold text-brand-accent hover:underline rounded-lg hover:bg-brand-accent/10 cursor-pointer"
          >
            Lihat Semua &rarr;
          </button>
        </div>

        <div className="space-y-3">
          {events.map((p) => {
            const eventDate = new Date(p.date);
            const monthShort = !Number.isNaN(eventDate.getTime())
              ? eventDate.toLocaleString('id-ID', { month: 'short' })
              : '-';
            const dayNum = !Number.isNaN(eventDate.getTime()) ? eventDate.getDate() : '-';

            return (
              <div
                key={p.id}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-[#F4F6F9] border border-[#EAEFF4]/60 hover:border-brand-accent/20 cursor-pointer transition-all duration-200"
                onClick={() =>
                  onNavigate(ViewType.CLIENTS, {
                    type: 'VIEW_CLIENT_DETAILS',
                    id: p.clientId,
                  })
                }
              >
                <div className="w-12 h-12 rounded-xl grad-brand flex-shrink-0 flex flex-col items-center justify-center border border-transparent">
                  <p className="text-[10px] font-bold text-white/90 uppercase tracking-wider">
                    {monthShort}
                  </p>
                  <p className="text-xl font-extrabold text-white">{dayNum}</p>
                </div>
                <div className="flex-grow overflow-hidden">
                  <p className="font-bold text-[#2A3547] truncate text-sm group-hover:text-brand-accent transition-colors">
                    {p.projectName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-[#5A6A85] uppercase tracking-tight">
                      {p.projectType}
                    </span>
                    {p.location && (
                      <div className="flex items-center gap-1 text-[10px] text-[#5A6A85] truncate">
                        <MapPinIcon className="w-3 h-3 text-brand-accent shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.isToday ? 'bg-red-600 text-white' : 'solid-blue text-white'
                    }`}
                  >
                    {p.countdownText}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusClass(
                      p.status,
                      projectStatusConfig
                    )}`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <p className="text-center text-sm text-[#5A6A85] py-8">
              Tidak ada Acara Pernikahan mendatang.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
