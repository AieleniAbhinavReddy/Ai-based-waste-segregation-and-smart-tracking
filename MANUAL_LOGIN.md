# 🆘 MANUAL BACKUP LOGIN (If Demo Buttons Not Working)

## Use This if Demo Buttons Keep Failing

---

## 🎯 MANUAL LOGIN - 3 DEMO ACCOUNTS

### Go to Login Page
```
http://localhost:5173/login
```

### MANUAL LOGIN 1: ADMIN

In the login form, manually type:

**Email field:**
```
admin@greenidia.com
```

**Password field:**
```
Admin@123456
```

**Click:** "Sign In" button

**Expected Result:**
- ✅ Redirect to `/admin/dashboard`
- ✅ See admin features (Users, Zones, Pickups, Complaints)

---

### MANUAL LOGIN 2: SUPERVISOR

1. Go back to login page
2. In the login form, manually type:

**Email field:**
```
supervisor@greenidia.com
```

**Password field:**
```
Supervisor@123456
```

**Click:** "Sign In" button

**Expected Result:**
- ✅ Redirect to `/supervisor/dashboard`
- ✅ See supervisor features (Zone overview, Worker monitoring)

---

### MANUAL LOGIN 3: CITIZEN

1. Go back to login page
2. In the login form, manually type:

**Email field:**
```
citizen@greenidia.com
```

**Password field:**
```
Citizen@123456
```

**Click:** "Sign In" button

**Expected Result:**
- ✅ Redirect to `/dashboard`
- ✅ See citizen features (Schedule pickups, View rewards)

---

## ✅ WHAT TO TRY

If manual login works but demo buttons don't:

1. **Clear cache:**
   - Press: `Ctrl+Shift+Delete`
   - Clear all browsing data
   - Restart browser

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Try demo buttons again**

---

## ⚠️ IF EVEN MANUAL LOGIN FAILS

**"Invalid credentials" on all 3:**
- The auth accounts DON'T exist in Supabase yet
- Follow `SIMPLE_DEMO_SETUP.md` STEP 1 to create them
- Then try manual login again

**"Email not confirmed" message:**
- Auth user exists but not activated
- Go to Supabase → Authentication → Users
- Click the user and confirm their email

**"Password incorrect":**
- Typo in password
- Check case sensitivity (Capital letters matter!)
- Try copying/pasting the password exactly

---

## 🎬 TROUBLESHOOTING FLOW

```
Try Manual Login
    ↓
SUCCESS (Logged in)? → Everything working! ✅
    ↓
NO - "Invalid credentials"?
    → Auth users not created yet
    → Go to SIMPLE_DEMO_SETUP.md STEP 1

NO - "Email not confirmed"?
    → Go to Supabase → Auth → Users
    → Find user and confirm email
    → Try login again

NO - Other error?
    → Take screenshot
    → Check console (F12)
    → Contact support
```

---

## 💡 TIPS

✅ **Passwords are CASE SENSITIVE**
- `Admin@123456` ≠ `admin@123456`
- Copy/paste to avoid typos

✅ **Email must be EXACT**
- `admin@greenidia.com` (not greenidia.io or com.au)
- Check for typos

✅ **Use Chrome/Firefox**
- Some browsers have auth issues
- Try different browser if problems persist

✅ **Dev server must be running**
- Terminal should show: `Local: http://localhost:5173`
- If not, run: `npm run dev`

---

## 📖 NEXT STEPS

After successful manual login:

1. **Explore features**
   - Admin: `/admin/dashboard`
   - Supervisor: `/supervisor/dashboard`
   - Citizen: `/dashboard`

2. **Create test data** (as Admin)
   - Go to `/admin/users` → Create new users
   - Go to `/admin/zones` → Create new zones

3. **View all features**
   - See `FEATURES_VERIFICATION_REPORT.md`

---

**Still having issues?**

1. Check `DEBUG_INVALID_CREDENTIALS.md` for detailed troubleshooting
2. Follow `SIMPLE_DEMO_SETUP.md` STEP 1 to create auth accounts
3. Share exact error message for help
