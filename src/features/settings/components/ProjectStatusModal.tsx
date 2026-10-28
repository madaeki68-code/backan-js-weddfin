import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { Trash2Icon } from '../../../constants';
import { ProjectStatusFormData } from '../types/settings.types';
import { ProjectStatusConfig } from '../../../types';

export interface ProjectStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: 'add' | 'edit';
  selectedStatus: ProjectStatusConfig | null;
  form: ProjectStatusFormData;
  isSubmitting: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubStatusChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddSubStatus: () => void;
  onRemoveSubStatus: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProjectStatusModal: React.FC<ProjectStatusModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  selectedStatus,
  form,
  isSubmitting,
  onFormChange,
  onSubStatusChange,
  onAddSubStatus,
  onRemoveSubStatus,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === 'add' ? 'Tambah Status Baru' : `Edit Status: ${selectedStatus?.name}`}
    >
      <form onSubmit={onSubmit} className="space-y-4 form-compact form-compact--ios-scale">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="input-group md:col-span-2">
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={onFormChange}
              className="input-field"
              required
              placeholder=" "
            />
            <label htmlFor="name" className="input-label">
              Nama Status
            </label>
          </div>
          <div className="input-group">
            <input
              type="color"
              id="color"
              name="color"
              value={form.color}
              onChange={onFormChange}
              className="input-field !p-1 h-12"
            />
            <label htmlFor="color" className="input-label">
              Warna
            </label>
          </div>
          <div className="input-group">
            <input
              type="number"
              min={0}
              max={100}
              id="defaultProgress"
              name="defaultProgress"
              value={form.defaultProgress ?? ''}
              onChange={onFormChange}
              className="input-field"
              placeholder=" "
            />
            <label htmlFor="defaultProgress" className="input-label">
              Default Progress (%)
            </label>
          </div>
        </div>
        <div className="input-group">
          <textarea
            id="note"
            name="note"
            value={form.note}
            onChange={onFormChange}
            className="input-field"
            rows={2}
            placeholder=" "
          />
          <label htmlFor="note" className="input-label">
            Catatan/Deskripsi Status
          </label>
        </div>

        <div>
          <h4 className="text-base font-semibold text-brand-text-light mb-2">Sub-Status</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {form.subStatuses.map((sub, index) => (
              <div
                key={index}
                className="p-3 bg-brand-bg rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3 items-center"
              >
                <div className="input-group !mt-0">
                  <input
                    type="text"
                    name="name"
                    value={sub.name}
                    onChange={e => onSubStatusChange(index, e)}
                    placeholder="Nama Sub-Status"
                    className="input-field !p-2 !text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="input-group flex-grow !mt-0">
                    <input
                      type="text"
                      name="note"
                      value={sub.note}
                      onChange={e => onSubStatusChange(index, e)}
                      placeholder="Catatan"
                      className="input-field !p-2 !text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveSubStatus(index)}
                    className="p-2 text-brand-danger hover:bg-brand-danger/10 rounded-full"
                    title="Hapus Sub-Status"
                    aria-label="Hapus Sub-Status"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddSubStatus}
            className="text-sm font-semibold text-brand-accent hover:underline mt-2"
          >
            + Tambah Sub-Status
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
          <button type="button" onClick={onClose} className="button-secondary">
            Batal
          </button>
          <button type="submit" disabled={isSubmitting} className="button-primary">
            {isSubmitting
              ? 'Menyimpan...'
              : modalMode === 'add'
              ? 'Simpan Status'
              : 'Update Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
