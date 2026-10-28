import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { Eye, EyeOff } from 'lucide-react';
import { KeyIcon, NAV_ITEMS } from '../../../constants';
import { UserFormData } from '../types/settings.types';
import { ViewType } from '../../../types';

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userModalMode: 'add' | 'edit';
  userForm: UserFormData;
  userFormError: string;
  isSaving: boolean;
  showUserPassword: boolean;
  setShowUserPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onUserFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPermissionsChange: (view: ViewType, checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userModalMode,
  userForm,
  userFormError,
  isSaving,
  showUserPassword,
  setShowUserPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onUserFormChange,
  onPermissionsChange,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userModalMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
    >
      <form onSubmit={onSubmit} className="space-y-4 form-compact form-compact--ios-scale">
        {userFormError && (
          <p className="text-red-800 text-sm bg-red-100 p-3 rounded-md">{userFormError}</p>
        )}

        <div className="hidden sm:block bg-blue-100 border border-blue-600/30 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <KeyIcon className="w-4 h-4" />
            Informasi Pengguna
          </h4>
          <p className="text-xs text-brand-text-secondary">
            Tambahkan pengguna baru yang dapat mengakses sistem. Atur peran dan izin akses sesuai
            kebutuhan.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">Data Pribadi</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <input
                type="text"
                name="fullName"
                value={userForm.fullName}
                onChange={onUserFormChange}
                className="input-field"
                placeholder=" "
                required
              />
              <label className="input-label">Nama Lengkap</label>
              <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
                Nama lengkap pengguna
              </p>
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                value={userForm.email}
                onChange={onUserFormChange}
                className="input-field"
                placeholder=" "
                required
              />
              <label className="input-label">Email</label>
              <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
                Email untuk login ke sistem
              </p>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">Keamanan</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <div className="relative">
                <input
                  id="user-form-password"
                  type={showUserPassword ? 'text' : 'password'}
                  name="password"
                  value={userForm.password}
                  onChange={onUserFormChange}
                  className="input-field pr-11"
                  placeholder=" "
                  autoComplete="new-password"
                  required={userModalMode === 'add'}
                />
                <label htmlFor="user-form-password" className="input-label">
                  {userModalMode === 'add' ? 'Kata Sandi' : 'Kata Sandi Baru'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowUserPassword(show => !show)}
                  aria-label={showUserPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  title={showUserPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-text-secondary hover:text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
                {userModalMode === 'add'
                  ? 'Minimal 6 karakter'
                  : 'Kosongkan jika tidak berubah'}
              </p>
            </div>
            <div className="input-group">
              <div className="relative">
                <input
                  id="user-form-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={userForm.confirmPassword}
                  onChange={onUserFormChange}
                  className="input-field pr-11"
                  placeholder=" "
                  autoComplete="new-password"
                  required={!!userForm.password}
                />
                <label htmlFor="user-form-confirm-password" className="input-label">
                  Konfirmasi Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(show => !show)}
                  aria-label={
                    showConfirmPassword
                      ? 'Sembunyikan konfirmasi kata sandi'
                      : 'Lihat konfirmasi kata sandi'
                  }
                  title={
                    showConfirmPassword
                      ? 'Sembunyikan kata sandi'
                      : 'Lihat kata sandi'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-text-secondary hover:text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="hidden sm:block text-xs text-brand-text-secondary mt-1">
                Ketik ulang kata sandi
              </p>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-brand-text-light mb-3">Peran & Izin Akses</h5>
          <div className="input-group">
            <select
              name="role"
              value={userForm.role}
              onChange={onUserFormChange}
              className="input-field"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            <label className="input-label">Peran</label>
            <p className="text-xs text-brand-text-secondary mt-1">
              Admin memiliki akses penuh, Member dapat dikustomisasi
            </p>
          </div>
        </div>

        {userForm.role === 'Member' && (
          <div className="bg-brand-bg p-4 rounded-lg border border-brand-border">
            <h5 className="text-sm font-semibold text-brand-text-light mb-3">
              Izin Akses Halaman
            </h5>
            <p className="text-xs text-brand-text-secondary mb-3">
              Pilih halaman mana saja yang dapat diakses oleh pengguna ini
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {NAV_ITEMS.filter(item => item.view !== ViewType.SETTINGS).map(item => (
                <label
                  key={item.view}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-brand-input cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={userForm.permissions.includes(item.view)}
                    onChange={e => onPermissionsChange(item.view, e.target.checked)}
                    className="h-4 w-4 rounded flex-shrink-0 text-brand-accent focus:ring-brand-accent transition-colors"
                  />
                  <span className="text-sm text-brand-text-primary">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-brand-border">
          <button
            type="button"
            onClick={onClose}
            className="button-secondary w-full sm:w-auto"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="button-primary w-full sm:w-auto"
          >
            {isSaving
              ? 'Menyimpan...'
              : userModalMode === 'add'
              ? 'Simpan Pengguna'
              : 'Update Pengguna'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
