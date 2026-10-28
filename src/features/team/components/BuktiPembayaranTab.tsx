import React, { useState, useMemo } from 'react';
import { FileTextIcon, DownloadIcon, Trash2Icon, EyeIcon } from '../../../constants';
import { TeamPaymentRecord, TeamMember } from '../types';
import { formatCurrency, formatDate } from '../utils/teamUtils';
import { CheckCircle2, AlertCircle, Search } from 'lucide-react';

interface BuktiPembayaranTabProps {
  teamPaymentRecords?: TeamPaymentRecord[];
  teamMembers?: TeamMember[];
  onViewSlip?: (record: TeamPaymentRecord) => void;
  onDeleteSlip?: (record: TeamPaymentRecord) => void;
  onCreateSlip?: () => void;
}

export const BuktiPembayaranTab: React.FC<BuktiPembayaranTabProps> = ({
  teamPaymentRecords = [],
  teamMembers = [],
  onViewSlip,
  onDeleteSlip,
  onCreateSlip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const recordsWithMembers = useMemo(() => {
    return teamPaymentRecords.map(rec => ({
      record: rec,
      member: teamMembers.find(m => m.id === rec.teamMemberId),
    }));
  }, [teamPaymentRecords, teamMembers]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recordsWithMembers;
    return recordsWithMembers.filter(({ record, member }) =>
      record.recordNumber.toLowerCase().includes(q) ||
      (member?.name && member.name.toLowerCase().includes(q)) ||
      (member?.role && member.role.toLowerCase().includes(q))
    );
  }, [recordsWithMembers, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#2A3547]">
            Daftar Bukti &amp; Slip Pembayaran
          </h3>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-0.5">
            Kelola arsip slip pembayaran dan gaji untuk seluruh tim internal, karyawan, dan vendor.
          </p>
        </div>
        {onCreateSlip && (
          <button
            type="button"
            onClick={onCreateSlip}
            className="button-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs"
          >
            <FileTextIcon className="w-3.5 h-3.5" />
            <span>Pilih Anggota untuk Bayar</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Cari nomor slip, nama anggota, atau peran..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-[#2A3547] placeholder:text-[#5A6A85] focus:outline-none focus:bg-white focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all pl-9"
          />
          <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="text-xs text-[#5A6A85] px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center sm:text-right">
          Total <span className="font-bold text-[#2A3547]">{filteredRecords.length}</span> slip pembayaran
        </div>
      </div>

      {/* Content */}
      {filteredRecords.length === 0 ? (
        <div className="border border-dashed border-slate-200 bg-white rounded-2xl p-10 sm:p-14 text-center">
          <FileTextIcon className="w-12 h-12 mx-auto mb-3 text-brand-accent/40" />
          <h4 className="text-sm sm:text-base font-bold text-[#2A3547] mb-1">
            Belum ada slip pembayaran tersimpan
          </h4>
          <p className="text-xs sm:text-sm text-[#5A6A85] max-w-md mx-auto">
            Slip pembayaran otomatis tersimpan di sini saat Anda melakukan pembayaran honor acara atau gaji karyawan melalui tab detail anggota.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filteredRecords.map(({ record, member }) => (
              <div key={record.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-md">
                      {record.recordNumber}
                    </span>
                    <h5 className="font-bold text-sm text-[#2A3547] mt-1.5">
                      {member?.name || 'Anggota Tim'}
                    </h5>
                    <p className="text-xs text-[#5A6A85]">{member?.role || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#5A6A85]">{formatDate(record.date)}</p>
                    <p className="font-bold text-sm text-emerald-600 mt-1">
                      {formatCurrency(record.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="flex items-center gap-1 text-[11px] text-[#5A6A85]">
                    {record.vendorSignature ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Bertanda Tangan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Belum TTD
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {onViewSlip && (
                      <button
                        type="button"
                        onClick={() => onViewSlip(record)}
                        className="btn-box-read text-[11px] px-2.5 py-1"
                      >
                        <EyeIcon className="w-3 h-3 text-white" />
                        <span>Lihat Slip</span>
                      </button>
                    )}
                    {onDeleteSlip && (
                      <button
                        type="button"
                        onClick={() => onDeleteSlip(record)}
                        className="btn-box-delete text-[11px] px-2 py-1"
                      >
                        <Trash2Icon className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[#5A6A85] uppercase text-[10px] sm:text-xs font-bold">
                <tr>
                  <th className="px-4 py-3 text-left">No. Slip</th>
                  <th className="px-4 py-3 text-left">Penerima</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-right">Total Nominal</th>
                  <th className="px-4 py-3 text-center">Tanda Tangan</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(({ record, member }) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-brand-accent">
                      {record.recordNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#2A3547]">{member?.name || 'Anggota Tim'}</div>
                      <div className="text-[11px] text-[#5A6A85]">{member?.role || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-[#5A6A85] whitespace-nowrap">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(record.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {record.vendorSignature ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Ada TTD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" /> Belum TTD
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onViewSlip && (
                          <button
                            type="button"
                            onClick={() => onViewSlip(record)}
                            className="btn-box-read px-2.5 py-1 text-xs"
                            title="Lihat Slip"
                          >
                            <EyeIcon className="w-3.5 h-3.5 text-white" />
                            <span>Lihat</span>
                          </button>
                        )}
                        {onDeleteSlip && (
                          <button
                            type="button"
                            onClick={() => onDeleteSlip(record)}
                            className="btn-box-delete px-2 py-1 text-xs"
                            title="Hapus Slip"
                          >
                            <Trash2Icon className="w-3.5 h-3.5 text-white" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuktiPembayaranTab;
