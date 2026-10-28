# 🚀 Quick Start Guide

Panduan cepat untuk mulai testing dan menggunakan service adapters.

---

## ⚡ 5-Minute Setup

### 1. Environment Setup

Buat file `.env.local` di root project:

```bash
# Copy dari .env.example
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Backend API
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Feature Flags - Enable modules you want to test
VITE_USE_NESTJS_API=false  # Global off for safety
VITE_NESTJS_FINANCE=true   # Enable Finance module
VITE_NESTJS_STORAGE=false
VITE_NESTJS_AUTH=false
# ... (others stay false for now)

# Supabase (fallback)
VITE_SUPABASE_URL=your-url-here
VITE_SUPABASE_ANON_KEY=your-key-here
```

### 2. Start Servers

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
# Wait for "Nest application successfully started"
```

Terminal 2 - Frontend:
```bash
npm run dev
# Wait for "ready in Xms"
```

### 3. Check Feature Flags

Open browser console:
```javascript
// Should see feature flags logged automatically in dev mode
// 🚩 Feature Flags
//   Global: Supabase
//   Modules:
//     finance: ✅ NestJS
//     storage: ❌ Supabase
//     ...
```

---

## 🧪 Quick Test

### Test Finance Adapter (3 minutes)

1. **Navigate to Cards page** in your app
2. **Open DevTools** → Network tab
3. **List Cards**: Should see request to `/api/v1/finance/cards`
4. **Create Card**: Add new card
   - Check request: `POST /api/v1/finance/cards`
   - Status should be 201
5. **Success!** Finance adapter working ✅

---

## 📝 Using Adapters in Your Components

### Before (Supabase)

```typescript
// ❌ Old way - Direct Supabase
import supabase from '@/lib/supabaseClient';

async function loadCards() {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('bank_name');
  
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
```

### After (Adapter)

```typescript
// ✅ New way - Adapter (auto-switches backend)
import { listCards } from '@/services/adapters';

async function loadCards() {
  try {
    const cards = await listCards();
    return cards;
  } catch (error) {
    console.error(error.message); // Already user-friendly!
    return [];
  }
}
```

**Benefits:**
- ✅ Feature flag automatically chooses backend
- ✅ Error messages already user-friendly
- ✅ No need to know if using Supabase or NestJS
- ✅ Easy to test with feature flags
- ✅ TypeScript typed

---

## 🔥 Common Patterns

### Pattern 1: Fetch Data on Mount

```typescript
import { useEffect, useState } from 'react';
import { listCards } from '@/services/adapters';
import type { CardDTO } from '@/services/adapters';

function CardsPage() {
  const [cards, setCards] = useState<CardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listCards();
        setCards(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render cards */}</div>;
}
```

### Pattern 2: Create with Form

```typescript
import { useState } from 'react';
import { createCard } from '@/services/adapters';
import type { CreateCardInput } from '@/services/adapters';

function AddCardForm() {
  const [formData, setFormData] = useState<CreateCardInput>({
    cardHolderName: '',
    bankName: '',
    lastFourDigits: '',
    balance: 0,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const newCard = await createCard(formData);
      alert('Card created!');
      // Redirect or refresh list
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Pattern 3: File Upload

```typescript
import { uploadAvatar } from '@/services/adapters';

function AvatarUpload() {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadAvatar(file, 'client');
      console.log('Uploaded:', result.url);
      // Update UI with new avatar URL
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      disabled={uploading}
    />
  );
}
```

### Pattern 4: Auth Check

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '@/services/adapters';

function ProtectedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
      }
    }
    checkAuth();
  }, [navigate]);

  return <div>Protected content</div>;
}
```

---

## 🐛 Troubleshooting

### "Network error"
**Cause**: Backend not running  
**Fix**: 
```bash
cd backend
npm run start:dev
```

### "401 Unauthorized"
**Cause**: Not logged in or token expired  
**Fix**: 
```typescript
import { logout } from '@/services/adapters';
await logout();
// Redirect to login page
```

### Feature flag not working
**Cause**: Vite didn't reload env  
**Fix**:
```bash
# Restart dev server
npm run dev
```

### Console warning: "Feature flag not set"
**Cause**: Module flag not in `.env.local`  
**Fix**: Add to `.env.local`:
```bash
VITE_NESTJS_YOUR_MODULE=false
```

### TypeScript error: "Cannot find module"
**Cause**: Import path wrong  
**Fix**:
```typescript
// ✅ Correct
import { listCards } from '@/services/adapters';

