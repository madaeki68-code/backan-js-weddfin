/**
 * TeamMemberList
 *
 * Renders the member list for a single group (Tim, Karyawan, or Vendor).
 * Desktop: table with avatar, role, specialization, status, unpaid/salary, rating, actions.
 * Mobile: responsive cards.
 */

import React from 'react';
import { TeamMember, TeamProjectPayment } from '../../../types';
import { dedupeCurrentTeamPayments, formatCurrency } from '../utils/teamUtils';
import {
    EyeIcon,
    PencilIcon,
    Trash2Icon,
    StarIcon,
    UsersIcon,
} from '../../../constants';
import { MobileExpandableExtra } from '../../../components/ui/MobileProgressiveDisclosure';
import TablePagination from '../../../shared/ui/TablePagination';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listTeamMembersPaginated } from '../../../services/teamMembers';
import { customizeUiText, useUiTextOverrides } from '../../../utils/uiTextCustomization';
import { Power } from 'lucide-react';

interface TeamMemberListProps {
    members: TeamMember[];
    teamProjectPaymentsInDateRange: TeamProjectPayment[];
    groupLabel: 'team' | 'employee' | 'vendor';
    searchQuery?: string;
    onViewDetails: (member: TeamMember) => void;
    onEditMember: (member: TeamMember) => void;
    onDeleteMember: (memberId: string) => void;
    onToggleStatus?: (memberId: string) => void;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
    members,
    teamProjectPaymentsInDateRange,
    groupLabel,
    searchQuery = '',
    onViewDetails,
    onEditMember,
    onDeleteMember,
    onToggleStatus,
}) => {
    const textOverrides = useUiTextOverrides();
    const text = (key: string, fallback: string) => customizeUiText(`table.team.${key}`, fallback, textOverrides);
    const currentTeamPayments = dedupeCurrentTeamPayments(teamProjectPaymentsInDateRange);
    const getUnpaidFee = (memberId: string) =>
        currentTeamPayments
            .filter(payment => payment.teamMemberId === memberId && payment.status === 'Unpaid')
            .reduce((sum, payment) => sum + payment.fee, 0);

    const emptyMessage =
        groupLabel === 'team'
            ? 'Tidak ada data anggota tim yang cocok.'
            : groupLabel === 'employee' ? 'Tidak ada data karyawan yang cocok.' : 'Tidak ada data vendor yang cocok.';

    const emptySearchMessage =
        groupLabel === 'team'
            ? 'Tidak ada data anggota tim yang cocok dengan pencarian.'
            : groupLabel === 'employee' ? 'Tidak ada data karyawan yang cocok dengan pencarian.' : 'Tidak ada data vendor yang cocok dengan pencarian.';

    const nameHeader = groupLabel === 'vendor' ? 'Nama Vendor' : groupLabel === 'employee' ? 'Nama Karyawan' : 'Nama';
    const roleHeader = groupLabel === 'vendor' ? 'Bidang / Layanan' : 'Peran & Spesialisasi';

    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const queryClient = useQueryClient();

    React.useEffect(() => {
        setCurrentPage(1);
    }, [members.length, groupLabel, searchQuery]);

    React.useEffect(() => {
        void queryClient.invalidateQueries({ queryKey: ['teamMembers', 'page'] });
    }, [members, queryClient]);

    const memberPageQuery = useQuery({
        queryKey: ['teamMembers', 'page', groupLabel, searchQuery, currentPage, itemsPerPage],
        queryFn: () => listTeamMembersPaginated(currentPage, itemsPerPage, {
            category: groupLabel,
            search: searchQuery,
        }),
        placeholderData: previous => previous,
    });
    const paginatedMembers = memberPageQuery.data?.teamMembers || [];
    const memberTotal = memberPageQuery.data?.total || 0;

    return (
        <div className="bg-white rounded-2xl shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden transition-all duration-300">
            {/* Mobile cards */}
            <div className="md:hidden p-3 space-y-3 bg-[#F8FAFC]">
                {paginatedMembers.map(member => {
                    const unpaidFee = getUnpaidFee(member.id);
                    const memberStatus = (member as any).status || 'Aktif';

                    const categoryBadgeClass =
                        groupLabel === 'vendor'
                            ? 'solid-orange text-white border border-orange-600'
                            : 'solid-blue text-white border border-blue-600';

                    return (
                        <div
                            key={member.id}
                            className={`rounded-xl bg-white border p-3.5 shadow-xs group transition-all duration-200 ${
                                memberStatus === 'Nonaktif'
                                    ? 'border-slate-300 opacity-80 bg-slate-50/50'
                                    : 'border-slate-200 hover:border-brand-accent'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-200">
                                <div className="min-w-0 flex-1 flex items-center gap-2.5">
                                    <span className="w-9 h-9 rounded-full overflow-hidden shrink-0 grad-brand border border-brand-accent/20 flex items-center justify-center text-xs font-bold text-white">
                                        {member.avatarUrl ? (
                                            <img
                                                src={member.avatarUrl}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            member.name?.charAt(0).toUpperCase() || '?'
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="font-bold text-[#2A3547] text-sm leading-tight truncate">
                                                {member.name}
                                            </p>
                                            <span
                                                className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                                    memberStatus === 'Aktif'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                {memberStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                            <p className="text-[11px] text-[#5A6A85] font-medium truncate">
                                                {member.role}
                                                {member.specialization ? ` • ${member.specialization}` : ''}
                                            </p>
                                            <span
                                                className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider ${categoryBadgeClass}`}
                                            >
                                                {member.category || (groupLabel === 'vendor' ? 'Vendor' : 'Tim')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-[11px] shrink-0">
                                    <div className="inline-flex items-center gap-1 solid-orange border border-orange-600 text-white font-bold px-2 py-0.5 rounded-lg">
                                        <StarIcon className="w-3 h-3 text-white fill-current" />
                                        {member.rating ? member.rating.toFixed(1) : '0.0'}
                                    </div>
                                </div>
                            </div>
                            <div className="py-2.5 flex items-center justify-between text-xs border-b border-slate-100">
                                <span className="text-[#5A6A85] font-medium">
                                    {groupLabel === 'employee' ? 'Gaji Bulanan' : 'Honor Belum Dibayar'}
                                </span>
                                <span
                                    className={`text-right font-bold ${
                                        groupLabel === 'employee'
                                            ? 'text-brand-accent'
                                            : unpaidFee > 0
                                            ? 'text-red-600'
                                            : 'text-emerald-600'
                                    }`}
                                >
                                    {formatCurrency(groupLabel === 'employee' ? member.standardFee : unpaidFee)}
                                </span>
                            </div>
                            <MobileExpandableExtra
                                labelOpen="Lihat Aksi"
                                labelClose="Ringkas"
                                headerRight={
                                    <button
                                        onClick={() => onViewDetails(member)}
                                        className="btn-box-read text-[10px] px-2.5 py-1"
                                    >
                                        <EyeIcon className="w-3 h-3 flex-shrink-0 text-white" /> <span>Detail</span>
                                    </button>
                                }
                            >
                                <div className="flex justify-end gap-1.5 pt-1">
                                    {onToggleStatus && (
                                        <button
                                            onClick={() => onToggleStatus(member.id)}
                                            className="px-2 py-1 rounded-md text-[10px] font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1"
                                            title={memberStatus === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                        >
                                            <Power className="w-3 h-3" />
                                            <span>{memberStatus === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEditMember(member)}
                                        className="btn-box-edit text-[10px] px-2.5 py-1"
                                    >
                                        <PencilIcon className="w-3 h-3 flex-shrink-0" /> <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDeleteMember(member.id)}
                                        className="btn-box-delete text-[10px] px-2.5 py-1"
                                    >
                                        <Trash2Icon className="w-3 h-3 flex-shrink-0 text-white" /> <span>Hapus</span>
                                    </button>
                                </div>
                            </MobileExpandableExtra>
                        </div>
                    );
                })}
                {members.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-xl border border-slate-200 text-[#5A6A85]">
                        <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-xs lg:text-sm border-collapse">
                    <thead className="text-[11px] lg:text-xs text-[#5A6A85] font-bold uppercase bg-[#F8FAFC] border-b border-slate-200">
                        <tr>
                            <th className="px-3 lg:px-4 py-3.5 text-center w-10 lg:w-14 border-r border-slate-200/70">{text('number', 'No')}</th>
                            <th className="px-3 lg:px-4 py-3.5 text-left border-r border-slate-200/70">{text('name', nameHeader)}</th>
                            <th className="px-3 lg:px-4 py-3.5 text-left border-r border-slate-200/70">{text('role', roleHeader)}</th>
                            <th className="px-3 lg:px-4 py-3.5 text-center border-r border-slate-200/70">{text('status', 'Status')}</th>
                            <th className="px-3 lg:px-4 py-3.5 text-left border-r border-slate-200/70">
                                {text('payment', groupLabel === 'employee' ? 'Gaji Bulanan' : 'Honor Belum Dibayar')}
                            </th>
                            <th className="px-3 lg:px-4 py-3.5 text-center border-r border-slate-200/70">{text('rating', 'Rating')}</th>
                            <th className="px-3 lg:px-4 py-3.5 text-center">{text('actions', 'Aksi')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {paginatedMembers.map((member, index) => {
                            const unpaidFee = getUnpaidFee(member.id);
                            const memberStatus = (member as any).status || 'Aktif';

                            return (
                                <tr
                                    key={member.id}
                                    className={`hover:bg-[#F8FAFC] transition-colors ${
                                        memberStatus === 'Nonaktif' ? 'opacity-70 bg-slate-50/40' : ''
                                    }`}
                                >
                                    <td className="px-3 lg:px-4 py-3.5 text-center font-semibold text-[#5A6A85] border-r border-slate-100">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-3 lg:px-4 py-3.5 font-bold text-[#2A3547] border-r border-slate-100">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 grad-brand border border-brand-accent/20 flex items-center justify-center text-xs font-bold text-white">
                                                {member.avatarUrl ? (
                                                    <img
                                                        src={member.avatarUrl}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    member.name?.charAt(0).toUpperCase() || '?'
                                                )}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold text-[#2A3547]">{member.name}</p>
                                                {member.phone && (
                                                    <p className="text-[11px] font-normal text-[#5A6A85] truncate">{member.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-4 py-3.5 border-r border-slate-100">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-slate-200 text-[#2A3547] text-xs font-semibold">
                                                {member.role}
                                            </span>
                                            {member.specialization && (
                                                <span className="text-[11px] text-brand-text-secondary">
                                                    {member.specialization}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-4 py-3.5 text-center border-r border-slate-100">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                memberStatus === 'Aktif'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-slate-200 text-slate-700'
                                            }`}
                                        >
                                            {memberStatus}
                                        </span>
                                    </td>
                                    <td className={`px-3 lg:px-4 py-3.5 font-bold whitespace-nowrap border-r border-slate-100 ${
                                        groupLabel === 'employee'
                                            ? 'text-brand-accent'
                                            : unpaidFee > 0
                                            ? 'text-red-600'
                                            : 'text-emerald-600'
                                    }`}>
                                        {formatCurrency(groupLabel === 'employee' ? member.standardFee : unpaidFee)}
                                    </td>
                                    <td className="px-3 lg:px-4 py-3.5 border-r border-slate-100">
                                        <div className="flex justify-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg solid-orange border border-orange-600 text-white font-bold text-xs">
                                                <StarIcon className="w-3.5 h-3.5 text-white fill-current" />
                                                {member.rating ? member.rating.toFixed(1) : '0.0'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 lg:px-4 py-3.5">
                                        <div className="flex items-center justify-center space-x-1.5">
                                            <button
                                                onClick={() => onViewDetails(member)}
                                                className="btn-box-read w-7 lg:w-8 h-7 lg:h-8 rounded-md lg:rounded-lg flex items-center justify-center"
                                                title="Detail"
                                            >
                                                <EyeIcon className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-white flex-shrink-0" />
                                            </button>
                                            <button
                                                onClick={() => onEditMember(member)}
                                                className="btn-box-edit w-7 lg:w-8 h-7 lg:h-8 rounded-md lg:rounded-lg flex items-center justify-center"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-3.5 lg:w-4 h-3.5 lg:h-4 flex-shrink-0" />
                                            </button>
                                            {onToggleStatus && (
                                                <button
                                                    onClick={() => onToggleStatus(member.id)}
                                                    className="w-7 lg:w-8 h-7 lg:h-8 rounded-md lg:rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-100"
                                                    title={memberStatus === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                >
                                                    <Power className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDeleteMember(member.id)}
                                                className="btn-box-delete w-7 lg:w-8 h-7 lg:h-8 rounded-md lg:rounded-lg flex items-center justify-center"
                                                title="Hapus"
                                            >
                                                <Trash2Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4 text-white flex-shrink-0" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!memberPageQuery.isLoading && memberTotal === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-10 text-[#5A6A85] font-medium"
                                >
                                    {emptySearchMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalItems={memberTotal}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                label={groupLabel === 'vendor' ? 'vendor' : 'anggota tim'}
                pageSizeOptions={[10, 20, 50]}
            />
        </div>
    );
};

export default TeamMemberList;
