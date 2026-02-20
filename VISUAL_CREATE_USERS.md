# 📱 CREATE AUTH USERS - VISUAL STEP-BY-STEP

## The Issue
Demo account not found because auth users don't exist in Supabase.

## ✅ Solution: Create them now (takes 5 minutes)

---

## 🎯 STEP 1: Go to Supabase Dashboard

1. **Open your browser**
2. **Go to:** https://app.supabase.com
3. **Login** with your Supabase account
4. **Select** your "Green India" project

You should see your project dashboard.

---

## 🎯 STEP 2: Click Authentication

On the left sidebar, look for and click:
```
├─ Project Settings
├─ Database
├─ Authentication ← CLICK THIS
├─ Storage
├─ Functions
└─ ...
```

Click **"Authentication"**

---

## 🎯 STEP 3: Click Users Tab

After clicking Authentication, you'll see tabs at the top:
```
[Users] [Policies] [Providers] [Email Templates]
```

Click the **"Users"** tab (should be first/default)

---

## 🎯 STEP 4: Create First User (Admin)

You should see a page with user list (probably empty) and a button at top right.

**Click the "Invite" button** (or similar button to create user)

A form will appear:

```
┌─────────────────────────────────┐
│ Email:                          │
│ [___________________________]   │
│                                 │
│ Password:                       │
│ [___________________________]   │
│                                 │
│ Confirm Password:               │
│ [___________________________]   │
│                                 │
│           [Send invite]         │
└─────────────────────────────────┘
```

**Fill in:**
- **Email:** `admin@greenidia.com`
- **Password:** `Admin@123456`
- **Confirm:** `Admin@123456`

**Click:** "Send invite" or "Create" or similar button

**Wait** a few seconds, you should see success message ✅

---

## 🎯 STEP 5: Create Second User (Supervisor)

Click "Invite" button again (you should be back at users list)

**Fill in:**
- **Email:** `supervisor@greenidia.com`
- **Password:** `Supervisor@123456`
- **Confirm:** `Supervisor@123456`

**Click:** "Send invite" button

**Wait** for success message ✅

---

## 🎯 STEP 6: Create Third User (Citizen)

Click "Invite" button again

**Fill in:**
- **Email:** `citizen@greenidia.com`
- **Password:** `Citizen@123456`
- **Confirm:** `Citizen@123456`

**Click:** "Send invite" button

**Wait** for success message ✅

---

## ✅ VERIFY ALL 3 USERS CREATED

After creating all 3, you should see them in the **Users list:**

```
admin@greenidia.com         ← Visible? ✓
supervisor@greenidia.com    ← Visible? ✓
citizen@greenidia.com       ← Visible? ✓
```

If you see all 3 emails in the list → **SUCCESS!** ✅

---

## 🎯 STEP 7: Run SQL Setup Script

Still in Supabase dashboard:

**Click** on **"SQL Editor"** (left sidebar):
```
├─ Project Settings
├─ Database
├─ Authentication 
├─ Storage
├─ Functions
├─ SQL Editor ← CLICK THIS
└─ ...
```

---

## 🎯 STEP 8: Create New Query

In SQL Editor, click **"New Query"** button (top right)

An empty SQL editor box will appear.

---

## 🎯 STEP 9: Copy and Paste SQL Script

1. **Open file** in your project folder:
   ```
   DEMO_ACCOUNTS_SETUP.sql
   ```

2. **Select ALL content:**
   - Press: `Ctrl+A`

3. **Copy:**
   - Press: `Ctrl+C`

4. **Go back to Supabase SQL Editor** (browser window)

5. **Click** in the empty query box

6. **Paste:**
   - Press: `Ctrl+V`

You should see SQL code in the editor.

---

## 🎯 STEP 10: Run SQL Query

In the SQL Editor, look for a **"RUN"** button (usually bottom right or top right area).

**Click** the "RUN" button.

**Wait** ~3-5 seconds for query to execute.

You should see:
```
✅ Success message (or query results)
✅ No red error messages
```

---

## ✅ DONE!

You have now:
1. ✅ Created 3 auth users in Supabase
2. ✅ Ran the SQL setup script

---

## 🎯 STEP 11: Test Demo Login

1. **Go to** your app: http://localhost:5173/login

2. **Refresh page** (press F5)

3. **Click** one of the demo buttons:
   ```
   [Login as Admin]       ← Red button
   [Login as Supervisor]  ← Blue button
   [Login as Citizen]     ← Green button
   ```

4. **If it works:**
   - ✅ You'll be logged in automatically
   - ✅ Redirected to dashboard
   - ✅ No error message!

---

## 📷 SCREENSHOTS (If Needed)

### Authentication Tab
```
┌─ Supabase Dashboard ──────────────────┐
│  Left Sidebar:                        │
│  ├─ Dashboard                         │
│  ├─ SQL Editor                        │
│  ├─ Authentication ← CLICK HERE       │
│  └─ ...                               │
│                                       │
│  Main Area:                           │
│  [Users] [Policies] [Providers] ...   │
│                                       │
│  [Invite] button (top right)          │
│  Users list (empty initially)         │
└───────────────────────────────────────┘
```

### Invite Form
```
┌─ Invite User ─────────────────────────┐
│                                       │
│  Email:                               │
│  [_____________________________]      │
│                                       │
│  Password:                            │
│  [_____________________________]      │
│                                       │
│  Confirm Password:                    │
│  [_____________________________]      │
│                                       │
│          [Send Invite]                │
│                                       │
└───────────────────────────────────────┘
```

### After All 3 Users Created
```
Users List:
✓ admin@greenidia.com
✓ supervisor@greenidia.com  
✓ citizen@greinidia.com
```

---

## 🆘 TROUBLESHOOTING

**Q: "I don't see an Invite button"**
- Look at top right corner of Users page
- May say "Create", "New User", "Add User" instead
- Click whichever exists

**Q: "Created user but I don't see it in the list"**
- Refresh page (F5)
- Wait a few seconds
- Should appear in the users list

**Q: "SQL script shows errors"**
- Make sure ALL 3 auth users were created FIRST
- Copy entire SQL script (don't skip any lines)
- Try running again

**Q: "Demo buttons still say invalid credentials"**
- Close browser completely
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (npm run dev)
- Open new browser window
- Try again

---

## ✅ FINAL CHECKLIST

```
☐ Opened https://app.supabase.com
☐ Selected Green India project
☐ Clicked Authentication
☐ Saw Users tab
☐ Created user: admin@greenidia.com
☐ Created user: supervisor@greenidia.com
☐ Created user: citizen@greenidia.com
☐ Verified all 3 users in Users list
☐ Clicked SQL Editor
☐ Created New Query
☐ Copied entire DEMO_ACCOUNTS_SETUP.sql
☐ Pasted into SQL Editor
☐ Clicked RUN button
☐ Saw success (no errors)
☐ Went to http://localhost:5173/login
☐ Clicked demo button
☐ Successfully logged in! ✅
```

---

## 🎉 SUCCESS!

If you completed all steps above:
- ✅ Demo accounts are created
- ✅ Demo buttons work
- ✅ You can login as Admin, Supervisor, or Citizen
- ✅ All features available

**Congratulations!** 🚀

---

## 📞 IF STILL STUCK

Tell me:
1. **What step are you stuck on?** (1-11)
2. **What error message do you see?**
3. **Did you see all 3 users in the Users list?**

I'll help you fix it! 💪
