# 🚨 IMMEDIATE ACTION REQUIRED

## Your Demo Buttons Show "Invalid Credentials"

This is because the auth users are **NOT created in Supabase yet**.

---

## ⚡ IMMEDIATE FIX (5 MINUTES)

### DO THIS RIGHT NOW:

**STEP 1: Go to Supabase**
```
https://app.supabase.com
→ Select your Green India project
→ Authentication (left sidebar)
→ Users tab
```

**STEP 2: Create 3 Auth Users**

Click "Invite" button and fill these in:

**User 1:**
```
Email: admin@greenidia.com
Password: Admin@123456
Confirm: Admin@123456
→ Click "Send invite"
```

**User 2:**
```
Email: supervisor@greenidia.com
Password: Supervisor@123456
Confirm: Supervisor@123456
→ Click "Send invite"
```

**User 3:**
```
Email: citizen@greinidia.com
Password: Citizen@123456
Confirm: Citizen@123456
→ Click "Send invite"
```

**Verify all 3 appear in Users list** ✅

---

**STEP 3: Run SQL Script**

```
SQL Editor (in Supabase)
→ New Query
→ Copy DEMO_ACCOUNTS_SETUP.sql (entire file)
→ Paste into editor
→ Click RUN button
→ Wait for success (should show no errors)
```

---

**STEP 4: Restart & Test**

```bash
npm run dev
```

Go to: `http://localhost:5173/login`

Click the demo buttons - they should work now! ✅

---

## 🎯 IF IT STILL DOESN'T WORK

### Try Manual Login Instead:

On login page:
- Email: `admin@greenidia.com`
- Password: `Admin@123456`
- Click "Sign In"

**If manual login works** → Demo buttons are just buggy, use manual

**If manual login fails** → Auth accounts not created (do STEP 1 again)

---

## 📚 REFERENCE FILES

| File | When to Use |
|------|-----------|
| **QUICK_FIX.md** | 🔥 Start here - simplest fix |
| **SIMPLE_DEMO_SETUP.md** | Visual 3-step guide |
| **DEBUG_INVALID_CREDENTIALS.md** | Detailed troubleshooting |
| **MANUAL_LOGIN.md** | Manual login backup |
| **DEMO_SETUP_GUIDE.md** | Complete detailed guide |

---

## 💡 THE ISSUE EXPLAINED

```
Demo button clicked
    ↓
Tries to login with: admin@greenidia.com, Admin@123456
    ↓
Supabase looks for this user
    ↓
User NOT FOUND (because you didn't create it!)
    ↓
Returns: "Invalid credentials" error
    ↓
SOLUTION: Create the auth user in Supabase FIRST
```

---

## ✅ DO THIS NOW

1. **Open:** https://app.supabase.com
2. **Go to:** Authentication → Users
3. **Create 3 users** with the emails/passwords above
4. **Run:** DEMO_ACCOUNTS_SETUP.sql
5. **Restart:** npm run dev
6. **Test:** Click demo buttons at http://localhost:5173/login

---

## 📞 AFTER YOU DO THE ABOVE

Let me know:
1. Did the demo buttons work? ✅
2. Or is it still showing error? ❌

I'm ready to help with the next step! 🚀

---

**👉 START WITH:** `QUICK_FIX.md` for fastest solution
