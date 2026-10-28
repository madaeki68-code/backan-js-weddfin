/**
 * Finance Adapter
 * Wrapper yang bisa switch antara Supabase dan NestJS backend untuk Finance module
 * (Cards, Pockets, Transactions)
 */

import { apiClient, handleApiError } from '../api-client';
import { useNestJSForModule } from '../../config/features';
import * as supabaseCards from '../cards';
import type { Card } from '../../types';

// ========== TYPES ==========

export interface CardDTO {
  id: string;
  cardHolderName: string;
  bankName: string;
  cardType: string;
  lastFourDigits: string;
  expiryDate?: string | null;
  balance: number;
  colorGradient: string;
}

export interface CreateCardInput {
  name?: string;
  cardHolderName: string;
  bankName: string;
  cardType?: string;
  lastFourDigits: string;
  expiryDate?: string | null;
  balance?: number;
  colorGradient?: string;
}

export interface UpdateCardInput {
  name?: string;
  cardHolderName?: string;
  bankName?: string;
  cardType?: string;
  lastFourDigits?: string;
  expiryDate?: string | null;
  balance?: number;
  colorGradient?: string;
}

export interface PocketDTO {
  id: string;
  name: string;
  type: string;
  description?: string;
  icon: string;
  amount: number;
  goalAmount?: number;
  lockEndDate?: string | null;
  sourceCardId?: string | null;
  members?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePocketInput {
  name: string;
  type: string;
  description?: string;
  icon?: string;
  amount?: number;
  goalAmount?: number;
  lockEndDate?: string | null;
  sourceCardId?: string | null;
  members?: any[];
}

export interface UpdatePocketInput {
  name?: string;
  type?: string;
  description?: string;
  icon?: string;
  amount?: number;
  goalAmount?: number;
  lockEndDate?: string | null;
  sourceCardId?: string | null;
  members?: any[];
}

export interface TransactionDTO {
  id: string;
  type: 'Pemasukan' | 'Pengeluaran' | 'Transfer';
  amount: number;
  date: string;
  description: string;
  category: string;
  method: string;
  projectId?: string | null;
  cardId?: string | null;
  pocketId?: string | null;
  proofUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  type: 'Pemasukan' | 'Pengeluaran' | 'Transfer';
  amount: number;
  date: string;
  description: string;
  category?: string;
  method?: string;
  projectId?: string | null;
  cardId?: string | null;
  pocketId?: string | null;
  printingItemId?: string;
  sourceId?: string;
  clientName?: string;
  proofUrl?: string;
  vendorSignature?: string;
}

export interface UpdateTransactionInput {
  type?: 'Pemasukan' | 'Pengeluaran' | 'Transfer';
  amount?: number;
  date?: string;
  description?: string;
  category?: string;
  method?: string;
  projectId?: string | null;
  cardId?: string | null;
  pocketId?: string | null;
  printingItemId?: string;
  sourceId?: string;
  clientName?: string;
  proofUrl?: string;
  vendorSignature?: string;
}

export interface TransactionListParams {
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
  type?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionListResponse {
  transactions: TransactionDTO[];
  total: number;
}

// ========== CARDS ==========

/**
 * List all cards
 */
export async function listCards(): Promise<CardDTO[]> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.get<CardDTO[]>('/finance/cards');
      return data;
    } else {
      const rows = await supabaseCards.listCards();
      return rows.map((row) => ({
        id: row.id,
        cardHolderName: row.card_holder_name,
        bankName: row.bank_name,
        cardType: row.card_type,
        lastFourDigits: row.last_four_digits,
        expiryDate: row.expiry_date,
        balance: row.balance,
        colorGradient: row.color_gradient || 'from-indigo-500 to-blue-500',
      }));
    }
  } catch (error) {
    console.error('[Finance Adapter] Error listing cards:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Create a new card
 */
export async function createCard(input: CreateCardInput): Promise<CardDTO> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.post<CardDTO>('/finance/cards', input);
      return data;
    } else {
      const row = await supabaseCards.createCard({
        card_holder_name: input.cardHolderName,
        bank_name: input.bankName,
        card_type: input.cardType || 'Debit',
        last_four_digits: input.lastFourDigits,
        expiry_date: input.expiryDate,
        balance: input.balance || 0,
        color_gradient: input.colorGradient,
      });
      return {
        id: row.id,
        cardHolderName: row.card_holder_name,
        bankName: row.bank_name,
        cardType: row.card_type,
        lastFourDigits: row.last_four_digits,
        expiryDate: row.expiry_date,
        balance: row.balance,
        colorGradient: row.color_gradient || 'from-indigo-500 to-blue-500',
      };
    }
  } catch (error) {
    console.error('[Finance Adapter] Error creating card:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Update a card
 */
export async function updateCard(id: string, input: UpdateCardInput): Promise<CardDTO> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.patch<CardDTO>(`/finance/cards/${id}`, input);
      return data;
    } else {
      const patch: any = {};
      if (input.cardHolderName !== undefined) patch.card_holder_name = input.cardHolderName;
      if (input.bankName !== undefined) patch.bank_name = input.bankName;
      if (input.cardType !== undefined) patch.card_type = input.cardType;
      if (input.lastFourDigits !== undefined) patch.last_four_digits = input.lastFourDigits;
      if (input.expiryDate !== undefined) patch.expiry_date = input.expiryDate;
      if (input.balance !== undefined) patch.balance = input.balance;
      if (input.colorGradient !== undefined) patch.color_gradient = input.colorGradient;

      const row = await supabaseCards.updateCard(id, patch);
      return {
        id: row.id,
        cardHolderName: row.card_holder_name,
        bankName: row.bank_name,
        cardType: row.card_type,
        lastFourDigits: row.last_four_digits,
        expiryDate: row.expiry_date,
        balance: row.balance,
        colorGradient: row.color_gradient || 'from-indigo-500 to-blue-500',
      };
    }
  } catch (error) {
    console.error('[Finance Adapter] Error updating card:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete a card
 */
export async function deleteCard(id: string): Promise<void> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      await apiClient.delete(`/finance/cards/${id}`);
    } else {
      await supabaseCards.safeDeleteCard(id);
    }
  } catch (error) {
    console.error('[Finance Adapter] Error deleting card:', error);
    throw new Error(handleApiError(error));
  }
}

