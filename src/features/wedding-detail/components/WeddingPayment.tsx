import React, { useState } from 'react';
import { Project, Client, Transaction, TransactionType, Card, FinancialPocket } from '../../../types';
import { WeddingFinancialSummary } from '../types/weddingDetail.types';
import { formatCurrency } from '../../../utils/currency';
import RupiahInput from '../../../shared/form/RupiahInput';
import {
  CreditCard,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Receipt,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { POPULAR_PRESET_CHIPS } from '../../clients/constants';

interface WeddingPaymentProps {
  client: Client;
  activeProject: Project | null;
  financial: WeddingFinancialSummary;
  projectTransactions: Transaction[];
  cards: Card[];
  pockets: FinancialPocket[];
  isRecordingPayment: boolean;
  isAddingExpense: boolean;
  onRecordPayment: (amount: number, destinationCardId: string, proofFile?: File | null) => Promise<void>;
  onAddExtraCharge: (name: string, amount: number) => Promise<void>;
  onDeleteExtraCharge: (chargeId: string) => Promise<void>;
  onAddProjectExpense: (data: { date: string; description: string; amount: number; category: string; sourceId: string }) => Promise<void>;
  onDeleteProjectExpense: (txId: string) => Promise<void>;
  onViewReceipt: (transaction: Transaction) => void;
}

export const WeddingPayment: React.FC<WeddingPaymentProps> = ({
  client,
  activeProject,
  financial,
  projectTransactions,
  cards,
  pockets,
  isRecordingPayment,
  isAddingExpense,
  onRecordPayment,
  onAddExtraCharge,
  onDeleteExtraCharge,
  onAddProjectExpense,
  onDeleteProjectExpense,
  onViewReceipt,
}) => {
  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [destinationCardId, setDestinationCardId] = useState<string>(() => cards[0]?.id || '');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  // Extra Charge State
  const [chargeName, setChargeName] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');

  // Expense State
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Operasional Hari H');
  const [expenseSourceId, setExpenseSourceId] = useState(() => pockets[0]?.id || cards[0]?.id || '');

  // Separate income and expense transactions
  const incomeTransactions = projectTransactions.filter(t => t.type === TransactionType.INCOME);
  const expenseTransactions = projectTransactions.filter(t => t.type === TransactionType.EXPENSE);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (file) {
      setProofPreviewUrl(URL.createObjectURL(file));
    } else {
      setProofPreviewUrl(null);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(paymentAmount.replace(/\D/g, ''));
    if (numericAmount <= 0) return;

    await onRecordPayment(numericAmount, destinationCardId, proofFile);
    setPaymentAmount('');
    setProofFile(null);
    setProofPreviewUrl(null);
  };

  const handleAddChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(chargeAmount.replace(/\D/g, ''));
    if (!chargeName.trim() || numericAmount <= 0) return;

    await onAddExtraCharge(chargeName.trim(), numericAmount);
    setChargeName('');
    setChargeAmount('');
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(expenseAmount.replace(/\D/g, ''));
    if (!expenseDesc.trim() || numericAmount <= 0 || !expenseSourceId) return;

    await onAddProjectExpense({
      date: expenseDate,
      description: expenseDesc.trim(),
      amount: numericAmount,
      category: expenseCategory,
      sourceId: expenseSourceId,
    });
    setExpenseDesc('');
    setExpenseAmount('');
    setShowExpenseForm(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Financial Status Summary Banner ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
            Total Biaya Acara
          </span>
          <span className="text-xl font-black text-brand-text-primary">
            {formatCurrency(financial.totalCost)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
            Sudah Dibayar (Masuk)
          </span>
          <span className="text-xl font-black text-emerald-700">
            {formatCurrency(financial.amountPaid)}
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            financial.remainingBalance > 0
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
            Sisa Tagihan Pengantin
          </span>
          <span
            className={`text-xl font-black ${
              financial.remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(financial.remainingBalance)}
          </span>
        </div>
      </div>

      {/* ── Form: Catat Pembayaran Masuk ─────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Catat Pembayaran Masuk (DP / Pelunasan)
          </h3>
          <span className="text-xs font-semibold text-brand-text-secondary">
            {financial.remainingBalance > 0
              ? `Sisa: ${formatCurrency(financial.remainingBalance)}`
              : 'Status: Lunas'}
          </span>
        </div>

        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-text-secondary mb-1">
                Nominal Pembayaran (Rp) *
              </label>
              <RupiahInput
                value={paymentAmount}
                onChange={setPaymentAmount}
                placeholder="Contoh: 2.000.000"
                className="w-full text-xs rounded-xl"
              />
              {financial.remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setPaymentAmount(String(financial.remainingBalance))}
                  className="mt-1 text-[11px] font-bold text-brand-accent hover:underline cursor-pointer"
                >
                  Bayar Lunas ({formatCurrency(financial.remainingBalance)})
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text-secondary mb-1">
                Rekening Penerima (Masuk ke) *
              </label>
              <select
                value={destinationCardId}
                onChange={e => setDestinationCardId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
              >
                {cards.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name || `${c.bankName} (${c.cardHolderName})`} ({c.cardType}) — Saldo: {formatCurrency(c.balance || 0)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bukti Pembayaran / Upload Proof */}
          <div>
            <label className="block text-xs font-bold text-brand-text-secondary mb-1">
              Bukti Transfer / Pembayaran (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-brand-accent bg-slate-50 text-xs text-brand-text-secondary font-medium">
                <Upload className="w-4 h-4 text-brand-accent" />
                <span>{proofFile ? proofFile.name : 'Pilih File Gambar Bukti'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofChange}
                  className="hidden"
                />
              </label>

              {proofPreviewUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={proofPreviewUrl}
                    alt="Preview bukti"
                    className="w-8 h-8 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreviewUrl(null);
                    }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isRecordingPayment || !paymentAmount}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isRecordingPayment ? 'Mencatat...' : 'Simpan Pembayaran'}
          </button>
        </form>
      </div>

      {/* ── Riwayat Pembayaran Masuk ─────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
        <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <Receipt className="w-4 h-4 text-brand-accent" />
          Riwayat Pembayaran Pengantin
        </h3>

        {incomeTransactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-brand-text-secondary bg-slate-50 rounded-xl">
            Belum ada pembayaran yang dicatat untuk acara ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-brand-text-secondary font-semibold">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3">Akun Masuk</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                  <th className="py-2.5 px-3 text-center">Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomeTransactions.map(tx => {
                  const card = cards.find(c => c.id === tx.cardId || c.id === tx.sourceId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-medium text-brand-text-secondary whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-text-primary">
                        {tx.description}
                        {tx.proofUrl && (
                          <a
                            href={tx.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-[10px] text-brand-accent underline"
                          >
                            Lihat Bukti
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-3 text-brand-text-secondary">
                        {card?.name || card?.bankName || tx.cardId || tx.sourceId || 'Kas'}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 text-right whitespace-nowrap">
                        +{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onViewReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg border border-brand-border hover:bg-white text-[11px] font-semibold text-brand-accent cursor-pointer"
                        >
                          Kuitansi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Biaya Tambahan (Extra Charges) ───────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
        <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <Plus className="w-4 h-4 text-brand-accent" />
          Biaya Tambahan (Add-on Kustom & Overtime)
        </h3>

        {/* Existing Charges */}
        {activeProject?.extraCharges && activeProject.extraCharges.length > 0 ? (
          <div className="space-y-2 mb-4">
            {activeProject.extraCharges.map(charge => (
              <div
                key={charge.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-brand-text-primary">{charge.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-text-primary">
                    +{formatCurrency(charge.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteExtraCharge(charge.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Hapus biaya"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-text-secondary mb-4">Belum ada biaya tambahan untuk acara ini.</p>
        )}

        {/* Popular chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {POPULAR_PRESET_CHIPS.slice(0, 4).map(chip => (
            <button
              key={chip.name}
              type="button"
              onClick={() => {
                setChargeName(chip.name);
                setChargeAmount(String(chip.amount));
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-all"
            >
              + {chip.name} ({formatCurrency(chip.amount)})
            </button>
          ))}
        </div>

        {/* Add charge form */}
        <form onSubmit={handleAddChargeSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nama Biaya Tambahan..."
            value={chargeName}
            onChange={e => setChargeName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
          />
          <div className="w-full sm:w-44">
            <RupiahInput
              value={chargeAmount}
              onChange={setChargeAmount}
              placeholder="Nominal (Rp)"
              className="w-full text-xs rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={!chargeName.trim() || !chargeAmount}
            className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            Tambah Biaya
          </button>
        </form>
      </div>

      {/* ── Pengeluaran Operasional Wedding (Project Expenses) ───────────── */}
      <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Pengeluaran Khusus Acara Ini
            </h3>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Transport, meals, akomodasi, atau cetak album
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-text-primary text-xs font-bold transition-all"
          >
            {showExpenseForm ? 'Tutup Form' : '+ Catat Pengeluaran'}
          </button>
        </div>

        {/* Expense form */}
        {showExpenseForm && (
          <form onSubmit={handleAddExpenseSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-3 text-xs animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-brand-text-secondary mb-1">Keterangan Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bensin & Tol Mobil Tim, Makan Siang Kru"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Nominal (Rp)</label>
                <RupiahInput
                  value={expenseAmount}
                  onChange={setExpenseAmount}
                  placeholder="Contoh: 150.000"
                  className="w-full text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Kategori</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs"
                >
                  <option value="Operasional Hari H">Operasional Hari H</option>
                  <option value="Transport & Tol">Transport & Tol</option>
                  <option value="Konsumsi Tim">Konsumsi Tim</option>
                  <option value="Sewa Alat">Sewa Alat</option>
                  <option value="Cetak & Packaging">Cetak & Packaging</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-brand-text-secondary mb-1">Sumber Dana (Potong Saldo)</label>
                <select
                  value={expenseSourceId}
                  onChange={e => setExpenseSourceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs"
                >
                  <optgroup label="Kantong / Pockets">
                    {pockets.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.amount || 0)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Rekening / Cards">
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formatCurrency(c.balance || 0)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseForm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isAddingExpense || !expenseDesc.trim() || !expenseAmount}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50"
              >
                {isAddingExpense ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </button>
            </div>
          </form>
        )}

        {/* Expense list */}
        {expenseTransactions.length === 0 ? (
          <div className="py-5 text-center text-xs text-brand-text-secondary bg-slate-50 rounded-xl">
            Belum ada pengeluaran khusus yang dicatat untuk acara ini.
          </div>
        ) : (
          <div className="space-y-2">
            {expenseTransactions.map(tx => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div>
                  <span className="font-bold text-brand-text-primary block">{tx.description}</span>
                  <span className="text-[10px] text-brand-text-secondary">
                    {tx.date} • {tx.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-600">-{formatCurrency(tx.amount)}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteProjectExpense(tx.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Hapus pengeluaran"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeddingPayment;
