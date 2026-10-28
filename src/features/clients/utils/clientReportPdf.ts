import {
  Transaction,
  TeamProjectPayment,
  Package,
  Profile,
  TransactionType,
} from '../types';
import { ClientWithSummary } from '../types/clients.types';
import {
  ReportPdfInput,
  ReportSection,
  buildReportFileName,
} from '../../../shared/utils/reportPdf';
import { formatRupiah, formatMonthLabel } from './clientFormatters';

export function buildPengantinPdfInput(params: {
  filteredClientData: ClientWithSummary[];
  transactions: Transaction[];
  teamProjectPayments: TeamProjectPayment[];
  packages: Package[];
  userProfile: Profile;
  monthFilter: string;
}): ReportPdfInput {
  const { filteredClientData, transactions, teamProjectPayments, packages, userProfile, monthFilter } = params;

  const eventRows = filteredClientData
    .flatMap(client =>
      client.projects.map(project => [
        project.date ? new Date(project.date).toLocaleDateString('id-ID') : '-',
        client.name,
        project.projectName || '-',
        project.location || '-',
        project.packageName || '-',
        project.totalCost || 0,
        project.paymentStatus || '-',
      ])
    )
    .sort((left, right) => String(left[0]).localeCompare(String(right[0])));

  const totalProjectValue = filteredClientData.reduce((sum, client) => sum + client.totalProjectValue, 0);
  const totalBalanceDue = filteredClientData.reduce((sum, client) => sum + client.balanceDue, 0);

  const projectMetaById = new Map<string, { clientId: string; clientName: string; projectName: string }>();
  filteredClientData.forEach(client => {
    client.projects.forEach(project => {
      projectMetaById.set(project.id, {
        clientId: client.id,
        clientName: client.name,
        projectName: project.projectName || project.packageName || 'Acara',
      });
    });
  });

  const ledgerEntries: {
    date: string;
    clientId: string;
    clientName: string;
    projectName: string;
    direction: 'Masuk' | 'Keluar';
    category: string;
    description: string;
    amount: number;
  }[] = [];

  transactions.forEach(transaction => {
    if (!transaction.projectId) return;
    const meta = projectMetaById.get(transaction.projectId);
    if (!meta) return;
    const isIncome = transaction.type === TransactionType.INCOME;
    if (!isIncome && (transaction.category || '').toLowerCase().includes('gaji tim / vendor')) return;
    ledgerEntries.push({
      date: transaction.date,
      clientId: meta.clientId,
      clientName: meta.clientName,
      projectName: meta.projectName,
      direction: isIncome ? 'Masuk' : 'Keluar',
      category: transaction.category || (isIncome ? 'Pembayaran Klien' : 'Biaya Acara'),
      description: transaction.description || '-',
      amount: isIncome ? transaction.amount : -transaction.amount,
    });
  });

  teamProjectPayments.forEach(payment => {
    const meta = projectMetaById.get(payment.projectId);
    if (!meta) return;
    ledgerEntries.push({
      date: payment.date,
      clientId: meta.clientId,
      clientName: meta.clientName,
      projectName: meta.projectName,
      direction: 'Keluar',
      category: 'Pembayaran Tim / Vendor',
      description: payment.role ? `${payment.teamMemberName} (${payment.role})` : payment.teamMemberName,
      amount: -payment.fee,
    });
  });

  ledgerEntries.sort((left, right) => {
    const dateDiff = new Date(left.date).getTime() - new Date(right.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return left.clientName.localeCompare(right.clientName);
  });

  const ledgerByClient = new Map<string, { income: number; expense: number }>();
  ledgerEntries.forEach(entry => {
    const totals = ledgerByClient.get(entry.clientId) || { income: 0, expense: 0 };
    if (entry.amount >= 0) totals.income += entry.amount;
    else totals.expense += Math.abs(entry.amount);
    ledgerByClient.set(entry.clientId, totals);
  });

  const recapRows: (string | number)[][] = filteredClientData.map(client => {
    const totals = ledgerByClient.get(client.id) || { income: 0, expense: 0 };
    return [
      client.name,
      client.projects.length,
      totals.income,
      totals.expense,
      totals.income - totals.expense,
      client.balanceDue,
    ];
  });
  const recapTotals = recapRows.reduce(
    (acc, row) => ({
      income: acc.income + Number(row[2]),
      expense: acc.expense + Number(row[3]),
      net: acc.net + Number(row[4]),
      balance: acc.balance + Number(row[5]),
    }),
    { income: 0, expense: 0, net: 0, balance: 0 }
  );
  recapRows.push([
    `TOTAL (${filteredClientData.length} pengantin)`,
    filteredClientData.reduce((sum, client) => sum + client.projects.length, 0),
    recapTotals.income,
    recapTotals.expense,
    recapTotals.net,
    recapTotals.balance,
  ]);

  type LedgerEntry = (typeof ledgerEntries)[number];
  const packageIdSet = new Set((packages || []).map(pkg => pkg.id));
  const expensesByClient = new Map<string, LedgerEntry[]>();
  ledgerEntries.forEach(entry => {
    if (entry.amount >= 0) return;
    const list = expensesByClient.get(entry.clientId) || [];
    list.push(entry);
    expensesByClient.set(entry.clientId, list);
  });

  const weddingRows: (string | number)[][] = filteredClientData
    .map(client => {
      const totals = ledgerByClient.get(client.id) || { income: 0, expense: 0 };
      const eventDate = client.mostRecentProject?.date || client.since || '';
      const eventTime = eventDate ? new Date(eventDate).getTime() : 0;

      const packageLines: string[] = [];
      client.projects.forEach(project => {
        if (client.projects.length > 1) {
          packageLines.push(`— ${project.projectName || project.packageName || 'Acara'}`);
        }
        const selectedAddOns = (project.addOns || []).filter(item => item && (item.name || item.id));
        const additionalPackages = project.additionalPackages?.length
          ? project.additionalPackages
          : selectedAddOns.filter(item => item.id && packageIdSet.has(item.id) && item.id !== project.packageId);
        const additionalPackageIds = new Set(additionalPackages.map(item => item.id));
        const regularAddOns = selectedAddOns.filter(
          item => (!item.id || !packageIdSet.has(item.id)) && !additionalPackageIds.has(item.id)
        );
        const customCosts = project.customCosts || [];
        const customTotal = customCosts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const additionalTotal = additionalPackages.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const addOnTotal = regularAddOns.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const transportCost = Number(project.transportCost) || 0;
        const printingCost = Number(project.printingCost) || 0;
        const primaryTotal =
          project.totalCost - customTotal - additionalTotal - addOnTotal - transportCost - printingCost;

        packageLines.push(`Paket utama · ${project.packageName || 'Paket'}  ${formatRupiah(primaryTotal)}`);
        additionalPackages.forEach(item =>
          packageLines.push(
            `Paket tambahan · ${item.name || (packages || []).find(pkg => pkg.id === item.id)?.name || 'Paket'}  ${formatRupiah(Number(item.price) || 0)}`
          )
        );
        regularAddOns.forEach(item =>
          packageLines.push(`Add-on · ${item.name || 'Tambahan'}  ${formatRupiah(Number(item.price) || 0)}`)
        );
        if (printingCost > 0) packageLines.push(`Produksi fisik  ${formatRupiah(printingCost)}`);
        if (transportCost > 0) packageLines.push(`Transport  ${formatRupiah(transportCost)}`);
        customCosts.forEach(item =>
          packageLines.push(`${item.description || 'Biaya tambahan'}  ${formatRupiah(Number(item.amount) || 0)}`)
        );
      });

      const expenseLines = (expensesByClient.get(client.id) || []).map(entry => {
        const suffix = entry.projectName ? `(${entry.projectName})` : '';
        let label = entry.description && entry.description !== '-' ? entry.description : entry.category;
        const trimmed = label.trim();
        if (suffix && trimmed.endsWith(suffix)) {
          label = trimmed.slice(0, -suffix.length).replace(/[\s\-–—]+$/, '').trim() || label;
        }
        return `${label}  ${formatRupiah(Math.abs(entry.amount))}`;
      });
      if (expenseLines.length) expenseLines.push(`Total ${formatRupiah(totals.expense)}`);

      return {
        eventTime,
        row: [
          eventDate ? new Date(eventDate).toLocaleDateString('id-ID') : '-',
          client.name,
          packageLines.length ? packageLines.join('\n') : 'Belum ada paket',
          expenseLines.length ? expenseLines.join('\n') : 'Tanpa pengeluaran',
          totals.income - totals.expense,
        ] as (string | number)[],
      };
    })
    .sort((left, right) => left.eventTime - right.eventTime)
    .map(entry => entry.row);

  weddingRows.push([
    '',
    `TOTAL (${filteredClientData.length} pengantin)`,
    '',
    `Total ${formatRupiah(recapTotals.expense)}`,
    recapTotals.net,
  ]);

  const sections: ReportSection[] = [
    {
      title: 'Daftar Pengantin',
      columns: [
        { header: 'Nama', width: 2 },
        { header: 'Telepon', width: 1.4 },
        { header: 'Status', width: 1 },
        { header: 'Paket Terbaru', width: 2 },
        { header: 'Nilai Proyek', width: 1.4, isCurrency: true, tone: 'positive' },
        { header: 'Sisa Bayar', width: 1.4, isCurrency: true, tone: 'negative' },
      ],
      rows: filteredClientData.map(client => [
        client.name,
        client.whatsapp || client.phone || '-',
        client.status,
        client.PackageTerbaru || '-',
        client.totalProjectValue,
        client.balanceDue,
      ]),
      emptyText: 'Tidak ada pengantin pada periode ini.',
    },
    {
      title: 'Tabel Pengantin: Tanggal, Paket, Pengeluaran & Laba',
      columns: [
        { header: 'Tanggal', width: 0.85 },
        { header: 'Nama Pengantin', width: 1.25 },
        { header: 'Rincian Paket yang Diambil', width: 3.2 },
        { header: 'Total Rincian Pengeluaran', width: 2.9, align: 'left', tone: 'negative' },
        { header: 'Laba Bersih', width: 1.2, isCurrency: true, tone: 'auto' },
      ],
      rows: weddingRows,
      emptyText: 'Tidak ada pengantin pada periode ini.',
    },
    {
      title: 'Daftar Acara Pernikahan',
      columns: [
        { header: 'Tanggal', width: 1.1 },
        { header: 'Pengantin', width: 1.8 },
        { header: 'Nama Acara', width: 1.8 },
        { header: 'Lokasi', width: 1.6 },
        { header: 'Paket', width: 1.4 },
        { header: 'Nilai', width: 1.3, isCurrency: true, tone: 'positive' },
        { header: 'Status', width: 1 },
      ],
      rows: eventRows,
      emptyText: 'Tidak ada acara pernikahan pada periode ini.',
    },
    {
      title: 'Rincian Transaksi Kas per Pengantin',
      columns: [
        { header: 'Tanggal', width: 1 },
        { header: 'Pengantin', width: 1.5 },
        { header: 'Acara', width: 1.6 },
        { header: 'Tipe', width: 0.7 },
        { header: 'Kategori', width: 1.3 },
        { header: 'Keterangan', width: 2.2 },
        { header: 'Jumlah', width: 1.3, isCurrency: true, tone: 'auto' },
      ],
      rows: ledgerEntries.map(entry => [
        entry.date ? new Date(entry.date).toLocaleDateString('id-ID') : '-',
        entry.clientName,
        entry.projectName,
        entry.direction,
        entry.category,
        entry.description,
        entry.amount,
      ]),
      emptyText: 'Belum ada transaksi kas untuk pengantin pada periode ini.',
    },
    {
      title: 'Rekap Keuangan per Pengantin',
      columns: [
        { header: 'Pengantin', width: 2 },
        { header: 'Acara', width: 0.8, align: 'right' },
        { header: 'Kas Masuk', width: 1.4, isCurrency: true, tone: 'positive' },
        { header: 'Kas Keluar', width: 1.4, isCurrency: true, tone: 'negative' },
        { header: 'Laba Bersih', width: 1.4, isCurrency: true, tone: 'auto' },
        { header: 'Sisa Bayar', width: 1.4, isCurrency: true, tone: 'negative' },
      ],
      rows: recapRows,
      emptyText: 'Belum ada data keuangan pengantin pada periode ini.',
    },
  ];

  return {
    title: 'Laporan Data Pengantin',
    subtitle: userProfile.companyName,
    periodLabel: monthFilter ? formatMonthLabel(monthFilter) : 'Semua Periode',
    profile: userProfile,
    filename: buildReportFileName('Laporan-Data-Pengantin', monthFilter || 'semua-periode'),
    summaryCards: [
      { label: 'Total Pengantin', value: String(filteredClientData.length) },
      { label: 'Nilai Proyek', value: formatRupiah(totalProjectValue) },
      {
        label: 'Sudah Dibayar',
        value: formatRupiah(totalProjectValue - totalBalanceDue),
        tone: 'positive',
      },
      {
        label: 'Sisa Pembayaran',
        value: formatRupiah(totalBalanceDue),
        tone: totalBalanceDue > 0 ? 'negative' : 'positive',
      },
    ],
    sections,
    footerNote: `Dibuat otomatis oleh sistem pada ${new Date().toLocaleString('id-ID')}.`,
  };
}
