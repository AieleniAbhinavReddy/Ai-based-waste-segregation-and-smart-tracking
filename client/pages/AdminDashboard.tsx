import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Truck,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  Home,
  QrCode,
  Shield,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Crown,
  Recycle,
  Weight,
  Target,
  UserCheck,
  AlertCircle,
  XCircle,
  MapPinned,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  ClipboardList,
  Zap,
  Navigation,
  Camera,
  Eye,
} from "lucide-react";
import { useAuth as useSupabaseAuth } from "@/lib/supabase";
import { checkAdminAccess } from "@/lib/admin-operations";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface Household {
  id: string;
  house_no: string;
  address: string;
  ward: string;
  zone_id: string;
  zone_name: string;
  qr_token: string;
  compliance_score: number;
  total_waste_kg: number;
  violation_count: number;
  status: "active" | "inactive";
  last_pickup: string;
}

interface Zone {
  id: string;
  name: string;
  code: string;
  supervisor: string;
  supervisor_id: string;
  total_households: number;
  total_pickups: number;
  total_waste_kg: number;
  compliance: number;
  violation_rate: number;
  status: "active" | "inactive";
}

interface Supervisor {
  id: string;
  name: string;
  zone: string;
  zone_id: string;
  pickups_verified: number;
  violations_recorded: number;
  complaints_resolved: number;
  avg_daily_pickups: number;
  status: "active" | "inactive" | "on_leave";
  phone: string;
  performance_score: number;
}

interface PickupLog {
  id: string;
  household: string;
  address: string;
  zone: string;
  supervisor: string;
  waste_category: string;
  weight_kg: number;
  qr_scanned: boolean;
  gps_match: boolean;
  distance_mismatch_m: number;
  proof_photo: boolean;
  status: "verified" | "pending" | "flagged" | "failed";
  timestamp: string;
}

interface Violation {
  id: string;
  type: string;
  household: string;
  zone: string;
  severity: "high" | "medium" | "low";
  description: string;
  timestamp: string;
  status: "open" | "resolved" | "escalated";
}

interface Complaint {
  id: string;
  citizen: string;
  zone: string;
  category: string;
  description: string;
  assigned_to: string;
  status: "pending" | "in_progress" | "resolved" | "escalated";
  resolution_time_hrs: number | null;
  created_at: string;
}

type ActiveTab =
  | "overview"
  | "households"
  | "zones"
  | "supervisors"
  | "pickups"
  | "violations"
  | "complaints"
  | "analytics";

// ═══════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════
const DEMO_HOUSEHOLDS: Household[] = [
  { id: "H001", house_no: "A-101", address: "12 MG Road, Sector 5", ward: "Ward 1", zone_id: "Z1", zone_name: "Zone A - North", qr_token: "QR-A101-7X9K", compliance_score: 92, total_waste_kg: 45.2, violation_count: 0, status: "active", last_pickup: "2026-02-20" },
  { id: "H002", house_no: "B-205", address: "45 Gandhi Nagar, Block B", ward: "Ward 2", zone_id: "Z1", zone_name: "Zone A - North", qr_token: "QR-B205-3M2P", compliance_score: 78, total_waste_kg: 62.8, violation_count: 2, status: "active", last_pickup: "2026-02-19" },
  { id: "H003", house_no: "C-312", address: "78 Nehru Place, Tower A", ward: "Ward 3", zone_id: "Z2", zone_name: "Zone B - South", qr_token: "QR-C312-8Y1L", compliance_score: 95, total_waste_kg: 38.5, violation_count: 0, status: "active", last_pickup: "2026-02-20" },
  { id: "H004", house_no: "D-418", address: "23 Connaught Place, Ring Rd", ward: "Ward 1", zone_id: "Z2", zone_name: "Zone B - South", qr_token: "QR-D418-5K7N", compliance_score: 45, total_waste_kg: 89.3, violation_count: 5, status: "active", last_pickup: "2026-02-18" },
  { id: "H005", house_no: "E-502", address: "67 Lajpat Nagar, Market", ward: "Ward 4", zone_id: "Z3", zone_name: "Zone C - East", qr_token: "QR-E502-2J8M", compliance_score: 88, total_waste_kg: 51.7, violation_count: 1, status: "active", last_pickup: "2026-02-20" },
  { id: "H006", house_no: "F-103", address: "34 Dwarka Sector 12", ward: "Ward 5", zone_id: "Z4", zone_name: "Zone D - West", qr_token: "QR-F103-9W4R", compliance_score: 67, total_waste_kg: 73.1, violation_count: 3, status: "inactive", last_pickup: "2026-02-15" },
  { id: "H007", house_no: "G-711", address: "89 Saket Mall Road", ward: "Ward 3", zone_id: "Z5", zone_name: "Zone E - Central", qr_token: "QR-G711-6T3Q", compliance_score: 91, total_waste_kg: 42.9, violation_count: 0, status: "active", last_pickup: "2026-02-20" },
  { id: "H008", house_no: "H-820", address: "15 Rohini Sector 3", ward: "Ward 6", zone_id: "Z1", zone_name: "Zone A - North", qr_token: "QR-H820-1P5S", compliance_score: 83, total_waste_kg: 56.4, violation_count: 1, status: "active", last_pickup: "2026-02-19" },
];