// ❌ Wrong
import { listCards } from './services/adapters';
```

---

## 📚 Available Adapters

### ✅ Ready to Use

| Adapter | Import | Status |
|---------|--------|--------|
| Finance | `import { listCards, createCard, ... } from '@/services/adapters'` | ✅ Ready |
| Team Payments | `import { reconcileTeamPayments, ... } from '@/services/adapters'` | ✅ Ready |
| Storage | `import { uploadFile, uploadAvatar, ... } from '@/services/adapters'` | ✅ Ready |
| Auth | `import { login, logout, isAuthenticated, ... } from '@/services/adapters'` | ✅ Ready |
| Calendar | `import { listCalendarEvents, createCalendarEvent, ... } from '@/services/adapters'` | ✅ Ready |

### ⏳ Coming Soon

- Projects Adapter
- Clients Adapter
- Team Members Adapter
- Packages Adapter
- Add-ons Adapter
- Leads Adapter
- Galleries Adapter
- Profile Adapter
- Client Feedback Adapter
- Profile Settings Adapter

---

## 🎯 Today's Goal (Oct 29)

### Morning (2-3 hours)
1. ✅ Test Finance Adapter
2. ✅ Fix any issues
3. ✅ Document results

### Afternoon (2-3 hours)
1. ✅ Test Storage Adapter
2. ✅ Test Auth Adapter
3. ✅ Update progress docs

---

## 💡 Tips

### Testing Tips
- ✅ Test with feature flag ON and OFF
- ✅ Check console for errors
- ✅ Check Network tab for API calls
- ✅ Test error scenarios (network offline, invalid data)

### Development Tips
- ✅ Use TypeScript for type safety
- ✅ Handle errors with try/catch
- ✅ Show loading states
- ✅ Give user feedback (success/error messages)

### Debugging Tips
- ✅ Check feature flags: `localStorage` or browser console
- ✅ Check tokens: `localStorage.getItem('auth_access_token')`
- ✅ Test backend directly: Postman/Thunder Client
- ✅ Enable verbose logging (if needed)

---

## 📖 Further Reading

- [Migration Analysis](./migration-analysis.md) - Full inventory
- [Action Plan](./action-plan.md) - 11-phase roadmap
- [Backend Integration Guide](./backend-integration-guide.md) - Complete manual
- [Testing Guide](./testing-guide.md) - Detailed testing procedures
- [Implementation Progress](./implementation-progress.md) - Current status

---

## 🆘 Need Help?

### Common Questions

**Q: Which backend am I using?**  
A: Check browser console for feature flags log, or check `.env.local`

**Q: How do I switch backends?**  
A: Change feature flag in `.env.local` and restart dev server

**Q: Can I use both backends?**  
A: Yes! Some modules can use NestJS while others use Supabase

**Q: What if adapter fails?**  
A: It falls back to Supabase automatically (if implemented)

**Q: How do I add Supabase fallback?**  
A: Check existing adapter code (e.g., `finance-adapter.ts`) for pattern

---

## 🎉 Success Checklist

Before calling a module "done":

- [ ] Adapter implemented
- [ ] Feature flag working
- [ ] All CRUD operations tested
- [ ] Error scenarios tested
- [ ] Console clean (no errors)
- [ ] Network tab shows correct calls
- [ ] Components updated
- [ ] Documentation updated
- [ ] No regressions

---

**Last Updated**: October 28, 2026  
**Status**: Ready for Testing! 🚀  
**Next**: Start with Finance Adapter testing
