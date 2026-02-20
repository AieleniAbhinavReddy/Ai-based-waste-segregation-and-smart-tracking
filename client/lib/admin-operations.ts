/**
 * Admin Operations Library
 * Handles all admin-level operations for the Smart Waste Management System
 */

import { supabase } from "./supabase";

// ==================== USER MANAGEMENT ====================

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'citizen' | 'worker' | 'supervisor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export interface CitizenProfile extends AdminUser {
  zone_id?: string;
  compliance_score: number;
  total_epoints: number;
  waste_generated_kg: number;
}

export interface WorkerProfile extends AdminUser {
  zone_id: string;
  supervisor_id: string;
  worker_code: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  shift: string;
  pickups_completed: number;
  efficiency_score: number;
}

export interface SupervisorProfile extends AdminUser {
  zone_id: string;
  supervisor_code: string;
  phone: string;
  department: string;
  workers_count: number;
  zone_name: string;
}

// Get all users with filters
export const getAllUsers = async (filters?: {
  role?: string;
  status?: string;
  zone_id?: string;
}) => {
  try {
    let query = supabase
      .from("user_profiles")
      .select(`
        id,
        email,
        full_name,
        created_at,
        user_roles(role, status)
      `);

    if (filters?.role) {
      query = query.eq("user_roles.role", filters.role);
    }
    if (filters?.status) {
      query = query.eq("user_roles.status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Get all citizens
export const getAllCitizens = async () => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select(`
        id,
        email,
        full_name,
        points,
        created_at,
        user_roles(role, status),
        citizen_compliance(compliance_score, total_waste_generated_kg, zone_id)
      `)
      .eq("user_roles.role", "citizen");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching citizens:", error);
    throw error;
  }
};

// Get all workers
export const getAllWorkers = async () => {
  try {
    const { data, error } = await supabase
      .from("workers")
      .select(`
        id,
        user_id,
        zone_id,
        supervisor_id,
        worker_code,
        phone,
        vehicle_type,
        vehicle_number,
        shift,
        status,
        user_profiles!inner(id, email, full_name),
        zones!inner(name),
        worker_performance(efficiency_score, compliance_score, total_pickups)
      `);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching workers:", error);
    throw error;
  }
};

// Get all supervisors
export const getAllSupervisors = async () => {
  try {
    const { data, error } = await supabase
      .from("supervisors")
      .select(`
        id,
        user_id,
        zone_id,
        supervisor_code,
        phone,
        department,
        status,
        user_profiles!inner(id, email, full_name),
        zones!inner(name)
      `);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    throw error;
  }
};

// Create new user (citizen, worker, or supervisor)
export const createNewUser = async (userData: {
  email: string;
  password: string;
  full_name: string;
  role: 'citizen' | 'worker' | 'supervisor';
  zone_id?: string;
  phone?: string;
  shift?: string;
}) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;
    if (!authData.user?.id) throw new Error("Failed to create user");

    // Create profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
      });

    if (profileError) throw profileError;

    // Create role entry
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: userData.role,
        status: "active",
      });

    if (roleError) throw roleError;

    // Create role-specific information
    if (userData.role === "worker" && userData.zone_id) {
      const { error: workerError } = await supabase
        .from("workers")
        .insert({
          user_id: authData.user.id,
          zone_id: userData.zone_id,
          phone: userData.phone,
          shift: userData.shift,
          status: "active",
        });

      if (workerError) throw workerError;
    } else if (userData.role === "supervisor" && userData.zone_id) {
      const { error: supervisorError } = await supabase
        .from("supervisors")
        .insert({
          user_id: authData.user.id,
          zone_id: userData.zone_id,
          phone: userData.phone,
          status: "active",
        });

      if (supervisorError) throw supervisorError;
    }

    return authData.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Update user role or status
export const updateUserRole = async (userId: string, updates: {
  role?: 'citizen' | 'worker' | 'supervisor' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
}) => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .update(updates)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Delete user (soft delete - set status to inactive)
export const deactivateUser = async (userId: string) => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .update({ status: "inactive" })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deactivating user:", error);
    throw error;
  }
};

// ==================== ZONE MANAGEMENT ====================

export interface Zone {
  id: string;
  name: string;
  code: string;
  ward_number: string;
  city: string;
  area_sqkm: number;
  population: number;
  supervisor_id: string;
  status: 'active' | 'inactive';
  created_at: string;
}

