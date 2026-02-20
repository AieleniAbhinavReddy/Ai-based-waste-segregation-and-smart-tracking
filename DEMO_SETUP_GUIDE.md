# ✅ DEMO ACCOUNTS SETUP GUIDE

**Problem:** Demo credentials showing "invalid credentials"  
**Reason:** Demo accounts not created in Supabase database yet  
**Solution:** Follow this step-by-step guide to create them

---

## 🚀 SOLUTION OVERVIEW

You need to:
1. **Create auth users** in Supabase (Authentication)
2. **Run SQL script** to set up profiles and roles
3. **Test login** with demo credentials

**Time needed:** 10 minutes

---

## ✅ STEP 1: Create Auth Users in Supabase

### Go to Supabase Dashboard

1. Open: **https://app.supabase.com**
2. Select your **Green India project**
3. Click **"Authentication"** (left sidebar)
4. Click **"Users"** tab
5. Click **"Invite"** button (top right)

### Create Admin Account

1. Click **"Invite"** button
2. Fill in:
   - **Email:** `admin@greenidia.com`
   - **Password:** `Admin@123456`
   - **Confirm Password:** `Admin@123456`
3. Click **"Send invite"** button
4. ✅ Admin user created!

### Create Supervisor Account

1. Click **"Invite"** button again
2. Fill in:
   - **Email:** `supervisor@greenidia.com`
   - **Password:** `Supervisor@123456`
   - **Confirm Password:** `Supervisor@123456`
3. Click **"Send invite"** button
4. ✅ Supervisor user created!

### Create Citizen Account

1. Click **"Invite"** button again
2. Fill in:
   - **Email:** `citizen@greenidia.com`
   - **Password:** `Citizen@123456`
   - **Confirm Password:** `Citizen@123456`
3. Click **"Send invite"** button
4. ✅ Citizen user created!

### Verify All 3 Users Created

Go to **Authentication → Users** tab and verify you see:
```
✓ admin@greenidia.com
✓ supervisor@greenidia.com
✓ citizen@greenidia.com
```

All 3 should be visible in the users list.

---

## ✅ STEP 2: Run SQL Setup Script

### Open Supabase SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"** button (top right)
3. You should see a blank SQL editor

### Copy and Paste SQL Script

1. Open this file: **`DEMO_ACCOUNTS_SETUP.sql`** (in your project folder)
2. Copy the ENTIRE content
3. Paste into Supabase SQL editor
4. You should see the SQL code in the editor

### Run the Script

1. Click the **"RUN"** button (bottom right of editor)
2. Wait a few seconds...
3. You should see: ✅ **Success** messages
4. The script will show query results

### What the Script Does

✅ Creates user profiles for all 3 accounts  
✅ Assigns roles (admin, supervisor, citizen)  
✅ Creates demo zone and supervisor assignment  
✅ Sets up citizen compliance data  

---

## ✅ STEP 3: Verify Setup

### Run Verification Queries (Optional)

In the same SQL editor, you can run these to verify:

```sql
-- Check if demo accounts exist
SELECT email, created_at FROM auth.users WHERE email LIKE '%greenidia.com%';

-- Check roles assigned
SELECT ur.id, up.email, ur.role, ur.status 
FROM public.user_roles ur
JOIN public.user_profiles up ON ur.user_id = up.id
WHERE up.email LIKE '%greenidia.com%';
```

You should see:
```
admin@greenidia.com          → admin role
supervisor@greenidia.com     → supervisor role
citizen@greenidia.com        → citizen role
```

---

## ✅ STEP 4: Test Login with Demo Credentials

### Start Dev Server

```bash
npm run dev
```

### Go to Login Page

Open: **http://localhost:5173/login**

### Try One-Click Demo Login

You should see the demo buttons section:
```
📝 DEMO ACCOUNTS (QUICK ACCESS)

[Login as Admin]        (Red button)
[Login as Supervisor]   (Blue button)
[Login as Citizen]      (Green button)
```

### Click "Login as Admin" Button

- ✅ Button should work now!
- ✅ You'll be logged in instantly
- ✅ Redirected to `/admin/dashboard`

### Click "Login as Supervisor" Button

1. Click **"← Back to Home"** or go back to login page
2. Click **"Login as Supervisor"** button
3. ✅ Logged in as supervisor
4. ✅ Redirected to `/supervisor/dashboard`

### Click "Login as Citizen" Button

1. Go back to login page
2. Click **"Login as Citizen"** button
3. ✅ Logged in as citizen
4. ✅ Redirected to `/dashboard`

