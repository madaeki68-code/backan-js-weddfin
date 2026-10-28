import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFinanceCalculations } from '../hooks/useFinanceCalculations';
import {
    Transaction,
    TransactionType,
    Card,
    CardType,
    FinancialPocket,
    PocketType,
    Project,
    PaymentStatus,
} from '../../../types';

const mockCards: Card[] = [
    {
        id: 'card-bca',
        cardHolderName: 'Vena',
        bankName: 'BCA',
        cardType: CardType.DEBIT,
        lastFourDigits: '1234',
        balance: 10000000,
        expiryDate: '12/28',
        colorGradient: 'from-blue-500 to-sky-400',
    },
    {
        id: 'card-cc',
        cardHolderName: 'Vena',
        bankName: 'Mandiri',
        cardType: CardType.KREDIT,
        lastFourDigits: '5678',
        balance: -2000000,
        expiryDate: '10/27',
        colorGradient: 'from-purple-500 to-pink-500',
    },
];

const mockPockets: FinancialPocket[] = [
    {
        id: 'pocket-budget',
        name: 'Anggaran Operasional',
        description: 'Operasional bulanan',
        icon: 'clipboard-list',
        type: PocketType.EXPENSE,
        amount: 3000000,
        sourceCardId: 'card-bca',
    },
    {
        id: 'pocket-saving',
        name: 'Tabungan Alat',
        description: 'Upgrade kamera',
        icon: 'piggy-bank',
        type: PocketType.SAVING,
        amount: 5000000,
        sourceCardId: 'card-bca',
    },
];

const mockProjects: Project[] = [
    {
        id: 'project-1',
        projectName: 'Wedding Rama & Shinta',
        clientName: 'Rama & Shinta',
        clientId: 'client-1',
        projectType: 'Wedding',
        packageName: 'Gold',
        packageId: 'pkg-1',
        addOns: [],
        date: '2026-10-15',
        location: 'Jakarta',
        progress: 100,
        status: 'Selesai',
        totalCost: 15000000,
        amountPaid: 15000000,
        paymentStatus: PaymentStatus.LUNAS,
        team: [],
    },
    {
        id: 'project-2',
        projectName: 'Wedding Budi & Ani',
        clientName: 'Budi & Ani',
        clientId: 'client-2',
        projectType: 'Wedding',
        packageName: 'Silver',
        packageId: 'pkg-2',
        addOns: [],
        date: '2026-10-25',
        location: 'Bandung',
        progress: 50,
        status: 'Berjalan',
        totalCost: 10000000,
        amountPaid: 4000000,
        paymentStatus: PaymentStatus.DP_TERBAYAR,
        team: [],
    },
];

const mockTransactions: Transaction[] = [
    {
        id: 'tx-1',
        date: '2026-10-01',
        description: 'DP Wedding Rama & Shinta',
        amount: 7500000,
        type: TransactionType.INCOME,
        category: 'DP',
        method: 'Transfer Bank',
        cardId: 'card-bca',
        projectId: 'project-1',
    },
    {
        id: 'tx-2',
        date: '2026-10-10',
        description: 'Pelunasan Rama & Shinta',
        amount: 7500000,
        type: TransactionType.INCOME,
        category: 'Pelunasan',
        method: 'Transfer Bank',
        cardId: 'card-bca',
        projectId: 'project-1',
    },
    {
        id: 'tx-3',
        date: '2026-10-12',
        description: 'Transport & Akomodasi Tim Rama',
        amount: 1500000,
        type: TransactionType.EXPENSE,
        category: 'Transport & Akomodasi',
        method: 'Transfer Bank',
        cardId: 'card-bca',
        projectId: 'project-1',
    },
    {
        id: 'tx-4',
        date: '2026-10-05',
        description: 'DP Wedding Budi & Ani',
        amount: 4000000,
        type: TransactionType.INCOME,
        category: 'DP',
        method: 'Transfer Bank',
        cardId: 'card-bca',
        projectId: 'project-2',
    },
    {
        id: 'tx-5',
        date: '2026-10-18',
        description: 'Sewa Lensa Tambahan',
        amount: 800000,
        type: TransactionType.EXPENSE,
        category: 'Sewa Alat & Properti',
        method: 'Transfer Bank',
        cardId: 'card-bca',
        projectId: 'project-2',
    },
    {
        id: 'tx-6',
        date: '2026-10-20',
        description: 'Transfer ke Tabungan Alat',
        amount: 2000000,
        type: TransactionType.EXPENSE,
        category: 'Transfer Internal',
        method: 'Sistem',
        cardId: 'card-bca',
    },
];

