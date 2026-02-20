# Admin & Supervisor Operations API Reference

Quick reference guide for using admin-operations.ts and supervisor-operations.ts libraries.

---

## Admin Operations (`admin-operations.ts`)

### User Management

#### Get all users by role
```typescript
import { getAllCitizens, getAllWorkers, getAllSupervisors } from '@/lib/admin-operations';

// Get all citizens
const citizens = await getAllCitizens();
// Returns: { id, email, full_name, phone, created_at, status, compliance_score }[]

// Get all workers
const workers = await getAllWorkers();
// Returns: { id, email, full_name, phone, zone_id, shift, status, efficiency_score }[]

// Get all supervisors
const supervisors = await getAllSupervisors();
// Returns: { id, email, full_name, phone, zone_id, total_zone_compliance }[]
```

#### Create new user
```typescript
import { createNewUser } from '@/lib/admin-operations';

const newUser = await createNewUser({
  email: 'john@example.com',
  password: 'SecurePass123!',
  full_name: 'John Doe',
  phone: '+919876543210',
  role: 'worker', // 'citizen' | 'worker' | 'supervisor'
  zone_id: 'zone-uuid', // Required for worker/supervisor
  shift: 'Morning' // 'Morning' | 'Evening' - Required for worker
});
// Returns: { user_id, email, role }
```

#### Update user role
```typescript
import { updateUserRole } from '@/lib/admin-operations';

await updateUserRole(userId, {
  role: 'supervisor', // 'citizen' | 'worker' | 'supervisor' | 'admin'
  status: 'inactive' // 'active' | 'inactive'
});
```

#### Deactivate user
```typescript
import { deactivateUser } from '@/lib/admin-operations';

await deactivateUser(userId);
// Sets status to 'inactive' and role to 'citizen'
```

---

### Zone Management

#### Get all zones with details
```typescript
import { getAllZones, getZoneDetails } from '@/lib/admin-operations';

// Get all zones
const zones = await getAllZones();
// Returns: { id, name, code, ward_number, city, area_sqkm, population, supervisor_id, supervisor_email }[]

// Get specific zone details
const zone = await getZoneDetails(zoneId);
// Returns: { id, name, code, ward_number, city, area_sqkm, population, supervisor_id, supervisor_name, supervisor_email, total_citizens, total_workers, created_at }
```

#### Create zone
```typescript
import { createZone } from '@/lib/admin-operations';

const newZone = await createZone({
  name: 'Downtown District',
  code: 'DWN001',
  ward_number: 'W15',
  city: 'Delhi',
  area_sqkm: 25.5,
  population: 50000
});
// Returns: { id, name, code }
```

#### Update zone
```typescript
import { updateZone } from '@/lib/admin-operations';

await updateZone(zoneId, {
  name: 'Downtown District Updated',
  population: 55000
});
```

#### Assign supervisor to zone
```typescript
import { assignSupervisorToZone } from '@/lib/admin-operations';

await assignSupervisorToZone(zoneId, supervisorId);
// Assigns supervisor to zone, making them responsible for that zone
```

---

### Pickup Monitoring

#### Get pickup statistics
```typescript
import { getPickupStats } from '@/lib/admin-operations';

const stats = await getPickupStats();
// Returns: {
//   pickupsToday: number,
//   pickupsThisMonth: number,
//   failedPickups: number,
//   qrSuccessRate: number (0-100),
//   violations: number
// }
```

#### Get pickup logs with filters
```typescript
import { getPickupLogs } from '@/lib/admin-operations';

const logs = await getPickupLogs({
  zone_id: 'zone-uuid', // Optional
  worker_id: 'worker-uuid', // Optional
  status: 'completed', // Optional: 'completed' | 'failed' | 'scheduled'
  fromDate: new Date('2024-01-01'), // Optional
  toDate: new Date('2024-01-31') // Optional
});
// Returns: {
//   id, created_at, zone_id, worker_id, citizen_id,
//   gps_lat, gps_lng, waste_weight, qr_verified, status
// }[]
```

---

### Violation Management

#### Get violation statistics
```typescript
import { getViolationsCount } from '@/lib/admin-operations';

const count = await getViolationsCount();
// Returns: number
```

