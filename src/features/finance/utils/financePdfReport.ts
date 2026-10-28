import {
    Transaction,
    TransactionType,
    Profile,
    Project,
    Card,
    FinancialPocket,
} from '../../../types';
import {
    downloadReportPdf,
    buildReportFileName,
    ReportSection,
} from '../../../shared/utils/reportPdf';

const formatRupiah = (amount: number): string =>
    `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(Number(amount) || 0))}`;

export interface GenerateFinanceReportPdfParams {
    transactionsToExport: Transaction[];
    periodLabel?: string;
    clientLabel?: string;
    profile: Profile;
    projects: Project[];
    cards: Card[];
    pockets: FinancialPocket[];
}

export async function generateFinanceReportPdf({
    transactionsToExport,
    periodLabel = 'Semua Periode',
    clientLabel,
    profile,
    projects,
    cards,
    pockets,
}: GenerateFinanceReportPdfParams): Promise<void> {
    const exportIncome = transactionsToExport
        .filter(transaction => transaction.type === TransactionType.INCOME)
        .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
    const exportExpense = transactionsToExport
        .filter(transaction => transaction.type === TransactionType.EXPENSE)
        .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    const categoryGroups = new Map<string, { type: TransactionType; category: string; total: number; transactions: Transaction[] }>();
    transactionsToExport.forEach(transaction => {
        const category = transaction.category?.trim() || 'Tanpa kategori';
        const key = `${transaction.type}::${category}`;
        const group = categoryGroups.get(key) || { type: transaction.type, category, total: 0, transactions: [] };
        group.total += Number(transaction.amount) || 0;
        group.transactions.push(transaction);
        categoryGroups.set(key, group);
    });

    const sortedCategoryGroups = [...categoryGroups.values()].sort((left, right) => {
        const typeCompare = (left.type === TransactionType.INCOME ? 0 : 1) - (right.type === TransactionType.INCOME ? 0 : 1);
        return typeCompare || right.total - left.total || left.category.localeCompare(right.category);
    });

    const categoryRows: (string | number)[][] = sortedCategoryGroups.map(group => [
        group.type === TransactionType.INCOME ? 'Pemasukan' : 'Pengeluaran',
        group.category,
        group.total,
    ]);

    const categoryDetailSections: ReportSection[] = sortedCategoryGroups.map(group => ({
        title: `Rincian Transaksi: ${group.type === TransactionType.INCOME ? 'Pemasukan' : 'Pengeluaran'} - ${group.category}`,
        columns: [
            { header: 'Tanggal', width: 1.2 },
            { header: 'Deskripsi', width: 3.2 },
            { header: 'Metode', width: 1.2 },
            { header: 'Jumlah', width: 1.5, isCurrency: true, tone: group.type === TransactionType.INCOME ? 'positive' : 'auto' },
        ],
        rows: group.transactions.slice().sort((left, right) => right.date.localeCompare(left.date)).map(transaction => [
            transaction.date ? new Date(transaction.date).toLocaleDateString('id-ID') : '-',
            transaction.description || '-',
            transaction.method || '-',
            group.type === TransactionType.INCOME ? transaction.amount : -Math.abs(transaction.amount),
        ]),
        emptyText: 'Tidak ada transaksi pada kategori ini.',
    }));

    // ── Rekap laba per pengantin (transaksi sesuai filter tanggal) ──
    const projectById = new Map(projects.map(project => [project.id, project]));
    const clientProfitMap = new Map<string, { name: string; income: number; expense: number; projectIds: Set<string> }>();
    transactionsToExport.forEach(transaction => {
        if (!transaction.projectId) return;
        const project = projectById.get(transaction.projectId);
        if (!project) return;
        const entry = clientProfitMap.get(project.clientId) || {
            name: project.clientName || project.projectName || 'Tanpa Pengantin',
            income: 0,
            expense: 0,
            projectIds: new Set<string>(),
        };
        if (transaction.type === TransactionType.INCOME) entry.income += transaction.amount;
        else entry.expense += transaction.amount;
        entry.projectIds.add(project.id);
        clientProfitMap.set(project.clientId, entry);
    });

    const profitClients = Array.from(clientProfitMap.values())
        .sort((left, right) => (right.income - right.expense) - (left.income - left.expense));
    const profitRows: (string | number)[][] = profitClients.map(entry => [
        entry.name,
        entry.projectIds.size,
        entry.income,
        entry.expense,
        entry.income - entry.expense,
    ]);
    const profitTotals = profitClients.reduce((acc, entry) => ({
        events: acc.events + entry.projectIds.size,
        income: acc.income + entry.income,
        expense: acc.expense + entry.expense,
    }), { events: 0, income: 0, expense: 0 });
    profitRows.push([
        `TOTAL (${profitClients.length} pengantin)`,
        profitTotals.events,
        profitTotals.income,
        profitTotals.expense,
        profitTotals.income - profitTotals.expense,
    ]);

    // ── Rekap saldo akun (kartu & kantong) ──
    const accountRows: (string | number)[][] = [
        ...cards.map(card => [
            `${card.bankName}${card.lastFourDigits ? ` •••• ${card.lastFourDigits}` : ''}`,
            `Kartu ${card.cardType}`,
            Number(card.balance) || 0,
        ]),
        ...pockets.map(pocket => [pocket.name, `Kantong ${pocket.type}`, Number(pocket.amount) || 0]),
    ];

    const sections: ReportSection[] = [
        {
            title: 'Daftar Transaksi',
            columns: [
                { header: 'Tanggal', width: 1.1 },
                { header: 'Keterangan', width: 2.4 },
                { header: 'Kategori', width: 1.4 },
                { header: 'Tipe', width: 0.9 },
                { header: 'Jumlah', width: 1.5, isCurrency: true, tone: 'auto' },
            ],
            rows: transactionsToExport.map(transaction => [
                transaction.date ? new Date(transaction.date).toLocaleDateString('id-ID') : '-',
                transaction.description || '-',
                transaction.category || '-',
                transaction.type === TransactionType.INCOME ? 'Masuk' : 'Keluar',
                transaction.type === TransactionType.INCOME ? transaction.amount : -transaction.amount,
            ]),
            emptyText: 'Tidak ada transaksi pada periode ini.',
        },
        {
            title: 'Ringkasan per Kategori',
            columns: [
                { header: 'Tipe', width: 1.1 },
                { header: 'Kategori', width: 2.4 },
                { header: 'Total', width: 1.5, isCurrency: true },
            ],
            rows: categoryRows,
            emptyText: 'Belum ada data kategori.',
        },
        ...categoryDetailSections,
        {
            title: 'Rekap Laba per Pengantin',
            columns: [
                { header: 'Pengantin', width: 2 },
                { header: 'Acara', width: 0.8, align: 'right' },
                { header: 'Pemasukan', width: 1.5, isCurrency: true, tone: 'positive' },
                { header: 'Pengeluaran', width: 1.5, isCurrency: true, tone: 'negative' },
                { header: 'Laba Bersih', width: 1.5, isCurrency: true, tone: 'auto' },
            ],
            rows: profitRows,
            emptyText: 'Belum ada transaksi proyek pada periode ini.',
        },
        {
            title: 'Rekap Saldo Akun & Kantong',
            columns: [
                { header: 'Nama Akun', width: 2.4 },
                { header: 'Tipe', width: 1.6 },
                { header: 'Saldo', width: 1.6, isCurrency: true },
            ],
            rows: accountRows,
            emptyText: 'Belum ada akun atau kantong terdaftar.',
        },
    ];

    const periodKey = periodLabel === 'Semua Periode'
        ? 'semua-periode'
        : periodLabel.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');

    await downloadReportPdf({
        title: 'Laporan Keuangan',
        subtitle: clientLabel ? `${profile.companyName} · ${clientLabel}` : profile.companyName,
        periodLabel,
        profile,
        filename: buildReportFileName('Laporan-Keuangan', periodKey),
        summaryCards: [
            { label: 'Total Pemasukan', value: formatRupiah(exportIncome), tone: 'positive' },
            { label: 'Total Pengeluaran', value: formatRupiah(exportExpense), tone: 'negative' },
            {
                label: 'Laba Bersih',
                value: formatRupiah(exportIncome - exportExpense),
                tone: exportIncome >= exportExpense ? 'positive' : 'negative',
            },
            { label: 'Jumlah Transaksi', value: String(transactionsToExport.length) },
        ],
        sections,
        footerNote: `Dibuat otomatis oleh sistem pada ${new Date().toLocaleString('id-ID')}.`,
    });
}
