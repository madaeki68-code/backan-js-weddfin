import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kesalahan',
  message,
  error,
  onRetry,
  retryLabel = 'Coba Lagi',
  className = '',
  children,
}) => {
  const displayMessage =
    message ||
    (typeof error === 'string' ? error : error instanceof Error ? error.message : 'Silakan muat ulang atau coba beberapa saat lagi.');

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`} role="alert">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200/80 flex items-center justify-center text-red-600 mb-3.5 shadow-xs">
        <AlertCircle className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      {displayMessage && <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">{displayMessage}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs hover:shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
      {children}
    </div>
  );
};

export default ErrorState;