#### Get all violations
```typescript
import { getAllViolations } from '@/lib/admin-operations';

const violations = await getAllViolations({
  zone_id: 'zone-uuid', // Optional
  status: 'open' // Optional: 'open' | 'resolved'
});
// Returns: {
//   id, citizen_id, violation_type, description,
//   created_at, resolved_at, status, zone_id
// }[]
```

#### Resolve violation
```typescript
import { resolveViolation } from '@/lib/admin-operations';

await resolveViolation(violationId);
// Marks violation as resolved and updates resolved_at timestamp
```

---

### Complaint Management

#### Get all complaints
```typescript
import { getAllComplaints } from '@/lib/admin-operations';

const complaints = await getAllComplaints({
  zone_id: 'zone-uuid', // Optional
  status: 'open', // Optional: 'open' | 'in_progress' | 'resolved'
  priority: 'urgent' // Optional: 'urgent' | 'high' | 'medium' | 'low'
});
// Returns: {
//   id, citizen_id, worker_id, category, description,
//   priority, status, created_at, assigned_to_supervisor,
//   resolved_at
// }[]
```

#### Assign complaint to supervisor
```typescript
import { assignComplaint } from '@/lib/admin-operations';

await assignComplaint(complaintId, supervisorId);
// Updates complaint status to 'in_progress' and assigns to supervisor
```

#### Resolve complaint
```typescript
import { resolveComplaint } from '@/lib/admin-operations';

await resolveComplaint(complaintId, 'Resolution details and action taken');
// Marks complaint as resolved with resolution text
```

---

### Performance Analytics

#### Get worker performance
```typescript
import { getWorkerPerformance } from '@/lib/admin-operations';

const performance = await getWorkerPerformance({
  zone_id: 'zone-uuid' // Optional
});
// Returns: {
//   worker_id, name, zone_id, pickups_completed, pickups_failed,
//   efficiency_score (0-100), compliance_score (0-100),
//   last_active
// }[]
```

#### Get zone performance
```typescript
import { getZonePerformance } from '@/lib/admin-operations';

const zonePerf = await getZonePerformance();
// Returns: {
//   zone_id, zone_name, total_pickups, successful_pickups,
//   compliance_score (0-100), avg_response_time_minutes,
//   total_workers, active_workers
// }[]
```

#### Get citizen compliance
```typescript
import { getCitizenCompliance } from '@/lib/admin-operations';

const compliance = await getCitizenCompliance({
  zone_id: 'zone-uuid' // Optional
});
// Returns: {
//   citizen_id, name, zone_id, total_pickups, successful_pickups,
//   compliance_score (0-100), violations_count
// }[]
```

#### Generate zone waste report
```typescript
import { generateZoneWasteReport } from '@/lib/admin-operations';

const report = await generateZoneWasteReport(zoneId, 'month');
// period: 'day' | 'week' | 'month' | 'year'
// Returns: {
//   zone_id, zone_name, period, total_waste_collected_kg,
//   waste_by_category { plastic, paper, organic, metal, glass },
//   daily_average_kg, trend (increasing/stable/decreasing)
// }
```

---

### Utilities

#### Check if user is admin
```typescript
import { checkAdminAccess } from '@/lib/admin-operations';

const isAdmin = await checkAdminAccess(userId);
// Returns: boolean
```

#### Export data to CSV
```typescript
import { exportToCSV } from '@/lib/admin-operations';

const data = [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
];

exportToCSV(data, 'users.csv');
// Triggers browser download of CSV file
```

---

## Supervisor Operations (`supervisor-operations.ts`)

### Zone Monitoring

#### Get supervisor's zone data
```typescript
import { getSupervisorZoneData } from '@/lib/supervisor-operations';

const zoneData = await getSupervisorZoneData(supervisorId);
// Returns: {
//   zone_id, zone_name, total_citizens, total_workers,
//   pickups_today, pending_pickups, zone_compliance_score,
//   violations_today, active_complaints
// }
```

---

### Worker Monitoring

#### Get workers in supervisor's zone
```typescript
import { getSupervisorWorkers } from '@/lib/supervisor-operations';

const workers = await getSupervisorWorkers(supervisorId);
// Returns: {
//   worker_id, name, status, pickups_today, efficiency_score,
//   last_location_lat, last_location_lng, last_active
// }[]
```