---

## 🎯 DEMO CREDENTIALS FINAL

After setup, these credentials work:

### 1. ADMIN Account
```
Email:    admin@greenidia.com
Password: Admin@123456
Role:     Admin
Access:   /admin/dashboard (all admin features)
```

### 2. SUPERVISOR Account
```
Email:    supervisor@greenidia.com
Password: Supervisor@123456
Role:     Supervisor
Access:   /supervisor/dashboard (zone-level features)
```

### 3. CITIZEN Account
```
Email:    citizen@greenidia.com
Password: Citizen@123456
Role:     Citizen
Access:   /dashboard (citizen features)
```

---

## 📊 ADMIN FEATURES (Login as Admin)

Once logged in as admin, go to: `/admin/dashboard`

### Features You Can Access:

```
✅ User Management (/admin/users)
   - View all citizens with compliance scores
   - View all workers
   - View all supervisors
   - Create new users
   - Deactivate users

✅ Zone Management (/admin/zones)
   - View all zones
   - Create new zones
   - See zone statistics
   - Assign supervisors to zones

✅ Pickup Monitoring (/admin/pickups)
   - View all pickups in real-time
   - See GPS coordinates (Latitude, Longitude)
   - Filter by zone, status, worker
   - Check QR verification status
   - View waste weight collected

✅ Complaint Management (/admin/complaints)
   - View all citizen complaints
   - Statistics (open, in progress, resolved)
   - Resolve complaints
   - Assign to supervisors
   - Filter by priority/status

✅ Dashboard Analytics
   - Real-time statistics cards
   - Weekly pickup trends chart
   - Zone compliance chart
   - Worker efficiency chart
```

---

## 👔 SUPERVISOR FEATURES (Login as Supervisor)

Once logged in as supervisor, go to: `/supervisor/dashboard`

### Features You Can Access:

```
✅ Zone Dashboard
   - Zone name and statistics
   - Total citizens and workers
   - Today's pickups
   - Compliance score %
   - Active violations count

✅ Charts
   - Weekly pickup trends
   - Worker efficiency ranking
   - Zone performance metrics

✅ Quick Actions
   - Worker Monitoring
   - Pickup Verification
   - Complaint Handling
   - Performance Review

✅ Zone-Specific Data Only
   - Only see your assigned zone's data
   - RLS enforces this at database level
```

---

## 👤 CITIZEN FEATURES (Login as Citizen)

Once logged in as citizen, go to: `/dashboard`

### Features You Can Access:

```
✅ Personal Dashboard
   - Your waste pickup history
   - Your compliance score (85%)
   - Your epoints balance (250 points)
   - Total waste generated
   - Your zone assignments

✅ Waste Management
   - Schedule waste pickups
   - View upcoming pickups
   - Track completed pickups

✅ Rewards & Points
   - View epoints balance
   - See how to earn more points
   - View rewards available

✅ Profile & Settings
   - Update profile information
   - View notification preferences
```

---

## ❓ TROUBLESHOOTING

### Problem: "Still showing invalid credentials"

**Solution:**
1. Did you create the auth users in Supabase? (Check Authentication → Users)
2. Did you run the SQL script? (Check SQL Editor)
3. Wait 5 seconds and refresh the login page
4. Try manual login instead of demo buttons:
   - Email: `admin@greenidia.com`
   - Password: `Admin@123456`

### Problem: "SQL script shows error"

**Solution:**
1. Make sure all 3 auth users were created FIRST
2. Copy the entire SQL script (all of it, not just part)
3. Paste completely into SQL editor
4. Click RUN and wait for completion
5. If errors persist, run verification query to check current state

### Problem: "Demo buttons don't work"

