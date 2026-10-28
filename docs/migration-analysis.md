# Analisis Migrasi Supabase ke NestJS Backend

**Tanggal**: 28 Oktober 2026  
**Status**: Sebagian selesai, perlu dilanjutkan

## ✅ Yang Sudah Selesai

### 1. **Backend Infrastructure**
- [x] NestJS project structure dengan Prisma ORM
- [x] PostgreSQL database schema lengkap
- [x] Authentication dengan JWT dan refresh tokens
- [x] User login sessions tracking
- [x] Profile settings management

### 2. **Storage System**
- [x] File-based storage dengan metadata di Prisma
- [x] Upload endpoint terautentikasi (`/storage/upload`)
- [x] Public access untuk folder tertentu (assets, gallery-images, dll)
- [x] Private access dengan validasi profileId untuk bukti pembayaran
- [x] File type validation (JPEG, PNG, WebP, GIF, SVG, PDF)
- [x] File size limit (10 MB)
- [x] Magic byte validation untuk keamanan

**File**: `backend/src/modules/storage/storage.service.ts`

### 3. **Finance Module**
- [x] Cards (kartu bank/debit) CRUD
- [x] Pockets (tabungan/pocket) CRUD
- [x] Transactions CRUD dengan relasi ke cards, pockets, projects
- [x] **Batch transactions** endpoint atomik (`POST /finance/transactions/batch`)
- [x] Automatic balance adjustment untuk cards
- [x] Transaction filters (type, category, date range, search)
- [x] Pagination support

**File**: `backend/src/modules/finance/finance.service.ts`

### 4. **Team Payments System**
- [x] Team project payments dengan status "Paid" yang terproteksi
- [x] **Reconcile endpoint** yang mempertahankan baris Paid saat sync ulang
- [x] Team payment records (bukti pembayaran batch)
- [x] Relasi ke projects dan team members
- [x] Validasi atomik dalam transaksi Prisma

**File**: `backend/src/modules/team-payments/team-payments.service.ts`

### 5. **Calendar System**
- [x] Calendar events CRUD
- [x] Relasi ke projects, clients, team members
- [x] Date range filtering
- [x] All-day events support
- [x] Tasks array per event
- [x] ICS feed dengan Google Calendar token (dapat dicabut)

**File**: `backend/src/modules/calendar/calendar.service.ts`

### 6. **Other Backend Modules**
- [x] Projects management
- [x] Clients management
- [x] Team members management
- [x] Packages & add-ons
- [x] Leads tracking
- [x] Galleries & gallery items
- [x] Client feedback
- [x] Project team assignments
- [x] Profile management

## 🔄 Dalam Proses / Perlu Dilanjutkan

### 1. **Frontend Migration**
Frontend masih menggunakan Supabase client untuk hampir semua operasi. Perlu diganti dengan API calls ke NestJS backend:

#### Services yang masih pakai Supabase:
- `src/services/cards.ts` - CRUD cards
- `src/services/addOns.ts` - Add-ons management
- `src/services/bioLinks.ts` - Bio link pages
- `src/services/clients.ts` - Clients dengan upload avatar
- `src/services/clientFeedback.ts` - Client feedback CRUD
- `src/services/packages.ts` - Packages CRUD
- `src/services/profile.ts` - Profile management
- `src/services/loginSessions.ts` - Login sessions tracking
- `src/services/mobileUiScale.ts` - UI scale settings
- Dan masih banyak lagi...

#### Auth State Management:
- `src/hooks/useDashboardStats.ts` masih pakai `supabase.auth.onAuthStateChange`
- Login sessions masih akses langsung ke Supabase

### 2. **Public Form Endpoints**
Form booking publik (tanpa autentikasi) masih pakai fallback Supabase untuk upload bukti:
- Perlu endpoint publik khusus di NestJS untuk receive booking submissions
- Upload bukti pembayaran dari form publik (tanpa session JWT)

### 3. **Storage Migration Strategy**
- File yang sudah ada di Supabase Storage belum dimigrasikan
- Perlu script untuk download dari Supabase → upload ke local storage
- Atau: hybrid approach (baca dulu dari local, fallback ke Supabase jika belum migrasi)

### 4. **Real-time Updates**
- Supabase real-time subscriptions belum ada pengganti
- Perlu implement WebSocket atau Server-Sent Events di NestJS
- Atau polling strategy untuk data updates

### 5. **Portal Access**
Client portal dan team portal masih pakai:
- `portal_access_id` di Clients & TeamMembers table
- Perlu endpoint public untuk akses portal tanpa login (via token)