#### Get worker's daily route
```typescript
import { getWorkerRoute } from '@/lib/supervisor-operations';

const route = await getWorkerRoute(workerId);
// Returns: {
//   waypoints: { lat, lng }[],
//   total_distance_km: number,
//   pickups_on_route: number
// }
```

#### Get worker's pickup history
```typescript
import { getWorkerPickupHistory } from '@/lib/supervisor-operations';

const history = await getWorkerPickupHistory(workerId, 7);
// days: number of days to look back
// Returns: {
//   date, total_pickups, successful, failed,
//   avg_weight_kg, efficiency_score
// }[]
```

#### Flag worker violation
```typescript
import { flagWorkerViolation } from '@/lib/supervisor-operations';

await flagWorkerViolation({
  worker_id: 'worker-uuid',
  violation_type: 'missed_pickup', // or other violation types
  description: 'Missed pickup at Zone A on Jan 15',
  gps_lat: 28.7041,
  gps_lng: 77.1025
});
```

---

### Pickup Verification

#### Get pickups needing verification
```typescript
import { getSupervisorPickupsToVerify } from '@/lib/supervisor-operations';

const pickups = await getSupervisorPickupsToVerify(supervisorId);
// Returns: {
//   id, worker_id, citizen_id, created_at,
//   gps_lat, gps_lng, waste_weight, qr_verified,
//   worker_name, citizen_name
// }[]
```

#### Check GPS mismatch
```typescript
import { checkGPSMismatch } from '@/lib/supervisor-operations';

const mismatch = await checkGPSMismatch(
  pickupLogId,
  28.7041, // expected latitude
  77.1025, // expected longitude
  100 // tolerance in meters
);
// Returns: {
//   isMismatch: boolean,
//   distance_meters: number,
//   status: 'valid' | 'suspicious' | 'critical'
// }
```

#### Verify pickup
```typescript
import { verifyPickup } from '@/lib/supervisor-operations';

await verifyPickup(pickupId, {
  status: 'verified', // 'verified' | 'rejected'
  photo_verified: true,
  gps_verified: true,
  notes: 'All checks passed'
});
```

---

### Complaint Handling

#### Get supervisor's complaints
```typescript
import { getSupervisorComplaints } from '@/lib/supervisor-operations';

const complaints = await getSupervisorComplaints(supervisorId);
// Returns: {
//   id, category, description, priority, status,
//   created_at, assigned_worker_id
// }[]
```

#### Assign complaint to worker
```typescript
import { assignComplaintToWorker } from '@/lib/supervisor-operations';

await assignComplaintToWorker(complaintId, workerId);
// Assigns complaint to a worker in supervisor's zone
```

#### Resolve complaint as worker
```typescript
import { resolveComplaintAsWorker } from '@/lib/supervisor-operations';

await resolveComplaintAsWorker(complaintId, 'Action taken details');
// Worker resolves complaint assigned to them
```

---

### Performance Review

#### Get daily performance summary
```typescript
import { getDailyPerformanceSummary } from '@/lib/supervisor-operations';

const summary = await getDailyPerformanceSummary(supervisorId);
// Returns: {
//   date, total_pickups, successful_pickups, failed_pickups,
//   avg_efficiency_score, violations_count, complaints_count
// }
```

#### Get worker productivity score
```typescript
import { getWorkerProductivityScore } from '@/lib/supervisor-operations';

const score = await getWorkerProductivityScore(workerId);
// Returns: {
//   worker_id, name, score (0-100), pickups_this_week,
//   avg_weight_per_pickup, trend
// }
```

#### Generate weekly zone report
```typescript
import { generateWeeklyZoneReport } from '@/lib/supervisor-operations';

const report = await generateWeeklyZoneReport(supervisorId);
// Returns: {
//   zone_id, week_starting, week_ending,
//   total_pickups, successful_rate (%),
//   waste_collected_kg, top_performer, issues_reported
// }
```

---

### Utilities

#### Check if user is supervisor
```typescript
import { checkSupervisorAccess } from '@/lib/supervisor-operations';

const isSupervisor = await checkSupervisorAccess(userId);
// Returns: boolean
```