// ========== POCKETS ==========

/**
 * List all pockets
 */
export async function listPockets(): Promise<PocketDTO[]> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.get<PocketDTO[]>('/finance/pockets');
      return data;
    } else {
      // TODO: Implement Supabase fallback jika ada
      throw new Error('Pockets not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error listing pockets:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Create a new pocket
 */
export async function createPocket(input: CreatePocketInput): Promise<PocketDTO> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.post<PocketDTO>('/finance/pockets', input);
      return data;
    } else {
      throw new Error('Pockets not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error creating pocket:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Update a pocket
 */
export async function updatePocket(id: string, input: UpdatePocketInput): Promise<PocketDTO> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.patch<PocketDTO>(`/finance/pockets/${id}`, input);
      return data;
    } else {
      throw new Error('Pockets not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error updating pocket:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete a pocket
 */
export async function deletePocket(id: string): Promise<void> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      await apiClient.delete(`/finance/pockets/${id}`);
    } else {
      throw new Error('Pockets not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error deleting pocket:', error);
    throw new Error(handleApiError(error));
  }
}

// ========== TRANSACTIONS ==========

/**
 * List transactions with filters
 */
export async function listTransactions(params: TransactionListParams = {}): Promise<TransactionListResponse> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.get<TransactionListResponse>('/finance/transactions', { params });
      return data;
    } else {
      throw new Error('Transactions not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error listing transactions:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Create a single transaction
 */
export async function createTransaction(input: CreateTransactionInput): Promise<TransactionDTO> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.post<TransactionDTO>('/finance/transactions', input);
      return data;
    } else {
      throw new Error('Transactions not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error creating transaction:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Create multiple transactions atomically (batch)
 */
export async function createTransactionsBatch(inputs: CreateTransactionInput[]): Promise<TransactionDTO[]> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.post<TransactionDTO[]>('/finance/transactions/batch', { items: inputs });
      return data;
    } else {
      throw new Error('Batch transactions not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error creating batch transactions:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, input: UpdateTransactionInput): Promise<TransactionDTO> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      const data = await apiClient.patch<TransactionDTO>(`/finance/transactions/${id}`, input);
      return data;
    } else {
      throw new Error('Transactions not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error updating transaction:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  const useNestJS = useNestJSForModule('finance');

  try {
    if (useNestJS) {
      await apiClient.delete(`/finance/transactions/${id}`);
    } else {
      throw new Error('Transactions not implemented for Supabase fallback');
    }
  } catch (error) {
    console.error('[Finance Adapter] Error deleting transaction:', error);
    throw new Error(handleApiError(error));
  }
}
