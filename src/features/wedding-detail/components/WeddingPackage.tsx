import React from 'react';
import { Project, Package, AddOn, Profile } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { Sparkles, Check, Package as PackageIcon, PlusCircle, ShieldCheck, GitBranch } from 'lucide-react';
import { getPackageTerms } from '../../packages/packageTerms';
import PackageTermsDisplay from '../../packages/components/PackageTermsDisplay';
import WorkflowDisplay from '../../packages/components/WorkflowDisplay';
import { getWorkflows } from '../../packages/workflows';

interface WeddingPackageProps {
  activeProject: Project | null;
  selectedPackage: Package | null;
  addOns?: AddOn[];
  profile: Profile;
}

export const WeddingPackage: React.FC<WeddingPackageProps> = ({
  activeProject,
  selectedPackage,
  addOns = [],
  profile,
}) => {
  const packageTerms = getPackageTerms(profile.publicPageConfig?.packageTerms);
  const workflows = getWorkflows(profile.publicPageConfig);

  // Match active project add-ons if any
  const projectAddOns = activeProject?.addOns || [];

  return (
    <div className="space-y-6">
      {/* ── Active Package Main Card ────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-accent px-2 py-0.5 rounded-full bg-brand-accent/10">
              Paket Utama
            </span>
            <h3 className="text-lg sm:text-xl font-black text-brand-text-primary mt-1">
              {selectedPackage?.name || activeProject?.packageName || 'Paket Kustom'}
            </h3>
            {selectedPackage?.category && (
              <span className="text-xs text-brand-text-secondary">Kategori: {selectedPackage.category}</span>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
              Harga Paket
            </span>
            <span className="text-xl sm:text-2xl font-black text-brand-accent">
              {formatCurrency(selectedPackage?.price || activeProject?.packagePrice || activeProject?.totalCost || 0)}
            </span>
          </div>
        </div>

        {/* Deliverables / Features List */}
        {selectedPackage?.items && selectedPackage.items.length > 0 ? (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-3 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Layanan & Output yang Didapatkan:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {selectedPackage.items.map((feature: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-brand-text-primary"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-brand-text-secondary text-center">
            Detail fitur paket dapat disesuaikan pada menu Paket atau formulir pengantin.
          </div>
        )}
      </div>

      {/* ── Selected Add-Ons if any ─────────────────────────────────────── */}
      {projectAddOns.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <PlusCircle className="w-4 h-4 text-brand-accent" />
            Layanan Tambahan (Add-On)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectAddOns.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="font-bold text-brand-text-primary">{item.name}</span>
                <span className="font-bold text-brand-accent">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Package Terms & Workflow ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Ketentuan Layanan Paket
          </h3>
          <PackageTermsDisplay terms={packageTerms} />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <GitBranch className="w-4 h-4 text-brand-accent" />
            Alur Pengerjaan Standar
          </h3>
          <WorkflowDisplay workflows={workflows} />
        </div>
      </div>
    </div>
  );
};

export default WeddingPackage;
