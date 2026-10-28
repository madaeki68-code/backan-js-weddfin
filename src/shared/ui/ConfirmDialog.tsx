import React from 'react';
import { AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';
import Modal from './Modal';

export type ConfirmVariant = 'danger' | 'warning' | 'primary';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    buttonClass: string;
  }
> = {
  danger: {
    icon: <AlertCircle className="w-6 h-6 text-red-600" />,
    iconBg: 'bg-red-50 border-red-100',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    iconBg: 'bg-amber-50 border-amber-100',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  primary: {
    icon: <Info className="w-6 h-6 text-blue-600" />,
    iconBg: 'bg-blue-50 border-blue-100',
    buttonClass: 'bg-brand-accent hover:opacity-90 text-white',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
}) => {
  const config = variantConfig[variant] || variantConfig.danger;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      onClose();
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2.5 w-full">
      <button
        type="button"
        disabled={isLoading}
        onClick={onClose}
        className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
      >
        {cancelText}
      </button>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => void handleConfirm()}
        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer ${config.buttonClass}`}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        <span>{confirmText}</span>
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={footer}>
      <div className="flex items-start gap-3.5 py-1">
        <div
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${config.iconBg}`}
        >
          {config.icon}
        </div>
        <div className="flex-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {message}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
