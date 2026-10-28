import React, { useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { ShareTemplateConfig } from '../types/settings.types';
import { PREVIEW_VARS } from '../constants/settings.constants';
import { processTemplate } from '../../../services/chatTemplatesOffline';

export interface ShareTemplateItemProps {
  config: ShareTemplateConfig;
  stringValue: string;
  onProfileUpdate: (key: string, val: string) => void;
  onReset: () => void;
  showSuccess?: (msg?: string) => void;
}

export const ShareTemplateItem: React.FC<ShareTemplateItemProps> = ({
  config,
  stringValue,
  onProfileUpdate,
  onReset,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const previewText = processTemplate(
    stringValue || config.defaultValue,
    PREVIEW_VARS,
  );

  const handleInsertVar = (varName: string) => {
    const el = document.getElementById(config.key) as HTMLTextAreaElement | null;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const current = stringValue;
      const updated = current.substring(0, start) + varName + current.substring(end);
      onProfileUpdate(config.key, updated);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + varName.length, start + varName.length);
      }, 50);
    } else {
      onProfileUpdate(config.key, stringValue + varName);
    }
  };

  return (
    <div
      className={`group p-6 bg-brand-surface rounded-2xl border transition-all duration-300 ${
        showPreview
          ? 'border-cyan-500 shadow-xl'
          : 'border-brand-border hover:border-cyan-500/40 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="font-bold text-base text-brand-text-light">{config.label}</h4>
          <p className="text-xs text-brand-text-secondary mt-0.5">{config.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              showPreview
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-brand-text-secondary hover:bg-brand-bg hover:text-brand-accent'
            }`}
            title="Lihat Preview"
            aria-label="Lihat Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-9 h-9 text-brand-text-secondary hover:bg-brand-bg hover:text-orange-800 rounded-lg flex items-center justify-center transition-all"
            title="Reset ke Default"
            aria-label="Reset ke Default"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="input-group !mt-0 group/field">
          <textarea
            id={config.key}
            value={stringValue}
            onChange={e => onProfileUpdate(config.key, e.target.value)}
            className="input-field !bg-brand-bg min-h-[140px] rounded-xl font-sans leading-relaxed group-hover/field:border-cyan-500/50 transition-colors"
            placeholder={config.placeholder}
            rows={5}
          />
          <label htmlFor={config.key} className="input-label !text-brand-text-secondary">
            Isi Pesan WhatsApp
          </label>
        </div>

        <div className="p-4 bg-brand-bg/50 rounded-xl border border-brand-border/50 backdrop-blur-sm">
          <p className="text-[10px] font-bold text-brand-text-secondary mb-2 uppercase tracking-wider">
            Klik Variabel Untuk Menyisipkan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {config.variables.map(v => (
              <button
                key={v.label}
                type="button"
                onClick={() => handleInsertVar(v.label)}
                title={v.desc}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-600 text-[11px] font-mono border border-cyan-400/20 hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {showPreview && (
          <div className="pt-4 border-t border-brand-border/30 animate-in zoom-in-95 duration-200">
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
                  {previewText}
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
          </div>
        )}
      </div>
    </div>
  );
};
