import React from 'react';
import { WhatsappIcon } from '../../../constants';
import { normalizeWhatsAppNumber, isValidWhatsAppNumber } from '../utils/phone';
import { buildWhatsAppLink } from '../utils/whatsapp';

export interface WhatsAppChatButtonProps {
  phone?: string | null;
  message?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

export const WhatsAppChatButton: React.FC<WhatsAppChatButtonProps> = ({
  phone,
  message = '',
  label = 'WhatsApp',
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  title,
}) => {
  const normalized = normalizeWhatsAppNumber(phone);
  const isValid = isValidWhatsAppNumber(normalized);
  const isButtonDisabled = disabled || !isValid;

  const url = isValid ? buildWhatsAppLink(normalized, message) : '#';

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5 rounded-2xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs border border-emerald-500/30',
    secondary:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200',
    outline:
      'bg-transparent hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-semibold',
    'icon-only':
      'p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-200 aspect-square flex items-center justify-center',
  }[variant];

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const tooltip =
    title || (isValid ? `Chat WhatsApp dengan ${phone}` : 'Nomor WhatsApp belum tersedia atau tidak valid');

  if (isButtonDisabled) {
    return (
      <button
        type="button"
        disabled
        title={tooltip}
        className={`inline-flex items-center justify-center transition-all opacity-50 cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      >
        <WhatsappIcon className="w-4 h-4 flex-shrink-0" />
        {variant !== 'icon-only' && <span>{label}</span>}
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      title={tooltip}
      className={`inline-flex items-center justify-center transition-all cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
    >
      <WhatsappIcon className="w-4 h-4 flex-shrink-0" />
      {variant !== 'icon-only' && <span>{label}</span>}
    </a>
  );
};
