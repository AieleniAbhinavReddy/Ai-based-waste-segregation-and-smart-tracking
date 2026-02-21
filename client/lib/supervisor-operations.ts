/**
 * Supervisor Operations Library
 * Handles all supervisor-level operations for the Smart Waste Management System
 */

import { supabase } from "./supabase";

/** Throws if supabase client is not available */
function requireSupabase() {
  if (!supabase) throw new Error("Supabase not configured – using demo mode");
  return supabase;
}

// ==================== ZONE MONITORING ====================

export interface SupervisorZoneData {
  zone_id: string;
  zone_name: string;
  total_citizens: number;
  total_workers: number;
  pickups_today: number;
  pending_pickups: number;
  zone_compliance_score: number;
  violations_today: number;
  active_complaints: number;
}

/**
 * Get supervisor's assigned zone data
 */
export const getSupervisorZoneData = async (supervisorId: string): Promise<SupervisorZoneData | null> => {
  try {
    // Get supervisor's zone
    const { data: supervisorData, error: supervisorError } = await requireSupabase()
      .from("supervisors")
      .select("zone_id")
      .eq("user_id", supervisorId)
      .single();

    if (supervisorError || !supervisorData) return null;

    const zoneId = supervisorData.zone_id;

    // Get zone data
    const { data: zoneData, error: zoneError } = await requireSupabase()
      .from("zones")
      .select("*")
      .eq("id", zoneId)
      .single();

    if (zoneError) return null;

    // Get citizen count
    const { count: citizenCount } = await requireSupabase()
      .from("citizen_compliance")
      .select("*", { count: "exact" })
      .eq("zone_id", zoneId);

    // Get worker count
    const { count: workerCount } = await requireSupabase()
      .from("workers")
      .select("*", { count: "exact" })
      .eq("zone_id", zoneId);

    // Get today's pickups
    const today = new Date().toISOString().split('T')[0];
    const { data: pickupsData } = await requireSupabase()
      .from("pickup_logs")
      .select("*")
      .eq("zone_id", zoneId)
      .gte("created_at", today);

    // Get pending pickups
    const pendingCount = (pickupsData || []).filter(p => p.status === 'scheduled').length;

    // Get violations today
    const { data: violationsData } = await requireSupabase()
      .from("violations")
      .select("*")
      .eq("zone_id", zoneId)
      .gte("created_at", today);

    // Get active complaints
    const { count: complaintCount } = await requireSupabase()
      .from("complaints")
      .select("*", { count: "exact" })
      .eq("zone_id", zoneId)
      .eq("status", "open");

    // Get zone performance
    const { data: performanceData } = await requireSupabase()
      .from("zone_performance")
      .select("compliance_percentage")
      .eq("zone_id", zoneId)
      .single();

    return {
      zone_id: zoneId,
      zone_name: zoneData.name,
      total_citizens: citizenCount || 0,
      total_workers: workerCount || 0,
      pickups_today: pickupsData?.length || 0,
      pending_pickups: pendingCount,
      zone_compliance_score: performanceData?.compliance_percentage || 0,
      violations_today: violationsData?.length || 0,
      active_complaints: complaintCount || 0,
    };
  } catch (error) {
    console.error("Error fetching supervisor zone data:", error);
    return null;
  }
};

// ==================== WORKER MONITORING ====================

export interface WorkerStatus {
  worker_id: string;
  worker_name: string;
  phone: string;
  shift: string;
  vehicle_number: string;
  current_location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  status: string;
  pickups_today: number;
  efficiency_score: number;
  violations_active: number;
  gps_enabled: boolean;
}

/**
 * Get all workers in supervisor's zone with live location
 */
