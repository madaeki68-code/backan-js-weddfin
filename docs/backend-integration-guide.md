# Backend Integration Guide

Panduan untuk mengintegrasikan frontend dengan NestJS backend dan migrasi dari Supabase.

## 📋 Table of Contents
1. [Setup](#setup)
2. [Architecture](#architecture)
3. [Feature Flags](#feature-flags)
4. [Service Adapters](#service-adapters)
5. [Authentication](#authentication)
6. [Migration Strategy](#migration-strategy)
7. [Testing](#testing)

---

## 🚀 Setup

### Prerequisites
- Backend NestJS sudah running di `http://localhost:4000`
- PostgreSQL database sudah setup
- Frontend development server running di `http://localhost:3003`

### Environment Variables

Tambahkan ke `.env` atau `.env.local`:

```bash
# NestJS Backend API
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Feature Flags
# Set ke 'true' untuk use NestJS backend, 'false' untuk Supabase
VITE_USE_NESTJS_API=false

# Per-module toggles (optional, override global flag)
VITE_NESTJS_AUTH=false
VITE_NESTJS_FINANCE=true
VITE_NESTJS_TEAM_PAYMENTS=true
VITE_NESTJS_STORAGE=true
VITE_NESTJS_CALENDAR=true
VITE_NESTJS_PROJECTS=false
VITE_NESTJS_CLIENTS=false
VITE_NESTJS_TEAM_MEMBERS=false
VITE_NESTJS_PACKAGES=false
VITE_NESTJS_ADDONS=false
VITE_NESTJS_LEADS=false
VITE_NESTJS_GALLERIES=false
VITE_NESTJS_PROFILE=false

# Supabase (still needed during transition)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Installation

No additional dependencies needed. API client built with native `fetch`.

---

## 🏗️ Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│        UI Components                │
│  (React Components)                 │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│     Service Adapters                │
│  (Abstraction Layer)                │
│  - Switches between Supabase/NestJS │
│  - Feature flag-based routing       │
└───────┬─────────────────┬───────────┘
        │                 │
┌───────▼────────┐ ┌─────▼──────────┐
│  API Client    │ │  Supabase      │
│  (NestJS)      │ │  Client        │
└────────────────┘ └────────────────┘
```

### Key Components

1. **API Client** (`src/services/api-client.ts`)
   - Base HTTP client dengan fetch
   - Automatic JWT injection
   - Token refresh logic
   - Error handling
   - Request/response interceptors

2. **Auth Token Manager** (`src/services/auth-token-manager.ts`)
   - JWT token storage (localStorage)
   - Token expiry checking
   - Automatic refresh
   - Token decode utilities

3. **Feature Flags** (`src/config/features.ts`)
   - Global & per-module toggles
   - Environment-based configuration
   - Runtime override capability

4. **Service Adapters** (`src/services/adapters/*.ts`)
   - Finance Adapter (Cards, Pockets, Transactions)
   - Team Payments Adapter
   - Storage Adapter
   - Calendar Adapter
   - etc...

---

## 🚩 Feature Flags

### How It Works

Feature flags allow gradual migration from Supabase to NestJS backend:

1. **Global Toggle**: `VITE_USE_NESTJS_API=true` enables NestJS for all modules
2. **Module-specific**: Override global for specific modules
3. **Runtime**: Can be changed at runtime for testing

### Usage in Code

```typescript
import { useNestJSForModule } from '@/config/features';

function someService() {
  const useNestJS = useNestJSForModule('finance');
  
  if (useNestJS) {
    // Call NestJS API
    return apiClient.get('/finance/cards');
  } else {
    // Fall back to Supabase
    return supabase.from('cards').select('*');
  }
}
```

### Debug Feature Flags

Di browser console:

```javascript
// Log current flags
import { logFeatureFlags } from '@/config/features';
logFeatureFlags();

// Override at runtime (for testing)
import { setFeatureFlags } from '@/config/features';
setFeatureFlags({
  useNestJSBackend: true,
  modules: {
    finance: true,
    storage: false,
  }
});
```

---

## 🔌 Service Adapters

### Finance Adapter Example

```typescript
import { listCards, createCard, updateCard, deleteCard } from '@/services/adapters/finance-adapter';

// Usage sama persis, tidak peduli backend apa yang dipakai
async function loadCards() {
  try {
    const cards = await listCards(); // Otomatis pakai NestJS atau Supabase
    console.log(cards);
  } catch (error) {
    console.error('Failed to load cards:', error);
  }
}
```

### Available Adapters

#### Finance Adapter (`finance-adapter.ts`)
✅ **Status**: Implemented

- `listCards()` - List all cards
- `createCard(input)` - Create new card
- `updateCard(id, input)` - Update card
- `deleteCard(id)` - Delete card
- `listPockets()` - List all pockets
- `createPocket(input)` - Create pocket
- `updatePocket(id, input)` - Update pocket
- `deletePocket(id)` - Delete pocket
- `listTransactions(params)` - List transactions with filters
- `createTransaction(input)` - Create transaction
- `createTransactionsBatch(inputs)` - Batch transactions (atomik)
- `updateTransaction(id, input)` - Update transaction
- `deleteTransaction(id)` - Delete transaction

#### Team Payments Adapter (`team-payments-adapter.ts`)
⏳ **Status**: TODO

- `listTeamPayments(projectId)`
- `reconcileTeamPayments(projectId, items)`
- `updatePaymentStatus(id, status)`
- `listPaymentRecords()`
- `createPaymentRecord(data)`
- `updatePaymentRecord(id, data)`
- `deletePaymentRecord(id)`

#### Storage Adapter (`storage-adapter.ts`)
⏳ **Status**: TODO

- `uploadFile(file, folder)`
- `getPublicUrl(id)`
- `getPrivateUrl(id)`
- `deleteFile(id)`

#### Calendar Adapter (`calendar-adapter.ts`)
⏳ **Status**: TODO

- `listEvents(from, to, projectId)`
- `createEvent(data)`
- `updateEvent(id, data)`
- `deleteEvent(id)`

(More adapters to be implemented...)

---

## 🔐 Authentication

### JWT Token Flow

1. **Login** → Server returns `accessToken` + `refreshToken`
2. **Store** → Both tokens stored in `localStorage`
3. **API Calls** → `accessToken` injected automatically via interceptor
4. **Token Expiry** → Auto-refresh before expiry (60s threshold)
5. **Refresh Failed** → Clear tokens, redirect to login

### Token Structure

**Access Token** (15 minutes):
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Refresh Token** (7 days):
```json
{
  "sub": "user-id",
  "sessionId": "session-id",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Usage

```typescript
import { 
  setAuthTokens, 
  getAuthToken, 
  clearAuthTokens,
  isAuthenticated 
} from '@/services/auth-token-manager';

// After login
setAuthTokens({
  accessToken: 'jwt-access-token',
  refreshToken: 'jwt-refresh-token'
});

// Check auth status
if (isAuthenticated()) {
  // User is logged in
}

// Logout
clearAuthTokens();
```

### Protected Routes

```typescript
import { isAuthenticated } from '@/services/auth-token-manager';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
```

---

## 🔄 Migration Strategy

### Phase-by-Phase Approach

#### Phase 1: Infrastructure ✅
- [x] API Client created
- [x] Auth Token Manager created
- [x] Feature Flags system
- [x] Finance Adapter implemented

#### Phase 2: Module-by-Module
Enable feature flags progressively:

1. **Week 1**: Finance module
   ```bash
   VITE_NESTJS_FINANCE=true
   ```

2. **Week 1**: Team Payments
   ```bash
   VITE_NESTJS_TEAM_PAYMENTS=true
   ```

3. **Week 1**: Storage
   ```bash
   VITE_NESTJS_STORAGE=true
   ```

4. **Week 2**: Calendar
   ```bash
   VITE_NESTJS_CALENDAR=true
   ```

5. **Week 2-3**: Remaining modules
   ```bash
   VITE_NESTJS_PROJECTS=true
   VITE_NESTJS_CLIENTS=true
   # ... etc
   ```

#### Phase 3: Full Switch
Once all modules tested:

```bash
VITE_USE_NESTJS_API=true
```

Remove per-module flags.

#### Phase 4: Cleanup
- Remove Supabase dependencies
- Remove fallback code
- Remove feature flags

### Migration Checklist per Module

- [ ] Create adapter service
- [ ] Implement all methods (NestJS + Supabase fallback)
- [ ] Update components to use adapter
- [ ] Test CRUD operations
- [ ] Test error scenarios
- [ ] Enable feature flag
- [ ] Monitor production
- [ ] Remove Supabase fallback code

---

## 🧪 Testing

### Manual Testing

1. **Feature Flag OFF** (Supabase)
   ```bash
   VITE_NESTJS_FINANCE=false
   npm run dev
   ```
   Test all CRUD operations → Should use Supabase

2. **Feature Flag ON** (NestJS)
   ```bash
   VITE_NESTJS_FINANCE=true
   npm run dev
   ```
   Test all CRUD operations → Should use NestJS API

3. **Network Errors**
   - Stop backend server
   - Try operations → Should show proper error messages

4. **Token Expiry**
   - Manually expire token in localStorage
   - Make API call → Should auto-refresh

### Integration Testing

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { listCards, createCard, deleteCard } from '@/services/adapters/finance-adapter';

describe('Finance Adapter', () => {
  it('should list cards', async () => {
    const cards = await listCards();
    expect(Array.isArray(cards)).toBe(true);
  });

  it('should create card', async () => {
    const card = await createCard({
      cardHolderName: 'John Doe',
      bankName: 'Test Bank',
      lastFourDigits: '1234',
      balance: 1000000,
    });
    expect(card.id).toBeDefined();
    
    // Cleanup
    await deleteCard(card.id);
  });
});
```

### Performance Testing

Monitor API response times:

```typescript
console.time('listCards');
await listCards();
console.timeEnd('listCards');
// Should be < 500ms
```

---

## 📊 Monitoring & Debugging

### Network Tab

Buka DevTools → Network:
- Check requests ke `/api/v1/*`
- Verify Authorization header ada
- Check response status & payload

### Console Logs

Service adapters log errors automatically:
```
[Finance Adapter] Error listing cards: NetworkError
```

### Feature Flags Debug

```javascript
import { logFeatureFlags } from '@/config/features';
logFeatureFlags();

// Output:
// 🚩 Feature Flags
//   Global: NestJS
//   Modules:
//     finance: ✅ NestJS
//     storage: ✅ NestJS
//     projects: ↪️ (using global: NestJS)
```

---

## 🆘 Troubleshooting

### Error: "Network error"
**Cause**: Backend tidak running atau URL salah  
**Fix**: 
1. Check backend running di `http://localhost:4000`
2. Verify `VITE_API_BASE_URL` di `.env`

### Error: "401 Unauthorized"
**Cause**: Token expired atau invalid  
**Fix**:
1. Check token di localStorage: `localStorage.getItem('auth_access_token')`
2. Try logout & login again
3. Check backend JWT_SECRET match

### Error: "CORS policy"
**Cause**: Backend CORS not configured  
**Fix**: Add CORS config di backend `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3003',
  credentials: true,
});
```

### Feature flag not working
**Cause**: Vite tidak re-read environment variables  
**Fix**: Restart dev server:
```bash
npm run dev
```

---

## 📚 Additional Resources

- [Backend README](../../backend/README.md)
- [API Documentation](./api-documentation.md) (TODO)
- [Prisma Schema](../../backend/prisma/schema.prisma)
- [Action Plan](./action-plan.md)
- [Migration Analysis](./migration-analysis.md)

---

## 🤝 Contributing

When adding new adapters:

1. Copy pattern dari `finance-adapter.ts`
2. Implement both NestJS and Supabase branches
3. Add feature flag check
4. Add TypeScript types
5. Add error handling
6. Update this guide
7. Add tests

---

## 📝 Notes

- Always maintain backward compatibility selama migrasi
- Test thoroughly before enabling feature flags di production
- Keep Supabase fallback sampai 100% confident
- Monitor error rates setelah switch
- Document any issues encountered

---

**Last Updated**: October 28, 2026