describe('useFinanceCalculations Hook', () => {
    const defaultParams = {
        transactions: mockTransactions,
        cards: mockCards,
        pockets: mockPockets,
        projects: mockProjects,
        filters: { searchTerm: '', dateFrom: '', dateTo: '' },
        categoryFilter: { type: 'all' as const, category: 'Semua' },
        reportFilters: { client: 'all', dateFrom: '', dateTo: '' },
        profitReportFilters: { year: 2026, month: 9 }, // October (0-indexed month 9)
        projectionMonths: 6,
    };

    it('menghitung filteredSummary (total income, expense, net) dengan akurat', () => {
        const { result } = renderHook(() => useFinanceCalculations(defaultParams));

        const expectedIncome = 7500000 + 7500000 + 4000000; // 19,000,000
        const expectedExpense = 1500000 + 800000 + 2000000; // 4,300,000
        const expectedNet = expectedIncome - expectedExpense; // 14,700,000

        expect(result.current.filteredSummary.income).toBe(expectedIncome);
        expect(result.current.filteredSummary.expense).toBe(expectedExpense);
        expect(result.current.filteredSummary.net).toBe(expectedNet);
    });

    it('mengecualikan Transfer Internal pada cashflowFilteredSummary', () => {
        const { result } = renderHook(() => useFinanceCalculations(defaultParams));

        // tx-6 adalah Transfer Internal, sehingga tidak dihitung dalam pengeluaran operasional arus kas
        const economicExpense = 1500000 + 800000; // 2,300,000
        expect(result.current.cashflowFilteredSummary.expense).toBe(economicExpense);
        expect(result.current.cashflowFilteredSummary.income).toBe(19000000);
        expect(result.current.cashflowFilteredSummary.net).toBe(19000000 - economicExpense);
    });

    it('memfilter transaksi berdasarkan rentang tanggal dateFrom dan dateTo', () => {
        const paramsWithDateFilter = {
            ...defaultParams,
            filters: { searchTerm: '', dateFrom: '2026-10-10', dateTo: '2026-10-15' },
        };

        const { result } = renderHook(() => useFinanceCalculations(paramsWithDateFilter));

        // Transaksi di rentang 10-15 Oktober: tx-2 (10 Okt) dan tx-3 (12 Okt)
        expect(result.current.filteredTransactions.length).toBe(2);
        expect(result.current.filteredTransactions.map(t => t.id)).toEqual(['tx-2', 'tx-3']);
        expect(result.current.filteredSummary.income).toBe(7500000);
        expect(result.current.filteredSummary.expense).toBe(1500000);
    });

    it('memfilter transaksi berdasarkan searchTerm (deskripsi atau kategori)', () => {
        const paramsWithSearch = {
            ...defaultParams,
            filters: { searchTerm: 'Pelunasan', dateFrom: '', dateTo: '' },
        };

        const { result } = renderHook(() => useFinanceCalculations(paramsWithSearch));

        expect(result.current.filteredTransactions.length).toBe(1);
        expect(result.current.filteredTransactions[0].id).toBe('tx-2');
    });

    it('memfilter transaksi berdasarkan jenis kategori', () => {
        const paramsWithCategory = {
            ...defaultParams,
            categoryFilter: { type: TransactionType.INCOME, category: 'DP' },
        };

        const { result } = renderHook(() => useFinanceCalculations(paramsWithCategory));

        expect(result.current.filteredTransactions.length).toBe(2);
        expect(result.current.filteredTransactions.every(t => t.category === 'DP')).toBe(true);
    });

    it('menghitung statistik kartu dan alokasi saldo kantong', () => {
        const { result } = renderHook(() => useFinanceCalculations(defaultParams));

        expect(result.current.summary.totalAssets).toBe(10000000 + (-2000000)); // 8,000,000
        expect(result.current.summary.pocketsTotal).toBe(3000000 + 5000000); // 8,000,000
        expect(result.current.cardStats.creditDebt).toBe(2000000);
        expect(result.current.cardStats.debitAndCashAssets).toBe(10000000);
    });

    it('menghitung profitabilitas proyek dan pengantin di profitReportMetrics', () => {
        const { result } = renderHook(() => useFinanceCalculations(defaultParams));

        const ramaProfit = result.current.projectProfitabilityData.find(p => p?.clientId === 'client-1');
        expect(ramaProfit).toBeDefined();
        // Rama: Income = 15jt, Cost = 1.5jt => Profit = 13.5jt
        expect(ramaProfit?.totalIncome).toBe(15000000);
        expect(ramaProfit?.totalCost).toBe(15000000 - 13500000); // 1,500,000
        expect(ramaProfit?.profit).toBe(13500000);

        const budiProfit = result.current.projectProfitabilityData.find(p => p?.clientId === 'client-2');
        expect(budiProfit).toBeDefined();
        // Budi: Income = 4jt, Cost = 800rb => Profit = 3.2jt
        expect(budiProfit?.totalIncome).toBe(4000000);
        expect(budiProfit?.totalCost).toBe(800000);
        expect(budiProfit?.profit).toBe(3200000);
    });

    it('menghadapi daftar transaksi kosong secara aman (empty state)', () => {
        const emptyParams = {
            ...defaultParams,
            transactions: [] as Transaction[],
            projects: [] as Project[],
            cards: [] as Card[],
            pockets: [] as FinancialPocket[],
        };

        const { result } = renderHook(() => useFinanceCalculations(emptyParams));

        expect(result.current.filteredTransactions).toEqual([]);
        expect(result.current.filteredSummary).toEqual({ income: 0, expense: 0, net: 0 });
        expect(result.current.summary.totalAssets).toBe(0);
        expect(result.current.summary.pocketsTotal).toBe(0);
        expect(result.current.cashflowMetrics.avgIncome).toBe(0);
        expect(result.current.cashflowMetrics.avgExpense).toBe(0);
    });
});
