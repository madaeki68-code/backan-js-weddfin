import { useState, useCallback, useRef, useEffect } from 'react';
import { ConfirmVariant } from '../shared/ui/ConfirmDialog';

export interface ConfirmOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export interface ConfirmDialogState extends ConfirmOptions {
  isOpen: boolean;
  isLoading: boolean;
}

export const useConfirm = () => {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    isLoading: false,
    title: 'Konfirmasi',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    variant: 'danger',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    if (resolverRef.current) {
      resolverRef.current(false);
    }
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        isOpen: true,
        isLoading: false,
        title: options.title || 'Konfirmasi Tindakan',
        message: options.message,
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        variant: options.variant || 'danger',
      });
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCancel = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const confirmDialogProps = {
    isOpen: state.isOpen,
    onClose: handleCancel,
    onConfirm: handleConfirm,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
    isLoading: state.isLoading,
  };

  return {
    confirm,
    confirmDialogProps,
    isOpen: state.isOpen,
  };
};

export default useConfirm;
