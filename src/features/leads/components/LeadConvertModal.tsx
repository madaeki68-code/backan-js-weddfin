import React, { useMemo } from 'react';
import Modal from '../../../shared/ui/Modal';
import RupiahInput from '../../../shared/form/RupiahInput';
import { Package, AddOn, Profile, Card, PromoCode, ClientType } from '../../../types';
import { formatCurrency } from '../utils/leadFormatters';
import type { ConvertLeadFormData } from '../types/leads.types';

export interface LeadConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ConvertLeadFormData;
  setFormData: React.Dispatch<React.SetStateAction<ConvertLeadFormData>>;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  packages: Package[];
  addOns: AddOn[];
  userProfile: Profile;
  cards: Card[];
  promoCodes: PromoCode[];
  isSubmitting?: boolean;
}

export const LeadConvertModal: React.FC<LeadConvertModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  handleFormChange,
  handleSubmit,
  packages,
  addOns,
  userProfile,
  cards,
  promoCodes,
  isSubmitting = false,
}) => {
  const priceCalculations = useMemo(() => {
    const selectedPackage = packages.find((p) => p.id === formData.packageId);
    const packagePrice = selectedPackage?.price || 0;

    const addOnsPrice = addOns
      .filter((addon) => (formData.selectedAddOnIds || []).includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);

    const totalProjectBeforeDiscount = packagePrice + addOnsPrice;
    let discountAmount = 0;
    let discountApplied = 'N/A';
    const promoCode = promoCodes.find((p) => p.id === formData.promoCodeId);

    if (promoCode) {
      if (promoCode.discountType === 'percentage') {
        discountAmount = (totalProjectBeforeDiscount * promoCode.discountValue) / 100;
        discountApplied = `${promoCode.discountValue}%`;
      } else {
        discountAmount = promoCode.discountValue;
        discountApplied = formatCurrency(promoCode.discountValue);
      }
    }

    const totalProject = totalProjectBeforeDiscount - discountAmount;
    const remainingPayment = totalProject - Number(formData.dp || 0);

    return {
      packagePrice,
      addOnsPrice,
      totalProject,
      remainingPayment,
      discountAmount,
      discountApplied,
    };
  }, [
    formData.packageId,
    formData.selectedAddOnIds,
    formData.dp,
    formData.promoCodeId,
    packages,
    addOns,
    promoCodes,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konversi Calon Pengantin Menjadi Pengantin"
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="form-compact form-compact--ios-scale">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
          {/* Left Column: Client & Project Info */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2">
              Informasi Pengantin
            </h4>
            <div className="input-group">
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
                required
              />
              <label htmlFor="clientName" className="input-label">
                Nama Pengantin
              </label>
            </div>
            <div className="input-group">
              <select
                id="clientType"
                name="clientType"
                value={formData.clientType || ClientType.DIRECT}
                onChange={handleFormChange}
                className="input-field"
                required
              >
                {Object.values(ClientType).map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
              <label htmlFor="clientType" className="input-label">
                Jenis Pengantin
              </label>
            </div>
            <div className="input-group">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
                required
              />
              <label htmlFor="phone" className="input-label">
                Nomor Telepon
              </label>
            </div>
            <div className="input-group">
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="whatsapp" className="input-label">
                No. WhatsApp
              </label>
            </div>
            <div className="input-group">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
                required
              />
              <label htmlFor="email" className="input-label">
                Email
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="instagram" className="input-label">
                Instagram (@username)
              </label>
            </div>

            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 pt-4">
              Informasi Acara Pernikahan
            </h4>
            <div className="input-group">
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
                required
              />
              <label htmlFor="projectName" className="input-label">
                Nama Acara Pernikahan
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType || ''}
                  onChange={handleFormChange}
                  className="input-field"
                  required
                >
                  <option value="" disabled>
                    Pilih Jenis...
                  </option>
                  {userProfile.projectTypes.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
                <label htmlFor="projectType" className="input-label">
                  Jenis Acara Pernikahan
                </label>
              </div>
              <div className="input-group">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleFormChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="date" className="input-label">
                  Tanggal Acara Pernikahan
                </label>
              </div>
            </div>
            <div className="input-group">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="location" className="input-label">
                Lokasi (Kota)
              </label>
            </div>
            <div className="input-group">
              <textarea
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
                rows={2}
              />
              <label htmlFor="address" className="input-label">
                Alamat Lengkap
              </label>
            </div>
          </div>

          {/* Right Column: Financial & Other Info */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2">
              Detail Package &amp; Pembayaran
            </h4>
            <div className="input-group">
              <select
                id="packageId"
                name="packageId"
                value={formData.packageId || ''}
                onChange={handleFormChange}
                className="input-field"
                required
              >
                <option value="">Pilih Package...</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <label htmlFor="packageId" className="input-label">
                Package
              </label>
              <p className="text-right text-xs text-brand-text-secondary mt-1">
                Harga Package: {formatCurrency(priceCalculations.packagePrice)}
              </p>
            </div>

            <div className="input-group">
              <label className="input-label !static !-top-4 !text-brand-accent">Add-On</label>
              <div className="p-3 border border-brand-border bg-brand-bg rounded-lg max-h-32 overflow-y-auto space-y-2 mt-2">
                {addOns.map((addon) => (
                  <label
                    key={addon.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-brand-input cursor-pointer"
                  >
                    <span className="text-sm text-brand-text-primary">{addon.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-brand-text-secondary">
                        {formatCurrency(addon.price)}
                      </span>
                      <input
                        type="checkbox"
                        id={addon.id}
                        name="addOns"
                        checked={(formData.selectedAddOnIds || []).includes(addon.id)}
                        onChange={handleFormChange}
                        className="h-4 w-4 rounded flex-shrink-0 text-blue-600 focus:ring-blue-600 transition-colors"
                      />
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-right text-xs text-brand-text-secondary mt-1">
                Total Harga Add-On: {formatCurrency(priceCalculations.addOnsPrice)}
              </p>
            </div>

            <div className="input-group">
              <select
                id="promoCodeId"
                name="promoCodeId"
                value={formData.promoCodeId || ''}
                onChange={handleFormChange}
                className="input-field"
              >
                <option value="">Tanpa Kode Promo</option>
                {promoCodes
                  .filter((p) => p.isActive)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - (
                      {p.discountType === 'percentage'
                        ? `${p.discountValue}%`
                        : formatCurrency(p.discountValue)}
                      )
                    </option>
                  ))}
              </select>
              <label htmlFor="promoCodeId" className="input-label">
                Kode Promo
              </label>
              {formData.promoCodeId && (
                <p className="text-right text-xs text-brand-success mt-1">
                  Diskon Diterapkan: {priceCalculations.discountApplied}
                </p>
              )}
            </div>

            <div className="p-4 bg-brand-bg rounded-lg space-y-3">
              <div className="flex justify-between items-center font-bold text-lg">
                <span className="text-brand-text-secondary">Total Acara Pernikahan</span>
                <span className="text-brand-text-light">
                  {formatCurrency(priceCalculations.totalProject)}
                </span>
              </div>
              <div className="input-group !mt-2">
                <RupiahInput
                  id="dp"
                  name="dp"
                  value={String(formData.dp ?? '')}
                  onChange={(raw) => setFormData((prev) => ({ ...prev, dp: raw }))}
                  className="input-field text-right"
                  placeholder=" "
                />
                <label htmlFor="dp" className="input-label">
                  Uang DP
                </label>
              </div>
              {Number(formData.dp) > 0 && (
                <div className="input-group !mt-2">
                  <select
                    name="dpDestinationCardId"
                    value={formData.dpDestinationCardId || ''}
                    onChange={handleFormChange}
                    className="input-field"
                    required
                  >
                    <option value="">Setor DP ke...</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.bankName}{' '}
                        {c.lastFourDigits !== 'CASH' ? `**** ${c.lastFourDigits}` : '(Tunai)'}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="dpDestinationCardId" className="input-label">
                    Kartu Tujuan
                  </label>
                </div>
              )}
              <hr className="border-brand-border" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span className="text-brand-text-secondary">Sisa Pembayaran</span>
                <span className="text-blue-800">
                  {formatCurrency(priceCalculations.remainingPayment)}
                </span>
              </div>
            </div>

            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 pt-4">
              Lainnya (Opsional)
            </h4>
            <div className="input-group">
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleFormChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="notes" className="input-label">
                Catatan Tambahan
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-8 mt-8 border-t border-brand-border sticky bottom-0 bg-brand-surface">
          <button type="button" onClick={onClose} className="button-secondary">
            Batal
          </button>
          <button type="submit" disabled={isSubmitting} className="button-primary">
            {isSubmitting ? 'Menyimpan...' : 'Konversi Calon Pengantin'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
