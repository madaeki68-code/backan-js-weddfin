import { PrismaClient, UserRole, TeamRole, ProjectStatus, TransactionType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding for Attera Visual...');

  // 1. Password hash untuk akun owner (Password123!)
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  const user = await prisma.user.upsert({
    where: { email: 'admin@atteravisual.com' },
    update: {},
    create: {
      id: userId,
      email: 'admin@atteravisual.com',
      passwordHash,
      role: UserRole.admin,
      isActive: true,
      profile: {
        create: {
          businessName: 'Attera Visual Artistry',
          ownerName: 'Nopian Hadi',
          phone: '+6281234567890',
          address: 'Jl. Ranggagading No. 14, Bandung',
          instagramHandle: '@atteravisual',
          websiteUrl: 'https://atteravisual.id',
          mobileUiScale: 1.0,
        },
      },
    },
  });
  console.log(`✅ User & Profile created: ${user.email}`);

  // 2. Rekening Bank (Cards)
  const cardBca = await prisma.card.upsert({
    where: { id: 'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01' },
    update: {},
    create: {
      id: 'c11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      profileId: userId,
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'NOPIAN HADI',
      currentBalance: 45000000.0,
      isPrimary: true,
    },
  });

  await prisma.card.upsert({
    where: { id: 'c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02' },
    update: {},
    create: {
      id: 'c12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
      profileId: userId,
      bankName: 'Bank Mandiri',
      accountNumber: '9876543210',
      accountHolder: 'ATTERA VISUAL CV',
      currentBalance: 15000000.0,
      isPrimary: false,
    },
  });
  console.log('✅ Bank Accounts (Cards) seeded');

  // 3. Pos Anggaran (Pockets)
  await prisma.pocket.upsert({
    where: { id: 'f11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01' },
    update: {},
    create: {
      id: 'f11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      profileId: userId,
      name: 'Operasional & Produksi',
      targetPercentage: 40.0,
      currentAmount: 24000000.0,
      color: '#10B981',
    },
  });

  await prisma.pocket.upsert({
    where: { id: 'f12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02' },
    update: {},
    create: {
      id: 'f12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
      profileId: userId,
      name: 'Honor Kru Lapangan',
      targetPercentage: 35.0,
      currentAmount: 21000000.0,
      color: '#6366F1',
    },
  });
  console.log('✅ Pockets (Budget) seeded');

  // 4. Paket Foto & Video
  const packageDiamond = await prisma.package.upsert({
    where: { id: 'e11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01' },
    update: {},
    create: {
      id: 'e11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      profileId: userId,
      name: 'Diamond Full Wedding Day',
      category: 'Wedding',
      price: 18500000.0,
      description: 'Liputan lengkap akad hingga resepsi malam.',
      features: [
        '2 Fotografer Senior',
        '2 Videografer Cinematic',
        '1 Pilot Drone 4K',
        '1 Album Kolase 30x40 20 Halaman',
        'Teaser 1 Menit & Video Dokumenter 15 Menit',
        'Semua File Mentah + 100 Edit Foto di Flashdisk Box Kayu',
      ],
      isActive: true,
    },
  });
  console.log('✅ Packages seeded');

  // 5. Tim Kru Lapangan
  const crewPhotographer = await prisma.teamMember.upsert({
    where: { id: 'a11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01' },
    update: {},
    create: {
      id: 'a11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      profileId: userId,
      name: 'Reza Pramana',
      role: TeamRole.photographer,
      phone: '+628112233441',
      standardFee: 1200000.0,
      isActive: true,
    },
  });

  await prisma.teamMember.upsert({
    where: { id: 'a12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02' },
    update: {},
    create: {
      id: 'a12ebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
      profileId: userId,
      name: 'Fajar Ramadhan',
      role: TeamRole.videographer,
      phone: '+628112233442',
      standardFee: 1200000.0,
      isActive: true,
    },
  });
  console.log('✅ Team Members seeded');

  // 6. Klien Pengantin
  const clientDimas = await prisma.client.upsert({
    where: { id: 'b11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01' },
    update: {},
    create: {
      id: 'b11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      profileId: userId,
      groomName: 'Dimas Prasetyo',
      brideName: 'Sarah Anindita',
      phone: '+6281399887766',
      email: 'sarah.dimas@gmail.com',
      address: 'Dago Asri, Bandung',
    },
  });

  // 7. Project Acara Pernikahan
  const projectDimas = await prisma.project.upsert({
    where: { id: 'd11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01' },
    update: {},
    create: {
      id: 'd11ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      profileId: userId,
      clientId: clientDimas.id,
      packageId: packageDiamond.id,
      title: 'Wedding of Dimas & Sarah',
      eventDate: new Date('2026-12-19'),
      venueName: 'Gedong Putih Villa & Hall',
      venueCity: 'Bandung Barat',
      status: ProjectStatus.confirmed,
      totalPackagePrice: 18500000.0,
      totalAddonPrice: 1500000.0,
      discountAmount: 1000000.0,
      grandTotal: 19000000.0,
      amountPaid: 10000000.0,
      notes: 'Konsep rustic outdoor, akad jam 08.00 WIB, resepsi 18.30 WIB.',
    },
  });
  console.log('✅ Project seeded');

  // 8. Penugasan Kru Proyek
  await prisma.projectTeamAssignment.upsert({
    where: {
      projectId_teamMemberId: {
        projectId: projectDimas.id,
        teamMemberId: crewPhotographer.id,
      },
    },
    update: {},
    create: {
      id: 'a21ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      projectId: projectDimas.id,
      teamMemberId: crewPhotographer.id,
      assignedRole: TeamRole.photographer,
      agreedFee: 1200000.0,
      isConfirmed: true,
    },
  });

  // 9. Transaksi DP Masuk
  await prisma.transaction.upsert({
    where: { id: 'e21ebc99-9c0b-4ef8-bb6d-6bb9bd380a01' },
    update: {},
    create: {
      id: 'e21ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      profileId: userId,
      projectId: projectDimas.id,
      cardId: cardBca.id,
      type: TransactionType.income,
      amount: 10000000.0,
      transactionDate: new Date('2026-10-20'),
      description: 'DP 50% Wedding Dimas & Sarah',
      referenceNumber: 'TRX-BCA-20261020-001',
    },
  });

  // 10. Galeri Client Portal
  await prisma.gallery.upsert({
    where: { projectId: projectDimas.id },
    update: {},
    create: {
      id: 'f21ebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
      projectId: projectDimas.id,
      slug: 'dimas-sarah-wedding',
      accessCode: 'ATTERA2026',
      isPublished: true,
      downloadAllowed: true,
    },
  });

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
