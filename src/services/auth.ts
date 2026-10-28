import { User } from '../types';
import { apiRequest } from './apiClient';

interface BackendUser {
  id: string;
  email: string;
  role: string;
  profile?: {
    businessName?: string | null;
    ownerName?: string | null;
  } | null;
}

function toFrontendUser(user: BackendUser): User {
  return {
    id: user.id,
    email: user.email,
    password: '',
    fullName: user.profile?.ownerName || user.profile?.businessName || user.email,
    companyName: user.profile?.businessName || undefined,
    role: user.role === 'admin' || user.role === 'superadmin' ? 'Admin' : 'Member',
    permissions: [],
  };
}

export async function login(email: string, password: string): Promise<User> {
  const result = await apiRequest<{ user: BackendUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return toFrontendUser(result.user);
}

export async function getCurrentUser(): Promise<User> {
  const user = await apiRequest<BackendUser>('/auth/me');
  return toFrontendUser(user);
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' });
}
