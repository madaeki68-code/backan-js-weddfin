import React from 'react';
import { Project, Package } from '../types';
import RupiahInput from '../../../shared/form/RupiahInput';
import {
  FileTextIcon,
  CreditCardIcon,
  Trash2Icon,
  PencilIcon,
  CheckIcon,
  XIcon,
} from '../../../constants';
import { ChevronDown } from 'lucide-react';
import { formatCurrency } from '../utils/clientHelpers';

interface FinancePillProps {
  label: string;
  value: string;
  color: 'neutral' | 'green' | 'red';
}

const FinancePill: React.FC<FinancePillProps> = ({ label, value, color }) => {
  const colorMap = {
    neutral: 'bg-[#F4F6F9] border-[#EAEFF4] text-[#5A6A85]',
    green: 'bg-green-600/10 border-green-600/20 text-green-600',
    red: 'bg-red-600/10 border-red-600/20 text-red-600',
  };
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl border px-2 py-2 sm:px-3 sm:py-2.5 ${colorMap[color]}`}
    >
      <span className="text-[7px] font-black uppercase tracking-[0.12em] opacity-80 sm:text-[8px]">{label}</span>
      <span className="mt-0.5 truncate text-[11px] font-black tracking-tight sm:text-sm">{value}</span>
    </div>
  );
};

interface ClientDetailInvoiceTabProps {
  clientProjects: Project[];
  packages: Package[];
  openCostDetails: Record<string, boolean>;
  setOpenCostDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  editingChargeId: string | null;
  editChargeData: { name: string; amount: string };
  setEditChargeData: React.Dispatch<React.SetStateAction<{ name: string; amount: string }>>;
  onStartEditCharge: (charge: { id: string; description: string; amount: number }) => void;
  onSaveEditCharge: (projectId: string) => void;
  onCancelEditCharge: () => void;
  onDeleteCharge: (projectId: string, chargeId: string) => void;
  onDeleteAdditionalPackage: (projectId: string, packageIndex: number) => void;
  onViewInvoice: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ClientDetailInvoiceTab: React.FC<ClientDetailInvoiceTabProps> = ({
  clientProjects,
  packages,
  openCostDetails,
  setOpenCostDetails,
  editingChargeId,
  editChargeData,
  setEditChargeData,
  onStartEditCharge,
  onSaveEditCharge,
  onCancelEditCharge,
  onDeleteCharge,
  onDeleteAdditionalPackage,
  onViewInvoice,
  onDeleteProject,
}) => {
  if (clientProjects.length === 0) {
    return (
      <p className="rounded-xl border border-brand-border bg-brand-surface py-10 text-center text-sm text-brand-text-secondary">
        Belum ada invoice untuk pengantin ini.
      </p>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {clientProjects.map((p, projectIndex) => {
        const pkg =
          packages.find(
            item =>
              item.id === p.packageId ||
              (p.packageName && item.name.trim().toLowerCase() === p.packageName.trim().toLowerCase())
          ) || null;
        const durationOption = pkg?.durationOptions?.find(option => option.label === p.durationSelection);
        const teamComposition = durationOption?.photographers || pkg?.photographers;
        const packageDescriptionItems = [...(pkg?.digitalItems || [])];
        if (teamComposition?.trim()) packageDescriptionItems.unshift(`Jumlah Tim: ${teamComposition}`);
        const selectedAddOns = (p.addOns || []).filter(item => item && (item.name || item.id));
        const selectedPackageIds = new Set(packages.map(item => item.id));
        const additionalPackages = p.additionalPackages?.length
          ? p.additionalPackages
          : selectedAddOns.filter(
              item => item.id && selectedPackageIds.has(item.id) && item.id !== p.packageId
            );
        const additionalPackageIds = new Set(additionalPackages.map(item => item.id));
        const regularAddOns = selectedAddOns.filter(
          item => (!item.id || !selectedPackageIds.has(item.id)) && !additionalPackageIds.has(item.id)
        );
        const packagePrice =
          p.totalCost +
          (Number(p.discountAmount) || 0) -
          (p.customCosts?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0) -
          regularAddOns.reduce((sum, item) => sum + Number(item.price || 0), 0) -
          additionalPackages.reduce((sum, item) => sum + Number(item.price || 0), 0) -
          Number(p.transportCost || 0);
        const remainingBalance = p.totalCost - p.amountPaid;
        const eventDateLabel = p.date
          ? new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'Tanggal belum ditentukan';

        return (
          <article
            key={p.id}
            className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-xs"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border bg-brand-bg/60 px-4 py-3">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-bold text-brand-text-primary">{p.projectName}</h4>
                <p className="text-[10px] text-brand-text-secondary">
                  PRJ-{p.id.slice(-6).toUpperCase()} · {eventDateLabel}
                </p>
              </div>
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">
                Invoice #{projectIndex + 1}
              </span>
            </header>
            <div className="space-y-3 p-3 sm:p-5">
              <details
                open={openCostDetails[p.id] ?? true}
                onToggle={event => {
                  const isOpen = event.currentTarget.open;
                  setOpenCostDetails(current =>
                    current[p.id] === isOpen ? current : { ...current, [p.id]: isOpen }
                  );
                }}
                className="overflow-hidden rounded-xl border border-brand-border bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-blue-600 px-4 py-3 text-xs font-bold text-white [&::-webkit-details-marker]:hidden">
                  <span>Rincian biaya</span>
                  <span className="flex items-center gap-2">
                    {formatCurrency(p.totalCost)}
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>
                <div className="space-y-2.5 border-t border-brand-border px-4 py-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-brand-text-secondary">
                        Paket utama{' '}
                        {p.packageName || pkg?.name ? (
                          <strong className="text-brand-text-primary">({p.packageName || pkg?.name})</strong>
                        ) : null}
                      </span>
                      <strong className="shrink-0 text-brand-text-primary">{formatCurrency(packagePrice)}</strong>
                    </div>
                    {p.durationSelection && (
                      <p className="mt-1 pl-2 text-[11px] italic text-brand-accent">{p.durationSelection}</p>
                    )}
                    {packageDescriptionItems.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 border-l-2 border-brand-accent pl-2.5">
                        {packageDescriptionItems.map((item, index) => (
                          <li key={index} className="text-[10px] text-brand-text-secondary">
                            · {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {additionalPackages.map((item, index) => {
                    const additionalPackage = packages.find(candidate => candidate.id === item.id);
                    const deliverables = [
                      ...(additionalPackage?.digitalItems || []),
                      ...(additionalPackage?.physicalItems || []).map(physical => physical.name),
                    ].filter(Boolean);
                    return (
                      <div key={item.id || index} className="group/addpkg relative pr-6">
                        <div className="flex justify-between gap-3">
                          <span className="text-brand-text-secondary">
                            Paket tambahan · {item.name || additionalPackage?.name}
                          </span>
                          <strong className="shrink-0">{formatCurrency(Number(item.price || 0))}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={event => {
                            event.preventDefault();
                            onDeleteAdditionalPackage(p.id, index);
                          }}
                          className="absolute right-0 top-0 rounded p-0.5 text-red-600 opacity-0 transition-opacity group-hover/addpkg:opacity-100 cursor-pointer"
                          title="Hapus paket tambahan"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                        {deliverables.map((deliverable, deliverableIndex) => (
                          <p key={deliverableIndex} className="pl-2 text-[10px] text-brand-text-secondary">
                            · {deliverable}
                          </p>
                        ))}
                      </div>
                    );
                  })}
                  {regularAddOns.map((item, index) => (
                    <div key={item.id || item.name || index} className="flex justify-between gap-3">
                      <span className="text-brand-text-secondary">+ {item.name} (Add-on)</span>
                      <strong className="shrink-0">{formatCurrency(Number(item.price || 0))}</strong>
                    </div>
                  ))}
                  {Number(p.transportCost) > 0 && (
                    <div className="flex justify-between gap-3">
                      <span className="text-brand-text-secondary">+ Biaya transport</span>
                      <strong>{formatCurrency(Number(p.transportCost))}</strong>
                    </div>
                  )}
                  {(p.customCosts || []).map(charge => {
                    const editing = editingChargeId === charge.id;
                    return (
                      <div key={charge.id} className="border-t border-brand-border pt-2">
                        {editing ? (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="text"
                              value={editChargeData.name}
                              onChange={event =>
                                setEditChargeData(current => ({ ...current, name: event.target.value }))
                              }
                              className="min-w-0 flex-1 rounded-lg border border-brand-border bg-white p-2 text-xs"
                              placeholder="Nama biaya"
                            />
                            <RupiahInput
                              value={editChargeData.amount}
                              onChange={value =>
                                setEditChargeData(current => ({ ...current, amount: value }))
                              }
                              className="w-full rounded-lg border border-brand-border bg-white p-2 text-xs sm:w-32"
                              placeholder="0"
                            />
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => onSaveEditCharge(p.id)}
                                className="rounded-lg bg-emerald-700 p-2 text-white cursor-pointer"
                                title="Simpan"
                              >
                                <CheckIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={onCancelEditCharge}
                                className="rounded-lg bg-red-700 p-2 text-white cursor-pointer"
                                title="Batal"
                              >
                                <XIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0 text-brand-text-secondary">{charge.description}</span>
                            <div className="flex shrink-0 items-center gap-2">
                              <strong>
                                {Number(charge.amount) === 0 ? 'Rp 0' : formatCurrency(charge.amount)}
                              </strong>
                              <button
                                type="button"
                                onClick={() => onStartEditCharge(charge)}
                                className="text-blue-700 cursor-pointer"
                                title="Edit biaya"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteCharge(p.id, charge.id)}
                                className="text-red-700 cursor-pointer"
                                title="Hapus biaya"
                              >
                                <Trash2Icon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Number(p.discountAmount) > 0 && (
                    <div className="flex justify-between gap-3 border-t border-brand-border pt-2 text-red-600">
                      <span>Diskon</span>
                      <strong>−{formatCurrency(Number(p.discountAmount))}</strong>
                    </div>
                  )}
                </div>
              </details>
              <div className="grid grid-cols-3 gap-2">
                <FinancePill label="Total" value={formatCurrency(p.totalCost)} color="neutral" />
                <FinancePill label="Terbayar" value={formatCurrency(p.amountPaid)} color="green" />
                <FinancePill
                  label="Sisa"
                  value={formatCurrency(remainingBalance)}
                  color={remainingBalance > 0 ? 'red' : 'green'}
                />
              </div>
              <div className="client-detail-action-group flex flex-wrap items-center justify-end gap-2">
                {p.dpProofUrl && (
                  <a
                    href={p.dpProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary inline-flex items-center gap-1.5 !px-3 !py-2 text-xs"
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    Bukti DP
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onViewInvoice(p)}
                  className="button-primary inline-flex items-center gap-1.5 !px-3 !py-2 text-xs cursor-pointer"
                >
                  <FileTextIcon className="h-4 w-4" />
                  Invoice PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Hapus acara “${p.projectName}”? Data acara ini akan dihapus dan tindakan ini tidak dapat dibatalkan.`
                      )
                    ) {
                      onDeleteProject(p.id);
                    }
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2Icon className="h-4 w-4" />
                  Hapus Acara
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ClientDetailInvoiceTab;
