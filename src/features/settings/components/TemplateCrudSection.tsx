import React from 'react';
import { Eye, Copy, RefreshCw } from 'lucide-react';
import { PencilIcon, PlusIcon, Trash2Icon, MessageSquareIcon } from '../../../constants';
import { ChatTemplate } from '../../../types';
import { VariableChip } from '../types/settings.types';
import { PREVIEW_VARS } from '../constants/settings.constants';
import { processTemplate } from '../../../services/chatTemplatesOffline';

export interface TemplateCrudSectionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  chipClass: string;
  templates: ChatTemplate[];
  variableChips: readonly VariableChip[];
  editingId: string | null;
  isAddingNew: boolean;
  formData: { title: string; template: string };
  formError: string;
  isSaving: boolean;
  previewId: string | null;
  onAddNew: () => void;
  onEdit: (t: ChatTemplate) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  onPreviewToggle: (id: string) => void;
  onFormChange: (field: 'title' | 'template', val: string) => void;
  onInsertVar: (v: string) => void;
  textareaId: string;
}

export const TemplateCrudSection: React.FC<TemplateCrudSectionProps> = ({
  title,
  subtitle,
  icon,
  accentClass,
  chipClass,
  templates,
  variableChips,
  editingId,
  isAddingNew,
  formData,
  formError,
  isSaving,
  previewId,
  onAddNew,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onReset,
  onPreviewToggle,
  onFormChange,
  onInsertVar,
  textareaId,
}) => {
  const getPreviewText = (t: ChatTemplate) => processTemplate(t.template, PREVIEW_VARS);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Template disalin ke clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-bg/50 p-4 rounded-2xl border border-brand-border">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-2xl ${accentClass} flex items-center justify-center text-xl shadow-lg shadow-brand-accent/10`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-text-light">{title}</h3>
            <p className="text-xs text-brand-text-secondary mt-1 max-w-md">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="button-secondary inline-flex items-center gap-1.5 text-xs py-1.5 px-2.5 flex-1 sm:flex-none justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-brand-border"
          >
            <RefreshCw className="w-3 h-3" /> Reset Default
          </button>
          <button
            type="button"
            onClick={onAddNew}
            disabled={isAddingNew || isSaving}
            className="button-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-3 flex-1 sm:flex-none justify-center rounded-xl shadow-lg shadow-brand-accent/20"
          >
            <PlusIcon className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {(isAddingNew || editingId) && (
        <div className="p-4 bg-brand-surface rounded-2xl border-2 border-brand-accent/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-brand-text-light">
              {isAddingNew ? 'Buat Template Baru' : 'Edit Template Chat'}
            </h4>
          </div>

          {formError && (
            <div className="bg-red-100 border border-red-600/20 text-red-800 text-xs p-2.5 rounded-xl flex items-center gap-2">
              {formError}
            </div>
          )}

          <div className="input-group !mt-0">
            <input
              type="text"
              id="ct-title"
              value={formData.title}
              onChange={e => onFormChange('title', e.target.value)}
              className="input-field !bg-brand-bg rounded-xl !py-2 !text-sm"
              placeholder=" "
            />
            <label htmlFor="ct-title" className="input-label !text-xs">
              Judul Template (misal: Sapaan Awal)
            </label>
          </div>

          <div className="space-y-2">
            <div className="input-group !mt-0">
              <textarea
                id={textareaId}
                value={formData.template}
                onChange={e => onFormChange('template', e.target.value)}
                className="input-field !bg-brand-bg min-h-[120px] rounded-xl font-sans leading-relaxed !py-2 !text-sm"
                placeholder=" "
                rows={4}
              />
              <label htmlFor={textareaId} className="input-label !text-xs">
                Isi Pesan Template
              </label>
            </div>

            <div className="p-3 bg-brand-bg/50 rounded-xl border border-brand-border/50 backdrop-blur-sm">
              <p className="text-[10px] font-bold text-brand-text-secondary mb-1.5 uppercase tracking-wider">
                Klik Variabel Untuk Menyisipkan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {variableChips.map(v => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => onInsertVar(v.label)}
                    title={v.desc}
                    className={`inline-flex items-center px-2 py-1 rounded-lg ${chipClass} text-[10px] font-mono border transition-all hover:scale-105 active:scale-95 shadow-sm`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="button-primary flex-1 py-2 rounded-xl font-bold shadow-lg shadow-brand-accent/20 text-sm"
            >
              {isSaving ? 'Menyimpan...' : isAddingNew ? 'Buat' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="button-secondary flex-1 py-2 rounded-xl font-bold bg-white/5 border border-brand-border text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Template list */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {templates.length === 0 && !isAddingNew && (
          <div className="text-center py-20 bg-brand-bg/30 rounded-3xl border border-brand-border/50 border-dashed">
            <div className="bg-brand-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-border">
              <MessageSquareIcon className="w-8 h-8 text-brand-text-secondary opacity-30" />
            </div>
            <p className="text-brand-text-secondary font-medium italic">
              Anda belum memiliki template chat kustom.
            </p>
            <button
              type="button"
              onClick={onAddNew}
              className="button-primary mt-6 text-sm px-6 rounded-xl shadow-lg"
            >
              + Tambah Template Pertama
            </button>
          </div>
        )}
        {templates.map((t, idx) => (
          <div
            key={t.id}
            className={`group p-5 rounded-2xl border transition-all duration-300 ${
              editingId === t.id
                ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20'
                : 'border-brand-border bg-brand-surface hover:border-brand-accent/40 hover:shadow-xl hover:shadow-black/5'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-lg ${accentClass} text-[10px] font-black flex-shrink-0 shadow-sm`}
                  >
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-base text-brand-text-light truncate group-hover:text-brand-accent transition-colors">
                    {t.title}
                  </h4>
                </div>
                <div className="relative">
                  <p className="text-sm text-brand-text-secondary line-clamp-3 pl-9 leading-relaxed group-hover:text-brand-text-primary transition-colors italic">
                    "{t.template}"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:self-start bg-brand-bg/80 p-1 rounded-xl border border-brand-border/50 backdrop-blur-sm self-end">
                <button
                  type="button"
                  onClick={() => onPreviewToggle(t.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    previewId === t.id
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                      : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-accent border border-transparent'
                  }`}
                  title="Preview Pesan"
                  aria-label="Preview Pesan"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(t.template)}
                  className="w-9 h-9 text-brand-text-secondary hover:bg-brand-surface hover:text-brand-accent rounded-lg flex items-center justify-center transition-all border border-transparent"
                  title="Salin Template"
                  aria-label="Salin Template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(t)}
                  className="w-9 h-9 text-brand-text-secondary hover:bg-brand-surface hover:text-brand-accent rounded-lg flex items-center justify-center transition-all border border-transparent"
                  title="Edit Template"
                  aria-label="Edit Template"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  className="w-9 h-9 text-brand-text-secondary hover:bg-red-100 hover:text-red-800 rounded-lg flex items-center justify-center transition-all border border-transparent"
                  title="Hapus Template"
                  aria-label="Hapus Template"
                >
                  <Trash2Icon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Section */}
            {previewId === t.id && (
              <div className="mt-5 pt-5 border-t border-brand-border/50 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
                  <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">
                    Live Preview WhatsApp
                  </p>
                </div>
                <div className="bg-[#0b141a] rounded-2xl p-4 sm:p-6 border border-white/5 relative overflow-hidden shadow-2xl">
                  <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  ></div>
                  <div className="relative max-w-[85%] sm:max-w-[70%] ml-auto">
                    <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm text-sm whitespace-pre-wrap leading-relaxed">
                      {getPreviewText(t)}
                      <div className="flex justify-end gap-1 items-center mt-1.5">
                        <span className="text-[10px] opacity-60">12:45 PM</span>
                        <svg
                          width="16"
                          height="15"
                          viewBox="0 0 16 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="opacity-80"
                        >
                          <path
                            d="M15.01 3.47L8.41 10.07L5.59 7.25L4.88 7.96L8.41 11.49L15.72 4.18L15.01 3.47ZM12.89 3.47L8.41 7.95L10.03 9.57L11.44 8.16L11.41 8.13L13.6 5.94L12.89 3.47ZM0.28 7.96L3.81 11.49L4.52 10.78L0.99 7.25L0.28 7.96Z"
                            fill="#34B7F1"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-0 -right-2 w-0 h-0 border-[6px] border-transparent border-t-[#005c4b] border-l-[#005c4b]"></div>
                  </div>
                </div>
                <p className="text-[10px] text-center text-brand-text-secondary mt-3 opacity-60">
                  Pesan ini dihasilkan menggunakan data profil & Acara Pernikahan contoh
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