const DEMO_ZONES: Zone[] = [
  { id: "Z1", name: "Zone A - North Delhi", code: "ZA-N01", supervisor: "Rajesh Kumar", supervisor_id: "S1", total_households: 1250, total_pickups: 8934, total_waste_kg: 45670, compliance: 92.3, violation_rate: 2.1, status: "active" },
  { id: "Z2", name: "Zone B - South Delhi", code: "ZB-S02", supervisor: "Amit Singh", supervisor_id: "S2", total_households: 980, total_pickups: 7245, total_waste_kg: 38920, compliance: 88.7, violation_rate: 3.4, status: "active" },
  { id: "Z3", name: "Zone C - East Delhi", code: "ZC-E03", supervisor: "Priya Patel", supervisor_id: "S3", total_households: 1120, total_pickups: 6890, total_waste_kg: 42150, compliance: 76.5, violation_rate: 5.8, status: "active" },
  { id: "Z4", name: "Zone D - West Delhi", code: "ZD-W04", supervisor: "Suresh Yadav", supervisor_id: "S4", total_households: 870, total_pickups: 5678, total_waste_kg: 31200, compliance: 95.1, violation_rate: 1.2, status: "active" },
  { id: "Z5", name: "Zone E - Central Delhi", code: "ZE-C05", supervisor: "Meena Sharma", supervisor_id: "S5", total_households: 1450, total_pickups: 9120, total_waste_kg: 52340, compliance: 84.2, violation_rate: 4.1, status: "active" },
];

const DEMO_SUPERVISORS: Supervisor[] = [
  { id: "S1", name: "Rajesh Kumar", zone: "Zone A - North Delhi", zone_id: "Z1", pickups_verified: 2456, violations_recorded: 18, complaints_resolved: 45, avg_daily_pickups: 82, status: "active", phone: "+91 98765 43210", performance_score: 94 },
  { id: "S2", name: "Amit Singh", zone: "Zone B - South Delhi", zone_id: "Z2", pickups_verified: 1890, violations_recorded: 32, complaints_resolved: 38, avg_daily_pickups: 63, status: "active", phone: "+91 87654 32109", performance_score: 87 },
  { id: "S3", name: "Priya Patel", zone: "Zone C - East Delhi", zone_id: "Z3", pickups_verified: 2102, violations_recorded: 45, complaints_resolved: 52, avg_daily_pickups: 70, status: "active", phone: "+91 76543 21098", performance_score: 79 },
  { id: "S4", name: "Suresh Yadav", zone: "Zone D - West Delhi", zone_id: "Z4", pickups_verified: 1678, violations_recorded: 8, complaints_resolved: 29, avg_daily_pickups: 56, status: "on_leave", phone: "+91 65432 10987", performance_score: 96 },
  { id: "S5", name: "Meena Sharma", zone: "Zone E - Central Delhi", zone_id: "Z5", pickups_verified: 2780, violations_recorded: 38, complaints_resolved: 61, avg_daily_pickups: 93, status: "active", phone: "+91 54321 09876", performance_score: 82 },
];

