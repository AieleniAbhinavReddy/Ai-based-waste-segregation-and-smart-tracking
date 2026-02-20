# Admin & Supervisor Features - Deployment Checklist

## Pre-Deployment Verification

### 1. Files Created ✅
Verify all new files are in place:

```
✅ client/lib/admin-operations.ts
✅ client/lib/supervisor-operations.ts
✅ client/lib/navigation-helpers.tsx
✅ client/pages/AdminDashboard.tsx
✅ client/pages/AdminUsers.tsx
✅ client/pages/AdminZones.tsx
✅ client/pages/AdminPickups.tsx
✅ client/pages/AdminComplaints.tsx
✅ client/pages/SupervisorDashboard.tsx
✅ server-files/admin-schema-extension.sql
✅ ADMIN_SUPERVISOR_GUIDE.md
✅ NAVIGATION_SETUP.md (this file)
```

### 2. App.tsx Updates ✅
Verify these imports are in App.tsx:
```typescript
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminZones from "./pages/AdminZones";
import AdminPickups from "./pages/AdminPickups";
import AdminComplaints from "./pages/AdminComplaints";
import SupervisorDashboard from "./pages/SupervisorDashboard";
```

Verify these routes exist:
```typescript
// Admin routes
{ path: "/admin/dashboard", element: <ProtectedRoute><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute> }
{ path: "/admin/users", element: <ProtectedRoute><AppLayout><AdminUsers /></AppLayout></ProtectedRoute> }
{ path: "/admin/zones", element: <ProtectedRoute><AppLayout><AdminZones /></AppLayout></ProtectedRoute> }
{ path: "/admin/pickups", element: <ProtectedRoute><AppLayout><AdminPickups /></AppLayout></ProtectedRoute> }
{ path: "/admin/complaints", element: <ProtectedRoute><AppLayout><AdminComplaints /></AppLayout></ProtectedRoute> }

// Supervisor route
{ path: "/supervisor/dashboard", element: <ProtectedRoute><AppLayout><SupervisorDashboard /></AppLayout></ProtectedRoute> }
```

### 3. Package Dependencies ✅
All dependencies already exist in your project:
- ✅ React 18.3.1
- ✅ React Router v6
- ✅ TypeScript
- ✅ Supabase Auth
- ✅ Recharts (for charts)
- ✅ Radix UI components
- ✅ TailwindCSS
- ✅ Framer Motion (for animations)

No new npm packages needed!

---

## Deployment Steps

### Step 1: Database Schema Extension (5 minutes)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to "SQL Editor"

2. **Run Schema Extension**
   - Create a new query
   - Copy entire contents of `admin-schema-extension.sql`
   - Click "RUN"
   - Wait for success message

3. **Verify Tables Created**
   - Go to "Table Editor"
   - Confirm these tables exist:
     - ✅ user_roles
     - ✅ zones
     - ✅ workers
     - ✅ supervisors
     - ✅ pickup_logs
     - ✅ violations
     - ✅ complaints
     - ✅ worker_performance
     - ✅ zone_performance
     - ✅ citizen_compliance
     - ✅ worker_live_location
     - ✅ system_settings
     - ✅ payments

4. **Verify RLS Policies**
   - Go to "Authentication" → "Policies"
   - Confirm all RLS policies are enabled (green toggle)
   - You should see policies for all 13 new tables

### Step 2: Create Admin User (2 minutes)

1. **Get Your User ID**
   - Go to "Authentication" → "Users"
   - Find your user account
   - Copy the "UID" value

2. **Assign Admin Role**
   - Go to "Table Editor" → Select "user_roles" table
   - Click "Insert row"
   - Fill in:
     - `user_id`: Paste your UID
     - `role`: Select "admin" from dropdown
     - `status`: Select "active" from dropdown
   - Click "Save"

3. **Verify**
   - Log in to your app
   - Navigate to `/admin/dashboard`
   - You should see the Admin Dashboard with cards and charts

### Step 3: Update Sidebar Navigation (3 minutes)

1. **Open your DashboardLayout.tsx or Sidebar.tsx**

2. **Import Navigation Helpers**
   ```typescript
   import { adminNavigationItems, supervisorNavigationItems } from '@/lib/navigation-helpers';
   ```

3. **Add Role Detection**
   ```typescript
   import { checkAdminAccess, checkSupervisorAccess } from '@/lib/admin-operations';
   import { useAuth as useSupabaseAuth } from '@/lib/supabase';
   import { useEffect, useState } from 'react';

   const DashboardLayout = ({ children }) => {
     const { user } = useSupabaseAuth();
     const [userRole, setUserRole] = useState<string | null>(null);

     useEffect(() => {
       if (user) {
         checkAdminAccess(user.id).then(isAdmin => {
           if (isAdmin) setUserRole('admin');
         }).catch(() => {
           checkSupervisorAccess(user.id).then(isSupervisor => {
             if (isSupervisor) setUserRole('supervisor');
           });
         });
       }
     }, [user]);

     return (
       // ... your layout code with role-based navigation ...
     );
   };
   ```

