import React from 'react';
import { ClientStatus, PaymentStatus } from '../types';
import { getPaymentStatusClass } from '../utils/clientHelpers';

interface ClientStatusBadgeProps {
  status?: ClientStatus | string;
  paymentStatus?: PaymentStatus | string | null;
  className?: string;
}

export const ClientStatusBadge: React.FC<ClientStatusBadgeProps> = ({
  status,
  paymentStatus,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {status && (
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            status === ClientStatus.ACTIVE
              ? 'solid-teal text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {status}
        </span>
      )}
      {paymentStatus && (
        <span
          className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${getPaymentStatusClass(
            paymentStatus as PaymentStatus
          )}`}
        >
          {paymentStatus}
        </span>
      )}
    </div>
  );
};

export default ClientStatusBadge;