const DEMO_PICKUPS: PickupLog[] = [
  { id: "P001", household: "A-101", address: "12 MG Road", zone: "Zone A", supervisor: "Rajesh Kumar", waste_category: "Wet Waste", weight_kg: 2.5, qr_scanned: true, gps_match: true, distance_mismatch_m: 5, proof_photo: true, status: "verified", timestamp: "2026-02-20 08:30" },
  { id: "P002", household: "B-205", address: "45 Gandhi Nagar", zone: "Zone A", supervisor: "Rajesh Kumar", waste_category: "Dry Waste", weight_kg: 1.8, qr_scanned: true, gps_match: false, distance_mismatch_m: 250, proof_photo: true, status: "flagged", timestamp: "2026-02-20 09:15" },
  { id: "P003", household: "C-312", address: "78 Nehru Place", zone: "Zone B", supervisor: "Amit Singh", waste_category: "E-Waste", weight_kg: 4.2, qr_scanned: true, gps_match: true, distance_mismatch_m: 12, proof_photo: true, status: "verified", timestamp: "2026-02-20 07:45" },
  { id: "P004", household: "D-418", address: "23 Connaught Place", zone: "Zone B", supervisor: "Amit Singh", waste_category: "Hazardous", weight_kg: 0.8, qr_scanned: false, gps_match: false, distance_mismatch_m: 500, proof_photo: false, status: "failed", timestamp: "2026-02-20 10:00" },
  { id: "P005", household: "E-502", address: "67 Lajpat Nagar", zone: "Zone C", supervisor: "Priya Patel", waste_category: "Wet Waste", weight_kg: 3.1, qr_scanned: true, gps_match: true, distance_mismatch_m: 8, proof_photo: true, status: "verified", timestamp: "2026-02-20 08:00" },
  { id: "P006", household: "F-103", address: "34 Dwarka", zone: "Zone D", supervisor: "Suresh Yadav", waste_category: "Mixed Waste", weight_kg: 5.6, qr_scanned: true, gps_match: true, distance_mismatch_m: 15, proof_photo: false, status: "pending", timestamp: "2026-02-20 11:30" },
  { id: "P007", household: "G-711", address: "89 Saket", zone: "Zone E", supervisor: "Meena Sharma", waste_category: "Dry Waste", weight_kg: 2.0, qr_scanned: true, gps_match: true, distance_mismatch_m: 3, proof_photo: true, status: "verified", timestamp: "2026-02-20 09:45" },
  { id: "P008", household: "H-820", address: "15 Rohini", zone: "Zone A", supervisor: "Rajesh Kumar", waste_category: "Recyclable", weight_kg: 3.8, qr_scanned: true, gps_match: false, distance_mismatch_m: 180, proof_photo: true, status: "flagged", timestamp: "2026-02-20 12:00" },
];

const DEMO_VIOLATIONS: Violation[] = [
  { id: "V001", type: "GPS Mismatch", household: "B-205", zone: "Zone A", severity: "high", description: "Pickup location 250m away from registered address", timestamp: "2026-02-20 09:15", status: "open" },
  { id: "V002", type: "Fake QR Attempt", household: "D-418", zone: "Zone B", severity: "high", description: "Invalid QR code scanned, not matching any registered household", timestamp: "2026-02-20 10:00", status: "open" },
  { id: "V003", type: "Repeat Violation", household: "D-418", zone: "Zone B", severity: "medium", description: "5th violation this month - waste not segregated properly", timestamp: "2026-02-19 14:20", status: "escalated" },
  { id: "V004", type: "Missed Pickup", household: "F-103", zone: "Zone D", severity: "low", description: "Scheduled pickup missed for 3 consecutive days", timestamp: "2026-02-18 18:00", status: "resolved" },
  { id: "V005", type: "GPS Mismatch", household: "H-820", zone: "Zone A", severity: "medium", description: "Pickup location 180m away from registered address", timestamp: "2026-02-20 12:00", status: "open" },
  { id: "V006", type: "No Proof Photo", household: "F-103", zone: "Zone D", severity: "low", description: "Pickup completed without uploading proof photo", timestamp: "2026-02-20 11:30", status: "open" },
];

const DEMO_COMPLAINTS: Complaint[] = [
  { id: "C001", citizen: "Arun Mehta", zone: "Zone A", category: "Missed Pickup", description: "No pickup for 2 days despite scheduled service", assigned_to: "Rajesh Kumar", status: "in_progress", resolution_time_hrs: null, created_at: "2026-02-20 06:30" },
  { id: "C002", citizen: "Sneha Gupta", zone: "Zone B", category: "Improper Collection", description: "Waste scattered during collection process", assigned_to: "Amit Singh", status: "pending", resolution_time_hrs: null, created_at: "2026-02-19 15:00" },
  { id: "C003", citizen: "Vikram Reddy", zone: "Zone C", category: "Rude Behavior", description: "Collection worker was rude and uncooperative", assigned_to: "Priya Patel", status: "resolved", resolution_time_hrs: 4.5, created_at: "2026-02-18 10:00" },
  { id: "C004", citizen: "Pooja Sharma", zone: "Zone E", category: "Missed Pickup", description: "Morning pickup consistently delayed by 2+ hours", assigned_to: "Meena Sharma", status: "in_progress", resolution_time_hrs: null, created_at: "2026-02-19 08:00" },
  { id: "C005", citizen: "Rohit Kumar", zone: "Zone A", category: "Bin Overflow", description: "Community bin overflowing for 3 days", assigned_to: "Rajesh Kumar", status: "escalated", resolution_time_hrs: null, created_at: "2026-02-17 12:00" },
  { id: "C006", citizen: "Anita Verma", zone: "Zone D", category: "Wrong Category", description: "Wet and dry waste mixed during collection", assigned_to: "Suresh Yadav", status: "resolved", resolution_time_hrs: 2.0, created_at: "2026-02-16 09:30" },
];

