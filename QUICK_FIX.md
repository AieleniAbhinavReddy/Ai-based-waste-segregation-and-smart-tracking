# 🎯 MOST LIKELY ISSUE & FIX

## ❌ "Invalid Credentials" = Auth Users Don't Exist

---

## ✅ THE FIX (DO THIS RIGHT NOW)

### CHECK 1: Are the auth users created?

1. Open: **https://app.supabase.com**
2. Go to: **Authentication → Users**
3. Look at the list

**Do you see these 3 emails?**
```
admin@greenidia.com
supervisor@greinidia.com
citizen@greinidia.com
```

- ❌ **NO** → Go to "CREATE ACCOUNTS" section below
- ✅ **YES** → Go to "CHECK 2" below

---

## 🆘 CREATE ACCOUNTS (If Not Visible)

1. In Supabase, click **"Invite"** button (top right)
2. Create this:

```
Email: admin@greenidia.com
Password: Admin@123456
Confirm: Admin@123456
Click "Send invite"
```

3. Click "Invite" again and create:

```
Email: supervisor@greenidia.com
Password: Supervisor@123456
Confirm: Supervisor@123456
Click "Send invite"
```

4. Click "Invite" again and create:

```
Email: citizen@greenidia.com
Password: Citizen@123456
Confirm: Citizen@123456
Click "Send invite"
```

**Wait for all to appear in Users list** ✅

---

## CHECK 2: Did you run SQL script?

1. In Supabase, click **SQL Editor**
2. Did you run **DEMO_ACCOUNTS_SETUP.sql**?

- ❌ **NO** → Continue to "RUN SQL SCRIPT" section below
- ✅ **YES** → Go to "CHECK 3" below

---

## 🛠️ RUN SQL SCRIPT

1. In Supabase, **SQL Editor** → Click **"New Query"**
2. Open file: **DEMO_ACCOUNTS_SETUP.sql** (in your project folder)
3. Copy ENTIRE content (Ctrl+A → Ctrl+C)
4. Paste into SQL Editor (Ctrl+V)
5. Click **"RUN"** button
6. Wait for success (no red errors)

---

## CHECK 3: Test login

1. Make sure dev server running: `npm run dev`
2. Go to: **http://localhost:5173/login**
3. **Try to click a demo button**

**Does it work?**
- ✅ **YES** → SUCCESS! 🎉 You're done!
- ❌ **NO** → Continue below

---

## 🆘 STILL NOT WORKING?

### Try Manual Login Instead

On login page, DON'T click demo button. Instead:

1. Type manually in email field:
   ```
   admin@greinidia.com
   ```

2. Type in password field:
   ```
   Admin@123456
   ```

3. Click "Sign In" button

**Does manual login work?**
- ✅ **YES** → Demo buttons are just buggy, manual works fine
- ❌ **NO** → Auth accounts not created properly

---

## 📋 WHAT TO TELL ME IF STILL BROKEN

If nothing above works, **tell me:**

1. **In Supabase Authentication → Users tab:**
   - Do you see the 3 emails or not?
   - Take a screenshot

2. **When you click demo button:**
   - What error appears?
   - Open browser console (F12) and copy the error

3. **When you try manual login:**
   - What error appears?
   - Take a screenshot

With this info, I can fix it! 

---

## 9️⃣9️⃣% LIKELY CAUSE

You have NOT created the auth users in Supabase yet.

**Solution:**
1. Go to https://app.supabase.com
2. Authentication → Users
3. Create the 3 accounts (see "CREATE ACCOUNTS" section)
4. Try demo buttons again

That should fix it! ✅

---

## 📞 REFERENCE DOCS

- `SIMPLE_DEMO_SETUP.md` - Complete 3-step setup
- `DEBUG_INVALID_CREDENTIALS.md` - Detailed troubleshooting
- `MANUAL_LOGIN.md` - Try manual login instead
- `DEMO_SETUP_GUIDE.md` - Full detailed guide

---

**Try the "CREATE ACCOUNTS" section above RIGHT NOW and let me know if it works!** 🚀
