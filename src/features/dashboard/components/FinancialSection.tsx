import React from 'react';
import { Transaction, Project, ViewType, Card } from '../../../types';
import { DollarSignIcon } from '../../../constants';
import { MobileCollapsibleSection } from '../../../components/ui/MobileProgressiveDisclosure';
import { ChartDataPoint } from '../types';
import { IncomeChartWidget } from './IncomeChartWidget';
import { BusinessHealthWidget } from './BusinessHealthWidget';
import { RecentTransactionsWidget } from './RecentTransactionsWidget';

interface FinancialSectionProps {
  cards: Card[];
  transactions: Transaction[];
  projects: Project[];
  chartData: ChartDataPoint[];
  chartView: 'monthly' | 'yearly' | 'projection';
  onChangeChartView: (view: 'monthly' | 'yearly' | 'projection') => void;
  financialHealth: {
    monthlyRevenue: number;
    monthlyExpense: number;
    margin: number;
  };
  latestTransactions: Transaction[];
  onNavigate: (view: ViewType) => void;
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({
  cards,
  transactions,
  chartData,
  chartView,
  onChangeChartView,
  financialHealth,
  latestTransactions,
  onNavigate,
}) => {
  return (
    <MobileCollapsibleSection
      title="Kesehatan Finansial & Arus Kas"
      subtitle={`${cards.length} kartu · ${transactions.length} transaksi`}
      variant="stats"
      actionLabelOpen="Lihat Finansial"
      actionLabelClose="Tutup"
    >
      <div className="space-y-3">
        <div className="hidden md:flex items-center gap-2">
          <DollarSignIcon className="w-4 h-4 text-brand-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">
            Kesehatan Finansial & Kas
          </h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="col-span-1 xl:col-span-8">
            <IncomeChartWidget
              chartData={chartData}
              chartView={chartView}
              onChangeChartView={onChangeChartView}
            />
          </div>
          <div className="col-span-1 xl:col-span-4">
            <BusinessHealthWidget
              monthlyRevenue={financialHealth.monthlyRevenue}
              monthlyExpense={financialHealth.monthlyExpense}
              margin={financialHealth.margin}
            />
          </div>
          <div className="col-span-1 xl:col-span-12">
            <RecentTransactionsWidget
              transactions={latestTransactions}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>
    </MobileCollapsibleSection>
  );
};