// Get all zones
export const getAllZones = async () => {
  try {
    const { data, error } = await supabase
      .from("zones")
      .select(`
        *,
        user_profiles!supervisor_id(full_name, email),
        zone_performance(total_pickups, completed_pickups, compliance_percentage)
      `)
      .order("name");

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching zones:", error);
    throw error;
  }
};

// Get zone details with workers and performance
export const getZoneDetails = async (zoneId: string) => {
  try {
    const { data, error } = await supabase
      .from("zones")
      .select(`
        *,
        user_profiles!supervisor_id(id, full_name, email),
        workers(id, user_id, user_profiles(full_name, email)),
        zone_performance(*),
        pickup_logs(id, status, created_at)
      `)
      .eq("id", zoneId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching zone details:", error);
    throw error;
  }
};

// Create new zone
export const createZone = async (zoneData: {
  name: string;
  code: string;
  ward_number: string;
  city: string;
  area_sqkm: number;
  population: number;
  supervisor_id: string;
}) => {
  try {
    const { data, error } = await supabase
      .from("zones")
      .insert(zoneData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating zone:", error);
    throw error;
  }
};

// Update zone
export const updateZone = async (zoneId: string, updates: Partial<Zone>) => {
  try {
    const { data, error } = await supabase
      .from("zones")
      .update(updates)
      .eq("id", zoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating zone:", error);
    throw error;
  }
};

// Assign supervisor to zone
export const assignSupervisorToZone = async (zoneId: string, supervisorId: string) => {
  try {
    const { data, error } = await supabase
      .from("zones")
      .update({ supervisor_id: supervisorId })
      .eq("id", zoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error assigning supervisor:", error);
    throw error;
  }
};

// ==================== PICKUP MONITORING ====================

export const getPickupStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().setDate(1)).toISOString().split('T')[0];

    // Today's pickups
    const { data: todayData, error: todayError } = await supabase
      .from("pickup_logs")
      .select("*")
      .gte("created_at", today);

    // This month's pickups
    const { data: monthData, error: monthError } = await supabase
      .from("pickup_logs")
      .select("*")
      .gte("created_at", monthStart);

    // Failed pickups
    const { data: failedData } = await supabase
      .from("pickup_logs")
      .select("*")
      .eq("status", "failed");

    // QR verification success rate
    const { data: qrData } = await supabase
      .from("pickup_logs")
      .select("*")
      .eq("qr_verified", true);

    if (todayError || monthError) throw todayError || monthError;

    return {
      pickupsToday: todayData?.length || 0,
      pickupsThisMonth: monthData?.length || 0,
      failedPickups: failedData?.length || 0,
      qrSuccessRate: qrData ? ((qrData.length / (monthData?.length || 1)) * 100).toFixed(2) : 0,
      violations: await getViolationsCount(),
    };
  } catch (error) {
    console.error("Error fetching pickup stats:", error);
    throw error;
  }
};

// Get all pickup logs with filters
export const getPickupLogs = async (filters?: {
  zone_id?: string;
  worker_id?: string;
  status?: string;
  date?: string;
}) => {
  try {
    let query = supabase
      .from("pickup_logs")
      .select(`
        *,
        zones(name),
        user_profiles!worker_id(full_name),
        user_profiles!citizen_id(full_name)
      `);

    if (filters?.zone_id) query = query.eq("zone_id", filters.zone_id);
    if (filters?.worker_id) query = query.eq("worker_id", filters.worker_id);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.date) query = query.gte("created_at", filters.date);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching pickup logs:", error);
    throw error;
  }
};

// ==================== VIOLATIONS ====================

export const getViolationsCount = async () => {
  try {
    const { count, error } = await supabase
      .from("violations")
      .select("*", { count: "exact" })
      .eq("resolved", false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching violations count:", error);
    return 0;
  }
};

export const getAllViolations = async (filters?: {
  zone_id?: string;
  user_id?: string;
  violation_type?: string;
  resolved?: boolean;
}) => {
  try {
    let query = supabase
      .from("violations")
      .select(`
        *,
        zones(name),
        user_profiles(full_name, email),
        pickup_logs(status)
      `);

    if (filters?.zone_id) query = query.eq("zone_id", filters.zone_id);
    if (filters?.user_id) query = query.eq("user_id", filters.user_id);
    if (filters?.violation_type) query = query.eq("violation_type", filters.violation_type);
    if (filters?.resolved !== undefined) query = query.eq("resolved", filters.resolved);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching violations:", error);
    throw error;
  }
};

// Resolve a violation
export const resolveViolation = async (violationId: string) => {
  try {
    const { data, error } = await supabase
      .from("violations")
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", violationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error resolving violation:", error);
    throw error;
  }
};

