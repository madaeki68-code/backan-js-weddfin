import { describe, it, expect, vi } from 'vitest';
import { PaymentStatus, Client, Project, Transaction, Package, TeamProjectPayment, ClientStatus, ClientType } from '../../../types';

describe('Wedding Detail Domain Logic', () => {
  const dummyClient: Client = {
    id: 'client-1',
    name: 'Romeo & Juliet',
    phone: '081234567890',
    whatsapp: '081234567890',
    email: 'romeo@example.com',
    status: ClientStatus.ACTIVE,
    clientType: ClientType.DIRECT,
    since: '2026-01-15',
    lastContact: '2026-01-15',
    portalAccessId: 'portal-1',
  };

  const dummyProject: Project = {
    id: 'proj-1',
    clientId: 'client-1',
    projectName: 'Pernikahan Romeo & Juliet',
    clientName: 'Romeo & Juliet',
    projectType: 'Pernikahan',
    date: '2026-11-20',
    location: 'Grand Ballroom Jakarta',
    packageId: 'pkg-1',
    packageName: 'Premium Wedding Story',
    packagePrice: 15000000,
    totalCost: 17500000,
    amountPaid: 5000000,
    paymentStatus: PaymentStatus.DP_TERBAYAR,
    status: 'Terjadwal',
    progress: 40,
    addOns: [],
    team: [],
    activeSubStatuses: ['Moodboard Disetujui', 'Technical Meeting Selesai'],
    customSubStatuses: [
      { name: 'Moodboard Disetujui', note: '' },
      { name: 'Technical Meeting Selesai', note: '' },
      { name: 'Shoot Hari H', note: '' },
      { name: 'Editing Selesai', note: '' },
      { name: 'Penyerahan File', note: '' },
    ],
    extraCharges: [
      { id: 'ec-1', name: 'Charge Overtime 2 Jam', amount: 2500000 },
    ],
  };

  it('calculates remaining balance and payment status correctly for partial DP', () => {
    const totalCost = dummyProject.totalCost;
    const amountPaid = dummyProject.amountPaid;
    const remainingBalance = Math.max(0, totalCost - amountPaid);

    expect(remainingBalance).toBe(12500000);
    expect(amountPaid < totalCost && amountPaid > 0).toBe(true);
  });

  it('calculates payment status as LUNAS when fully paid', () => {
    const totalCost = 17500000;
    const amountPaid = 17500000;
    let paymentStatus = PaymentStatus.BELUM_BAYAR;

    if (amountPaid >= totalCost && totalCost > 0) {
      paymentStatus = PaymentStatus.LUNAS;
    } else if (amountPaid > 0) {
      paymentStatus = PaymentStatus.DP_TERBAYAR;
    }

    expect(paymentStatus).toBe(PaymentStatus.LUNAS);
  });

  it('computes sub-status progress percentage accurately', () => {
    const allSub = dummyProject.customSubStatuses || [];
    const activeSub = dummyProject.activeSubStatuses || [];
    const completedCount = allSub.filter(s => activeSub.includes(s.name)).length;
    const totalCount = allSub.length;
    const percent = Math.round((completedCount / totalCount) * 100);

    expect(completedCount).toBe(2);
    expect(totalCount).toBe(5);
    expect(percent).toBe(40);
  });

  it('calculates net estimated profit by subtracting team fees and expenses from total cost', () => {
    const totalCost = 17500000;
    const teamFees = 4000000; // 2 photographers @ 2jt
    const expenses = 1500000; // transport, meals, prints
    const profit = totalCost - teamFees - expenses;

    expect(profit).toBe(12000000);
    const margin = Math.round((profit / totalCost) * 100);
    expect(margin).toBe(69);
  });

  it('correctly calculates wedding countdown days for future, today, and past events', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 10);
    const diffFuture = Math.ceil((futureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffFuture).toBe(10);

    const todayDate = new Date(today);
    const diffToday = Math.ceil((todayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffToday).toBe(0);

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 5);
    const diffPast = Math.ceil((pastDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffPast).toBe(-5);
  });

  it('resolves delivery address from homeAddress or address fallback', () => {
    const clientWithHome: Partial<Client> = {
      name: 'Test Client',
      homeAddress: 'Jl. Melati No. 10 Jakarta',
      address: 'Jl. Kantor No. 1',
    };
    const delivery1 = clientWithHome.homeAddress || clientWithHome.address;
    expect(delivery1).toBe('Jl. Melati No. 10 Jakarta');

    const clientWithoutHome: Partial<Client> = {
      name: 'Test Client 2',
      address: 'Jl. Raya Bogor No. 50',
    };
    const delivery2 = clientWithoutHome.homeAddress || clientWithoutHome.address;
    expect(delivery2).toBe('Jl. Raya Bogor No. 50');
  });

  it('correctly categorizes tabs into 3 primary groups: acara, pembayaran, and invoice', () => {
    const resolvePrimaryTab = (tab: string): 'acara' | 'pembayaran' | 'invoice' => {
      if (tab === 'payment' || tab === 'pembayaran') return 'pembayaran';
      if (tab === 'invoice') return 'invoice';
      return 'acara';
    };

    expect(resolvePrimaryTab('overview')).toBe('acara');
    expect(resolvePrimaryTab('schedule')).toBe('acara');
    expect(resolvePrimaryTab('package')).toBe('acara');
    expect(resolvePrimaryTab('team')).toBe('acara');
    expect(resolvePrimaryTab('tasks')).toBe('acara');
    expect(resolvePrimaryTab('timeline')).toBe('acara');
    expect(resolvePrimaryTab('communication')).toBe('acara');
    expect(resolvePrimaryTab('payment')).toBe('pembayaran');
    expect(resolvePrimaryTab('pembayaran')).toBe('pembayaran');
    expect(resolvePrimaryTab('invoice')).toBe('invoice');
  });
});