#### Get supervisor information
```typescript
import { getSupervisorInfo } from '@/lib/supervisor-operations';

const info = await getSupervisorInfo(userId);
// Returns: {
//   supervisor_id, name, email, zone_id, zone_name,
//   total_workers, total_citizens, performance_score
// }
```

---

## Error Handling

### Common Error Patterns

```typescript
import { getAllZones } from '@/lib/admin-operations';

try {
  const zones = await getAllZones();
} catch (error) {
  if (error instanceof Error) {
    // Handle specific errors
    if (error.message.includes('RLS')) {
      console.error('Access denied - insufficient permissions');
    } else if (error.message.includes('network')) {
      console.error('Network error - check connection');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

### Using with React

```typescript
import { useEffect, useState } from 'react';
import { getAllZones } from '@/lib/admin-operations';

export function ZonesList() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true);
        const data = await getAllZones();
        setZones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadZones();
  }, []);

  if (loading) return <div>Loading zones...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {zones.map(zone => (
        <div key={zone.id}>{zone.name}</div>
      ))}
    </div>
  );
}
```

---

## Data Types Reference

### User Types
```typescript
type UserRole = 'citizen' | 'worker' | 'supervisor' | 'admin';
type UserStatus = 'active' | 'inactive';
type WorkerShift = 'Morning' | 'Evening';
```

### Complaint Status
```typescript
type ComplaintStatus = 'open' | 'in_progress' | 'resolved';
type ComplaintPriority = 'urgent' | 'high' | 'medium' | 'low';
```

### Violation Types
```typescript
type ViolationType = 'missed_pickup' | 'improper_disposal' | 'contamination' | 'other';
type ViolationStatus = 'open' | 'resolved';
```

### Pickup Status
```typescript
type PickupStatus = 'scheduled' | 'completed' | 'failed';
type QRStatus = 'verified' | 'fraud_detected' | 'pending';
```

---

## Best Practices

### 1. Always use try-catch blocks
```typescript
try {
  const data = await getUserData();
} catch (error) {
  // Handle error gracefully
}
```

### 2. Cache frequently accessed data
```typescript
const [cachedZones, setCachedZones] = useState(null);

if (cachedZones) return cachedZones;
const zones = await getAllZones();
setCachedZones(zones);
```

### 3. Validate inputs before API calls
```typescript
if (!email || !email.includes('@')) {
  setError('Invalid email');
  return;
}
const user = await createNewUser({ email, ... });
```

### 4. Use loading states for UX
```typescript
const [loading, setLoading] = useState(false);

const handleCreate = async () => {
  setLoading(true);
  try {
    await createZone(formData);
  } finally {
    setLoading(false);
  }
};
```

### 5. Roll up aggregate operations
```typescript
// Instead of multiple calls:
// const citizens = await getAllCitizens();
// const workers = await getAllWorkers();
// const supervisors = await getAllSupervisors();

// Use Promise.all:
const [citizens, workers, supervisors] = await Promise.all([
  getAllCitizens(),
  getAllWorkers(),
  getAllSupervisors()
]);
```

---

## Testing the APIs

### Example Test Suite
```typescript
describe('Admin Operations', () => {
  it('should get all zones', async () => {
    const zones = await getAllZones();
    expect(Array.isArray(zones)).toBe(true);
    expect(zones[0]).toHaveProperty('id');
  });

  it('should create a zone', async () => {
    const zone = await createZone({
      name: 'Test Zone',
      code: 'TZ001',
      ward_number: '1',
      city: 'Test City',
      area_sqkm: 10,
      population: 5000
    });
    expect(zone.id).toBeDefined();
  });

  it('should check admin access', async () => {
    const isAdmin = await checkAdminAccess(testUserId);
    expect(typeof isAdmin).toBe('boolean');
  });
});
```

---

## For More Information

- See **ADMIN_SUPERVISOR_GUIDE.md** for complete feature documentation
- See **DEPLOYMENT_CHECKLIST.md** for setup and deployment steps
- See page components (AdminDashboard.tsx, AdminUsers.tsx, etc.) for usage examples
- Check individual function JSDoc comments in admin-operations.ts and supervisor-operations.ts

