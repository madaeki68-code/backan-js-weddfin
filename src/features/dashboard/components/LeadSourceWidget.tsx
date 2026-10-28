import React from 'react';
import { LEAD_SOURCE_COLORS } from '../constants';

interface LeadSourceWidgetProps {
  sources: { name: string; count: number; percentage: number }[];
  totalLeads: number;
}

export const LeadSourceWidget: React.FC<LeadSourceWidgetProps> = ({
  sources,
  totalLeads,
}) => {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full">
      <h3 className="font-bold text-lg text-[#2A3547] mb-4">Sumber Calon Pengantin</h3>
      <div className="grid grid-cols-1 gap-4">
        {sources.map((source, idx) => (
          <div key={source.name} className="flex items-center gap-3">
            <div className="flex-grow">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#2A3547] font-semibold uppercase tracking-tight">
                  {source.name}
                </span>
                <span className="text-[#5A6A85] font-bold">{source.count}</span>
              </div>
              <div className="w-full bg-[#F4F6F9] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${source.percentage}%`,
                    backgroundColor: LEAD_SOURCE_COLORS[idx % LEAD_SOURCE_COLORS.length],
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-[#2A3547] w-10 text-right">
              {source.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
        {totalLeads === 0 && (
          <p className="text-center text-sm text-[#5A6A85] py-8">
            Belum ada data calon pengantin.
          </p>
        )}
      </div>
    </div>
  );
};
