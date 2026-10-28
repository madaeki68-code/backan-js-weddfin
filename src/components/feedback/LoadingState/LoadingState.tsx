import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat data...',
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-14 h-14 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`} role="status" aria-live="polite">
      <div className="relative flex justify-center items-center">
        <div className={`border-slate-200 rounded-full ${sizeClasses[size]}`} />
        <div
          className={`absolute animate-spin border-transparent border-t-blue-500 rounded-full ${sizeClasses[size]}`}
        />
      </div>
      {message && <p className="text-xs font-medium text-slate-500">{message}</p>}
      <span className="sr-only">{message}</span>
    </div>
  );
};

export interface DataLoadingWrapperProps {
  loading: boolean;
  loaded: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingMessage?: string;
  onRetry?: () => void;
}

export const DataLoadingWrapper: React.FC<DataLoadingWrapperProps> = ({
  loading,
  loaded,
  error,
  children,
  loadingMessage,
  onRetry,
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-600 border border-transparent flex items-center justify-center text-white mb-3 shadow-sm">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800 mb-1">Gagal Memuat Data</p>
        <p className="text-xs text-slate-500 mb-4 max-w-sm">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        )}
      </div>
    );
  }

  if (loading && !loaded) {
    return <LoadingState message={loadingMessage} />;
  }

  return <>{children}</>;
};

export default LoadingState;
