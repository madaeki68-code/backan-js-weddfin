import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { PencilIcon, NAV_ITEMS } from '../../../constants';
import { User } from '../../../types';

export interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onEdit: (user: User) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onEdit,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Detail Pengguna" size="md">
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-brand-border bg-brand-bg p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary">
              Nama
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-brand-text-primary">
              {user.fullName}
            </p>
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-bg p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary">
              Email
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-brand-text-primary">
              {user.email}
            </p>
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-bg p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary">
              Peran
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-text-primary">{user.role}</p>
          </div>
          {user.companyName && (
            <div className="rounded-xl border border-brand-border bg-brand-bg p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-text-secondary">
                Perusahaan
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-brand-text-primary">
                {user.companyName}
              </p>
            </div>
          )}
        </div>

        <section>
          <h4 className="text-xs font-bold uppercase tracking-wide text-brand-text-secondary">
            Izin Akses
          </h4>
          {user.role === 'Admin' ? (
            <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              Akses penuh ke seluruh fitur.
            </p>
          ) : (user.permissions?.length || 0) > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {NAV_ITEMS.filter(item => user.permissions?.includes(item.view)).map(item => (
                <span
                  key={item.view}
                  className="rounded-lg border border-brand-border bg-brand-bg px-2.5 py-1 text-xs font-medium text-brand-text-primary"
                >
                  {item.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-brand-text-secondary">
              Belum ada izin halaman yang diberikan.
            </p>
          )}
        </section>

        <div className="flex justify-end gap-2 border-t border-brand-border pt-4">
          <button type="button" onClick={onClose} className="button-secondary">
            Tutup
          </button>
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="button-primary inline-flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Edit Pengguna
          </button>
        </div>
      </div>
    </Modal>
  );
};
