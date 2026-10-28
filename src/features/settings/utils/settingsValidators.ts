import { User } from '../../../types';
import { UserFormData } from '../types/settings.types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateBankAccount(bankAccount?: string): ValidationResult {
  if (!bankAccount || !bankAccount.trim()) {
    return { isValid: true };
  }
  const trimmed = bankAccount.trim();
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Informasi rekening bank terlalu pendek.' };
  }
  return { isValid: true };
}

export function validateUserForm(
  form: UserFormData,
  mode: 'add' | 'edit',
  existingUsers: readonly User[] = [],
  currentEditingUserId?: string,
): ValidationResult {
  const fullName = form.fullName.trim();
  const email = form.email.trim();
  const password = form.password.trim();
  const confirmPassword = form.confirmPassword.trim();

  if (!fullName) {
    return { isValid: false, error: 'Nama lengkap wajib diisi.' };
  }

  if (!email) {
    return { isValid: false, error: 'Email wajib diisi.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format email tidak valid.' };
  }

  // Check email uniqueness
  const isDuplicate = existingUsers.some(
    u => u.email.toLowerCase() === email.toLowerCase() && (mode === 'add' || u.id !== currentEditingUserId),
  );
  if (isDuplicate) {
    return { isValid: false, error: 'Email sudah digunakan di dalam vendor ini.' };
  }

  if (mode === 'add') {
    if (!password) {
      return { isValid: false, error: 'Kata sandi wajib diisi untuk pengguna baru.' };
    }
  }

  if (password) {
    if (password.length < 6) {
      return { isValid: false, error: 'Kata sandi minimal 6 karakter.' };
    }
    if (password !== confirmPassword) {
      return { isValid: false, error: 'Konfirmasi kata sandi tidak cocok.' };
    }
  }

  return { isValid: true };
}

export function validateCategoryInput(
  rawInput: string,
  existingList: readonly string[],
  editingValue: string | null,
): ValidationResult {
  const value = rawInput.trim();
  if (!value) {
    return { isValid: false, error: 'Nama kategori tidak boleh kosong.' };
  }

  if (editingValue !== null) {
    if (value.toLowerCase() !== editingValue.toLowerCase() && existingList.some(item => item.toLowerCase() === value.toLowerCase())) {
      return { isValid: false, error: 'Kategori ini sudah ada.' };
    }
  } else {
    if (existingList.some(item => item.toLowerCase() === value.toLowerCase())) {
      return { isValid: false, error: 'Kategori ini sudah ada.' };
    }
  }

  return { isValid: true };
}

export function validateProjectStatusInput(
  name: string,
  existingStatuses: readonly { id: string; name: string }[],
  editingId?: string,
): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Nama status tidak boleh kosong.' };
  }

  const isDuplicate = existingStatuses.some(
    s => s.name.toLowerCase() === trimmed.toLowerCase() && (!editingId || s.id !== editingId),
  );
  if (isDuplicate) {
    return { isValid: false, error: `Status "${trimmed}" sudah ada.` };
  }

  return { isValid: true };
}