### 6. **Calendar Feed ICS**
- Backend sudah ada Google Calendar feed token
- Perlu endpoint public untuk serve ICS file (dengan token validation)

## 📋 Rencana Lanjutan

### Priority 1: Frontend API Integration
1. **Buat abstraction layer** untuk semua service calls
   - Wrap Supabase calls dengan fungsi yang bisa diswitch ke NestJS
   - Environment variable untuk toggle mode (Supabase vs NestJS)

2. **Migrate service by service**:
   - Start: Cards, Pockets, Transactions (sudah ada backend)
   - Next: Team payments
   - Then: Storage upload calls
   - Finally: Others

### Priority 2: Public Endpoints
1. Booking form submission endpoint (no auth)
2. ICS calendar feed endpoint (token-based auth)
3. Client portal access endpoints
4. Team portal access endpoints

### Priority 3: Storage Migration
1. Script untuk inventory files di Supabase Storage
2. Batch download & re-upload ke local storage
3. Update database references (URLs)
4. Verify integrity

### Priority 4: Real-time Features
1. Evaluate need for real-time (most features might not need it)
2. If needed: implement SSE or WebSocket in NestJS
3. Update frontend subscriptions

## 🗂️ File Structure

### Backend (NestJS)
```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── src/
│   ├── modules/
│   │   ├── auth/              # JWT authentication ✅
│   │   ├── storage/           # File storage ✅
│   │   ├── finance/           # Cards, pockets, transactions ✅
│   │   ├── team-payments/     # Team payments system ✅
│   │   ├── calendar/          # Calendar events ✅
│   │   ├── projects/          # Projects management ✅
│   │   ├── clients/           # Clients management ✅
│   │   ├── team-members/      # Team members ✅
│   │   ├── packages/          # Packages ✅
│   │   ├── add-ons/           # Add-ons ✅
│   │   ├── leads/             # Leads ✅
│   │   ├── galleries/         # Galleries ✅
│   │   └── ...
│   └── database/
│       └── prisma.service.ts  # Prisma client wrapper
└── uploads/                   # Local file storage
```

### Frontend (React + Vite)
```
src/
├── services/                  # API service layers (NEED MIGRATION ⚠️)
│   ├── cards.ts
│   ├── clients.ts
│   ├── profile.ts
│   └── ...
├── hooks/                     # React hooks (some need update ⚠️)
└── components/                # UI components
```

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
STORAGE_DIRECTORY="./uploads"
PUBLIC_API_URL="http://localhost:4000/api/v1"
```

### Frontend (.env)
```
VITE_API_BASE_URL="http://localhost:4000/api/v1"
VITE_SUPABASE_URL="..." # Still needed during transition
VITE_SUPABASE_ANON_KEY="..." # Still needed during transition
```

## 📊 Migration Progress Estimate

| Module | Backend | Frontend | Progress |
|--------|---------|----------|----------|
| Auth & Users | ✅ | ⚠️ | 70% |
| Storage | ✅ | ⚠️ | 60% |
| Finance | ✅ | ❌ | 50% |
| Team Payments | ✅ | ❌ | 50% |
| Calendar | ✅ | ❌ | 50% |
| Projects | ✅ | ❌ | 50% |
| Clients | ✅ | ❌ | 50% |
| Packages | ✅ | ❌ | 50% |
| Galleries | ✅ | ❌ | 50% |
| Portal Access | ⚠️ | ❌ | 20% |
| Real-time | ❌ | ❌ | 0% |

**Overall: ~45% Complete**

## 🎯 Next Steps

1. **Immediate**: Create API client wrapper di frontend
2. **Week 1**: Migrate Finance & Team Payments frontend calls
3. **Week 2**: Migrate Storage upload calls
4. **Week 3**: Public endpoints (booking form, ICS feed)
5. **Week 4**: Remaining services migration
6. **Week 5-6**: Storage file migration & testing
7. **Week 7**: Remove Supabase dependencies

## ⚠️ Risks & Considerations

1. **Data consistency**: Pastikan tidak ada data loss selama migrasi
2. **Downtime**: Plan deployment strategy untuk minimize downtime
3. **File migration**: Large files might take time, need bandwidth
4. **Testing**: Comprehensive testing needed before switching
5. **Rollback plan**: Keep Supabase as fallback during transition period

## 📝 Notes

- Backend menggunakan Prisma dengan PostgreSQL
- Semua endpoint backend di `/api/v1`
- Storage files di `backend/uploads/`
- Authentication: JWT access token (15 min) + refresh token (7 days)
- All backend services use transactions untuk atomicity
- Status "Paid" di team payments terproteksi dari overwrite saat reconcile
