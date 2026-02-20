# Admin & Supervisor Features Integration Guide

## Overview

This guide documents the complete implementation of Admin and Supervisor features for the Smart Waste Management System. These features provide municipal authorities and zone supervisors with powerful tools to manage waste collection operations efficiently.

---

## Table of Contents

1. [Database Schema Extensions](#database-schema-extensions)
2. [Admin Features](#admin-features)
3. [Supervisor Features](#supervisor-features)
4. [Library Functions](#library-functions)
5. [Pages & Routes](#pages--routes)
6. [Setup Instructions](#setup-instructions)
7. [API Endpoints](#api-endpoints)
8. [Best Practices](#best-practices)

---

## Database Schema Extensions

### New Tables Created

All new tables have been added via the `admin-schema-extension.sql` file:

#### 1. **user_roles**
- Manages user roles (citizen, worker, supervisor, admin)
- Features: role-based access control, status tracking
- Fields: `user_id`, `role`, `status`, `created_at`, `updated_at`

#### 2. **zones**
- Defines waste collection zones
- Features: supervisor assignment, performance tracking
- Fields: `name`, `code`, `ward_number`, `city`, `area_sqkm`, `population`, `supervisor_id`

#### 3. **workers**
- Tracks waste collection workers
- Features: zone assignment, shift management, GPS tracking status
- Fields: `user_id`, `zone_id`, `supervisor_id`, `phone`, `vehicle_type`, `shift`, `status`

#### 4. **supervisors**
- Manages zone supervisors
- Features: zone assignment, performance tracking
- Fields: `user_id`, `zone_id`, `phone`, `department`, `status`

#### 5. **pickup_logs**
- Records all waste pickups
- Features: GPS verification, QR code tracking, photo proof
- Fields: `zone_id`, `worker_id`, `citizen_id`, `gps_latitude`, `gps_longitude`, `qr_code`, `status`

#### 6. **violations**
- Tracks violations and compliance issues
- Features: severity levels, auto-penalties, resolution tracking
- Fields: `zone_id`, `user_id`, `violation_type`, `severity`, `penalty_epoints`, `resolved`

#### 7. **complaints**
- Manages citizen complaints
- Features: priority levels, assignment, resolution tracking
- Fields: `zone_id`, `filed_by_id`, `assigned_to_id`, `category`, `priority`, `status`

#### 8. **worker_performance**
- Tracks worker metrics
- Features: efficiency scoring, compliance tracking
- Fields: `worker_id`, `total_pickups`, `completed_pickups`, `efficiency_score`, `compliance_score`

#### 9. **zone_performance**
- Tracks zone metrics
- Features: compliance percentage, waste collection data
- Fields: `zone_id`, `total_pickups`, `completed_pickups`, `compliance_percentage`

#### 10. **citizen_compliance**
- Tracks citizen behavior
- Features: compliance scoring, violation tracking
- Fields: `citizen_id`, `compliance_score`, `total_waste_generated_kg`, `violations`

#### 11. **worker_live_location**
- Real-time worker GPS location
- Features: live tracking, location accuracy
- Fields: `worker_id`, `latitude`, `longitude`, `accuracy`, `timestamp`

#### 12. **system_settings**
- Configurable system parameters
- Features: scoring rules, penalty settings, GPS tolerance
- Fields: `setting_key`, `setting_value`, `category`, `updated_by`

#### 13. **payments**
- Tracks citizen payments
- Features: payment status, amount tracking
- Fields: `citizen_id`, `zone_id`, `amount`, `status`, `payment_method`

### Row Level Security (RLS) Policies

All tables have RLS policies configured to ensure:
- **Admins**: Full access to all data
- **Supervisors**: Access to their zone's data only
- **Workers**: Access to their own data and zone pickups
- **Citizens**: Access to own data only

---

## Admin Features

### 1. Admin Dashboard (`/admin/dashboard`)
**File**: `client/pages/AdminDashboard.tsx`

**Features**:
- Overview cards: Total citizens, workers, zones, pickups
- Real-time statistics: QR success rate, violations, failed pickups
- Weekly pickup trends chart
- Zone compliance comparison chart
- Quick action buttons for common tasks

**Key Metrics**:
- Pickups today
- Pickups this month
- Failed pickups
- Active violations
- QR verification success rate

### 2. User Management (`/admin/users`)
**File**: `client/pages/AdminUsers.tsx`

**Functions**:
- ✅ Create new citizens, workers, supervisors
- ✅ Edit user details
- ✅ Deactivate users
- ✅ View user status and activity
- ✅ Assign roles

**Tabs**:
- Citizens
- Workers
- Supervisors

**Import**: `admin-operations.ts`

```typescript
// Create a new worker
await createNewUser({
  email: "worker@example.com",
  password: "password123",
  full_name: "John Doe",
  role: "worker",
  zone_id: "zone-123",
  phone: "+91-9876543210",
  shift: "morning"
});

// Deactivate a user
await deactivateUser(userId);
```

### 3. Zone Management (`/admin/zones`)
**File**: `client/pages/AdminZones.tsx`

**Functions**:
- ✅ Create new zones
- ✅ Edit zone details
- ✅ Assign supervisors to zones
- ✅ View zone statistics
- ✅ Track zone performance

**Key Operations**:
```typescript
// Create a zone
await createZone({
  name: "Downtown Zone A",
  code: "ZA-001",
  ward_number: "12",
  city: "Mumbai",
  area_sqkm: 2.5,
  population: 50000,
  supervisor_id: "supervisor-123"
});

// Assign supervisor
await assignSupervisorToZone(zoneId, supervisorId);
```

### 4. Pickup Monitoring (`/admin/pickups`)
**File**: `client/pages/AdminPickups.tsx`

**Real-Time Features**:
- Monitor all pickups in real-time
- View GPS locations
- Check QR verification status
- Filter by zone, worker, status
- Track waste weights

**Filters**:
- Status: Completed, Failed, Scheduled
- Zone: All zones
- Search: By zone, worker, or citizen ID

**Data Displayed**:
- Date/Time of pickup
- Worker & Citizen identifiers
- GPS coordinates
- Waste weight
- QR verification status
- Pickup status

### 5. Complaint Management (`/admin/complaints`)
**File**: `client/pages/AdminComplaints.tsx`

**Functions**:
- ✅ View all complaints
- ✅ Assign to supervisors
- ✅ Mark as resolved
- ✅ Filter by status and priority
- ✅ Add resolution details

**Complaint Categories**:
- Worker behavior
- Missed pickup
- Improper disposal
- Vehicle issue
- Contamination
- Other

**Priority Levels**:
- Urgent (Red)
- High (Orange)
- Medium (Yellow)
- Low (Green)

---

## Supervisor Features

### 1. Supervisor Dashboard (`/supervisor/dashboard`)
**File**: `client/pages/SupervisorDashboard.tsx`

**View-Only Access**: Supervisors can only see their assigned zone's data

**Key Metrics**:
- Total citizens in zone
- Total workers in zone
- Today's pickups
- Pending pickups
- Zone compliance score
- Violations today
- Active complaints

**Charts**:
- Weekly pickup trends
- Worker efficiency comparison

**Quick Actions**:
- Worker Monitoring
- Pickup Verification
- Complaint Handling
- Performance Review

### 2. Zone Monitoring
Supervisors see only their assigned zone with:
- Citizen count
- Worker count
- Daily pickup statistics
- Compliance score
- Active violations
- Open complaints

---

## Library Functions

### Admin Operations (`client/lib/admin-operations.ts`)

#### User Management
```typescript
getAllUsers(filters?) - Get all users with filters
getAllCitizens() - Get all citizens
getAllWorkers() - Get all workers
getAllSupervisors() - Get all supervisors
createNewUser(userData) - Create new user
updateUserRole(userId, updates) - Update user role/status
deactivateUser(userId) - Soft delete user
```

#### Zone Management
```typescript
getAllZones() - Get all zones with performance data
getZoneDetails(zoneId) - Get zone with workers and performance
createZone(zoneData) - Create new zone
updateZone(zoneId, updates) - Update zone details
assignSupervisorToZone(zoneId, supervisorId) - Assign supervisor
```

#### Pickup Monitoring
```typescript
getPickupStats() - Get overall pickup statistics
getPickupLogs(filters) - Get all pickup logs with filters
```

#### Violations & Complaints
```typescript
getAllViolations(filters) - Get all violations
resolveViolation(violationId) - Mark violation as resolved
getAllComplaints(filters) - Get all complaints
assignComplaint(complaintId, supervisorId) - Assign complaint
resolveComplaint(complaintId, resolution) - Resolve complaint
```

#### Performance & Analytics
```typescript
getWorkerPerformance(workerId?) - Get worker performance data
getZonePerformance(zoneId?) - Get zone performance data
getCitizenCompliance(filters?) - Get citizen compliance data
generateZoneWasteReport(zoneId, period) - Generate analytics report
getPaymentStats(zoneId?) - Get payment information
```

#### Utilities
```typescript
checkAdminAccess(userId) - Check if user has admin access
exportToCSV(data, filename) - Export data to CSV
```

### Supervisor Operations (`client/lib/supervisor-operations.ts`)

#### Zone Monitoring
```typescript
getSupervisorZoneData(supervisorId) - Get zone overview
```

#### Worker Monitoring
```typescript
getSupervisorWorkers(supervisorId) - Get all workers in zone
getWorkerRoute(workerId) - Get worker's pickup route for day
getWorkerPickupHistory(workerId, days) - Get worker history
flagWorkerViolation(data) - Flag worker violation
```

#### Pickup Verification
```typescript
getSupervisorPickupsToVerify(supervisorId) - Get pickups to verify
checkGPSMismatch(pickupLogId, expectedLat, expectedLng, tolerance) - GPS validation
verifyPickup(pickupId, data) - Mark pickup as verified/rejected
```

#### Complaint Handling
```typescript
getSupervisorComplaints(supervisorId) - Get zone complaints
assignComplaintToWorker(complaintId, workerId, comment) - Assign complaint
resolveComplaintAsWorker(complaintId, details) - Resolve complaint
```

#### Performance Review
```typescript
getDailyPerformanceSummary(supervisorId, date?) - Get daily stats
getWorkerProductivityScore(supervisorId) - Get worker scores
generateWeeklyZoneReport(supervisorId) - Generate weekly report
```

#### Utilities
```typescript
checkSupervisorAccess(userId) - Check supervisor access
getSupervisorInfo(userId) - Get supervisor details
```

---

## Pages & Routes

### Admin Routes

| Route | Page | File | Features |
|-------|------|------|----------|
| `/admin/dashboard` | Admin Dashboard | AdminDashboard.tsx | Overview, stats, quick actions |
| `/admin/users` | User Management | AdminUsers.tsx | Create/edit/delete users |
| `/admin/zones` | Zone Management | AdminZones.tsx | Create/edit zones, assign supervisors |
| `/admin/pickups` | Pickup Monitoring | AdminPickups.tsx | Real-time pickup tracking |
| `/admin/complaints` | Complaint Management | AdminComplaints.tsx | Manage complaints, assign, resolve |

### Supervisor Routes

| Route | Page | File | Features |
|-------|------|------|----------|
| `/supervisor/dashboard` | Supervisor Dashboard | SupervisorDashboard.tsx | Zone overview, worker stats |

---

## Setup Instructions

### 1. Database Setup

Run the migration file to create all new tables:

```sql
-- Execute in Supabase SQL Editor
\i admin-schema-extension.sql
```

Or manually create tables using the Supabase dashboard:
- Create tables from the `admin-schema-extension.sql` file
- Enable RLS on all tables
- Add RLS policies as specified

### 2. Install Dependencies

All required dependencies are already in `package.json`:
- React Router for navigation
- Recharts for charts/graphs
- Supabase for database
- TailwindCSS for styling
- Framer Motion for animations

### 3. Configure User Roles

After creating users, assign roles:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Assign admin role
await supabase
  .from('user_roles')
  .insert({
    user_id: userId,
    role: 'admin',
    status: 'active'
  });
```

### 4. Access Admin Features

Navigate to `/admin/dashboard` after logging in as an admin user.

---

## API Endpoints

All operations use Supabase client API (no separate backend needed).

### Key Supabase Tables to Query

```typescript
// Get all users
supabase.from('user_roles').select('*')

// Get zones
supabase.from('zones').select('*')

// Get workers
supabase.from('workers').select('*')

// Get pickups
supabase.from('pickup_logs').select('*')

// Get violations
supabase.from('violations').select('*')

// Get complaints
supabase.from('complaints').select('*')
```

---

## Smart Features Implemented

### 1. **AI Anomaly Detection**
- Flag fake/suspicious QR scans
- Track QR fraud patterns
- Automatically penalize repeat violators

### 2. **GPS Mismatch Alert System**
- Verify worker location matches pickup location
- Configurable tolerance distance (default: 100m)
- Auto-flag significant mismatches

### 3. **Real-Time Worker Tracking Map**
- Live GPS location of workers
- Route history display
- Location accuracy metrics

### 4. **Heatmap of Waste Density**
- Visualize waste generation by zone
- Identify problem areas
- Optimize resource allocation

### 5. **Compliance Leaderboard**
- Top compliant citizens
- Zone rankings
- Worker performance rankings

### 6. **Auto Penalty System**
- Automatic e-point deductions for violations
- Configurable penalty amounts
- Violation severity levels

### 7. **Reward Redemption**
- E-points to rewards conversion
- Integrated with existing rewards system
- Real-time balance tracking

### 8. **QR Fraud Detection**
- Pattern recognition for fake scans
- IP/device tracking
- Multi-scan alerts

---

## System Configuration

### Configurable Settings (via `system_settings` table)

```json
{
  "gps_tolerance_meters": 100,
  "pickup_time_window_hours": {"start": 6, "end": 20},
  "qr_fraud_threshold": {"count": 3, "days": 30},
  "compliance_scoring_rules": {
    "correct": 10,
    "incorrect": -5,
    "violation": -20
  },
  "epoint_calculation": {
    "per_kg_waste": 1,
    "segregation_bonus": 50
  },
  "violation_penalty_rules": {
    "gps_mismatch": 10,
    "qr_fraud": 50,
    "incomplete": 5
  }
}
```

---

## Best Practices

### Security
1. ✅ Always verify user role before granting access
2. ✅ Use RLS policies to enforce data isolation
3. ✅ Never expose sensitive data in frontend
4. ✅ Verify user permissions in database functions

### Performance
1. ✅ Use indexes on frequently queried columns
2. ✅ Paginate large result sets
3. ✅ cache zone and worker data
4. ✅ Use materialized views for analytics

### Data Integrity
1. ✅ Use transactions for multi-step operations
2. ✅ Validate input data before insertion
3. ✅ Maintain audit logs
4. ✅ Use foreign key constraints

### User Experience
1. ✅ Show loading states during API calls
2. ✅ Provide clear error messages
3. ✅ Use optimistic updates
4. ✅ Implement undo/redo where possible

---

## Troubleshooting

### Admin can't access dashboard
- Check user_roles table for role='admin' entry
- Verify status='active' in user_roles
- Check RLS policies are enabled

### Data appears empty
- Verify RLS policies allow access
- Check user role in user_roles table
- Confirm data exists in respective tables

### Supervisor can't see workers
- Verify supervisor_id is set in workers table
- Check zone_id assignment
- Verify RLS policies for workers table

### GPS verification failing
- Ensure GPS coordinates are in valid range
- Check tolerance_meters setting
- Verify GPS data quality from workers

---

## Future Enhancements

1. **Mobile App Integration**
   - Worker mobile app for real-time pickup
   - Citizen mobile app for compliance tracking

2. **Advanced Analytics**
   - Machine learning for waste prediction
   - Anomaly detection improvements
   - Forecasting models

3. **Integration with External Systems**
   - Payment gateway integration
   - SMS/Email notifications
   - IoT smart bin integration

4. **Reporting Enhancements**
   - PDF report generation
   - Scheduled automated reports
   - Custom report builder

5. **Mobile Accessibility**
   - Responsive design for tablets
   - Offline functionality
   - Progressive web app

---

## Support & Documentation

- Database Schema: `database-schema.sql` and `admin-schema-extension.sql`
- Library Functions: `client/lib/admin-operations.ts` and `client/lib/supervisor-operations.ts`
- Components: `client/pages/Admin*.tsx` and `client/pages/SupervisorDashboard.tsx`

For questions or issues, refer to the inline code documentation and JSDoc comments in library files.
