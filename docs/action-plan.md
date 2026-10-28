# Action Plan: Lanjutan Migrasi Backend

## 🎯 Objective
Menyelesaikan migrasi dari Supabase ke NestJS backend yang sudah dibuat, dengan fokus pada integrasi frontend dan endpoint-endpoint yang masih kurang.

## 📋 Task Breakdown

### Phase 1: Frontend API Client Infrastructure (1-2 hari)

#### Task 1.1: Create API Client Service
**File**: `src/services/api-client.ts`
- [ ] Base HTTP client dengan axios/fetch
- [ ] Automatic JWT token injection
- [ ] Refresh token logic
- [ ] Error handling & retry logic
- [ ] Request/response interceptors
- [ ] TypeScript types untuk semua endpoints

#### Task 1.2: Create Service Adapters
**Files**: `src/services/adapters/*.ts`
- [ ] `FinanceAdapter` - wrap cards, pockets, transactions
- [ ] `TeamPaymentsAdapter` - wrap team payments
- [ ] `StorageAdapter` - wrap upload/download
- [ ] `CalendarAdapter` - wrap calendar events
- [ ] `ProjectsAdapter` - wrap projects
- [ ] `ClientsAdapter` - wrap clients

#### Task 1.3: Feature Flag System
**File**: `src/config/features.ts`
- [ ] Environment-based toggle (USE_NESTJS_API)
- [ ] Per-module toggle (finance, storage, calendar, etc)
- [ ] Automatic fallback ke Supabase jika API error

---

### Phase 2: Finance Module Frontend Integration (2-3 hari)

#### Task 2.1: Migrate Cards Service
**File**: `src/services/cards.ts`
- [ ] Replace `supabase.from('cards')` dengan API calls
- [ ] Update `listCards()` → `GET /finance/cards`
- [ ] Update `createCard()` → `POST /finance/cards`
- [ ] Update `updateCard()` → `PATCH /finance/cards/:id`
- [ ] Update `deleteCard()` → `DELETE /finance/cards/:id`
- [ ] Test integration

#### Task 2.2: Migrate Pockets (jika ada service terpisah)
- [ ] Similar pattern dengan cards

#### Task 2.3: Migrate Transactions Service
**File**: `src/services/transactions.ts` (jika ada)
- [ ] Replace dengan API calls
- [ ] Implement batch transactions call
- [ ] Update filters & pagination
- [ ] Test integration

#### Task 2.4: Update Finance Components
- [ ] Update semua komponen yang pakai finance services
- [ ] Test CRUD operations
- [ ] Test balance calculations
- [ ] Verify error handling

---

### Phase 3: Storage Module Frontend Integration (2 hari)

#### Task 3.1: Create Storage Service Wrapper
**File**: `src/services/storage.ts`
- [ ] `uploadFile(file, folder)` → `POST /storage/upload`
- [ ] `getPublicUrl(id)` → construct URL
- [ ] `getPrivateUrl(id)` → construct URL dengan auth
- [ ] `deleteFile(id)` → `DELETE /storage/assets/:id`

#### Task 3.2: Replace Avatar Upload in Clients
**File**: `src/services/clients.ts`
- [ ] Replace `supabase.storage.from('gallery-images').upload()`
- [ ] Use new storage service
- [ ] Update avatar URL references

#### Task 3.3: Update Image Upload Components
- [ ] Project gallery uploads
- [ ] Profile logo uploads
- [ ] Package cover uploads
- [ ] Payment proof uploads

---

### Phase 4: Team Payments Frontend Integration (1-2 hari)

#### Task 4.1: Create Team Payments Service
**File**: `src/services/team-payments.ts`
- [ ] `listTeamPayments(projectId)` → `GET /team-payments/projects/:id`
- [ ] `reconcileTeamPayments(projectId, items)` → `POST /team-payments/projects/:id/reconcile`
- [ ] `updatePaymentStatus(id, status)` → `PATCH /team-payments/:id`
- [ ] `listPaymentRecords()` → `GET /team-payments/records`
- [ ] `createPaymentRecord(data)` → `POST /team-payments/records`

#### Task 4.2: Update Team Payments UI
- [ ] Replace Supabase calls di komponen
- [ ] Test reconcile logic
- [ ] Verify "Paid" status protection
- [ ] Test payment records

