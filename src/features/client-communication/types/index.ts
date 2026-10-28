import {
  Client,
  Project,
  Lead,
  Profile,
  PaymentStatus,
} from '../../../types';

export type CommunicationChannel = 'whatsapp' | 'email' | 'phone' | 'portal';

export type CommunicationStatus = 'draft' | 'ready' | 'sent' | 'cancelled';

export type MessageTemplateCategory =
  | 'lead_initial'
  | 'lead_followup'
  | 'payment_reminder'
  | 'event_reminder'
  | 'progress_update'
  | 'confirmation'
  | 'custom';

export interface CommunicationTemplate {
  id: string;
  title: string;
  category: MessageTemplateCategory;
  template: string;
  variables: string[];
  description?: string;
  isDefault?: boolean;
}

export interface ClientInteractionLog {
  id: string;
  clientId: string;
  leadId?: string;
  projectId?: string;
  clientName: string;
  channel: CommunicationChannel;
  type:
    | 'chat'
    | 'payment_reminder'
    | 'event_reminder'
    | 'catalog_share'
    | 'portal_share'
    | 'custom';
  message: string;
  timestamp: string; // ISO String
  recipientPhone?: string;
  sentBy?: string;
  status?: 'sent' | 'failed' | 'scheduled';
  metadata?: Record<string, string | number | boolean>;
}

export type FollowUpPriority = 'high' | 'medium' | 'low';
export type FollowUpStatus = 'pending' | 'completed' | 'dismissed';
export type FollowUpType =
  | 'lead_discussion'
  | 'payment_due'
  | 'event_upcoming'
  | 'post_event'
  | 'document'
  | 'general';

export interface ClientFollowUp {
  id: string;
  clientId: string;
  clientName: string;
  leadId?: string;
  projectId?: string;
  title: string;
  type: FollowUpType;
  priority: FollowUpPriority;
  dueDate: string; // YYYY-MM-DD
  status: FollowUpStatus;
  notes?: string;
  suggestedTemplateId?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReminderType = 'payment_due' | 'wedding_upcoming' | 'lead_followup';

export interface ClientReminder {
  id: string; // Deterministic unique key to prevent duplicate alerts
  clientId: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  leadId?: string;
  type: ReminderType;
  dueDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  suggestedMessage: string;
  targetPhone?: string;
  amountDue?: number;
  isDismissed?: boolean;
  sentAt?: string;
}

export interface WhatsAppMessagePayload {
  phone: string;
  message: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  templateId?: string;
}

export interface CommunicationContextData {
  client?: Client | null;
  project?: Project | null;
  lead?: Lead | null;
  profile?: Profile | null;
}