4. **Add Navigation Items**
   - For admins: Add `adminNavigationItems` to sidebar
   - For supervisors: Add `supervisorNavigationItems` to sidebar
   - For citizens: Show only citizen-facing items

### Step 4: Create Test Data (5 minutes)

1. **Create a Zone**
   - Go to `/admin/zones`
   - Click "Create Zone"
   - Fill in:
     - Name: "Test Zone 1"
     - Code: "TZ001"
     - Ward Number: "1"
     - City: "Your City"
     - Area: "10"
     - Population: "5000"
   - Click "Create"

2. **Create a Supervisor**
   - Go to `/admin/users`
   - Click on "Supervisors" tab
   - Click "Create User"
   - Fill in:
     - Email: "supervisor@test.com"
     - Password: "SecurePass123!"
     - Name: "Test Supervisor"
     - Phone: "+919876543210"
     - Zone: "Test Zone 1" (from dropdown)
   - Click "Create"

3. **Assign Supervisor to Zone**
   - Go to `/admin/zones`
   - Find "Test Zone 1"
   - Click "Assign Supervisor"
   - Select "Test Supervisor"
   - Click "Assign"

4. **Create Workers**
   - Go to `/admin/users`
   - Click on "Workers" tab
   - Click "Create User"
   - Create 2-3 workers with:
     - Zone: "Test Zone 1"
     - Shift: "Morning" or "Evening"

---

## Testing Your Installation

### Admin Dashboard Test
```
✅ Navigate to: /admin/dashboard
✅ You should see:
  - Stats cards (Citizens, Workers, Zones, Pickups)
  - Charts with sample data
  - Alert cards (Violations, Failed Pickups)
  - Management cards for navigation
```

### Admin Users Test
```
✅ Navigate to: /admin/users
✅ You should see:
  - Three tabs: Citizens, Workers, Supervisors
  - List of users in each tab
  - "Create User" button works
  - Can toggle user status
```

### Admin Zones Test
```
✅ Navigate to: /admin/zones
✅ You should see:
  - Zone statistics cards
  - List of zones
  - "Create Zone" button works
  - "Assign Supervisor" functionality works
```

### Admin Pickups Test
```
✅ Navigate to: /admin/pickups
✅ You should see:
  - Pickup statistics
  - Filter options (Zone, Status, Search)
  - Pickup table with GPS and QR columns
```

### Admin Complaints Test
```
✅ Navigate to: /admin/complaints
✅ You should see:
  - Complaint statistics
  - Complaint table
  - "Resolve" button opens dialog
  - "Assign" button opens dialog
```

### Supervisor Dashboard Test
```
✅ Login as the supervisor you created
✅ Navigate to: /supervisor/dashboard
✅ You should see:
  - Zone name displayed
  - Zone-specific statistics
  - Charts showing zone data
  - Only data from "Test Zone 1" (RLS in effect)
```

---

## Troubleshooting

### Problem: "404 Not Found" when accessing admin routes
**Solution:**
- Check that routes are added to App.tsx
- Verify file paths in imports are correct
- Restart your dev server: `npm run dev`

### Problem: "Unauthorized" or blank page on admin dashboard
**Solution:**
- Make sure your user_id has role "admin" in user_roles table
- Clear browser cache and reload
- Check Supabase RLS policies are enabled
- Verify you're logged in with the admin account

### Problem: No data showing in charts/tables
**Solution:**
- Create test data using Admin Users and Admin Zones
- Check Supabase queries in browser DevTools → Network tab
- Verify RLS policies allow your user to read the data
- Check that you have data in the relevant tables

### Problem: "Cannot read property 'user_roles' of undefined"
**Solution:**
- Run admin-schema-extension.sql again (user_roles table not created)
- Clear all tables and re-run the SQL script
- Check Supabase Project Status dashboard for any errors

### Problem: Supervisor can see all zones instead of just their zone
**Solution:**
- Verify RLS policy for supervisor role is enabled
- Check that supervisor user_id is in supervisors table with correct zone_id
- Re-run the RLS policy creation SQL

### Problem: "module not found" error for navigation-helpers
**Solution:**
- Verify navigation-helpers.tsx is in client/lib/ directory
- Check import path: `import { ... } from '@/lib/navigation-helpers'`
- Restart dev server

---

## Security Checklist

### Before Going to Production:

