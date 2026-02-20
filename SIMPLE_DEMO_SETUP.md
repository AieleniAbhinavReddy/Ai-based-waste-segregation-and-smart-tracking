# 🎯 DEMO ACCOUNTS - SIMPLE 3-STEP SETUP

## ⚡ DO THIS NOW (TAKES 5 MINUTES)

---

## STEP 1️⃣ - CREATE 3 AUTH USERS (2 minutes)

### Go to Supabase Dashboard
```
https://app.supabase.com
→ Select your Green India project
→ Click "Authentication" (left sidebar)
→ Click "Users" tab
```

### Create User 1: ADMIN
```
Click "Invite" button
Email: admin@greenidia.com
Password: Admin@123456
Confirm: Admin@123456
Click "Send invite"
```

### Create User 2: SUPERVISOR
```
Click "Invite" button
Email: supervisor@greenidia.com
Password: Supervisor@123456
Confirm: Supervisor@123456
Click "Send invite"
```

### Create User 3: CITIZEN
```
Click "Invite" button
Email: citizen@greenidia.com
Password: Citizen@123456
Confirm: Citizen@123456
Click "Send invite"
```

### ✅ Verify All Created
You should now see in Users list:
- ✅ admin@greenidia.com
- ✅ supervisor@greenidia.com
- ✅ citizen@greenidia.com

---

## STEP 2️⃣ - RUN SQL SCRIPT (2 minutes)

### Go to SQL Editor
```
In Supabase dashboard:
→ Click "SQL Editor" (left sidebar)
→ Click "New Query" (top right)
```

### Copy SQL Script
```
1. In your project folder, open file:
   DEMO_ACCOUNTS_SETUP.sql

2. Select ALL content (Ctrl+A)
3. Copy (Ctrl+C)
```

### Paste & Run
```
1. Click in SQL Editor (empty box)
2. Paste (Ctrl+V)
3. Click "RUN" button (bottom right)
4. Wait for success message
```

### ✅ Verify Success
You should see:
- ✅ "Success" messages
- ✅ Query results showing insertions
- ✅ No red error messages

---

## STEP 3️⃣ - TEST DEMO LOGIN (1 minute)

### Start Development Server
```bash
npm run dev
```

### Open Login Page
```
Browser: http://localhost:5173/login
```

### See Demo Buttons
You should see:
```
📝 DEMO ACCOUNTS (QUICK ACCESS)

[Login as Admin] (Red button)
[Login as Supervisor] (Blue button)
[Login as Citizen] (Green button)
```

### Test Login - Admin
```
Click "Login as Admin" button
↓
Wait for redirect (2-3 seconds)
↓
You should see Admin Dashboard
✅ SUCCESS!
```

### Test Login - Supervisor
```
Go back to login page (click "← Back")
↓
Click "Login as Supervisor" button
↓
Wait for redirect
↓
You should see Supervisor Dashboard
✅ SUCCESS!
```

### Test Login - Citizen
```
Go back to login page
↓
Click "Login as Citizen" button
↓
Wait for redirect
↓
You should see Citizen Dashboard
✅ SUCCESS!
```

---

## 🎉 DONE!

All 3 demo accounts are now working!

### Demo Credentials Summary:
```
ADMIN:
  Email: admin@greenidia.com
  Pass:  Admin@123456
  Access: /admin/dashboard

SUPERVISOR:
  Email: supervisor@greenidia.com
  Pass:  Supervisor@123456
  Access: /supervisor/dashboard

CITIZEN:
  Email: citizen@greenidia.com
  Pass:  Citizen@123456
  Access: /dashboard
```

---

## ⚠️ IF IT DOESN'T WORK

### Check Step 1
Are the 3 auth users visible in Supabase Authentication → Users?
- NO → Go create them (Step 1)
- YES → Go to Step 2

### Check Step 2
Did you run the SQL script and see "Success"?
- NO → Go run it (Step 2)
- YES → Go to Step 3

### Check Step 3
Do you see the demo buttons on login page?
- NO → Refresh page (Ctrl+F5), restart dev server
- YES → Click buttons and they should work!

### Still Broken?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Close browser completely
3. Restart dev server
4. Open new browser window
5. Go to login page again
6. Try demo buttons

---

## 📋 FINAL CHECKLIST

```
✅ Created admin@greenidia.com in Supabase Auth
✅ Created supervisor@greenidia.com in Supabase Auth
✅ Created citizen@greenidia.com in Supabase Auth
✅ Ran DEMO_ACCOUNTS_SETUP.sql in SQL Editor
✅ npm run dev is running
✅ Opened http://localhost:5173/login
✅ Can see demo buttons
✅ "Login as Admin" works → See admin dashboard
✅ "Login as Supervisor" works → See supervisor dashboard
✅ "Login as Citizen" works → See citizen dashboard

🎉 ALL DONE!
```

---

## 🎬 WHAT'S NEXT?

After login works, explore these features:

### As Admin:
```
/admin/users         → Manage users
/admin/zones         → Manage zones
/admin/pickups       → Real-time GPS tracking
/admin/complaints    → Manage complaints
/admin/dashboard     → Analytics dashboard
```

### As Supervisor:
```
/supervisor/dashboard → Zone overview
                     → Worker monitoring
                     → Pickup verification
                     → Complaint handling
```

### As Citizen:
```
/dashboard           → Your personal dashboard
                     → Schedule pickups
                     → View rewards
                     → Check compliance score
```

---

**Questions? Check:**
- `DEMO_SETUP_GUIDE.md` - Full detailed instructions
- `QUICK_SETUP.md` - 5-minute overview
- `FEATURES_VERIFICATION_REPORT.md` - All features listed