export const getSupervisorWorkers = async (supervisorId: string) => {
  try {
    // Get supervisor's zone
    const { data: supervisorData, error: supervisorError } = await requireSupabase()
      .from("supervisors")
      .select("zone_id")
      .eq("user_id", supervisorId)
      .single();

    if (supervisorError || !supervisorData) return [];

    const { data, error } = await requireSupabase()
      .from("workers")
      .select(`
        id,
        user_id,
        phone,
        shift,
        vehicle_number,
        status,
        user_profiles!inner(full_name, email),
        worker_performance(efficiency_score, total_pickups),
        worker_live_location(latitude, longitude, timestamp)
      `)
      .eq("zone_id", supervisorData.zone_id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching supervisor workers:", error);
    throw error;
  }
};

/**
 * Get worker route (pickup history for the day)
 */
export const getWorkerRoute = async (workerId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await requireSupabase()
      .from("pickup_logs")
      .select(`
        id,
        location,
        gps_latitude,
        gps_longitude,
        status,
        qr_verified,
        created_at,
        user_profiles!citizen_id(full_name)
      `)
      .eq("worker_id", workerId)
      .gte("created_at", today)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching worker route:", error);
    throw error;
  }
};

/**
 * Get worker pickup history with details
 */
export const getWorkerPickupHistory = async (workerId: string, days: number = 30) => {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const { data, error } = await requireSupabase()
      .from("pickup_logs")
      .select(`
        *,
        zones(name),
        user_profiles!citizen_id(full_name, email),
        violations(violation_type, severity)
      `)
      .eq("worker_id", workerId)
      .gte("created_at", dateFrom.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching worker pickup history:", error);
    throw error;
  }
};

/**
 * Flag worker violation
 */
export const flagWorkerViolation = async (data: {
  worker_id: string;
  zone_id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  pickup_log_id?: string;
}) => {
  try {
    const { data: result, error } = await requireSupabase()
      .from("violations")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error("Error flagging violation:", error);
    throw error;
  }
};

// ==================== PICKUP VERIFICATION ====================

export interface PickupToVerify {
  id: string;
  worker_id: string;
  citizen_id: string;
  worker_name: string;
  citizen_name: string;
  gps_latitude: number;
  gps_longitude: number;
  qr_code: string;
  qr_verified: boolean;
  photo_proof_url: string;
  waste_weight: number;
  waste_types: string[];
  status: string;
  created_at: string;
  marked_suspicious: boolean;
}

/**
 * Get pickups for supervisor verification (today)
 */
export const getSupervisorPickupsToVerify = async (supervisorId: string) => {
  try {
    // Get supervisor's zone
    const { data: supervisorData, error: supervisorError } = await requireSupabase()
      .from("supervisors")
      .select("zone_id")
      .eq("user_id", supervisorId)
      .single();

    if (supervisorError || !supervisorData) return [];

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await requireSupabase()
      .from("pickup_logs")
      .select(`
        *,
        user_profiles!worker_id(full_name),
        user_profiles!citizen_id(full_name),
        violations(id, violation_type)
      `)
      .eq("zone_id", supervisorData.zone_id)
      .gte("created_at", today)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching pickups to verify:", error);
    throw error;
  }
};

/**
 * Check GPS mismatch against expected location
 */
