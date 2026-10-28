import React from 'react';
import SharedModal from '../../../shared/ui/Modal';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  className?: string;
}

export const Modal: React.FC<ModalProps> = React.memo(
  ({ isOpen, onClose, title, description, children, footer, size = '2xl', className = '' }) => {
    return (
      <SharedModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size={size}
        footer={footer}
        className={className}
      >
        {description && (
          <p className="text-xs text-slate-500 mb-3 -mt-1 font-medium">{description}</p>
        )}
        {children}
      </SharedModal>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
