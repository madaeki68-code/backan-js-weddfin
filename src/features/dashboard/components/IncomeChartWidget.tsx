import React from 'react';
import { ChartDataPoint } from '../types';
import { formatCurrency } from '../utils';

interface IncomeChartWidgetProps {
  chartData: ChartDataPoint[];
  chartView: 'monthly' | 'yearly' | 'projection';
  onChangeChartView: (view: 'monthly' | 'yearly' | 'projection') => void;
}

export const IncomeChartWidget: React.FC<IncomeChartWidgetProps> = ({
  chartData,
  chartView,
  onChangeChartView,
}) => {
  const maxVal = Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h3 className="font-bold text-lg text-[#2A3547] flex items-center gap-2">
            Analisis Keuangan
            {chartView === 'projection' && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full grad-brand text-white">
                Proyeksi 6 Bln
              </span>
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
              <span className="text-[11px] text-[#5A6A85] uppercase font-bold tracking-tight">
                {chartView === 'projection' ? 'Est. Masuk (+Piutang)' : 'Pemasukan'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span className="text-[11px] text-[#5A6A85] uppercase font-bold tracking-tight">
                {chartView === 'projection' ? 'Est. Pengeluaran' : 'Pengeluaran'}
              </span>
            </div>
          </div>
        </div>
        <div className="p-1 bg-[#F4F6F9] rounded-xl flex items-center h-fit border border-[#EAEFF4]">
          {[
            { id: 'monthly' as const, label: 'Bulanan' },
            { id: 'yearly' as const, label: 'Tahunan' },
            { id: 'projection' as const, label: 'Proyeksi Kas' },
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => onChangeChartView(view.id)}
              className={`px-4 py-3 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === view.id
                  ? 'bg-brand-accent text-white shadow-xs'
                  : 'text-[#5A6A85] hover:text-[#2A3547]'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 flex justify-between items-end gap-3 mt-4">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex-1 flex flex-col items-center justify-end h-full group relative"
          >
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
              <div className="bg-white border border-[#EAEFF4] shadow-xl p-2.5 rounded-xl text-[10px] whitespace-nowrap">
                <p className="text-[#2A3547] font-bold border-b border-[#EAEFF4] pb-1">
                  {item.name} {item.isProjected ? '(Proyeksi)' : ''}
                </p>
                <p className="text-[#166534] font-bold mt-1">
                  In: {formatCurrency(item.income, 0)}
                </p>
                {Boolean(item.projectedReceivables) && (
                  <p className="text-brand-accent font-semibold pl-2">
                    ↳ Piutang: {formatCurrency(item.projectedReceivables || 0, 0)}
                  </p>
                )}
                <p className="text-[#DC2626] font-bold">
                  Out: {formatCurrency(item.expense, 0)}
                </p>
                <p
                  className={`font-bold mt-0.5 pt-0.5 border-t border-[#EAEFF4] ${
                    item.income - item.expense >= 0 ? 'text-[#166534]' : 'text-[#DC2626]'
                  }`}
                >
                  Net: {item.income - item.expense >= 0 ? '+' : ''}
                  {formatCurrency(item.income - item.expense, 0)}
                </p>
              </div>
              <div className="w-2 h-2 bg-white border-r border-b border-[#EAEFF4] rotate-45 -mt-1" />
            </div>

            <div className="w-full flex items-end gap-1 h-full">
              <div
                className={`flex-1 rounded-t-md transition-all duration-300 ${
                  item.isProjected
                    ? 'bg-white border-t-2 border-x-2 border-dashed border-green-600 group-hover:bg-green-600'
                    : 'bg-green-600 group-hover:bg-green-700'
                }`}
                style={{ height: `${(item.income / maxVal) * 100}%` }}
              />
              <div
                className={`flex-1 rounded-t-md transition-all duration-300 ${
                  item.isProjected
                    ? 'bg-white border-t-2 border-x-2 border-dashed border-red-600 group-hover:bg-red-600'
                    : 'bg-red-600 group-hover:bg-red-700'
                }`}
                style={{ height: `${(item.expense / maxVal) * 100}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-bold mt-3 uppercase tracking-tighter truncate max-w-full ${
                item.isProjected ? 'text-brand-accent' : 'text-[#5A6A85]'
              }`}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
