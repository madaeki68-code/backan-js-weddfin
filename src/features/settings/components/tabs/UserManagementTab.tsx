import React from 'react';
import { Eye } from 'lucide-react';
import { PlusIcon, PencilIcon, Trash2Icon } from '../../../../constants';
import { UserDetailModal } from '../UserDetailModal';
import { UserFormModal } from '../UserFormModal';
import { useUserManagement } from '../../hooks/useUserManagement';
import { User } from '../../../../types';

export interface UserManagementTabProps {
  userHook: ReturnType<typeof useUserManagement>;
  users: User[];
  currentUser: User | null;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  userHook,
  users,
  currentUser,
}) => {
  const {
    isLoadingUsers,
    usersLoadError,
    setUsersLoadAttempted,
    isUserModalOpen,
    userModalMode,
    detailUser,
    setDetailUser,
    userForm,
    userFormError,
    showUserPassword,
    setShowUserPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSaving,
    handleOpenUserModal,
    handleCloseUserModal,
    handleUserFormChange,
    handlePermissionsChange,
    handleUserFormSubmit,
    handleDeleteUser,
  } = userHook;

  if (currentUser?.role !== 'Admin') {
    return (
      <p className="text-sm md:text-base text-brand-text-secondary">
        Anda tidak memiliki akses ke halaman ini.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h3 className="text-sm md:text-lg font-semibold text-brand-text-light">
          Manajemen Pengguna
        </h3>
        <button
          type="button"
          onClick={() => handleOpenUserModal('add')}
          className="button-primary inline-flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"
        >
          <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />
          Tambah Pengguna
        </button>
      </div>

      <div className="space-y-1.5 md:space-y-3">
        {isLoadingUsers ? (
          <p className="py-8 text-center text-sm text-brand-text-secondary" role="status">
            Memuat daftar pengguna...
          </p>
        ) : usersLoadError ? (
          <div
            className="flex flex-col items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-center"
            role="alert"
          >
            <p className="text-sm text-rose-700">{usersLoadError}</p>
            <button
              type="button"
              onClick={() => setUsersLoadAttempted(false)}
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Coba Lagi
            </button>
          </div>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-text-secondary">
            Belum ada data pengguna.
          </p>
        ) : (
          users.map(user => (
            <div
              key={user.id}
              className="px-2.5 py-1.5 sm:p-3 md:p-4 bg-brand-bg rounded-lg flex justify-between items-center gap-2 sm:gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base text-brand-text-light truncate leading-tight">
                  {user.fullName}
                </p>
                <p className="text-xs md:text-sm text-brand-text-secondary truncate leading-tight">
                  {user.email} - <span className="font-medium">{user.role}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setDetailUser(user)}
                  className="p-1 md:p-2 !min-h-0 !h-auto text-brand-text-secondary hover:bg-brand-input rounded-full"
                  title="Detail pengguna"
                  aria-label={`Lihat detail ${user.fullName}`}
                >
                  <Eye className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUserModal('edit', user)}
                  className="p-1 md:p-2 !min-h-0 !h-auto text-brand-text-secondary hover:bg-brand-input rounded-full"
                  title="Edit"
                  aria-label={`Edit ${user.fullName}`}
                >
                  <PencilIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-1 md:p-2 !min-h-0 !h-auto text-brand-text-secondary hover:bg-brand-input rounded-full"
                  title="Hapus"
                  aria-label={`Hapus ${user.fullName}`}
                >
                  <Trash2Icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={user => {
          setDetailUser(null);
          handleOpenUserModal('edit', user);
        }}
      />

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        userModalMode={userModalMode}
        userForm={userForm}
        userFormError={userFormError}
        isSaving={isSaving}
        showUserPassword={showUserPassword}
        setShowUserPassword={setShowUserPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        onUserFormChange={handleUserFormChange}
        onPermissionsChange={handlePermissionsChange}
        onSubmit={handleUserFormSubmit}
      />
    </div>
  );
};
