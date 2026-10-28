# Testing Guide - Service Adapters

Panduan untuk testing service adapters dan migrasi komponen.

---

## 🧪 Testing Strategy

### 1. **Feature Flag Testing**
Test dengan feature flag ON dan OFF untuk memastikan backward compatibility.

### 2. **Unit Testing**
Test setiap adapter function secara isolated.

### 3. **Integration Testing**
Test flow lengkap dari UI ke API.

### 4. **Manual Testing**
Test setiap fitur di browser dengan real data.

---

## 📋 Testing Checklist (Per Module)

### Before Testing
- [ ] Backend API running di `localhost:4000`
- [ ] Frontend running di `localhost:3003`
- [ ] Environment variables set correctly
- [ ] Test database seeded dengan data

### Finance Module Testing

#### Feature Flag OFF (Supabase)
```bash
# .env.local
VITE_NESTJS_FINANCE=false
```

- [ ] **Cards**
  - [ ] List cards displays correctly
  - [ ] Create card works
  - [ ] Update card works
  - [ ] Delete card works
  - [ ] Balance displays correctly
  
- [ ] **Pockets**
  - [ ] List pockets (if applicable)
  - [ ] Create pocket
  - [ ] Update pocket
  - [ ] Delete pocket

- [ ] **Transactions**
  - [ ] List transactions with filters
  - [ ] Create transaction
  - [ ] Update transaction
  - [ ] Delete transaction
  - [ ] Balance auto-adjusts

#### Feature Flag ON (NestJS)
```bash
# .env.local
VITE_NESTJS_FINANCE=true
```

Repeat all tests above. Results should be identical.

#### Error Scenarios
- [ ] Network offline → User-friendly error message
- [ ] Invalid data → Validation error shown
- [ ] Token expired → Auto-refresh works
- [ ] Server error (500) → Proper error handling

---

### Storage Module Testing

#### Feature Flag ON
```bash
VITE_NESTJS_STORAGE=true
```

- [ ] **Image Upload**
  - [ ] Avatar upload works
  - [ ] Gallery image upload works
  - [ ] Package cover upload works
  - [ ] File size validation
  - [ ] File type validation
  - [ ] Progress indicator shows (if implemented)

- [ ] **File Download**
  - [ ] Public file accessible without auth
  - [ ] Private file requires auth
  - [ ] Download to device works

- [ ] **File Delete**
  - [ ] Delete removes file
  - [ ] Deleted file no longer accessible

#### Validation Testing
- [ ] Upload file > 10MB → Error "Ukuran file maksimal 10 MB"
- [ ] Upload unsupported type → Error "Jenis file tidak didukung"
- [ ] Upload without login (private) → Error 401

---

### Team Payments Testing

#### Feature Flag ON
```bash
VITE_NESTJS_TEAM_PAYMENTS=true
```

- [ ] **Project Payments**
  - [ ] List payments for project
  - [ ] Create payment
  - [ ] Update payment status
  - [ ] Reconcile payments

- [ ] **Reconcile Logic** (CRITICAL)
  - [ ] Create payments with status "Unpaid"
  - [ ] Mark some as "Paid"
  - [ ] Reconcile with new data
  - [ ] Verify "Paid" rows preserved
  - [ ] Verify "Unpaid" rows updated/deleted

- [ ] **Payment Records**
  - [ ] List records
  - [ ] Create record
  - [ ] Update record
  - [ ] Delete record

---

### Auth Module Testing

#### Feature Flag ON
```bash
VITE_NESTJS_AUTH=true
```

- [ ] **Login**
  - [ ] Valid credentials → Success
  - [ ] Invalid credentials → Error
  - [ ] Token stored in localStorage
  - [ ] User data returned

- [ ] **Register**
  - [ ] Valid data → Account created
  - [ ] Duplicate email → Error
  - [ ] Weak password → Validation error

- [ ] **Logout**
  - [ ] Token cleared from localStorage
  - [ ] Redirect to login

- [ ] **Token Refresh**
  - [ ] Token auto-refreshes before expiry
  - [ ] Expired token → Refresh triggered
  - [ ] Refresh failure → Logout

