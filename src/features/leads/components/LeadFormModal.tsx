import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { LightbulbIcon } from '../../../constants';
import type { LeadFormData, LeadModalMode } from '../types/leads.types';

export interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: LeadModalMode;
  formData: LeadFormData;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  leadSources: string[];
  isSubmitting?: boolean;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  formData,
  handleFormChange,
  handleSubmit,
  leadSources,
  isSubmitting = false,
}) => {
  const sourceOptions = Array.from(
    new Set([...(leadSources || []), formData.contactChannel].filter(Boolean))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === 'add' ? 'Tambah Calon Pengantin Baru' : 'Edit Calon Pengantin'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 form-compact form-compact--ios-scale">
        <div className="hidden sm:block bg-blue-100 border border-blue-600 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <LightbulbIcon className="w-4 h-4" />
            Informasi Calon Pengantin
          </h4>
          <p className="text-xs text-brand-text-secondary">
            Catat informasi Calon Pengantin baru yang menghubungi Anda. Data ini akan membantu Anda
            melacak dan mengelola calon pengantin.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">
            Data Calon Pengantin
          </h5>
          <div className="input-group">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder=" "
              required
            />
            <label htmlFor="name" className="input-label">
              Nama Calon Pengantin
            </label>
            <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
              Nama lengkap pasangan calon pengantin
            </p>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">Sumber &amp; Lokasi</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <select
                id="contactChannel"
                name="contactChannel"
                value={formData.contactChannel || ''}
                onChange={handleFormChange}
                className="input-field"
              >
                {sourceOptions.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
              <label htmlFor="contactChannel" className="input-label">
                Sumber Calon Pengantin
              </label>
              <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
                Dari mana Calon Pengantin menghubungi?
              </p>
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
              <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
                Kota domisili Calon Pengantin
              </p>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">Alamat Lengkap</h5>
          <div className="input-group">
            <textarea
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder=" "
              rows={3}
            />
            <label htmlFor="address" className="input-label">
              Alamat Lengkap / Gedung
            </label>
            <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
              Alamat spesifik untuk Acara Pernikahan
            </p>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">Kontak</h5>
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
            <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
              Nomor WhatsApp aktif untuk komunikasi
            </p>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">
            Tanggal Acara{' '}
            <span className="text-brand-text-secondary font-normal">(Opsional)</span>
          </h5>
          <div className="input-group">
            <input
              type="date"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder=" "
              aria-label="Tanggal acara (opsional)"
            />
            <label htmlFor="eventDate" className="input-label">
              Tanggal Acara Pernikahan
            </label>
            <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
              Bisa dikosongkan jika belum ada tanggal pasti dari client.
            </p>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">Catatan Tambahan</h5>
          <div className="input-group">
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleFormChange}
              className="input-field"
              placeholder=" "
              rows={4}
            />
            <label htmlFor="notes" className="input-label">
              Catatan
            </label>
            <p className="text-xs text-brand-text-secondary mt-1">
              Catat kebutuhan, preferensi, atau informasi penting lainnya dan tanggal acaranya
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-brand-border sticky bottom-0 bg-brand-surface">
          <button
            type="button"
            onClick={onClose}
            className="button-secondary w-full sm:w-auto"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary w-full sm:w-auto"
          >
            {isSubmitting
              ? 'Menyimpan...'
              : modalMode === 'add'
              ? 'Simpan Calon Pengantin'
              : 'Update Calon Pengantin'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
