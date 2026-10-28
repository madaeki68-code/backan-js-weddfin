import React, { useState, useCallback, useEffect } from 'react';
import { User, ViewType } from '../../../types';
import { settingsService } from '../services/settings.service';
import { validateUserForm } from '../utils/settingsValidators';
import { UserFormData } from '../types/settings.types';

const emptyUserForm: UserFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Member',
  permissions: [],
};

export function useUserManagement(
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  currentUser: User | null,
  activeTab: string,
) {
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersLoadAttempted, setUsersLoadAttempted] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<UserFormData>(emptyUserForm);
  const [userFormError, setUserFormError] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadManagedUsers = useCallback(async () => {
    if (currentUser?.role !== 'Admin') return;
    setUsersLoadAttempted(true);
    setIsLoadingUsers(true);
    setUsersLoadError('');
    try {
      const list = await settingsService.listUsers();
      setUsers(list);
    } catch (error: unknown) {
      console.error('[useUserManagement] Failed to load users:', error);
      setUsersLoadError((error as Error)?.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser?.role, setUsers]);

  useEffect(() => {
    if (activeTab === 'users' && currentUser?.role === 'Admin' && !usersLoadAttempted) {
      void loadManagedUsers();
    }
  }, [activeTab, currentUser?.role, usersLoadAttempted, loadManagedUsers]);

  const handleOpenUserModal = (mode: 'add' | 'edit', user: User | null = null) => {
    setUserModalMode(mode);
    setSelectedUser(user);
    setShowUserPassword(false);
    setShowConfirmPassword(false);
    if (mode === 'edit' && user) {
      setUserForm({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: '',
        permissions: user.permissions || [],
      });
    } else {
      setUserForm(emptyUserForm);
    }
    setUserFormError('');
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
    setUserForm(emptyUserForm);
    setUserFormError('');
    setShowUserPassword(false);
    setShowConfirmPassword(false);
  };

  const handleUserFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionsChange = (view: ViewType, checked: boolean) => {
    setUserForm(prev => {
      const currentPermissions = new Set(prev.permissions);
      if (checked) {
        currentPermissions.add(view);
      } else {
        currentPermissions.delete(view);
      }
      return { ...prev, permissions: Array.from(currentPermissions) };
    });
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setUserFormError('');

    const validation = validateUserForm(userForm, userModalMode, users, selectedUser?.id);
    if (!validation.isValid) {
      setUserFormError(validation.error || 'Validasi formulir gagal.');
      return;
    }

    if (!currentUser) {
      setUserFormError('Tidak dapat membuat pengguna: sesi tidak valid.');
      return;
    }

    setIsSaving(true);
    try {
      if (userModalMode === 'add') {
        const newUser = await settingsService.createUser({
          fullName: userForm.fullName.trim(),
          email: userForm.email.trim(),
          password: userForm.password.trim(),
          role: userForm.role,
          permissions: userForm.role === 'Admin' ? [] : userForm.permissions,
        });
        setUsers(prev => [...prev, newUser]);
      } else if (selectedUser) {
        const updates: {
          fullName: string;
          email: string;
          role: User['role'];
          permissions: ViewType[];
          password?: string;
        } = {
          fullName: userForm.fullName.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          permissions: userForm.role === 'Admin' ? [] : userForm.permissions,
        };
        if (userForm.password.trim()) {
          updates.password = userForm.password.trim();
        }
        const updated = await settingsService.updateUser(selectedUser.id, updates);
        setUsers(prev => prev.map(u => (u.id === selectedUser.id ? updated : u)));
      }
      handleCloseUserModal();
    } catch (err: unknown) {
      console.error('[useUserManagement] Submit user failed:', err);
      setUserFormError((err as Error)?.message || 'Gagal menyimpan pengguna.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus pengguna "${target.fullName}" (${target.email})?`)) {
      try {
        await settingsService.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err: unknown) {
        console.error('[useUserManagement] Delete user failed:', err);
        alert('Gagal menghapus pengguna: ' + ((err as Error)?.message || 'Coba lagi.'));
      }
    }
  };

  return {
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
  };
}
