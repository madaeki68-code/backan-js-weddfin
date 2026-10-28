/**
 * Team-specific utility functions.
 * Pure functions – no side-effects, no React.
 */

import { formatCurrency } from '../../../utils/currency';
import { downloadCSV } from '../../../utils/export';
import { TeamMember, TeamProjectPayment } from '../../../types';

export { formatCurrency };

export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const dedupeCurrentTeamPayments = (
    payments: TeamProjectPayment[],
): TeamProjectPayment[] => {
    const currentByAssignment = new Map<string, TeamProjectPayment>();
    for (const payment of payments) {
        const key = JSON.stringify([payment.projectId, payment.teamMemberId]);
        const current = currentByAssignment.get(key);
        if (!current || (current.status === 'Paid' && payment.status === 'Unpaid')) {
            currentByAssignment.set(key, payment);
        }
    }
    return Array.from(currentByAssignment.values());
};

export const getStatusClass = (status: 'Paid' | 'Unpaid'): string =>
    status === 'Paid' ? 'solid-green text-white' : 'solid-orange text-white';

export const getEmployeeSalaryRecordNumber = (memberId: string, month: string): string =>
    `PAY-SAL-${memberId.slice(-6).toUpperCase()}-${month.replace('-', '')}`;

export const filterUniqueMembers = (
    members: TeamMember[],
    query: string,
    statusFilter?: 'Semua' | 'Aktif' | 'Nonaktif',
): TeamMember[] => {
    const seen = new Set<string>();
    const q = query.trim().toLowerCase();
    return members.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);

        // Status filter
        if (statusFilter && statusFilter !== 'Semua') {
            const memberStatus = (m as any).status || 'Aktif';
            if (memberStatus !== statusFilter) return false;
        }

        if (!q) return true;
        return (
            (m.name && m.name.toLowerCase().includes(q)) ||
            (m.role && m.role.toLowerCase().includes(q)) ||
            (m.specialization && m.specialization.toLowerCase().includes(q)) ||
            (m.location && m.location.toLowerCase().includes(q)) ||
            (m.phone && m.phone.toLowerCase().includes(q)) ||
            (m.email && m.email.toLowerCase().includes(q))
        );
    });
};

export const calculateMemberHonor = (
    memberId: string,
    payments: TeamProjectPayment[],
): {
    totalFee: number;
    paidFee: number;
    unpaidFee: number;
    eventCount: number;
} => {
    const deduped = dedupeCurrentTeamPayments(payments).filter(p => p.teamMemberId === memberId);
    const totalFee = deduped.reduce((sum, p) => sum + (p.fee || 0), 0);
    const paidFee = deduped.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.fee || 0), 0);
    const unpaidFee = totalFee - paidFee;
    return {
        totalFee,
        paidFee,
        unpaidFee,
        eventCount: deduped.length,
    };
};

export const downloadTeamCSV = (
    members: TeamMember[],
    teamProjectPayments: TeamProjectPayment[],
): void => {
    const headers = [
        'Nama',
        'Role',
        'Spesialisasi',
        'Kategori',
        'Status',
        'Email',
        'Telepon',
        'Alamat',
        'No. Rekening',
        'Honor Belum Dibayar',
        'Rating',
    ];
    const data = members.map(member => {
        const unpaidFee = dedupeCurrentTeamPayments(teamProjectPayments)
            .filter(p => p.teamMemberId === member.id && p.status === 'Unpaid')
            .reduce((sum, p) => sum + p.fee, 0);
        return [
            `"${(member.name || '').replace(/"/g, '""')}"`,
            member.role || '-',
            member.specialization || '-',
            member.category || 'Tim',
            (member as any).status || 'Aktif',
            member.email || '-',
            member.phone || '-',
            `"${(member.location || '-').replace(/"/g, '""')}"`,
            member.noRek || '-',
            unpaidFee,
            member.rating ? member.rating.toFixed(1) : '0.0',
        ];
    });
    downloadCSV(headers, data, `data-Tim-Vendor-${new Date().toISOString().split('T')[0]}.csv`);
};