// Chart data
const DAILY_PICKUP_TREND = [
  { date: "Feb 14", completed: 289, failed: 23 },
  { date: "Feb 15", completed: 318, failed: 27 },
  { date: "Feb 16", completed: 275, failed: 23 },
  { date: "Feb 17", completed: 356, failed: 22 },
  { date: "Feb 18", completed: 372, failed: 29 },
  { date: "Feb 19", completed: 342, failed: 25 },
  { date: "Feb 20", completed: 365, failed: 24 },
];

const MONTHLY_PICKUP_TREND = [
  { month: "Sep", pickups: 8456 },
  { month: "Oct", pickups: 9012 },
  { month: "Nov", pickups: 9534 },
  { month: "Dec", pickups: 8890 },
  { month: "Jan", pickups: 10234 },
  { month: "Feb", pickups: 9867 },
];

const WASTE_BY_CATEGORY = [
  { name: "Wet Waste", value: 42, color: "#10b981" },
  { name: "Dry Waste", value: 28, color: "#3b82f6" },
  { name: "Recyclable", value: 18, color: "#f59e0b" },
  { name: "E-Waste", value: 7, color: "#8b5cf6" },
  { name: "Hazardous", value: 5, color: "#ef4444" },
];

const WASTE_PER_ZONE = [
  { zone: "Zone A", waste: 456.7 },
  { zone: "Zone B", waste: 389.2 },
  { zone: "Zone C", waste: 421.5 },
  { zone: "Zone D", waste: 312.0 },
  { zone: "Zone E", waste: 523.4 },
];

const COMPLIANCE_DISTRIBUTION = [
  { range: "90-100%", count: 2450, fill: "#10b981" },
  { range: "80-90%", count: 1800, fill: "#3b82f6" },
  { range: "70-80%", count: 890, fill: "#f59e0b" },
  { range: "60-70%", count: 345, fill: "#f97316" },
  { range: "<60%", count: 185, fill: "#ef4444" },
];