---

### Phase 5: Calendar Frontend Integration (1 hari)

#### Task 5.1: Migrate Calendar Service
**File**: `src/services/calendar.ts`
- [ ] `listEvents(from, to, projectId)` → `GET /calendar/events`
- [ ] `createEvent(data)` → `POST /calendar/events`
- [ ] `updateEvent(id, data)` → `PATCH /calendar/events/:id`
- [ ] `deleteEvent(id)` → `DELETE /calendar/events/:id`

#### Task 5.2: Update Calendar Components
- [ ] Calendar view
- [ ] Event creation modal
- [ ] Event editing
- [ ] Filters

---

### Phase 6: Public Endpoints (2-3 hari)

#### Task 6.1: Booking Form Public Endpoint
**Backend**: `backend/src/modules/bookings/` (NEW)
- [ ] Create `BookingsModule`
- [ ] `POST /bookings/submit` (no auth required)
- [ ] Accept form data + file upload (proof)
- [ ] Store di database
- [ ] Send notification email (optional)

**Frontend**: `src/components/BookingForm.tsx`
- [ ] Replace Supabase call dengan public API
- [ ] Handle file upload
- [ ] Success/error handling

#### Task 6.2: ICS Calendar Feed Endpoint
**Backend**: `backend/src/modules/calendar/calendar-feed.controller.ts`
- [ ] `GET /calendar/feed/:token` (public, validate token)
- [ ] Generate ICS file dari calendar events
- [ ] Stream response dengan correct MIME type
- [ ] Cache strategy (optional)

**Frontend**: 
- [ ] Generate feed URL untuk user
- [ ] Copy-to-clipboard functionality
- [ ] Token refresh/revoke UI

#### Task 6.3: Client Portal Access
**Backend**: `backend/src/modules/portal/`
- [ ] `GET /portal/client/:accessId` (public, validate access ID)
- [ ] Return client info + projects + galleries
- [ ] Access logging

**Frontend**: `src/pages/ClientPortal.tsx`
- [ ] Replace Supabase queries
- [ ] Test access control

#### Task 6.4: Team Portal Access
Similar pattern dengan client portal

---

### Phase 7: Remaining Services Migration (3-4 hari)

#### Task 7.1: Projects Service
**File**: `src/services/projects.ts`
- [ ] List, create, update, delete
- [ ] Filters & search
- [ ] Relations (client, package, team)

#### Task 7.2: Clients Service
**File**: `src/services/clients.ts`
- [ ] Complete migration
- [ ] Search & pagination
- [ ] Avatar uploads (already done in Phase 3)

#### Task 7.3: Packages Service
**File**: `src/services/packages.ts`
- [ ] CRUD operations
- [ ] Cover image uploads

#### Task 7.4: Add-ons Service
**File**: `src/services/addOns.ts`
- [ ] CRUD operations

#### Task 7.5: Team Members Service
**File**: `src/services/team-members.ts`
- [ ] CRUD operations
- [ ] Avatar uploads

#### Task 7.6: Leads Service
**File**: `src/services/leads.ts`
- [ ] CRUD operations
- [ ] Status updates

#### Task 7.7: Galleries Service
**File**: `src/services/galleries.ts`
- [ ] Gallery CRUD
- [ ] Gallery items upload/management

#### Task 7.8: Profile Service
**File**: `src/services/profile.ts`
- [ ] Get/update profile
- [ ] Logo upload

---

### Phase 8: Authentication & Session Management (2 hari)

#### Task 8.1: Migrate Auth Service
**File**: `src/services/auth.ts`
- [ ] Replace `supabase.auth.signIn()` → `POST /auth/login`
- [ ] Replace `supabase.auth.signOut()` → `POST /auth/logout`
- [ ] Replace `supabase.auth.signUp()` → `POST /auth/register`
- [ ] JWT token storage (localStorage)
- [ ] Refresh token logic

#### Task 8.2: Update Auth Context/Store
**File**: `src/contexts/AuthContext.tsx` atau `src/store/auth.ts`
- [ ] Use new auth service
- [ ] Token refresh mechanism
- [ ] Session validation