- [ ] **Password Management**
  - [ ] Change password works
  - [ ] Reset password email sent
  - [ ] Reset with token works

---

### Calendar Module Testing

#### Feature Flag ON
```bash
VITE_NESTJS_CALENDAR=true
```

- [ ] **Events**
  - [ ] List events
  - [ ] Filter by date range
  - [ ] Filter by project
  - [ ] Create event
  - [ ] Update event
  - [ ] Delete event

- [ ] **All-day Events**
  - [ ] Create all-day event
  - [ ] Display correctly

- [ ] **Timed Events**
  - [ ] Create with start/end time
  - [ ] Time format correct
  - [ ] Duration calculated

- [ ] **ICS Feed**
  - [ ] Generate token
  - [ ] Feed URL accessible
  - [ ] Revoke token works

---

## 🔍 Manual Testing Procedure

### Step 1: Prepare Environment

```bash
# 1. Start backend
cd backend
npm run start:dev

# 2. Start frontend
cd ..
npm run dev

# 3. Open browser
# Navigate to http://localhost:3003
```

### Step 2: Enable Feature Flag

Edit `.env.local`:
```bash
VITE_NESTJS_FINANCE=true  # Example: testing Finance
```

Restart frontend:
```bash
npm run dev
```

### Step 3: Test CRUD Operations

For **Finance** example:

1. **Navigate to Cards page**
2. **List**: Check data displays
3. **Create**: Click "Add Card" → Fill form → Submit
   - ✅ Success message shown
   - ✅ New card appears in list
   - ✅ Check console: `POST /api/v1/finance/cards` → 201
4. **Update**: Click card → Edit → Submit
   - ✅ Changes saved
   - ✅ Check console: `PATCH /api/v1/finance/cards/:id` → 200
5. **Delete**: Click delete → Confirm
   - ✅ Card removed
   - ✅ Check console: `DELETE /api/v1/finance/cards/:id` → 200

### Step 4: Test Error Scenarios

1. **Network Error**
   - Stop backend server
   - Try any operation
   - ✅ Error message: "Tidak dapat terhubung ke server..."

2. **Validation Error**
   - Submit form with invalid data
   - ✅ Validation error shown

3. **Token Expiry**
   - Wait 15+ minutes (or manually expire token)
   - Make API call
   - ✅ Token auto-refreshes
   - ✅ Request succeeds

### Step 5: Compare with Supabase

1. Set `VITE_NESTJS_FINANCE=false`
2. Restart frontend
3. Repeat all tests
4. ✅ Results should be identical

---

## 🤖 Automated Testing

### Unit Tests

```typescript
// Example: finance-adapter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listCards, createCard, updateCard, deleteCard } from '@/services/adapters';
import * as apiClient from '@/services/api-client';

vi.mock('@/services/api-client');
vi.mock('@/config/features', () => ({
  useNestJSForModule: () => true, // Always test NestJS path
}));

describe('Finance Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCards', () => {
    it('should fetch cards from API', async () => {
      const mockCards = [
        { id: '1', cardHolderName: 'John', bankName: 'BCA', balance: 1000000 },
      ];

      vi.spyOn(apiClient.apiClient, 'get').mockResolvedValue(mockCards);

      const result = await listCards();

      expect(apiClient.apiClient.get).toHaveBeenCalledWith('/finance/cards');
      expect(result).toEqual(mockCards);
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(apiClient.apiClient, 'get').mockRejectedValue(new Error('Network error'));

      await expect(listCards()).rejects.toThrow();
    });
  });

  describe('createCard', () => {
    it('should create a card', async () => {
      const input = {
        cardHolderName: 'John',
        bankName: 'BCA',
        lastFourDigits: '1234',
        balance: 1000000,
      };
      const mockCard = { id: '1', ...input };

      vi.spyOn(apiClient.apiClient, 'post').mockResolvedValue(mockCard);

      const result = await createCard(input);

      expect(apiClient.apiClient.post).toHaveBeenCalledWith('/finance/cards', input);
      expect(result).toEqual(mockCard);
    });
  });

  // Add more tests...
});
```

