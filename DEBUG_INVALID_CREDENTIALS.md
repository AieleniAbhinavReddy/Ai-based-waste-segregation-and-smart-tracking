# 🔧 DEBUG: Why Demo Accounts Not Working

## ❌ You're Getting "Invalid Credentials"

This means **the auth users don't exist in your Supabase yet**.

Let me help you verify and fix this step by step.

---

## 🔍 **VERIFICATION CHECKLIST**

Go through this checklist to find the issue:

### **CHECK 1: Did You Create Auth Users?**

1. Open: **https://app.supabase.com**
2. Select your **Green India project**
3. Click: **Authentication** (left sidebar)
4. Click: **Users** tab
5. Look at the users list

**What you should see:**
```
✅ admin@greenidia.com
✅ supervisor@greenidia.com  
✅ citizen@greenidia.com
```

**If you DON'T see all 3:**
- ❌ STOP - Go create them NOW (see STEP 1 below)
- ✅ If you see them, continue to CHECK 2

---

### **CHECK 2: Did You Run the SQL Script?**

1. In Supabase, click: **SQL Editor**
2. Look for your query (should have run the DEMO_ACCOUNTS_SETUP.sql)
3. Check if it shows: ✅ **No errors**

**What you should see:**
```
Query Status: Success ✅
Rows inserted: Multiple rows
```

**If you see errors:**
- ❌ STOP - Go run it again (see STEP 2 below)
- ✅ If success, continue to CHECK 3

---

### **CHECK 3: Verify User Roles in Database**

1. In Supabase, click: **Table Editor**
2. Click: **user_roles** table
3. Look for rows with these users:

**What you should see:**
```
Email: admin@greenidia.com           → role: admin      → status: active
Email: supervisor@greenidia.com      → role: supervisor → status: active
Email: citizen@greenidia.com         → role: citizen    → status: active
```

**If missing:**
- ❌ Go run DEMO_ACCOUNTS_SETUP.sql again
- ✅ If correct, continue to CHECK 4

---

### **CHECK 4: Check Browser Console for Errors**

1. Open login page: **http://localhost:5173/login**
2. Open browser DevTools: **F12 or Ctrl+Shift+I**
3. Click: **Console** tab
4. Click demo button (e.g., "Login as Admin")
5. Look for error messages

**What you should look for:**
```
🔐 Attempting demo login for admin: admin@greenidia.com
✅ Login successful for admin
```

**If you see:**
```
❌ Demo login error for admin:
Error details: { message: "Invalid login credentials" }
```

**This means:** Auth user doesn't exist or wrong password

---

## 🛠️ **FIX: COMPLETE SETUP (Do This Now)**

### **STEP 1: Create Auth Users** ⭐ (MUST DO THIS FIRST!)

**VERY IMPORTANT:** Auth users MUST be created in Supabase BEFORE running SQL script!

1. Open: **https://app.supabase.com**
2. Select your project
3. Go to: **Authentication → Users**
4. Click: **"Invite"** button (top right)

#### Create User 1: ADMIN
```
Email:    admin@greenidia.com
Password: Admin@123456
Confirm:  Admin@123456
Click "Send invite"
Wait for confirmation
```

#### Create User 2: SUPERVISOR
```
Email:    supervisor@greenidia.com
Password: Supervisor@123456
Confirm:  Supervisor@123456
Click "Send invite"
Wait for confirmation
```

#### Create User 3: CITIZEN
```
Email:    citizen@greenidia.com
Password: Citizen@123456
Confirm:  Citizen@123456
Click "Send invite"
Wait for confirmation
```

#### ✅ Verify All Created
After creating, you should see in Users list:
```
✅ admin@greenidia.com        [Active]
✅ supervisor@greenidia.com   [Active]
✅ citizen@greenidia.com      [Active]
```

**STOP HERE and verify all 3 are visible before proceeding!**

---

### **STEP 2: Delete Old/Broken SQL Queries**

Before running new SQL, clean up old ones:

1. In Supabase, go to **SQL Editor**
2. Look at left sidebar for previous queries
3. If you see old DEMO_ACCOUNTS_SETUP queries, DELETE them
4. Start fresh with a NEW query

---

### **STEP 3: Run SQL Setup Script**

1. In Supabase **SQL Editor**, click: **"New Query"** (top right)
2. Open file from your project: **DEMO_ACCOUNTS_SETUP.sql**
3. Copy the ENTIRE content:
   ```
   - Start from: -- =====================================================
   - End at: -- If zone creation fails
   ```
4. Paste into SQL Editor
5. Click: **"RUN"** button (bottom right)
6. Wait for completion

### ✅ Check for Success

After running, you should see:
```
✅ INSERT 0 1  (or similar - means success)
✅ No red errors
```

**If you see NO error messages = SUCCESS!** ✅

---

### **STEP 4: Verify Database Setup**

Run verification query to confirm:

1. In SQL Editor, click: **"New Query"**
2. Copy and paste this:

```sql
SELECT ur.id, up.email, ur.role, ur.status 
FROM public.user_roles ur
JOIN public.user_profiles up ON ur.user_id = up.id
WHERE up.email LIKE '%greenidia.com%'
ORDER BY up.email;
```

3. Click **"RUN"** button
4. You should see:

```
email                        | role         | status
admin@greenidia.com          | admin        | active
supervisor@greenidia.com     | supervisor   | active
citizen@greenidia.com        | citizen      | active
```

