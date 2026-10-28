import React, { useState, useEffect } from 'react';
import { PencilIcon } from '../../../constants';

export interface TemplateEditorProps {
  id: string;
  label: string;
  value: string;
  rows: number;
  defaultValue: string;
  helper?: React.ReactNode;
  onSave: (value: string) => void;
  isSaving: boolean;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  id,
  label,
  value,
  rows,
  defaultValue,
  helper,
  onSave,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const legacyGreeting = [
    'Halo {leadName}!',
    'Halo *{clientName}*!',
    'Halo *{targetName}*!',
    'Halo {clientName}!',
  ].includes(value.trim());
  const initialDraft = !value.trim() || legacyGreeting ? defaultValue : value;
  const [draft, setDraft] = useState(initialDraft);
  const savedValue = value.trim();
  const detailValue = !savedValue || legacyGreeting ? defaultValue : value;
  const preview = savedValue
    ? `✓ Sudah diatur (${savedValue.split(/\r?\n/).length} baris)`
    : 'Belum diatur';

  useEffect(() => {
    if (!isEditing) setDraft(initialDraft);
  }, [isEditing, initialDraft]);

  return (
    <section
      className="rounded-xl border border-brand-accent/25 p-3 sm:p-4"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 7%, white)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="text-xs sm:text-sm font-semibold text-brand-text-light">{label}</h5>
          <p
            className={`mt-1 truncate text-[10px] sm:text-xs ${
              savedValue ? 'text-green-500' : 'text-brand-text-secondary italic'
            }`}
          >
            {preview}
          </p>
          <div className="mt-2 max-h-24 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-brand-accent/15 bg-white px-2.5 py-2 text-[10px] leading-relaxed text-brand-text-secondary sm:text-xs">
            {detailValue}
          </div>
        </div>
        <button
          type="button"
          aria-expanded={isEditing}
          onClick={() => setIsEditing(open => !open)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-accent bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
        >
          <PencilIcon className="h-3.5 w-3.5" />
          {isEditing ? 'Tutup' : 'Edit'}
        </button>
      </div>
      {isEditing && (
        <div className="mt-3 border-t border-brand-border/70 pt-3">
          <div className="input-group !mt-0">
            <textarea
              id={id}
              name={id}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              className="input-field"
              placeholder=" "
              rows={rows}
            />
            <label htmlFor={id} className="input-label">
              {label}
            </label>
          </div>
          {helper && <p className="mt-1 text-xs text-brand-text-secondary">{helper}</p>}
          <button
            type="button"
            onClick={() => setDraft(defaultValue)}
            className="mt-2 text-xs text-brand-accent hover:underline"
          >
            + Gunakan contoh
          </button>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={isSaving || draft === value}
              onClick={() => onSave(draft)}
              className="button-primary inline-flex min-w-24 items-center justify-center px-4 py-2 text-xs font-semibold"
            >
              {isSaving ? 'Menyimpan...' : savedValue ? 'Update' : 'Simpan'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
