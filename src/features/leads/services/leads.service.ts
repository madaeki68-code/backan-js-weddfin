import {
  listLeads,
  listLeadsPaginated,
  createLead as createLeadRow,
  updateLead as updateLeadRow,
  deleteLead as deleteLeadRow,
} from '../../../services/leads';
import { createClient as createClientRow } from '../../../services/clients';
import { createProject as createProjectRow } from '../../../services/projects';
import { createTransaction as createTransactionRow } from '../../../services/transactions';
import { findCardIdByMeta } from '../../../services/cards';
import { generateUUID } from '../../../utils/uuid';
import { logger } from '../../../lib/logger';
import {
  Lead,
  LeadStatus,
  Client,
  ClientStatus,
  ClientType,
  Project,
  Package,
  AddOn,
  Card,
  PromoCode,
  Transaction,
  TransactionType,
  PaymentStatus,
} from '../../../types';
import type { ConvertLeadFormData } from '../types/leads.types';

export {
  listLeads,
  listLeadsPaginated,
  createLeadRow,
  updateLeadRow,
  deleteLeadRow,
};

export interface ConvertLeadResult {
  createdClient: Client;
  createdProject: Project;
  createdTransaction: Transaction | null;
  updatedCardId?: string;
  updatedCardBalanceDelta?: number;
  promoCodeIdUsed?: string;
  conversionNote: string;
}

export async function convertLeadWorkflow({
  lead,
  formData,
  packages,
  addOns,
  promoCodes,
  cards,
}: {
  lead: Lead;
  formData: ConvertLeadFormData;
  packages: Package[];
  addOns: AddOn[];
  promoCodes: PromoCode[];
  cards: Card[];
}): Promise<ConvertLeadResult> {
  const selectedPackage = packages.find((p) => p.id === formData.packageId);
  if (!selectedPackage) {
    throw new Error('Harap pilih Package.');
  }

  const selectedAddOns = addOns.filter((addon) =>
    formData.selectedAddOnIds.includes(addon.id)
  );

  const packagePrice =
    formData.unitPrice !== undefined && !isNaN(Number(formData.unitPrice))
      ? Number(formData.unitPrice)
      : selectedPackage.price || 0;

  const totalBeforeDiscount =
    packagePrice + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);

  let finalDiscountAmount = 0;
  const promoCode = promoCodes.find((p) => p.id === formData.promoCodeId);
  if (promoCode) {
    if (promoCode.discountType === 'percentage') {
      finalDiscountAmount = (totalBeforeDiscount * promoCode.discountValue) / 100;
    } else {
      finalDiscountAmount = promoCode.discountValue;
    }
  }

  const totalProject = totalBeforeDiscount - finalDiscountAmount;
  const dpAmount = Number(formData.dp) || 0;

  // 1. Mark lead status as CONVERTED
  await updateLeadRow(lead.id, { status: LeadStatus.CONVERTED });

  // 2. Create client row
  const createdClient = await createClientRow({
    name: formData.clientName,
    email: formData.email,
    phone: formData.phone,
    whatsapp: formData.whatsapp || undefined,
    instagram: '',
    clientType: ClientType.DIRECT,
    since: new Date().toISOString().split('T')[0],
    status: ClientStatus.ACTIVE,
    lastContact: new Date().toISOString(),
    portalAccessId: generateUUID(),
    address: formData.address || undefined,
  } as Omit<Client, 'id'>);

  // 3. Update lead with conversion note
  const conversionNote = `Dikonversi menjadi Pengantin ID: ${createdClient.id}`;
  await updateLeadRow(lead.id, { notes: conversionNote });

  // 4. Create project row
  const createdProjectRaw = await createProjectRow({
    projectName: `${formData.clientName}`,
    clientName: formData.clientName,
    clientId: createdClient.id,
    projectType: formData.projectType,
    packageName: selectedPackage.name,
    date: formData.date,
    location: formData.location,
    address: formData.address,
    status: 'Dikonfirmasi',
    totalCost: totalProject,
    amountPaid: dpAmount,
    paymentStatus:
      dpAmount >= totalProject
        ? PaymentStatus.LUNAS
        : dpAmount > 0
        ? PaymentStatus.DP_TERBAYAR
        : PaymentStatus.BELUM_BAYAR,
    durationSelection: formData.durationSelection || undefined,
    unitPrice:
      formData.unitPrice !== undefined ? Number(formData.unitPrice) : undefined,
    notes: formData.notes || undefined,
    promoCodeId: formData.promoCodeId || undefined,
    discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : undefined,
    addOns: selectedAddOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    accommodation: undefined,
    driveLink: undefined,
    printingCost: undefined,
    transportCost: undefined,
    completedDigitalItems: [],
  });

  const createdProject: Project = { ...createdProjectRaw, addOns: selectedAddOns };

  let createdTransaction: Transaction | null = null;
  let updatedCardId: string | undefined;
  let updatedCardBalanceDelta: number | undefined;

  // 5. Create DP transaction if needed
  if (dpAmount > 0) {
    const selectedCard = cards.find((c) => c.id === formData.dpDestinationCardId);
    const supaCardId = selectedCard
      ? await findCardIdByMeta(selectedCard.bankName, selectedCard.lastFourDigits)
      : null;

    try {
      createdTransaction = await createTransactionRow({
        date: new Date().toISOString().split('T')[0],
        description: `DP Acara Pernikahan ${createdProject.projectName}`,
        amount: dpAmount,
        type: TransactionType.INCOME,
        projectId: createdProject.id,
        category: 'DP Acara Pernikahan',
        method: 'Transfer Bank',
        cardId: supaCardId || undefined,
      } as Omit<Transaction, 'id' | 'vendorSignature'>);

      if (supaCardId && formData.dpDestinationCardId) {
        updatedCardId = formData.dpDestinationCardId;
        updatedCardBalanceDelta = dpAmount;
      }
    } catch (err) {
      logger.warn('[Supabase] DP convert lead transaction failed, using local fallback.', err);
      createdTransaction = {
        id: `TRN-DP-${createdProject.id}`,
        date: new Date().toISOString().split('T')[0],
        description: `DP Acara Pernikahan ${createdProject.projectName}`,
        amount: dpAmount,
        type: TransactionType.INCOME,
        projectId: createdProject.id,
        category: 'DP Acara Pernikahan',
        method: 'Transfer Bank',
        cardId: formData.dpDestinationCardId,
      };
      if (formData.dpDestinationCardId) {
        updatedCardId = formData.dpDestinationCardId;
        updatedCardBalanceDelta = dpAmount;
      }
    }
  }

  return {
    createdClient,
    createdProject,
    createdTransaction,
    updatedCardId,
    updatedCardBalanceDelta,
    promoCodeIdUsed: promoCode?.id,
    conversionNote,
  };
}
