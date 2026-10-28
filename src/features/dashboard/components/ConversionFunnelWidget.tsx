import React from 'react';

interface ConversionFunnelWidgetProps {
  funnel: { label: string; count: number; color: string }[];
  totalLeads: number;
}

export const ConversionFunnelWidget: React.FC<ConversionFunnelWidgetProps> = ({
  funnel,
  totalLeads,
}) => {
  const safeTotal = totalLeads || 1;

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full">
      <h3 className="font-bold text-lg text-[#2A3547] mb-6">Funnel Konversi</h3>
      <div className="flex flex-col items-center space-y-2">
        {funnel.map((step, i) => {
          const width = (step.count / safeTotal) * 100;
          return (
            <div key={step.label} className="w-full flex flex-col items-center">
              <div
                className={`${step.color} h-10 flex items-center justify-center text-white text-xs font-bold rounded-xl transition-all duration-500 shadow-2xs`}
                style={{ width: `${Math.max(width, 30)}%` }}
              >
                {step.label}: {step.count}
              </div>
              {i < funnel.length - 1 && <div className="w-px h-2 bg-[#EAEFF4]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
