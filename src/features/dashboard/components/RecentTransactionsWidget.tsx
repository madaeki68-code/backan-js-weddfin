import React from 'react';
import { Transaction, TransactionType, ViewType } from '../../../types';
import { DollarSignIcon } from '../../../constants';
import { formatCurrency } from '../utils';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  onNavigate: (view: ViewType) => void;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  onNavigate,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-[#2A3547]">Transaksi Terbaru</h3>
        <button
          type="button"
          onClick={() => onNavigate(ViewType.FINANCE)}
          className="p-2 text-sm font-semibold text-brand-accent hover:underline rounded-lg hover:bg-brand-accent/10 cursor-pointer"
        >
          Lihat Semua &rarr;
        </button>
      </div>
      <div className="space-y-3.5">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                t.type === TransactionType.INCOME ? 'solid-green text-white' : 'bg-red-600 text-white'
              }`}
            >
              <DollarSignIcon className="w-5 h-5" />
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="font-bold text-[#2A3547] truncate text-sm">{t.description}</p>
              <p className="text-xs text-[#5A6A85]">
                {new Date(t.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
            <div
              className={`font-bold text-sm ${
                t.type === TransactionType.INCOME ? 'text-[#166534]' : 'text-[#DC2626]'
              }`}
            >
              {t.type === TransactionType.INCOME ? '+' : '-'}
              {formatCurrency(t.amount, 0)}
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-[#5A6A85]">Belum ada transaksi.</p>
        )}
      </div>
    </div>
  );
};