**Solution:**
1. Go to `/login` page (refresh if needed)
2. Make sure you're in "Login" mode (not signup mode)
3. The demo buttons should be visible below Google login
4. Click one button and wait (don't double-click)
5. You should see loading spinner, then redirect to dashboard

### Problem: "Can see demo buttons but they do nothing"

**Solution:**
1. Check browser console for errors (F12)
2. Check if all 3 auth users exist in Supabase
3. Check if SQL script ran successfully
4. Try manual login with credentials first
5. If manual login works, demo buttons should work

### Problem: "Logged in but can't see admin features"

**Solution:**
1. Go to Supabase → Table Editor → user_roles
2. Find your email
3. Check role column = 'admin' (exactly)
4. Check status column = 'active' (exactly)
5. If not correct, update the row
6. Logout and login again

---

## 📋 COMPLETE SETUP CHECKLIST

Use this checklist to verify everything is set up correctly:

```
STEP 1: Create Auth Users
  ☐ Created admin@greenidia.com in Supabase Auth
  ☐ Created supervisor@greenidia.com in Supabase Auth
  ☐ Created citizen@greenidia.com in Supabase Auth
  ☐ All 3 users visible in Authentication → Users tab

STEP 2: Run SQL Script
  ☐ Opened SQL Editor in Supabase
  ☐ Copied entire DEMO_ACCOUNTS_SETUP.sql
  ☐ Pasted into SQL Editor
  ☐ Clicked RUN button
  ☐ Script executed successfully with no errors

STEP 3: Verify Setup
  ☐ Ran verification query to check users
  ☐ All 3 users have correct roles assigned
  ☐ Admin has 'admin' role
  ☐ Supervisor has 'supervisor' role
  ☐ Citizen has 'citizen' role

STEP 4: Test Login
  ☐ Started dev server: npm run dev
  ☐ Went to http://localhost:5173/login
  ☐ Saw demo credentials section
  ☐ Clicked "Login as Admin" - SUCCESS ✅
  ☐ Redirected to /admin/dashboard
  ☐ Can see admin features

STEP 5: Test Other Accounts
  ☐ Went back to login page
  ☐ Clicked "Login as Supervisor" - SUCCESS ✅
  ☐ Redirected to /supervisor/dashboard
  ☐ Can see supervisor features
  ☐ Went back to login page
  ☐ Clicked "Login as Citizen" - SUCCESS ✅
  ☐ Redirected to /dashboard
  ☐ Can see citizen features

DONE! 🎉
```

---

## 🎬 VIDEO-STYLE WALKTHROUGH

```
PART 1: Create Auth Users (2 minutes)
├─ Open https://app.supabase.com
├─ Go to Authentication → Users
├─ Click "Invite" button
├─ Create admin@greenidia.com / Admin@123456
├─ Create supervisor@greenidia.com / Supervisor@123456
├─ Create citizen@greenidia.com / Citizen@123456
└─ Verify all 3 users appear in list

PART 2: Run SQL Setup (2 minutes)
├─ In Supabase, click "SQL Editor"
├─ Click "New Query"
├─ Open DEMO_ACCOUNTS_SETUP.sql file
├─ Copy entire content
├─ Paste into SQL editor
├─ Click "RUN" button
└─ Wait for success messages

PART 3: Test Demo Login (5 minutes)
├─ npm run dev
├─ Go to http://localhost:5173/login
├─ See demo credentials buttons
├─ Click "Login as Admin" → Admin Dashboard ✅
├─ Back to login
├─ Click "Login as Supervisor" → Supervisor Dashboard ✅
├─ Back to login
├─ Click "Login as Citizen" → Citizen Dashboard ✅
└─ All working! 🎉
```

---

## 📞 Final Checklist

After completing all steps above:

✅ **Admin Account Ready**
- Login with `admin@greentidia.com` / `Admin@123456`
- Can access `/admin/dashboard`
- Can see all admin features

✅ **Supervisor Account Ready**
- Login with `supervisor@greenidia.com` / `Supervisor@123456`
- Can access `/supervisor/dashboard`
- Can see all supervisor features
- Can only see Demo Zone 1 data

✅ **Citizen Account Ready**
- Login with `citizen@greenidia.com` / `Citizen@123456`
- Can access `/dashboard`
- Can see all citizen features
- Compliance score: 85%
- E-points: 250

✅ **Demo Buttons Working**
- One-click login buttons on `/login`
- All 3 buttons functional
- Auto-redirect to appropriate dashboard

---

## 🎯 NEXT STEPS

After successful setup:

1. **Explore Admin Features** - Create zones, manage users, monitor pickups
2. **Explore Supervisor Features** - Verify pickups, monitor workers, handle complaints
3. **Explore Citizen Features** - Schedule pickups, track compliance, earn rewards
4. **Create Test Data** - Use admin account to add more test data
5. **Test All Features** - Try each feature listed in FEATURES_VERIFICATION_REPORT.md

---

## ✨ YOU'RE ALL SET!

Follow this guide exactly, and all 3 demo accounts will work perfectly! 

Once setup is complete:
- ✅ Click "Login as Admin" to access admin features
- ✅ Click "Login as Supervisor" to access supervisor features  
- ✅ Click "Login as Citizen" to access citizen features

**If you still get errors after following this guide, reply with the exact error message and I'll help you fix it!** 😊
