/**
 * Team Payments Adapter
 * Wrapper untuk Team Project Payments dan Team Payment Records
 */

import { apiClient, handleApiError } from '../api-client';
import { useNestJSForModule } from '../../config/features';

// ========== TYPES ==========

export interface TeamProjectPaymentDTO {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  date: string;
  fee: number;
  status: 'Paid' | 'Unpaid';
  createdAt: string;
  updatedAt: string;
}

export interface TeamProjectPaymentInput {
  id?: string;
  teamMemberId: string;
  teamMemberName: string;
  date: string;
  fee: number;
  status: 'Paid' | 'Unpaid';
}

export interface ReconcileTeamPaymentsInput {
  items: TeamProjectPaymentInput[];
}

export interface TeamPaymentRecordDTO {
  id: string;
  recordNumber: string;
  teamMemberId: string | null;
  date: string;
  projectPaymentIds: string[];
  totalAmount: number;
  vendorSignature?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamPaymentRecordInput {
  recordNumber: string;
  teamMemberId?: string | null;
  date: string;
  projectPaymentIds: string[];
  totalAmount: number;
  vendorSignature?: string | null;
}

export interface UpdateTeamPaymentRecordInput {
  recordNumber?: string;
  teamMemberId?: string | null;
  date?: string;
  projectPaymentIds?: string[];
  totalAmount?: number;
  vendorSignature?: string | null;
}

// ========== TEAM PROJECT PAYMENTS ==========

/**
 * List all team project payments
 */
export async function listTeamPayments(): Promise<TeamProjectPaymentDTO[]> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.get<TeamProjectPaymentDTO[]>('/team-payments');
      return data;
    } else {
      // TODO: Implement Supabase fallback jika diperlukan
      throw new Error('Team payments Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error listing team payments:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * List team payments by project
 */
export async function listTeamPaymentsByProject(projectId: string): Promise<TeamProjectPaymentDTO[]> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.get<TeamProjectPaymentDTO[]>(`/team-payments/projects/${projectId}`);
      return data;
    } else {
      throw new Error('Team payments Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error listing project team payments:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Create a team project payment
 */
export async function createTeamPayment(
  projectId: string,
  input: TeamProjectPaymentInput
): Promise<TeamProjectPaymentDTO> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.post<TeamProjectPaymentDTO>(
        `/team-payments/projects/${projectId}`,
        input
      );
      return data;
    } else {
      throw new Error('Team payments Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error creating team payment:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Reconcile team payments for a project
 * IMPORTANT: Rows dengan status "Paid" akan tetap dipertahankan
 */
export async function reconcileTeamPayments(
  projectId: string,
  input: ReconcileTeamPaymentsInput
): Promise<TeamProjectPaymentDTO[]> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.post<TeamProjectPaymentDTO[]>(
        `/team-payments/projects/${projectId}/reconcile`,
        input
      );
      return data;
    } else {
      throw new Error('Team payments Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error reconciling team payments:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Update team payment status
 */
export async function updateTeamPaymentStatus(
  id: string,
  status: 'Paid' | 'Unpaid',
  fee?: number
): Promise<TeamProjectPaymentDTO> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.patch<TeamProjectPaymentDTO>(`/team-payments/${id}`, {
        status,
        ...(fee !== undefined && { fee }),
      });
      return data;
    } else {
      throw new Error('Team payments Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error updating team payment status:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete all team payments for a project
 */
export async function deleteProjectTeamPayments(projectId: string): Promise<void> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      await apiClient.delete(`/team-payments/projects/${projectId}`);
    } else {
      throw new Error('Team payments Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error deleting project team payments:', error);
    throw new Error(handleApiError(error));
  }
}

// ========== TEAM PAYMENT RECORDS ==========

/**
 * List all team payment records (bukti pembayaran)
 */
export async function listTeamPaymentRecords(): Promise<TeamPaymentRecordDTO[]> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.get<TeamPaymentRecordDTO[]>('/team-payments/records');
      return data;
    } else {
      throw new Error('Team payment records Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error listing payment records:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Create a team payment record
 */
export async function createTeamPaymentRecord(
  input: CreateTeamPaymentRecordInput
): Promise<TeamPaymentRecordDTO> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.post<TeamPaymentRecordDTO>('/team-payments/records', input);
      return data;
    } else {
      throw new Error('Team payment records Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error creating payment record:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Update a team payment record
 */
export async function updateTeamPaymentRecord(
  id: string,
  input: UpdateTeamPaymentRecordInput
): Promise<TeamPaymentRecordDTO> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      const data = await apiClient.patch<TeamPaymentRecordDTO>(`/team-payments/records/${id}`, input);
      return data;
    } else {
      throw new Error('Team payment records Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error updating payment record:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete a team payment record
 */
export async function deleteTeamPaymentRecord(id: string): Promise<void> {
  const useNestJS = useNestJSForModule('teamPayments');

  try {
    if (useNestJS) {
      await apiClient.delete(`/team-payments/records/${id}`);
    } else {
      throw new Error('Team payment records Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Team Payments Adapter] Error deleting payment record:', error);
    throw new Error(handleApiError(error));
  }
}
