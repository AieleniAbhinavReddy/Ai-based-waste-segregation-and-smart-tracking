# ⚡ QUICK SETUP (5 MINUTES)

## 🎯 THE PROBLEM & SOLUTION

**Why demo credentials don't work:**
- ❌ Auth users don't exist in Supabase
- ❌ User roles not assigned
- ❌ Profiles not created

**The solution:**
- ✅ Create auth users in Supabase
- ✅ Run SQL setup script
- ✅ Test login - WORKS! 🎉

---

## 📋 WHAT TO DO (3 SIMPLE STEPS)

### STEP 1️⃣: CREATE AUTH USERS (2 min)

**Go to:** https://app.supabase.com → Your Project → Authentication → Users

**Click "Invite" and create 3 users:**

```
USER 1 - ADMIN
  Email:    admin@greenidia.com
  Password: Admin@123456

USER 2 - SUPERVISOR
  Email:    supervisor@greenidia.com
  Password: Supervisor@123456

USER 3 - CITIZEN
  Email:    citizen@greenidia.com
  Password: Citizen@123456
```

✅ **Verify:** All 3 emails appear in Users list

---

### STEP 2️⃣: RUN SQL SETUP (2 min)

**Go to:** Supabase → SQL Editor → New Query

**Copy & paste entire content of:** `DEMO_ACCOUNTS_SETUP.sql`

**Click "RUN" button**

✅ Wait for success messages

---

### STEP 3️⃣: TEST LOGIN (1 min)

**Start dev server:**
```bash
npm run dev
```

**Go to:** http://localhost:5173/login

**Click demo buttons:**
```
[Admin]       → /admin/dashboard        ✅ Works!
[Supervisor]  → /supervisor/dashboard   ✅ Works!
[Citizen]     → /dashboard              ✅ Works!
```

---

## 🎬 VISUAL GUIDE

### Step 1: Supabase Authentication Tab
```
https://app.supabase.com
    ↓
Select Project
    ↓
Click "Authentication" (left menu)
    ↓
Click "Users" tab
    ↓
Click "Invite" button (top right)
    ↓
Enter email & password → Create 3 users
```

### Step 2: Supabase SQL Editor
```
https://app.supabase.com → SQL Editor → New Query
    ↓
Copy DEMO_ACCOUNTS_SETUP.sql
    ↓
Paste into editor
    ↓
Click "RUN" button
    ↓
Wait for completion ✅
```

### Step 3: Frontend Login
```
npm run dev
    ↓
http://localhost:5173/login
    ↓
See demo buttons section
    ↓
Click any demo button
    ↓
Instantly logged in! 🎉
```

---

## 📊 AFTER SETUP - WHAT YOU CAN DO

### As ADMIN - http://localhost:5173/admin/dashboard
```
✅ Manage Users      → Create/edit citizens, workers, supervisors
✅ Manage Zones      → Create zones, assign supervisors
✅ Monitor Pickups   → See real-time GPS tracking
✅ Manage Complaints → Resolve citizen complaints
✅ View Analytics    → Charts, trends, reports
```

### As SUPERVISOR - http://localhost:5173/supervisor/dashboard
```
✅ Zone Dashboard    → Metrics for your zone
✅ Monitor Workers   → Track worker locations & performance
✅ Verify Pickups    → GPS matching, QR verification
✅ Handle Complaints → Zone-level complaint management
✅ Performance Review → Worker productivity scores
```

### As CITIZEN - http://localhost:5173/dashboard
```
✅ Schedule Pickups  → Request waste collection
✅ View History      → Past pickups and waste data
✅ Earn Rewards      → E-points and vouchers
✅ Check Compliance  → Your waste management score
✅ Settings          → Profile and preferences
```

---

## ✅ VERIFICATION CHECKLIST

```
☐ Step 1: Created 3 auth users in Supabase
☐ Step 2: Ran DEMO_ACCOUNTS_SETUP.sql
☐ Step 3: npm run dev is running
☐ Step 4: Opened http://localhost:5173/login
☐ Step 5: Can see demo buttons in login form
☐ Step 6: Clicked "Login as Admin" → Logged in ✅
☐ Step 7: Clicked "Login as Supervisor" → Logged in ✅
☐ Step 8: Clicked "Login as Citizen" → Logged in ✅
☐ DONE! All features working 🎉
```

---

## 🆘 IF SOMETHING GOES WRONG

| Error | Solution |
|-------|----------|
| "Invalid credentials" | Created auth users yet? Do Step 1 |
| Demo buttons don't appear | Clear cache (Ctrl+Shift+Del), refresh |
| SQL script errors | Make sure all 3 auth users created FIRST |
| Can't see admin features | Check user_roles table - role should = 'admin' |
| Stuck on loading | Restart dev server: `npm run dev` |

---

## 📑 REFERENCE FILES

- `DEMO_ACCOUNTS_SETUP.sql` - SQL script to run
- `DEMO_SETUP_GUIDE.md` - Full detailed guide
- `FEATURES_VERIFICATION_REPORT.md` - All features listed
- `DEPLOYMENT_CHECKLIST.md` - Complete setup guide

---

## 🚀 YOU'RE READY!

Follow these 3 steps above and everything will work perfectly.

**Estimated time:** 5 minutes ⏱️

**After setup:**
- ✅ Demo credentials work instantly
- ✅ All 3 accounts functional
- ✅ All features accessible
- ✅ Ready to test & demo! 🎉