**All 3 accounts with correct roles = SUCCESS!** ✅

---

### **STEP 5: Test Demo Login**

1. Make sure dev server running: `npm run dev`
2. Open in browser: **http://localhost:5173/login**
3. **Close and reopen browser** (to clear cache)
4. Click one of these buttons:
   - **"Login as Admin"** (Red)
   - **"Login as Supervisor"** (Blue)
   - **"Login as Citizen"** (Green)

5. If it works:
   - ✅ You'll be redirected to appropriate dashboard
   - ✅ Should NOT see error message

---

## 🎯 **STEP-BY-STEP VISUAL GUIDE**

```
START HERE
    ↓
CHECK 1: See 3 auth users in Supabase?
    ↓
    NO → CREATE THEM (STEP 1 above)
    YES → Continue
    ↓
CHECK 2: Run SQL script?
    ↓
    NO → RUN IT (STEP 3 above)
    YES → Continue
    ↓
CHECK 3: See correct roles in user_roles table?
    ↓
    NO → RE-RUN SQL (STEP 3 above)
    YES → Continue
    ↓
TEST: Click demo button
    ↓
WORKS? → SUCCESS! 🎉
DOESN'T WORK? → See TROUBLESHOOTING below
```

---

## 🆘 **TROUBLESHOOTING**

### Problem 1: "Invalid login credentials" error

**Cause:** Auth user doesn't exist  
**Fix:**
1. Go check Authentication → Users
2. Make sure all 3 emails are there
3. If not, CREATE them (STEP 1)
4. If yes, DELETE and RE-CREATE them

---

### Problem 2: "Email not confirmed" error

**Cause:** New Supabase accounts need confirmation  
**Fix:**
1. Go to Authentication → Users
2. Find the user email
3. Click the user
4. Look for email confirmation status
5. Mark as confirmed (there should be an option)

---

### Problem 3: "User already exists" error in SQL

**Cause:** Duplicate user  
**Fix:**
1. Delete users in Supabase Auth
2. Delete old queries in SQL Editor
3. START FRESH with new auth users (STEP 1)
4. Run fresh SQL query (STEP 3)

---

### Problem 4: Still getting "Invalid credentials" after all above

**Advanced debugging:**
1. Open browser console (F12)
2. Click demo button
3. Take a screenshot of console error
4. Check these browser console messages:
   ```
   🔐 Attempting demo login for admin: admin@greenidia.com
   ❌ Demo login error for admin:
   Error details: { message: "..." }
   ```
5. Share the exact error message

---

## 📋 **COMPLETE CHECKLIST**

Use this to confirm everything is set up:

```
SETUP VERIFICATION:
☐ Created auth user: admin@greenidia.com
☐ Created auth user: supervisor@greenidia.com
☐ Created auth user: citizen@greenidia.com
☐ All 3 visible in Supabase Authentication → Users
☐ Ran DEMO_ACCOUNTS_SETUP.sql with NO errors
☐ Verified user_roles table has all 3 with correct roles
☐ npm run dev is running
☐ Opened http://localhost:5173/login

LOGIN TEST:
☐ Can see demo buttons on login page
☐ Clicked "Login as Admin" button
☐ Browser shows console message: 🔐 Attempting... and ✅ Login successful
☐ Redirected to /admin/dashboard
☐ Can see admin features

☐ Clicked "Login as Supervisor" button
☐ Browser shows console message: 🔐 Attempting... and ✅ Login successful
☐ Redirected to /supervisor/dashboard
☐ Can see supervisor features

☐ Clicked "Login as Citizen" button
☐ Browser shows console message: 🔐 Attempting... and ✅ Login successful
☐ Redirected to /dashboard
☐ Can see citizen features

🎉 ALL WORKING!
```

---

## 📞 **IF STILL STUCK**

Do this:

1. **Take a screenshot** of:
   - Supabase Authentication → Users tab (showing all 3 emails)
   - Supabase Table Editor → user_roles table (showing all 3 with roles)
   - Browser console error (F12 → Console → click demo button)

2. **Tell me:**
   - Did you complete STEP 1, 2, 3, 4, 5 above?
   - What error appears in browser console? (F12)
   - What error appears when you click demo button?

3. **I'll help you fix it!** 💪

---

## 🎬 **QUICK FIX (Try This First)**

If still not working:

```
1. Delete all 3 auth users from Supabase
2. Close browser completely
3. Re-create all 3 auth users (STEP 1)
4. Run fresh SQL query (STEP 3)
5. Clear browser cache (Ctrl+Shift+Del)
6. Restart dev server (npm run dev)
7. Open new browser window
8. Go to /login
9. Click demo button
10. Should work now! ✅
```

---

## ✨ **NEXT: After Demo Works**

Once all 3 demo accounts login successfully:

1. **Explore Admin Dashboard** → Create test data
2. **Explore Supervisor Dashboard** → Monitor operations
3. **Explore Citizen Dashboard** → Try citizen features
4. **Test All Features** → See FEATURES_VERIFICATION_REPORT.md

---

**Questions?** Read `SIMPLE_DEMO_SETUP.md` or `DEMO_SETUP_GUIDE.md` for full details.

**Still broken?** Follow the TROUBLESHOOTING section above and tell me the exact error! 🆘
