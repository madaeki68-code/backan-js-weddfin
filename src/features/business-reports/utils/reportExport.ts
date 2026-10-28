import {
  Client,
  Project,
  Profile,
  Transaction,
  TransactionType,
  Package,
} from '../../../types';
import {
  downloadReportPdf,
  buildReportFileName,
  ReportSection,
} from '../../../shared/utils/reportPdf';
import { formatCurrency } from '../../clients/utils/clientFormatters';
import { buildClientLedger } from '../../clients/utils/clientStats';
import { extractCityFromAddress } from '../../clients/utils/clientFormatters';
import { resolveLeadStatus } from '../../../constants';
import {
  TypeReportStats,
  CityStat,
  PackageStat,
  TeamStat,
  LeadConversionStat,
} from '../types/businessReports.types';

export function exportClientsReportToCsv(
  clients: Client[],
  filteredProjects: Project[],
  showNotification: (msg: string) => void
): void {
  const headers = ['Nama Pengantin', 'Email', 'No Telepon', 'Status', 'Terdaftar Sejak', 'Total Nilai Acara'];
  const rows = clients.map(client => {
    const totalValue = filteredProjects
      .filter(p => p.clientId === client.id)
      .reduce((sum, p) => sum + p.totalCost, 0);

    return [
      client.name,
      client.email,
      client.phone,
      client.status,
      new Date(client.since).toLocaleDateString('id-ID'),
      formatCurrency(totalValue),
    ];
  });

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `laporan-pengantin-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showNotification('Laporan berhasil diexport ke CSV');
}

export interface ExportPdfParams {
  profile: Profile | null;
  reportPeriodLabel: string;
  monthFilter: string;
  clients: Client[];
  filteredClients: Client[];
  filteredProjects: Project[];
  packages: Package[];
  transactions: Transaction[];
  filteredLeads: any[];
  totalRevenue: number;
  typeStats: TypeReportStats;
  cityStats: CityStat[];
  packageStats: PackageStat[];
  teamStats: TeamStat[];
  leadConversionStats: LeadConversionStat;
  typeReportClientsInTable: Client[];
  clientTransactionTotals: Map<string, { income: number; expense: number; expenses: { projectId: string; label: string; amount: number }[] }>;
  typeReportClientTableTotals: { projectValue: number; expense: number; netProfit: number };
  cityTableTotals: { clients: number; leads: number; projects: number; revenue: number };
  packageTableTotals: { pricelist: number; orders: number; revenue: number };
  teamTableTotals: { jobs: number; fees: number; paid: number; unpaid: number };
  showNotification: (msg: string) => void;
}

export async function exportExecutiveReportPdf(params: ExportPdfParams): Promise<void> {
  const {
    profile,
    reportPeriodLabel,
    monthFilter,
    clients,
    filteredClients,
    filteredProjects,
    packages,
    transactions,
    filteredLeads,
    totalRevenue,
    typeStats,
    cityStats,
    packageStats,
    teamStats,
    leadConversionStats,
    typeReportClientsInTable,
    clientTransactionTotals,
    typeReportClientTableTotals,
    cityTableTotals,
    packageTableTotals,
    teamTableTotals,
    showNotification,
  } = params;

  try {
    const clientNameById = new Map(clients.map(client => [client.id, client.name]));
    const projectMetaById = new Map<string, { clientName: string; projectName: string }>();

    filteredProjects.forEach(project => {
      projectMetaById.set(project.id, {
        clientName: clientNameById.get(project.clientId) || '-',
        projectName: project.projectName || project.packageName || 'Acara',
      });
    });

    const transactionRows = transactions
      .filter(transaction => !!transaction.projectId && projectMetaById.has(transaction.projectId))
      .map(transaction => {
        const meta = projectMetaById.get(transaction.projectId as string)!;
        const isIncome = transaction.type === TransactionType.INCOME;
        return {
          date: transaction.date,
          clientName: meta.clientName,
          projectName: meta.projectName,
          direction: isIncome ? 'Masuk' : 'Keluar',
          category: transaction.category || (isIncome ? 'Pembayaran Klien' : 'Biaya Acara'),
          description: transaction.description || '-',
          amount: isIncome ? transaction.amount : -transaction.amount,
        };
      })
      .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

    const transactionNetTotal = transactionRows.reduce((sum, row) => sum + row.amount, 0);

    const sections: ReportSection[] = [
      {
        title: '1. Ringkasan Tipe Klien (Langsung vs Vendor)',
        columns: [
          { header: 'Tipe Klien', width: 1.6 },
          { header: 'Pengantin', width: 1, align: 'right' },
          { header: 'Total Acara', width: 1, align: 'right' },
          { header: 'Omzet', width: 1.7, isCurrency: true, tone: 'positive' },
          { header: 'Rata-rata / Acara', width: 1.5, isCurrency: true },
          { header: 'Share Omzet', width: 1, align: 'right' },
        ],
        rows: [
          ['Langsung (Direct)', typeStats.typeReportDirectClients.length, typeStats.typeReportDirectProjects.length, typeStats.typeReportDirectRevenue, typeStats.typeReportAvgDirectRevenue, `${typeStats.typeReportDirectRevenueShare}%`],
          ['Vendor / WO', typeStats.typeReportVendorClients.length, typeStats.typeReportVendorProjects.length, typeStats.typeReportVendorRevenue, typeStats.typeReportAvgVendorRevenue, `${typeStats.typeReportVendorRevenueShare}%`],
          ['TOTAL', typeStats.typeReportClients.length, typeStats.typeReportProjects.length, typeStats.typeReportRevenue, typeStats.typeReportAvgRevenuePerClient, '100%'],
        ],
      },
      {
        title: '2. Rincian Pengantin (Detail Paket, Biaya Produksi & Laba Bersih)',
        columns: [
          { header: 'Pengantin', width: 1.4 },
          { header: 'Kontak', width: 1 },
          { header: 'Tipe', width: 0.6 },
          { header: 'Kota / Daerah', width: 0.9 },
          { header: 'Rincian Paket Acara', width: 2.6 },
          { header: 'Nilai Total', width: 1.1, isCurrency: true, tone: 'positive' },
          { header: 'Rincian Biaya Produksi', width: 2.6 },
          { header: 'Laba Bersih', width: 1.1, isCurrency: true, tone: 'auto' },
          { header: 'Status Bayar', width: 0.8 },
          { header: 'Tanggal Acara', width: 0.9 },
        ],
        rows: typeReportClientsInTable.map(client => {
          const ledger = buildClientLedger(
            client,
            filteredProjects,
            packages,
            clientTransactionTotals.get(client.id) || { income: 0, expense: 0, expenses: [] }
          );
          const packageDetail = ledger.projectCostDetails.length
            ? ledger.projectCostDetails.map(project => {
                const lines = [project.name];
                project.items.forEach(item => lines.push(`   - ${item.label}: ${formatCurrency(item.amount)}`));
                if (ledger.projectCostDetails.length > 1) lines.push(`   Subtotal: ${formatCurrency(project.total)}`);
                return lines.join('\n');
              }).join('\n')
            : '-';
          const expenseDetail = ledger.expenseByProject.length
            ? ledger.expenseByProject.map(project => {
                const lines: string[] = [];
                if (ledger.expenseByProject.length > 1) lines.push(project.name);
                project.items.forEach(item => lines.push(`   - ${item.label}: ${formatCurrency(item.amount)}`));
                lines.push(`   Total: ${formatCurrency(project.total)}`);
                return lines.join('\n');
              }).join('\n')
            : '-';

          return [
            client.name,
            client.phone || client.email || '-',
            ledger.isDirect ? 'Langsung' : 'Vendor',
            extractCityFromAddress(client.address || client.homeAddress || ''),
            packageDetail,
            ledger.totalVal,
            expenseDetail,
            ledger.netProfit,
            ledger.payStatus,
            ledger.eventDates.length
              ? ledger.eventDates.map(date => new Date(date).toLocaleDateString('id-ID')).join('\n')
              : '-',
          ];
        }).concat([[
          `TOTAL (${typeReportClientsInTable.length} pengantin)`,
          '', '', '', '',
          typeReportClientTableTotals.projectValue,
          typeReportClientTableTotals.expense,
          typeReportClientTableTotals.netProfit,
          '', '',
        ]]),
        emptyText: 'Tidak ada data pengantin pada periode ini.',
      },
      {
        title: '3. Peringkat Daerah & Kota Pengantin',
        columns: [
          { header: 'No', width: 0.4, align: 'right' },
          { header: 'Daerah / Kota', width: 1.6 },
          { header: 'Pengantin', width: 1, align: 'right' },
          { header: 'Calon (Leads)', width: 1, align: 'right' },
          { header: 'Total Acara', width: 1, align: 'right' },
          { header: 'Total Nilai Acara', width: 1.6, isCurrency: true },
          { header: 'Share', width: 0.9, align: 'right' },
        ],
        rows: cityStats.map((city, index) => [
          index + 1,
          city.name,
          city.clientCount,
          city.leadCount,
          city.projectCount,
          city.totalRevenue,
          `${city.percentage.toFixed(1)}%`,
        ]).concat([[
          '',
          'TOTAL',
          cityTableTotals.clients,
          cityTableTotals.leads,
          cityTableTotals.projects,
          cityTableTotals.revenue,
          cityTableTotals.clients > 0 ? '100.0%' : '-',
        ]]),
        emptyText: 'Belum ada data persebaran daerah pengantin.',
      },
      {
        title: '4. Rekap Paket & Pricelist Layanan',
        columns: [
          { header: 'No', width: 0.4, align: 'right' },
          { header: 'Nama Paket', width: 1.8 },
          { header: 'Kategori', width: 1.2 },
          { header: 'Wilayah', width: 1.2 },
          { header: 'Pricelist', width: 1.4, isCurrency: true },
          { header: 'Pesanan', width: 0.9, align: 'right' },
          { header: 'Total Omzet', width: 1.6, isCurrency: true },
          { header: 'Kontribusi', width: 1, align: 'right' },
          { header: 'Rata-rata Realisasi', width: 1.5, isCurrency: true },
        ],
        rows: packageStats.map((pkg, index) => [
          index + 1,
          pkg.name,
          pkg.category,
          pkg.region,
          pkg.pricelistPrice,
          `${pkg.orderCount}x`,
          pkg.totalOmzet,
          `${pkg.revenueContribution.toFixed(1)}%`,
          pkg.avgRealizedPrice,
        ]).concat([[
          '',
          'TOTAL',
          '',
          '',
          packageTableTotals.pricelist,
          `${packageTableTotals.orders}x`,
          packageTableTotals.revenue,
          totalRevenue > 0 ? `${((packageTableTotals.revenue / totalRevenue) * 100).toFixed(1)}%` : '-',
          packageTableTotals.orders > 0 ? packageTableTotals.revenue / packageTableTotals.orders : 0,
        ]]),
        emptyText: 'Belum ada data paket dan pricelist.',
      },
      {
        title: '5. Performa Tim & Pembayaran Honor',
        columns: [
          { header: 'No', width: 0.4, align: 'right' },
          { header: 'Nama Anggota Tim', width: 1.6 },
          { header: 'Peran / Posisi', width: 1.4 },
          { header: 'Jumlah Job', width: 0.9, align: 'right' },
          { header: 'Total Honor', width: 1.4, isCurrency: true },
          { header: 'Terbayar', width: 1.4, isCurrency: true, tone: 'positive' },
          { header: 'Sisa Belum Bayar', width: 1.4, isCurrency: true, tone: 'negative' },
        ],
        rows: teamStats.map((member, index) => [
          index + 1,
          member.name,
          `${member.role} (${member.category})`,
          `${member.jobCount} job`,
          member.totalFee,
          member.paidFee,
          member.unpaidFee,
        ]).concat([[
          '',
          'TOTAL',
          '',
          `${teamTableTotals.jobs} job`,
          teamTableTotals.fees,
          teamTableTotals.paid,
          teamTableTotals.unpaid,
        ]]),
        emptyText: 'Belum ada penugasan tim pada periode ini.',
      },
      {
        title: '6. Efektivitas Channel Promosi',
        columns: [
          { header: 'Channel', width: 2 },
          { header: 'Total Calon', width: 1, align: 'right' },
          { header: 'Closing', width: 1, align: 'right' },
          { header: 'Tingkat Konversi', width: 1.2, align: 'right' },
        ],
        rows: leadConversionStats.channels.map(channel => [
          channel.channel,
          channel.total,
          channel.converted,
          `${channel.rate}%`,
        ]),
        emptyText: 'Belum ada channel promosi yang tercatat.',
      },
      {
        title: '7. Daftar Calon Pengantin (Leads)',
        columns: [
          { header: 'Nama Calon', width: 1.6 },
          { header: 'Status', width: 1 },
          { header: 'Channel', width: 1 },
          { header: 'Lokasi / Kota', width: 1.5 },
          { header: 'WhatsApp', width: 1.1 },
          { header: 'Rencana Acara', width: 1.1 },
          { header: 'Tanggal Masuk', width: 1.1 },
        ],
        rows: filteredLeads.map(lead => [
          lead.name,
          resolveLeadStatus(lead),
          lead.contactChannel || '-',
          lead.location || lead.address || '-',
          lead.whatsapp || '-',
          lead.eventDate ? new Date(lead.eventDate).toLocaleDateString('id-ID') : '-',
          lead.date ? new Date(lead.date).toLocaleDateString('id-ID') : '-',
        ]).concat([[
          'TOTAL',
          `${filteredLeads.length} calon`,
          '', '', '', '', '',
        ]]),
        emptyText: 'Tidak ada data calon pengantin untuk periode ini.',
      },
      {
        title: '8. Daftar Transaksi Kas Pengantin (Detail)',
        columns: [
          { header: 'Tanggal', width: 1 },
          { header: 'Pengantin', width: 1.5 },
          { header: 'Acara', width: 1.6 },
          { header: 'Tipe', width: 0.7 },
          { header: 'Kategori', width: 1.3 },
          { header: 'Keterangan', width: 2.2 },
          { header: 'Jumlah', width: 1.3, isCurrency: true, tone: 'auto' },
        ],
        rows: transactionRows.map(row => [
          row.date ? new Date(row.date).toLocaleDateString('id-ID') : '-',
          row.clientName,
          row.projectName,
          row.direction,
          row.category,
          row.description,
          row.amount,
        ]).concat([[
          'TOTAL',
          `${transactionRows.length} transaksi`,
          '', '', 'Arus Kas Bersih', '',
          transactionNetTotal,
        ]]),
        emptyText: 'Belum ada transaksi kas pengantin pada periode ini.',
      },
    ];

    await downloadReportPdf({
      title: 'Laporan KPI Pengantin',
      subtitle: profile?.companyName || undefined,
      periodLabel: reportPeriodLabel,
      profile,
      filename: buildReportFileName('Laporan-KPI-Pengantin', monthFilter || 'semua-periode'),
      summaryCards: [
        { label: 'Total Pengantin', value: String(filteredClients.length) },
        { label: 'Total Proyek', value: String(filteredProjects.length) },
        { label: 'Total Omzet', value: formatCurrency(totalRevenue) },
        { label: 'Total Biaya Produksi', value: formatCurrency(typeReportClientTableTotals.expense), tone: 'negative' },
        {
          label: 'Laba Bersih',
          value: formatCurrency(typeReportClientTableTotals.netProfit),
          tone: typeReportClientTableTotals.netProfit >= 0 ? 'positive' : 'negative',
        },
        { label: 'Total Leads', value: String(filteredLeads.length) },
      ],
      sections,
      footerNote: `Dibuat otomatis oleh sistem pada ${new Date().toLocaleString('id-ID')}.`,
    });

    showNotification('Laporan PDF berhasil diunduh.');
  } catch (error) {
    console.error('[BusinessReports] Gagal membuat laporan PDF:', error);
    showNotification('Gagal membuat laporan PDF. Silakan coba lagi.');
  }
}