Run tests:
```bash
npm run test
```

### Integration Tests

```typescript
// Example: finance.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { listCards, createCard, deleteCard } from '@/services/adapters';

describe('Finance Integration', () => {
  let createdCardId: string;

  beforeAll(async () => {
    // Setup: ensure backend is running
    // Could also seed test data here
  });

  afterAll(async () => {
    // Cleanup: remove test data
    if (createdCardId) {
      await deleteCard(createdCardId);
    }
  });

  it('should complete full CRUD flow', async () => {
    // 1. List initial cards
    const initialCards = await listCards();
    expect(Array.isArray(initialCards)).toBe(true);

    // 2. Create card
    const newCard = await createCard({
      cardHolderName: 'Test User',
      bankName: 'Test Bank',
      lastFourDigits: '9999',
      balance: 500000,
    });
    expect(newCard.id).toBeDefined();
    createdCardId = newCard.id;

    // 3. Verify card in list
    const cardsAfterCreate = await listCards();
    expect(cardsAfterCreate.length).toBe(initialCards.length + 1);
    expect(cardsAfterCreate.find(c => c.id === createdCardId)).toBeDefined();

    // 4. Delete card
    await deleteCard(createdCardId);

    // 5. Verify card removed
    const cardsAfterDelete = await listCards();
    expect(cardsAfterDelete.length).toBe(initialCards.length);
    expect(cardsAfterDelete.find(c => c.id === createdCardId)).toBeUndefined();
  });
});
```

Run integration tests:
```bash
npm run test:e2e
```

---

## 📊 Test Coverage Goals

- **Adapters**: 80%+ line coverage
- **Critical Paths**: 100% (auth, payments, finance)
- **Error Handling**: All error scenarios tested
- **Edge Cases**: Null values, empty arrays, etc.

---

## 🐛 Bug Reporting Template

When you find a bug during testing:

```markdown
### Bug: [Short Description]

**Module**: Finance Adapter
**Feature Flag**: ON (NestJS)
**Severity**: High / Medium / Low

**Steps to Reproduce**:
1. Go to Cards page
2. Click "Add Card"
3. Submit empty form
4. ...

**Expected**:
Validation error shown

**Actual**:
App crashes / No error shown / Wrong error

**Console Errors**:
```
[paste error logs]
```

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Backend Version: NestJS 12.0
- Frontend Version: Latest

**Screenshots**:
[attach if applicable]
```

---

## ✅ Testing Sign-off

Before marking a module as "Complete", ensure:

- [ ] All CRUD operations work
- [ ] Feature flag ON = Same result as OFF
- [ ] Error scenarios handled
- [ ] Console shows no errors
- [ ] Network tab shows correct API calls
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing completed
- [ ] Bug-free for 24 hours in testing

---

## 📝 Testing Log Template

Keep a testing log:

```markdown
## Finance Module Testing - Oct 29, 2026

### Environment
- Backend: Running ✅
- Frontend: Running ✅
- Feature Flag: `VITE_NESTJS_FINANCE=true`
- Test Account: admin@test.com

### Results

#### Cards
- ✅ List: Works, 5 cards displayed
- ✅ Create: Created test card, ID: abc-123
- ✅ Update: Updated balance to 2,000,000
- ✅ Delete: Deleted test card
- ⚠️  Issue: Console warning about missing colorGradient
  - Severity: Low
  - Action: Add default value in adapter

#### Pockets
- ✅ List: Works
- ✅ Create: Works
- (etc...)

### Issues Found: 1
### Issues Fixed: 0
### Status: In Progress
```

---

## 🎯 Testing Priorities

1. **High Priority** (Test First)
   - Auth (login/logout/token refresh)
   - Finance (affects money)
   - Team Payments (critical business logic)

2. **Medium Priority**
   - Storage (file uploads)
   - Calendar
   - Projects

3. **Low Priority** (Can test later)
   - Profile settings
   - Client feedback
   - Bio links

---

**Last Updated**: October 28, 2026  
**Next Review**: October 29, 2026 (after first module tested)