#### Task 8.3: Migrate Login Sessions
**File**: `src/services/loginSessions.ts`
- [ ] Replace Supabase calls
- [ ] Device tracking
- [ ] Session management

---

### Phase 9: Testing & Verification (3-4 hari)

#### Task 9.1: Unit Tests
- [ ] API client tests
- [ ] Service adapter tests
- [ ] Backend unit tests (jika belum ada)

#### Task 9.2: Integration Tests
- [ ] End-to-end flow tests
- [ ] File upload/download tests
- [ ] Authentication flow tests

#### Task 9.3: Manual Testing
- [ ] Test setiap modul secara manual
- [ ] Browser compatibility
- [ ] Mobile responsive
- [ ] Error scenarios

#### Task 9.4: Performance Testing
- [ ] Load testing backend APIs
- [ ] File upload performance
- [ ] Database query optimization

---

### Phase 10: Storage File Migration (5-7 hari)

#### Task 10.1: Create Migration Script
**File**: `scripts/migrate-storage-files.ts`
- [ ] List all files from Supabase Storage
- [ ] Download files (dengan rate limiting)
- [ ] Upload ke local storage via API
- [ ] Update database references
- [ ] Verify checksums

#### Task 10.2: Run Migration
- [ ] Dry run untuk estimate size & time
- [ ] Execute migration
- [ ] Monitor progress
- [ ] Handle errors & retries

#### Task 10.3: Verification
- [ ] Verify all files migrated
- [ ] Test file access
- [ ] Check database integrity
- [ ] Performance testing

---

### Phase 11: Cleanup & Optimization (2-3 hari)

#### Task 11.1: Remove Supabase Dependencies
- [ ] Remove `@supabase/supabase-js` dari package.json
- [ ] Remove Supabase config files
- [ ] Remove environment variables
- [ ] Clean up unused code

#### Task 11.2: Code Optimization
- [ ] Remove feature flags
- [ ] Optimize API calls (batch, cache)
- [ ] Clean up console logs
- [ ] Update documentation

#### Task 11.3: Deployment Preparation
- [ ] Update deployment scripts
- [ ] Environment variables setup
- [ ] Database migration scripts
- [ ] Backup strategy

---

## 🚀 Execution Strategy

### Week 1
- Days 1-2: Phase 1 (API Client Infrastructure)
- Days 3-5: Phase 2 (Finance Module)

### Week 2
- Days 1-2: Phase 3 (Storage Module)
- Days 3-4: Phase 4 (Team Payments)
- Day 5: Phase 5 (Calendar)

### Week 3
- Days 1-3: Phase 6 (Public Endpoints)
- Days 4-5: Start Phase 7 (Projects, Clients)

### Week 4
- Days 1-4: Continue Phase 7 (Remaining Services)
- Day 5: Phase 8 (Auth)

### Week 5
- Days 1-4: Phase 9 (Testing)
- Day 5: Start Phase 10 (Storage Migration prep)

### Week 6-7
- Phase 10: Storage File Migration
- Phase 11: Cleanup

---

## ⚠️ Critical Points

1. **Backward Compatibility**: Maintain Supabase fallback until migration 100% complete
2. **Data Integrity**: Never modify data without transaction/rollback capability
3. **Testing**: Test each phase thoroughly before moving to next
4. **Performance**: Monitor API response times, optimize if needed
5. **Security**: Ensure all endpoints properly authenticated/authorized
6. **User Experience**: No disruption to end users during migration

---

## 📊 Success Criteria

- [ ] All frontend services using NestJS API (0% Supabase calls)
- [ ] All files migrated to local storage
- [ ] All tests passing (unit + integration)
- [ ] Performance benchmarks met (< 500ms API response)
- [ ] Zero data loss
- [ ] Production deployment successful
- [ ] Supabase dependencies removed

---

## 🆘 Rollback Plan

If critical issues found:
1. Revert feature flags to use Supabase
2. Restore from backup if data corrupted
3. Investigate issue
4. Fix and test
5. Resume migration

---

## 📝 Daily Progress Tracking

Update this section daily:

### Day 1: [Date]
- [ ] Tasks completed
- [ ] Blockers
- [ ] Notes

### Day 2: [Date]
- [ ] Tasks completed
- [ ] Blockers
- [ ] Notes

(Continue...)
