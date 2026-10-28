import React from 'react';
import { TrendingUpIcon, DollarSignIcon, StarIcon } from '../../../constants';
import { formatCurrency } from '../utils';

interface BusinessHealthWidgetProps {
  monthlyRevenue: number;
  monthlyExpense: number;
  margin: number;
}

export const BusinessHealthWidget: React.FC<BusinessHealthWidgetProps> = ({
  monthlyRevenue,
  monthlyExpense,
  margin,
}) => {
  const stats = [
    {
      label: 'Pemasukan Bulan Ini',
      value: formatCurrency(monthlyRevenue),
      icon: <TrendingUpIcon className="w-4 h-4" />,
      iconBg: 'grad-green',
      iconColor: 'text-white',
      valueColor: 'text-green-700',
    },
    {
      label: 'Pengeluaran Bulan Ini',
      value: formatCurrency(monthlyExpense),
      icon: <DollarSignIcon className="w-4 h-4" />,
      iconBg: 'grad-orange',
      iconColor: 'text-white',
      valueColor: 'text-orange-700',
    },
    {
      label: 'Margin Bulan Ini',
      value: `${margin.toFixed(1)}%`,
      icon: <StarIcon className="w-4 h-4" />,
      iconBg: 'grad-brand',
      iconColor: 'text-white',
      valueColor: 'text-brand-accent',
    },
  ];

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full">
      <h3 className="font-bold text-lg text-[#2A3547] mb-6">Ringkasan Performa Bisnis</h3>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between p-3.5 bg-[#F4F6F9] rounded-xl border border-[#EAEFF4]"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>{stat.icon}</div>
              <span className="text-sm font-semibold text-[#5A6A85]">{stat.label}</span>
            </div>
            <span className={`text-base font-extrabold ${stat.valueColor}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