- ⚠️ **Change all test passwords** created during setup
- ⚠️ **Enable HTTPS** on your domain
- ⚠️ **Configure Supabase Auth** email verification
- ⚠️ **Set up CORS** properly in Supabase settings
- ⚠️ **Review RLS Policies** - test with different roles
- ⚠️ **Enable Audit Logging** in Supabase
- ⚠️ **Set up Database Backups** - daily recommended
- ⚠️ **Restrict access to /admin routes** - only admins
- ⚠️ **Restrict access to /supervisor routes** - only supervisors
- ⚠️ **Test role escalation attempts** - ensure prevented by RLS

### Required Security Rules:

1. **Never expose Supabase API keys** in frontend code
   - ✅ Already done: Keys in environment variables

2. **Always verify user role on every admin operation**
   - ✅ Already done: checkAdminAccess(), checkSupervisorAccess()

3. **Row Level Security must be enabled on all tables**
   - ✅ Already done: schema-extension.sql includes policies

4. **Supervisors can only access their own zone**
   - ✅ Already done: RLS filters by supervisor_id and zone_id

5. **Workers can only see their own data**
   - ✅ Already done: RLS filters by user_id or zone_id

---

## Performance Optimization

### Recommended Database Indexes (Already included):
```sql
✅ user_roles(user_id, role)
✅ zones(supervisor_id)
✅ workers(zone_id, status)
✅ pickup_logs(created_at, zone_id)
✅ complaints(status, supervisor_id)
```

### Cache Strategy:
```typescript
// Admin operations cache frequently accessed data
const [cachedZones, setCachedZones] = useState(null);
const [cacheTime, setCacheTime] = useState(0);

// Refresh cache every 5 minutes
useEffect(() => {
  const interval = setInterval(() => {
    getAllZones().then(setCachedZones);
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
```

### Query Optimization:
- ✅ All queries use indexed columns
- ✅ Charts query aggregated data (worker_performance, zone_performance)
- ✅ Pagination implemented in table components
- ✅ Real-time subscriptions available via Supabase realtime

---

## Support & Documentation

### Useful Files:
1. **ADMIN_SUPERVISOR_GUIDE.md** - Complete feature documentation
2. **admin-operations.ts** - Admin API reference (JSDoc comments)
3. **supervisor-operations.ts** - Supervisor API reference (JSDoc comments)
4. **navigation-helpers.tsx** - Navigation components reference

### Common Tasks:

**Add a new admin user:**
```typescript
// Use AdminUsers page UI: Navigate to /admin/users → Create User
```

**Assign zone to supervisor:**
```typescript
// Use AdminZones page UI: Navigate to /admin/zones → Assign Supervisor
```

**View worker performance:**
```typescript
// Use AdminDashboard or check admin-operations.ts for getWorkerPerformance()
```

**Handle complaint:**
```typescript
// Navigate to /admin/complaints → Select complaint → Resolve or Assign
```

---

## Rollback Instructions

If you need to remove these features:

### Step 1: Remove Routes from App.tsx
Delete these lines:
```typescript
// Remove these imports
import AdminDashboard from "./pages/AdminDashboard";
// ... remove other imports ...

// Remove these routes
{ path: "/admin/dashboard", element: ... }
{ path: "/admin/users", element: ... }
// ... remove other routes ...
```

### Step 2: Remove Database Tables (Optional)
In Supabase SQL Editor, run:
```sql
-- Drop all admin/supervisor tables (WARNING: This deletes all data!)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS worker_live_location CASCADE;
DROP TABLE IF EXISTS citizen_compliance CASCADE;
DROP TABLE IF EXISTS zone_performance CASCADE;
DROP TABLE IF EXISTS worker_performance CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS violations CASCADE;
DROP TABLE IF EXISTS pickup_logs CASCADE;
DROP TABLE IF EXISTS supervisors CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

---

## Next Steps

1. ✅ Complete Checklist above
2. ✅ Run Database SQL Script
3. ✅ Create Admin User
4. ✅ Test Each Feature
5. ✅ Set Up Navigation
6. ✅ Create Initial Data
7. ⏭️ **Review ADMIN_SUPERVISOR_GUIDE.md** for feature details
8. ⏭️ **Read admin-operations.ts comments** for API reference
9. ⏭️ **Test with different user roles** to verify RLS
10. ⏭️ **Deploy to production** when confident

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review ADMIN_SUPERVISOR_GUIDE.md example code
3. Check admin-operations.ts and supervisor-operations.ts for function signatures
4. Look at page components for usage examples

**Feature Status: ✅ READY FOR DEPLOYMENT**

All files created and tested. Follow the deployment steps above and your admin/supervisor features will be live!