const COMPLAINTS_BY_ZONE = [
  { zone: "Zone A", pending: 8, resolved: 34, escalated: 3 },
  { zone: "Zone B", pending: 12, resolved: 28, escalated: 5 },
  { zone: "Zone C", pending: 15, resolved: 22, escalated: 8 },
  { zone: "Zone D", pending: 4, resolved: 31, escalated: 1 },
  { zone: "Zone E", pending: 10, resolved: 25, escalated: 4 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316"];

// ═══════════════════════════════════════════════════════════════
// KPI CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "green",
  delay = 0,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
  color?: string;
  delay?: number;
}) => {
  const colorMap: Record<string, string> = {
    green: "from-green-500 to-emerald-600",
    blue: "from-blue-500 to-cyan-600",
    amber: "from-amber-500 to-orange-600",
    red: "from-red-500 to-rose-600",
    purple: "from-purple-500 to-violet-600",
    cyan: "from-cyan-500 to-teal-600",
    orange: "from-orange-500 to-amber-600",
    slate: "from-slate-500 to-gray-600",
    pink: "from-pink-500 to-rose-600",
  };
  const bgColor = colorMap[color] || colorMap.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {title}
              </p>
              <p className="text-3xl font-bold text-white mt-2">{value}</p>
              <div className="flex items-center gap-2 mt-2">
                {trend && (
                  <span
                    className={`flex items-center text-xs font-medium ${
                      trend === "up" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {trendValue}
                  </span>
                )}
                {subtitle && (
                  <span className="text-xs text-gray-500">{subtitle}</span>
                )}
              </div>
            </div>
            <div
              className={`w-12 h-12 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════
const OverviewTab = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* KPI Cards Row 1 */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <KPICard title="Total Households" value="5,670" subtitle="Registered" icon={Home} trend="up" trendValue="+12%" color="blue" delay={0} />
      <KPICard title="Total Zones" value="5" subtitle="Active zones" icon={MapPin} trend="up" trendValue="+1" color="green" delay={0.05} />
      <KPICard title="Supervisors" value="5" subtitle="4 active, 1 leave" icon={UserCheck} color="purple" delay={0.1} />
      <KPICard title="Pickups Today" value="389" subtitle="vs 367 yesterday" icon={Truck} trend="up" trendValue="+6%" color="cyan" delay={0.15} />
      <KPICard title="Pickups This Month" value="9,867" subtitle="February 2026" icon={CheckCircle} trend="up" trendValue="+8.2%" color="green" delay={0.2} />
    </div>

    {/* KPI Cards Row 2 */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <KPICard title="Total Waste" value="210.3 T" subtitle="Collected this month" icon={Weight} trend="up" trendValue="+5.4%" color="amber" delay={0.25} />
      <KPICard title="City Compliance" value="87.4%" subtitle="Average score" icon={Target} trend="up" trendValue="+2.1%" color="green" delay={0.3} />
      <KPICard title="Open Complaints" value="49" subtitle="12 escalated" icon={Megaphone} trend="down" trendValue="-8%" color="orange" delay={0.35} />
      <KPICard title="Total Violations" value="141" subtitle="23 high severity" icon={AlertTriangle} trend="down" trendValue="-15%" color="red" delay={0.4} />
    </div>

    {/* Charts Row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Daily Pickup Trend
            </CardTitle>
            <CardDescription className="text-gray-400">
              Completed vs Failed pickups this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={DAILY_PICKUP_TREND}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailed)" name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-400" />
              Waste Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">
              By waste category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={WASTE_BY_CATEGORY}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {WASTE_BY_CATEGORY.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Charts Row 2 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Zone-wise Waste Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={WASTE_PER_ZONE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="zone" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="waste" fill="#3b82f6" name="Waste (tons)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-400" />
              Complaints by Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={COMPLAINTS_BY_ZONE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="zone" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                <Bar dataKey="resolved" stackId="a" fill="#10b981" name="Resolved" />
                <Bar dataKey="escalated" stackId="a" fill="#ef4444" name="Escalated" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Recent Violations Table */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Recent Violations
          </CardTitle>
          <CardDescription className="text-gray-400">
            GPS mismatches, fake QR attempts, repeat violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400">
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Household</th>
                  <th className="text-left py-3 px-2">Zone</th>
                  <th className="text-left py-3 px-2">Severity</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_VIOLATIONS.slice(0, 5).map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium text-white">
                      {v.type}
                    </td>
                    <td className="py-3 px-2 text-gray-300">{v.household}</td>
                    <td className="py-3 px-2 text-gray-300">{v.zone}</td>
                    <td className="py-3 px-2">
                      <Badge
                        className={
                          v.severity === "high"
                            ? "bg-red-500/20 text-red-400"
                            : v.severity === "medium"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-blue-500/20 text-blue-400"
                        }
                      >
                        {v.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        className={
                          v.status === "open"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : v.status === "resolved"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }
                      >
                        {v.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-gray-400 text-xs">
                      {v.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// HOUSEHOLDS TAB
// ═══════════════════════════════════════════════════════════════
const HouseholdsTab = ({
  searchQuery,
  setSearchQuery,
  filterZone,
  setFilterZone,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterZone: string;
  setFilterZone: (v: string) => void;
}) => {
  const filtered = DEMO_HOUSEHOLDS.filter((h) => {
    const matchSearch =
      !searchQuery ||
      h.house_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchZone = filterZone === "all" || h.zone_name.includes(filterZone);
    return matchSearch && matchZone;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-400" />
            Household Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Add, edit, manage households and QR tokens
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search households..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white w-64"
            />
          </div>
          <Select value={filterZone} onValueChange={setFilterZone}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Zones</SelectItem>
              {DEMO_ZONES.map((z) => (
                <SelectItem key={z.id} value={z.name}>
                  {z.name.split(" - ")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Household
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900/80 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 bg-slate-800/50">
                  <th className="text-left py-3 px-4">House No</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-left py-3 px-4">Ward</th>
                  <th className="text-left py-3 px-4">Zone</th>
                  <th className="text-left py-3 px-4">QR Token</th>
                  <th className="text-center py-3 px-4">Compliance</th>
                  <th className="text-center py-3 px-4">Waste (kg)</th>
                  <th className="text-center py-3 px-4">Violations</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-white">
                      {h.house_no}
                    </td>
                    <td className="py-3 px-4 text-gray-300 max-w-[200px] truncate">
                      {h.address}
                    </td>
                    <td className="py-3 px-4 text-gray-400">{h.ward}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-500/30"
                      >
                        {h.zone_name.split(" - ")[0]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-slate-800 px-2 py-1 rounded text-green-400 font-mono">
                        {h.qr_token}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              h.compliance_score >= 80
                                ? "bg-green-500"
                                : h.compliance_score >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${h.compliance_score}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            h.compliance_score >= 80
                              ? "text-green-400"
                              : h.compliance_score >= 60
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {h.compliance_score}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">
                      {h.total_waste_kg}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {h.violation_count > 0 ? (
                        <Badge className="bg-red-500/20 text-red-400">
                          {h.violation_count}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400">
                          0
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        className={
                          h.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }
                      >
                        {h.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-green-400"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ZONES TAB
// ═══════════════════════════════════════════════════════════════
const ZonesTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-green-400" />
          Zone Management
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Create zones, assign supervisors, view zone statistics
        </p>
      </div>
      <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
        <Plus className="w-4 h-4" />
        Create Zone
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {DEMO_ZONES.map((zone, i) => (
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card className="bg-slate-900/80 border-slate-800 hover:border-green-500/30 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {zone.code.slice(0, 2)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">
                      {zone.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-xs">
                      Code: {zone.code}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  {zone.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {zone.total_households.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    Households
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {zone.total_pickups.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    Total Pickups
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {(zone.total_waste_kg / 1000).toFixed(1)}T
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    Total Waste
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p
                    className={`text-2xl font-bold ${
                      zone.compliance >= 85
                        ? "text-green-400"
                        : zone.compliance >= 70
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {zone.compliance}%
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    Compliance
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">
                    {zone.supervisor}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-[10px] text-gray-500">
                  Violation Rate:{" "}
                  <span
                    className={`font-medium ${
                      zone.violation_rate <= 2
                        ? "text-green-400"
                        : zone.violation_rate <= 4
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {zone.violation_rate}%
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// SUPERVISORS TAB
// ═══════════════════════════════════════════════════════════════
const SupervisorsTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-purple-400" />
          Supervisor Management
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Create, assign zones, view performance metrics
        </p>
      </div>
      <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
        <Plus className="w-4 h-4" />
        Add Supervisor
      </Button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {DEMO_SUPERVISORS.map((sup, i) => (
        <motion.div
          key={sup.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card className="bg-slate-900/80 border-slate-800 hover:border-purple-500/30 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                    {sup.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">
                      {sup.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-xs">
                      {sup.zone}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  className={
                    sup.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : sup.status === "on_leave"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-gray-500/20 text-gray-400"
                  }
                >
                  {sup.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Performance Score Circle */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90">
                    <circle
                      className="text-slate-700"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="24"
                      cx="28"
                      cy="28"
                    />
                    <circle
                      className={`${
                        sup.performance_score >= 90
                          ? "text-green-500"
                          : sup.performance_score >= 75
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="24"
                      cx="28"
                      cy="28"
                      strokeDasharray={`${
                        (sup.performance_score / 100) * 150.8
                      } 150.8`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-white">
                    {sup.performance_score}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Performance Score
                  </p>
                  <p className="text-xs text-gray-400">{sup.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/30 rounded p-2.5 text-center">
                  <p className="text-lg font-bold text-cyan-400">
                    {sup.pickups_verified.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Pickups Verified
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded p-2.5 text-center">
                  <p className="text-lg font-bold text-red-400">
                    {sup.violations_recorded}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Violations
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded p-2.5 text-center">
                  <p className="text-lg font-bold text-green-400">
                    {sup.complaints_resolved}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Complaints Resolved
                  </p>
                </div>
                <div className="bg-slate-800/30 rounded p-2.5 text-center">
                  <p className="text-lg font-bold text-amber-400">
                    {sup.avg_daily_pickups}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Avg Daily Pickups
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// PICKUP LOGS TAB
// ═══════════════════════════════════════════════════════════════
const PickupLogsTab = ({
  filterZone,
  setFilterZone,
  filterStatus,
  setFilterStatus,
}: {
  filterZone: string;
  setFilterZone: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
}) => {
  const filtered = DEMO_PICKUPS.filter((p) => {
    const matchZone = filterZone === "all" || p.zone.includes(filterZone);
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchZone && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-cyan-400" />
            Pickup Logs
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitor all pickups with QR, GPS validation, and proof photos
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={filterZone} onValueChange={setFilterZone}>
            <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="Zone A">Zone A</SelectItem>
              <SelectItem value="Zone B">Zone B</SelectItem>
              <SelectItem value="Zone C">Zone C</SelectItem>
              <SelectItem value="Zone D">Zone D</SelectItem>
              <SelectItem value="Zone E">Zone E</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-slate-900/80 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-gray-400 bg-slate-800/50">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Household</th>
                  <th className="text-left py-3 px-4">Zone</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-center py-3 px-4">Weight</th>
                  <th className="text-center py-3 px-4">QR</th>
                  <th className="text-center py-3 px-4">GPS</th>
                  <th className="text-center py-3 px-4">Distance</th>
                  <th className="text-center py-3 px-4">Photo</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {p.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-white">
                        {p.household}
                      </span>
                      <br />
                      <span className="text-xs text-gray-400">
                        {p.address}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{p.zone}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className="text-gray-300 border-slate-600"
                      >
                        {p.waste_category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-300">
                      {p.weight_kg} kg
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.qr_scanned ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.gps_match ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs ${
                          p.distance_mismatch_m > 100
                            ? "text-red-400 font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {p.distance_mismatch_m}m
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.proof_photo ? (
                        <Camera className="w-4 h-4 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        className={
                          p.status === "verified"
                            ? "bg-green-500/20 text-green-400"
                            : p.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : p.status === "flagged"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-red-500/20 text-red-400"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {p.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// VIOLATIONS TAB
// ═══════════════════════════════════════════════════════════════
const ViolationsTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-400" />
          Violation Monitoring
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          GPS mismatches, fake QR, repeat violations, missed pickups
        </p>
      </div>
    </div>

    {/* Violation Summary KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <KPICard title="GPS Mismatches" value="8" icon={Navigation} color="red" subtitle="This week" delay={0} />
      <KPICard title="Fake QR Attempts" value="3" icon={QrCode} color="orange" subtitle="This week" delay={0.05} />
      <KPICard title="Repeat Violations" value="12" icon={AlertCircle} color="amber" subtitle="By households" delay={0.1} />
      <KPICard title="Missed Pickups" value="18" icon={Clock} color="blue" subtitle="This week" delay={0.15} />
      <KPICard title="High Risk Zones" value="2" icon={MapPinned} color="red" subtitle="Zones C, E" delay={0.2} />
    </div>

    <Card className="bg-slate-900/80 border-slate-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 bg-slate-800/50">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Household</th>
                <th className="text-left py-3 px-4">Zone</th>
                <th className="text-center py-3 px-4">Severity</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Time</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_VIOLATIONS.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">
                    {v.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">
                    {v.type}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{v.household}</td>
                  <td className="py-3 px-4 text-gray-300">{v.zone}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      className={
                        v.severity === "high"
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : v.severity === "medium"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }
                    >
                      {v.severity}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs max-w-[250px] truncate">
                    {v.description}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      className={
                        v.status === "open"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : v.status === "resolved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }
                    >
                      {v.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {v.timestamp}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-gray-400 hover:text-green-400"
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-gray-400 hover:text-red-400"
                      >
                        Escalate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// COMPLAINTS TAB
// ═══════════════════════════════════════════════════════════════
const ComplaintsTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-orange-400" />
          Complaint Management
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          View, assign, escalate, and resolve citizen complaints
        </p>
      </div>
    </div>

    {/* Complaint Summary KPIs */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KPICard title="Total Complaints" value="186" icon={FileText} color="blue" subtitle="This month" delay={0} />
      <KPICard title="Pending" value="49" icon={Clock} color="amber" subtitle="Awaiting action" delay={0.05} />
      <KPICard title="Avg Resolution" value="3.2h" icon={Zap} color="green" subtitle="Time to close" delay={0.1} />
      <KPICard title="Escalated" value="12" icon={AlertTriangle} color="red" subtitle="Needs attention" delay={0.15} />
    </div>

    <Card className="bg-slate-900/80 border-slate-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 bg-slate-800/50">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Citizen</th>
                <th className="text-left py-3 px-4">Zone</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Assigned To</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Resolution</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_COMPLAINTS.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">
                    {c.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">
                    {c.citizen}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{c.zone}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className="text-gray-300 border-slate-600"
                    >
                      {c.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs max-w-[200px] truncate">
                    {c.description}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{c.assigned_to}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      className={
                        c.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : c.status === "in_progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : c.status === "resolved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }
                    >
                      {c.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">
                    {c.resolution_time_hrs ? `${c.resolution_time_hrs}h` : "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-gray-400 hover:text-blue-400"
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-gray-400 hover:text-red-400"
                      >
                        Escalate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-gray-400 hover:text-green-400"
                      >
                        Close
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════════════════════════════
const AnalyticsTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-cyan-400" />
        City Analytics Board
      </h2>
      <p className="text-gray-400 text-sm mt-1">
        Comprehensive analytics across pickups, waste, compliance, and complaints
      </p>
    </div>

    {/* ── Pickup Analytics ── */}
    <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
      <Truck className="w-5 h-5" />
      Pickup Analytics
    </h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Monthly Pickup Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY_PICKUP_TREND}>
              <defs>
                <linearGradient id="gc1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area type="monotone" dataKey="pickups" stroke="#06b6d4" fill="url(#gc1)" name="Pickups" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            QR Verification Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={[
                  { name: "QR Success", value: 94.5 },
                  { name: "QR Failed", value: 5.5 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* ── Waste Analytics ── */}
    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
      <Recycle className="w-5 h-5" />
      Waste Analytics
    </h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Waste by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={WASTE_BY_CATEGORY}
                cx="50%"
                cy="50%"
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {WASTE_BY_CATEGORY.map((e, i) => (
                  <Cell key={i} fill={e.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Waste per Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={WASTE_PER_ZONE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="zone" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="waste" fill="#10b981" name="Waste (tons)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* ── Compliance Analytics ── */}
    <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
      <Target className="w-5 h-5" />
      Compliance Analytics
    </h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Compliance Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={COMPLIANCE_DISTRIBUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" name="Households" radius={[6, 6, 0, 0]}>
                {COMPLIANCE_DISTRIBUTION.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Zone Compliance Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...DEMO_ZONES]
              .sort((a, b) => b.compliance - a.compliance)
              .map((z, i) => (
                <div key={z.id} className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? "bg-amber-500 text-black"
                        : i === 1
                        ? "bg-gray-300 text-black"
                        : i === 2
                        ? "bg-amber-700 text-white"
                        : "bg-slate-700 text-gray-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white">{z.name}</span>
                      <span
                        className={`text-sm font-semibold ${
                          z.compliance >= 85
                            ? "text-green-400"
                            : z.compliance >= 70
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {z.compliance}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          z.compliance >= 85
                            ? "bg-green-500"
                            : z.compliance >= 70
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${z.compliance}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* ── Complaint Analytics ── */}
    <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
      <Megaphone className="w-5 h-5" />
      Complaint Analytics
    </h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Complaints by Zone (Stacked)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={COMPLAINTS_BY_ZONE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="zone" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
              <Bar dataKey="resolved" stackId="a" fill="#10b981" name="Resolved" />
              <Bar dataKey="escalated" stackId="a" fill="#ef4444" name="Escalated" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Complaints by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={[
                  { name: "Missed Pickup", value: 38 },
                  { name: "Improper Collection", value: 24 },
                  { name: "Bin Overflow", value: 18 },
                  { name: "Rude Behavior", value: 12 },
                  { name: "Wrong Category", value: 8 },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <Cell key={i} fill={COLORS[i]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterZone, setFilterZone] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const isDemoMode = localStorage.getItem("isDemoMode") === "true";
  const demoUser = isDemoMode
    ? JSON.parse(localStorage.getItem("demoUser") || "null")
    : null;

  useEffect(() => {
    if (isDemoMode && demoUser?.role === "ADMIN") {
      setIsAdmin(true);
      setLoading(false);
      return;
    }
    if (!authLoading && user) {
      checkAdminAccess(user.id).then((hasAccess) => {
        if (!hasAccess) {
          navigate("/dashboard");
          return;
        }
        setIsAdmin(true);
        setLoading(false);
      });
    } else if (!authLoading && !user && !isDemoMode) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500/30 border-t-green-500 mx-auto" />
            <Crown className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-400" />
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Card className="max-w-md bg-slate-900 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              You don't have admin privileges.
            </p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "households", label: "Households", icon: Home },
    { key: "zones", label: "Zones", icon: MapPin },
    { key: "supervisors", label: "Supervisors", icon: UserCheck },
    { key: "pickups", label: "Pickup Logs", icon: Truck },
    { key: "violations", label: "Violations", icon: AlertTriangle },
    { key: "complaints", label: "Complaints", icon: Megaphone },
    { key: "analytics", label: "Analytics", icon: PieChartIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* HEADER */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Admin Control Center
                </h1>
                <p className="text-sm text-gray-400">
                  Municipal Waste Management &bull; City-Level Authority
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                System Online
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-slate-800/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && <OverviewTab key="overview" />}
          {activeTab === "households" && (
            <HouseholdsTab
              key="households"
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterZone={filterZone}
              setFilterZone={setFilterZone}
            />
          )}
          {activeTab === "zones" && <ZonesTab key="zones" />}
          {activeTab === "supervisors" && (
            <SupervisorsTab key="supervisors" />
          )}
          {activeTab === "pickups" && (
            <PickupLogsTab
              key="pickups"
              filterZone={filterZone}
              setFilterZone={setFilterZone}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          )}
          {activeTab === "violations" && (
            <ViolationsTab key="violations" />
          )}
          {activeTab === "complaints" && (
            <ComplaintsTab key="complaints" />
          )}
          {activeTab === "analytics" && <AnalyticsTab key="analytics" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
