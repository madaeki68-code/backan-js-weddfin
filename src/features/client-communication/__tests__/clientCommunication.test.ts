import { describe, it, expect } from 'vitest';
import { normalizeWhatsAppNumber, formatDisplayPhoneNumber, isValidWhatsAppNumber } from '../utils/phone';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { interpolateTemplate, buildContextVariables } from '../utils/templateProcessor';
import { computeClientReminders } from '../utils/reminders';
import { filterInteractionsForClient, assertClientLogIntegrity } from '../utils/clientIsolation';
import { ClientInteractionLog } from '../types';

describe('Client Communication Domain Unit Tests', () => {
  describe('Phone Normalization Utils', () => {
    it('normalizes 08... phone numbers to 628...', () => {
      expect(normalizeWhatsAppNumber('08123456789')).toBe('628123456789');
      expect(normalizeWhatsAppNumber('+62 812 3456 789')).toBe('628123456789');
      expect(normalizeWhatsAppNumber('628123456789')).toBe('628123456789');
    });

    it('validates Indonesian WhatsApp numbers correctly', () => {
      expect(isValidWhatsAppNumber('08123456789')).toBe(true);
      expect(isValidWhatsAppNumber('123')).toBe(false);
      expect(isValidWhatsAppNumber('')).toBe(false);
    });

    it('formats phone numbers for clean display', () => {
      expect(formatDisplayPhoneNumber('08123456789')).toBe('+62 812-3456-789');
    });
  });

  describe('WhatsApp Link Generator', () => {
    it('creates a valid wa.me link with encoded text message', () => {
      const url = buildWhatsAppLink('08123456789', 'Halo Budi, terima kasih!');
      expect(url).toContain('https://wa.me/628123456789?text=Halo%20Budi%2C%20terima%20kasih!');
    });
  });

  describe('Template Processor', () => {
    it('replaces context variables in templates correctly', () => {
      const template = 'Halo {clientName}, tagihan sebesar {sisaTagihan} untuk {projectName} belum lunas.';
      const variables = {
        clientName: 'Siti & Agus',
        sisaTagihan: 'Rp 2.500.000',
        projectName: 'Wedding Siti & Agus',
      };
      const result = interpolateTemplate(template, variables);
      expect(result).toBe('Halo Siti & Agus, tagihan sebesar Rp 2.500.000 untuk Wedding Siti & Agus belum lunas.');
    });

    it('builds context variables from actual client, project, and profile data', () => {
      const mockClient = {
        id: 'c1',
        name: 'Rina & Dedi',
        phone: '081299998888',
        email: 'rina@example.com',
        status: 'Active',
      } as any;

      const mockProject = {
        id: 'p1',
        projectName: 'Akad & Resepsi Rina',
        date: '2026-12-25',
        totalCost: 15000000,
        amountPaid: 5000000,
        packageName: 'Luxury Package',
      } as any;

      const mockProfile = {
        companyName: 'VENA Pictures',
        bankAccount: 'BCA - 1234567890 (a.n. VENA Official)',
      } as any;

      const vars = buildContextVariables({ client: mockClient, project: mockProject, profile: mockProfile });
      expect(vars.clientName).toBe('Rina & Dedi');
      expect(vars.projectName).toBe('Akad & Resepsi Rina');
      expect(vars.sisaTagihan).toContain('10.000.000');
      expect(vars.companyName).toBe('VENA Pictures');
      expect(vars.bankAccount).toBe('BCA - 1234567890 (a.n. VENA Official)');
    });
  });

  describe('Client Isolation Filters', () => {
    it('strictly isolates interaction logs per clientId', () => {
      const logs: ClientInteractionLog[] = [
        { id: '1', clientId: 'c1', clientName: 'A', recipientPhone: '1', message: 'Hi', channel: 'whatsapp', type: 'chat', timestamp: '2026-01-01' },
        { id: '2', clientId: 'c2', clientName: 'B', recipientPhone: '2', message: 'Hello', channel: 'whatsapp', type: 'chat', timestamp: '2026-01-02' },
      ];

      const c1Logs = filterInteractionsForClient(logs, 'c1');
      expect(c1Logs.length).toBe(1);
      expect(c1Logs[0].clientId).toBe('c1');
    });

    it('validates client log integrity', () => {
      const validLog: ClientInteractionLog = {
        id: '1',
        clientId: 'c1',
        clientName: 'A',
        recipientPhone: '1',
        message: 'Hello',
        channel: 'whatsapp',
        type: 'chat',
        timestamp: '2026-01-01',
      };

      expect(assertClientLogIntegrity(validLog, 'c1')).toBe(true);
      expect(assertClientLogIntegrity(validLog, 'c2')).toBe(false);
    });
  });

  describe('Reminders Calculator', () => {
    it('computes reminders for upcoming events and unpaid balances without duplication', () => {
      const mockClients = [
        {
          id: 'c1',
          name: 'Maya',
          phone: '081211112222',
        } as any,
      ];

      const mockProjects = [
        {
          id: 'p1',
          clientId: 'c1',
          projectName: 'Maya Wedding',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalCost: 10000000,
          amountPaid: 2000000,
        } as any,
      ];

      const reminders = computeClientReminders(mockClients, mockProjects, []);
      expect(reminders.length).toBeGreaterThan(0);
      const paymentReminder = reminders.find(r => r.type === 'payment_due');
      expect(paymentReminder).toBeDefined();
      expect(paymentReminder?.clientId).toBe('c1');
    });
  });
});