// ==================== COMPLAINTS ====================

export interface Complaint {
  id: string;
  zone_id: string;
  filed_by_id: string;
  assigned_to_id?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export const getAllComplaints = async (filters?: {
  zone_id?: string;
  status?: string;
  priority?: string;
}) => {
  try {
    let query = supabase
      .from("complaints")
      .select(`
        *,
        zones(name),
        user_profiles!filed_by_id(full_name, email),
        user_profiles!assigned_to_id(full_name, email)
      `);

    if (filters?.zone_id) query = query.eq("zone_id", filters.zone_id);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.priority) query = query.eq("priority", filters.priority);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }
};

// Assign complaint to supervisor
export const assignComplaint = async (complaintId: string, supervisorId: string) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .update({
        assigned_to_id: supervisorId,
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

// Resolve complaint
export const resolveComplaint = async (complaintId: string, resolution: string) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .update({
        status: "resolved",
        resolution_details: resolution,
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

// ==================== WORKER PERFORMANCE ====================

export const getWorkerPerformance = async (workerId?: string) => {
  try {
    let query = supabase
      .from("worker_performance")
      .select(`
        *,
        user_profiles!worker_id(full_name, email),
        zones(name)
      `);

    if (workerId) query = query.eq("worker_id", workerId);

    const { data, error } = await query.order("efficiency_score", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching worker performance:", error);
    throw error;
  }
};

// Get zone performance
export const getZonePerformance = async (zoneId?: string) => {
  try {
    let query = supabase
      .from("zone_performance")
      .select(`
        *,
        zones(name, city)
      `);

    if (zoneId) query = query.eq("zone_id", zoneId);

    const { data, error } = await query.order("compliance_percentage", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching zone performance:", error);
    throw error;
  }
};

// ==================== ANALYTICS & REPORTS ====================

export const generateZoneWasteReport = async (zoneId: string, period: 'daily' | 'weekly' | 'monthly') => {
  try {
    const dateFilter = new Date();
    switch (period) {
      case 'daily':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case 'weekly':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'monthly':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
    }

    const { data, error } = await supabase
      .from("pickup_logs")
      .select("*")
      .eq("zone_id", zoneId)
      .gte("created_at", dateFilter.toISOString());

    if (error) throw error;

    const totalWeight = (data || []).reduce((sum, log) => sum + (log.waste_weight || 0), 0);
    const completedCount = (data || []).filter(log => log.status === 'completed').length;

    return {
      period,
      zone_id: zoneId,
      total_pickups: data?.length || 0,
      completed_pickups: completedCount,
      total_waste_kg: totalWeight,
      average_per_pickup: data && data.length > 0 ? (totalWeight / data.length).toFixed(2) : 0,
    };
  } catch (error) {
    console.error("Error generating waste report:", error);
    throw error;
  }
};

// ==================== CITIZEN COMPLIANCE ====================

export const getCitizenCompliance = async (filters?: {
  zone_id?: string;
  compliance_rank?: string;
}) => {
  try {
    let query = supabase
      .from("citizen_compliance")
      .select(`
        *,
        user_profiles(full_name, email),
        zones(name)
      `);

    if (filters?.zone_id) query = query.eq("zone_id", filters.zone_id);
    if (filters?.compliance_rank) query = query.eq("compliance_rank", filters.compliance_rank);

    const { data, error } = await query.order("compliance_score", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching citizen compliance:", error);
    throw error;
  }
};

// ==================== PAYMENTS ====================

export const getPaymentStats = async (zoneId?: string) => {
  try {
    let query = supabase
      .from("payments")
      .select("*");

    if (zoneId) query = query.eq("zone_id", zoneId);

    const { data, error } = await query;

    if (error) throw error;

    const totalPending = (data || []).filter(p => p.status === 'pending').length;
    const totalCompleted = (data || []).filter(p => p.status === 'completed').length;
    const totalAmount = (data || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      total_payments: data?.length || 0,
      completed: totalCompleted,
      pending: totalPending,
      total_amount: totalAmount.toFixed(2),
    };
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

export const checkAdminAccess = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error) return false;
    return data?.role === 'admin';
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
};

export const exportToCSV = (data: any[], filename: string) => {
  try {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${Date.now()}.csv`;
    link.click();
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw error;
  }
};
