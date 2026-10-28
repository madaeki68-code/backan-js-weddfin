import { Project, Client, Transaction, TeamProjectPayment, TeamPaymentRecord, TransactionType } from '../../../types';
import { updateProject as updateProjectInDb } from '../../../services/projects';
import { updateClient as updateClientInDb } from '../../../services/clients';
import { createTransaction as createTransactionInDb, deleteTransaction as deleteTransactionInDb } from '../../../services/transactions';
import {
  listProjectMeetings,
  createCalendarEvent,
  deleteCalendarEvent,
  encodeProjectMeetingNotes,
  ProjectMeeting,
  ProjectMeetingKind,
} from '../../../services/calendarEvents';
import { uploadDpProof } from '../../../services/storage';
import { updateTeamProjectPayments as updateTeamPaymentsInDb } from '../../../services/teamProjectPayments';
import { createTeamPaymentRecord } from '../../../services/teamPaymentRecords';
import { updatePocket as updatePocketInDb } from '../../../services/pockets';

export const weddingDetailService = {
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    return await updateProjectInDb(projectId, updates as any);
  },

  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    return await updateClientInDb(clientId, updates as any);
  },

  async uploadPaymentProof(file: File, _clientName?: string): Promise<string> {
    return await uploadDpProof(file);
  },

  async recordIncomeTransaction(params: {
    projectId: string;
    clientName: string;
    amount: number;
    destinationCardId: string;
    description: string;
    proofUrl?: string;
  }): Promise<Transaction> {
    const today = new Date().toISOString().split('T')[0];
    const newTx: Omit<Transaction, 'id'> = {
      date: today,
      description: params.description,
      amount: params.amount,
      type: TransactionType.INCOME,
      category: 'Pembayaran Pengantin',
      cardId: params.destinationCardId,
      method: 'Transfer Bank',
      projectId: params.projectId,
    };
    return await createTransactionInDb(newTx);
  },

  async recordExpenseTransaction(params: {
    projectId: string;
    clientName: string;
    amount: number;
    sourceId: string;
    sourceType: 'pocket' | 'card';
    category: string;
    description: string;
    date: string;
  }): Promise<Transaction> {
    const isPocket = params.sourceType === 'pocket';
    const newTx: Omit<Transaction, 'id'> = {
      date: params.date,
      description: params.description,
      amount: params.amount,
      type: TransactionType.EXPENSE,
      category: params.category,
      cardId: isPocket ? undefined : params.sourceId,
      pocketId: isPocket ? params.sourceId : undefined,
      method: 'Transfer Bank',
      projectId: params.projectId,
    };
    return await createTransactionInDb(newTx);
  },

  async deleteExpenseTransaction(txId: string): Promise<void> {
    await deleteTransactionInDb(txId);
  },

  async getMeetings(projectId: string): Promise<ProjectMeeting[]> {
    return await listProjectMeetings(projectId);
  },

  async addMeeting(meetingInput: {
    projectId: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
    agenda?: string;
    kind?: ProjectMeetingKind;
    zoomUrl?: string;
  }): Promise<ProjectMeeting> {
    const startTimeStr = meetingInput.time ? `${meetingInput.date}T${meetingInput.time}:00` : `${meetingInput.date}T10:00:00`;
    const endTimeStr = meetingInput.time
      ? `${meetingInput.date}T${String(Number(meetingInput.time.slice(0, 2)) + 1).padStart(2, '0')}:${meetingInput.time.slice(3)}:00`
      : `${meetingInput.date}T11:00:00`;

    const notes = encodeProjectMeetingNotes({
      projectId: meetingInput.projectId,
      kind: meetingInput.kind || 'regular',
      zoomUrl: meetingInput.zoomUrl || '',
      location: meetingInput.location || '',
      resultNotes: meetingInput.agenda || '',
    });

    const event = await createCalendarEvent({
      title: meetingInput.title,
      eventType: 'Meeting',
      date: meetingInput.date,
      startAt: startTimeStr,
      endAt: endTimeStr,
      allDay: false,
      projectId: meetingInput.projectId,
      location: meetingInput.location || '',
      notes,
    });

    return {
      event,
      metadata: {
        projectId: meetingInput.projectId,
        kind: meetingInput.kind || 'regular',
        zoomUrl: meetingInput.zoomUrl || '',
        location: meetingInput.location || '',
        resultNotes: meetingInput.agenda || '',
      },
    };
  },

  async deleteMeeting(meetingId: string): Promise<void> {
    await deleteCalendarEvent(meetingId);
  },

  async updateTeamProjectPayments(payments: TeamProjectPayment[]): Promise<TeamProjectPayment[]> {
    return await updateTeamPaymentsInDb(payments);
  },

  async recordTeamPaymentSlip(record: Omit<TeamPaymentRecord, 'id'>): Promise<TeamPaymentRecord> {
    return await createTeamPaymentRecord(record);
  },

  async updatePocket(pocketId: string, updates: any): Promise<any> {
    return await updatePocketInDb(pocketId, updates);
  },
};