export const checkGPSMismatch = async (
  pickupLogId: string,
  expectedLat: number,
  expectedLng: number,
  toleranceMeters: number = 100
) => {
  try {
    const { data, error } = await requireSupabase()
      .from("pickup_logs")
      .select("gps_latitude, gps_longitude")
      .eq("id", pickupLogId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Calculate distance using Haversine formula
    const R = 6371000; // Earth's radius in meters
    const lat1 = (expectedLat * Math.PI) / 180;
    const lat2 = (data.gps_latitude * Math.PI) / 180;
    const deltaLat = ((data.gps_latitude - expectedLat) * Math.PI) / 180;
    const deltaLng = ((data.gps_longitude - expectedLng) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      is_mismatch: distance > toleranceMeters,
      distance_meters: Math.round(distance),
      tolerance_meters: toleranceMeters,
    };
  } catch (error) {
    console.error("Error checking GPS mismatch:", error);
    throw error;
  }
};

/**
 * Verify pickup (mark as valid/invalid)
 */
export const verifyPickup = async (
  pickupId: string,
  data: {
    status: 'verified' | 'rejected';
    photo_verified: boolean;
    gps_verified: boolean;
    notes?: string;
  }
) => {
  try {
    const updateData = {
      status: data.status === 'verified' ? 'completed' : 'failed',
      qr_verified: data.photo_verified,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await requireSupabase()
      .from("pickup_logs")
      .update(updateData)
      .eq("id", pickupId)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error("Error verifying pickup:", error);
    throw error;
  }
};

// ==================== COMPLAINT HANDLING ====================

export interface ZoneComplaint {
  id: string;
  filed_by_id: string;
  filed_by_name: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  created_at: string;
  assignment_status: 'assigned' | 'unassigned';
}

/**
 * Get complaints assigned to supervisor or in their zone
 */
export const getSupervisorComplaints = async (supervisorId: string) => {
  try {
    // Get supervisor's zone
    const { data: supervisorData, error: supervisorError } = await requireSupabase()
      .from("supervisors")
      .select("zone_id")
      .eq("user_id", supervisorId)
      .single();

    if (supervisorError || !supervisorData) return [];

    const { data, error } = await requireSupabase()
      .from("complaints")
      .select(`
        *,
        user_profiles!filed_by_id(full_name, email)
      `)
      .eq("zone_id", supervisorData.zone_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching supervisor complaints:", error);
    throw error;
  }
};

/**
 * Assign complaint to worker in zone
 */
export const assignComplaintToWorker = async (
  complaintId: string,
  workerId: string,
  comment: string
) => {
  try {
    const { data, error } = await requireSupabase()
      .from("complaints")
      .update({
        assigned_to_id: workerId,
        status: "in_progress",
      })
      .eq("id", complaintId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error assigning complaint:", error);
    throw error;
  }
};

/**
 * Mark complaint as resolved
 */
export const resolveComplaintAsWorker = async (
  complaintId: string,
  resolutionDetails: string
) => {
  try {
    const { data, error } = await requireSupabase()
      .from("complaints")
      .update({
        status: "resolved",
        resolution_details: resolutionDetails,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", complaintId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error resolving complaint:", error);
    throw error;
  }
};

// ==================== PERFORMANCE REVIEW ====================

export interface DailyPerformanceSummary {
  date: string;
  total_pickups: number;
  completed_pickups: number;
  failed_pickups: number;
  total_workers: number;
  active_workers: number;
  zone_compliance_percentage: number;
  violations_count: number;
  average_pickup_time_minutes: number;
}

/**
 * Get daily performance summary for supervisor's zone
 */
export const getDailyPerformanceSummary = async (
  supervisorId: string,
  date?: string
): Promise<DailyPerformanceSummary | null> => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get supervisor's zone
    const { data: supervisorData, error: supervisorError } = await requireSupabase()
      .from("supervisors")
      .select("zone_id")
      .eq("user_id", supervisorId)
      .single();

    if (supervisorError || !supervisorData) return null;

    // Get pickups for the day
    const { data: pickupsData } = await requireSupabase()
      .from("pickup_logs")
      .select("*")
      .eq("zone_id", supervisorData.zone_id)
      .gte("created_at", targetDate);

    const totalPickups = pickupsData?.length || 0;
    const completedPickups = (pickupsData || []).filter(p => p.status === 'completed').length;
    const failedPickups = (pickupsData || []).filter(p => p.status === 'failed').length;

    // Get active workers
    const { count: totalWorkers } = await requireSupabase()
      .from("workers")
      .select("*", { count: "exact" })
      .eq("zone_id", supervisorData.zone_id);

    const { count: activeWorkers } = await requireSupabase()
      .from("workers")
      .select("*", { count: "exact" })
      .eq("zone_id", supervisorData.zone_id)
      .eq("status", "active");

    // Get violations
    const { data: violationsData } = await requireSupabase()
      .from("violations")
      .select("*")
      .eq("zone_id", supervisorData.zone_id)
      .gte("created_at", targetDate);

    // Get zone performance
    const { data: performanceData } = await requireSupabase()
      .from("zone_performance")
      .select("compliance_percentage")
      .eq("zone_id", supervisorData.zone_id)
      .single();

    return {
      date: targetDate,
      total_pickups: totalPickups,
      completed_pickups: completedPickups,
      failed_pickups: failedPickups,
      total_workers: totalWorkers || 0,
      active_workers: activeWorkers || 0,
      zone_compliance_percentage: performanceData?.compliance_percentage || 0,
      violations_count: violationsData?.length || 0,
      average_pickup_time_minutes: 0, // Can be calculated if timestamp data is available
    };
  } catch (error) {
    console.error("Error fetching daily performance summary:", error);
    return null;
  }
};

/**
 * Get worker productivity score for zone
 */
export const getWorkerProductivityScore = async (supervisorId: string) => {
  try {
    // Get supervisor's zone
    const { data: supervisorData, error: supervisorError } = await requireSupabase()
      .from("supervisors")
      .select("zone_id")
      .eq("user_id", supervisorId)
      .single();

    if (supervisorError || !supervisorData) return [];

    const { data, error } = await requireSupabase()
      .from("worker_performance")
      .select(`
        *,
        user_profiles!worker_id(full_name, email)
      `)
      .eq("zone_id", supervisorData.zone_id)
      .order("efficiency_score", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching worker productivity scores:", error);
    throw error;
  }
};

/**
 * Generate weekly zone report
 */
export const generateWeeklyZoneReport = async (supervisorId: string) => {
  try {
    // Get supervisor's zone
    const { data: supervisorData, error: supervisorError } = await requireSupabase()
      .from("supervisors")
      .select("zone_id")
      .eq("user_id", supervisorId)
      .single();

    if (supervisorError || !supervisorData) return null;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Get week's pickups
    const { data: pickupsData } = await requireSupabase()
      .from("pickup_logs")
      .select("*")
      .eq("zone_id", supervisorData.zone_id)
      .gte("created_at", weekStart.toISOString());

    // Get worker performance
    const { data: performanceData } = await requireSupabase()
      .from("worker_performance")
      .select("*")
      .eq("zone_id", supervisorData.zone_id);

    // Get zone performance
    const { data: zonePerformance } = await requireSupabase()
      .from("zone_performance")
      .select("*")
      .eq("zone_id", supervisorData.zone_id)
      .single();

    const totalWaste = (pickupsData || []).reduce((sum, p) => sum + (p.waste_weight || 0), 0);

    return {
      week_start: weekStart.toISOString().split('T')[0],
      zone_id: supervisorData.zone_id,
      total_pickups: pickupsData?.length || 0,
      completed_pickups: (pickupsData || []).filter(p => p.status === 'completed').length,
      failed_pickups: (pickupsData || []).filter(p => p.status === 'failed').length,
      total_waste_kg: totalWaste.toFixed(2),
      worker_count: performanceData?.length || 0,
      average_efficiency: performanceData && performanceData.length > 0
        ? (performanceData.reduce((sum, p) => sum + (p.efficiency_score || 0), 0) / performanceData.length).toFixed(2)
        : 0,
      zone_compliance: zonePerformance?.compliance_percentage || 0,
    };
  } catch (error) {
    console.error("Error generating weekly report:", error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if user is supervisor
 */
export const checkSupervisorAccess = async (userId: string): Promise<boolean> => {
  // Demo mode: check localStorage role
  const demoStr = localStorage.getItem("demoUser");
  if (demoStr) {
    try {
      const demo = JSON.parse(demoStr);
      if (demo.role === "SUPERVISOR") return true;
    } catch { /* ignore */ }
  }
  if (!supabase) return false;
  try {
    const { data, error } = await requireSupabase()
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error) return false;
    return data?.role === 'supervisor';
  } catch (error) {
    console.error("Error checking supervisor access:", error);
    return false;
  }
};

/**
 * Get supervisor's full information
 */
export const getSupervisorInfo = async (userId: string) => {
  try {
    const { data, error } = await requireSupabase()
      .from("supervisors")
      .select(`
        *,
        zones(id, name, city),
        user_profiles!user_id(full_name, email)
      `)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching supervisor info:", error);
    return null;
  }
};
