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
  Home,
  QrCode,
  Shield,
  Search,
  Eye,
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
  Camera,
  Navigation,
  Scan,
  Upload,
  Flag,
  BarChart3,
  PieChart as PieChartIcon,
  MessageSquare,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth as useSupabaseAuth } from "@/lib/supabase";
import { checkSupervisorAccess } from "@/lib/supervisor-operations";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface ZoneHousehold {
  id: string;
  house_no: string;
  address: string;
  compliance_score: number;
  total_waste_kg: number;
  violation_count: number;
  last_pickup: string;
  status: "active" | "inactive";
  lat: number;
  lng: number;
}

interface PickupEntry {
  id: string;
  household: string;
  address: string;
  waste_category: string;
  weight_kg: number;
  qr_scanned: boolean;
  gps_match: boolean;
  distance_m: number;
  proof_photo: boolean;
  status: "verified" | "pending" | "flagged" | "failed";
  timestamp: string;
  notes: string;
}

interface ZoneViolation {
  id: string;
  type: string;
  household: string;
  severity: "high" | "medium" | "low";
  description: string;
  timestamp: string;
  status: "open" | "confirmed" | "escalated" | "resolved";
  gps_distance_m: number | null;
}

interface ZoneComplaint {
  id: string;
  citizen: string;
  category: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "escalated";
  resolution_time_hrs: number | null;
  created_at: string;
}

type SupervisorTab =
  | "overview"
  | "qr_verify"
  | "analytics"
  | "map"
  | "violations"
  | "complaints";

// ═══════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════
const MY_ZONE = {
  name: "Zone A - North Delhi",
  code: "ZA-N01",
  total_households: 1250,
  pickups_today: 82,
  pickups_month: 2456,
  total_waste_today_kg: 287.5,
  total_waste_month_kg: 8934,
  compliance: 92.3,
  complaints_open: 5,
  violations_open: 3,
};

const ZONE_HOUSEHOLDS: ZoneHousehold[] = [
  { id: "H001", house_no: "A-101", address: "12 MG Road, Sector 5", compliance_score: 92, total_waste_kg: 45.2, violation_count: 0, last_pickup: "2026-02-20 08:30", status: "active", lat: 28.6139, lng: 77.209 },
  { id: "H002", house_no: "B-205", address: "45 Gandhi Nagar, Block B", compliance_score: 78, total_waste_kg: 62.8, violation_count: 2, last_pickup: "2026-02-19 09:15", status: "active", lat: 28.62, lng: 77.21 },
  { id: "H003", house_no: "C-312", address: "78 Nehru Place, Tower A", compliance_score: 95, total_waste_kg: 38.5, violation_count: 0, last_pickup: "2026-02-20 07:45", status: "active", lat: 28.625, lng: 77.215 },
  { id: "H004", house_no: "D-418", address: "23 Connaught Pl, Ring Rd", compliance_score: 45, total_waste_kg: 89.3, violation_count: 5, last_pickup: "2026-02-18 10:00", status: "active", lat: 28.63, lng: 77.22 },
  { id: "H005", house_no: "E-112", address: "56 Karol Bagh, Main St", compliance_score: 88, total_waste_kg: 51.7, violation_count: 1, last_pickup: "2026-02-20 08:00", status: "active", lat: 28.635, lng: 77.19 },
  { id: "H006", house_no: "F-901", address: "34 Model Town, Phase 2", compliance_score: 67, total_waste_kg: 73.1, violation_count: 3, last_pickup: "2026-02-15 11:30", status: "inactive", lat: 28.71, lng: 77.19 },
  { id: "H007", house_no: "G-207", address: "89 Civil Lines, Block A", compliance_score: 91, total_waste_kg: 42.9, violation_count: 0, last_pickup: "2026-02-20 09:45", status: "active", lat: 28.68, lng: 77.22 },
  { id: "H008", house_no: "H-820", address: "15 Rohini Sector 3", compliance_score: 83, total_waste_kg: 56.4, violation_count: 1, last_pickup: "2026-02-19 12:00", status: "active", lat: 28.72, lng: 77.11 },
  { id: "H009", house_no: "I-445", address: "67 Pitampura, Madhuban", compliance_score: 96, total_waste_kg: 33.2, violation_count: 0, last_pickup: "2026-02-20 07:15", status: "active", lat: 28.695, lng: 77.14 },
  { id: "H010", house_no: "J-333", address: "12 Shalimar Bagh, Ring", compliance_score: 72, total_waste_kg: 68.9, violation_count: 2, last_pickup: "2026-02-20 10:30", status: "active", lat: 28.715, lng: 77.16 },
];

const ZONE_PICKUPS: PickupEntry[] = [
  { id: "P001", household: "A-101", address: "12 MG Road", waste_category: "Wet Waste", weight_kg: 2.5, qr_scanned: true, gps_match: true, distance_m: 5, proof_photo: true, status: "verified", timestamp: "2026-02-20 08:30", notes: "" },
  { id: "P002", household: "B-205", address: "45 Gandhi Nagar", waste_category: "Dry Waste", weight_kg: 1.8, qr_scanned: true, gps_match: false, distance_m: 250, proof_photo: true, status: "flagged", timestamp: "2026-02-20 09:15", notes: "GPS mismatch detected" },
  { id: "P003", household: "C-312", address: "78 Nehru Place", waste_category: "Recyclable", weight_kg: 4.2, qr_scanned: true, gps_match: true, distance_m: 12, proof_photo: true, status: "verified", timestamp: "2026-02-20 07:45", notes: "" },
  { id: "P004", household: "D-418", address: "23 Connaught Pl", waste_category: "Mixed Waste", weight_kg: 0.8, qr_scanned: false, gps_match: false, distance_m: 500, proof_photo: false, status: "failed", timestamp: "2026-02-20 10:00", notes: "QR not scanned, no proof" },
  { id: "P005", household: "E-112", address: "56 Karol Bagh", waste_category: "Wet Waste", weight_kg: 3.1, qr_scanned: true, gps_match: true, distance_m: 8, proof_photo: true, status: "verified", timestamp: "2026-02-20 08:00", notes: "" },
  { id: "P006", household: "G-207", address: "89 Civil Lines", waste_category: "E-Waste", weight_kg: 5.6, qr_scanned: true, gps_match: true, distance_m: 15, proof_photo: true, status: "pending", timestamp: "2026-02-20 09:45", notes: "Awaiting verification" },
  { id: "P007", household: "H-820", address: "15 Rohini", waste_category: "Dry Waste", weight_kg: 2.0, qr_scanned: true, gps_match: false, distance_m: 180, proof_photo: true, status: "flagged", timestamp: "2026-02-20 12:00", notes: "GPS drift suspected" },
  { id: "P008", household: "I-445", address: "67 Pitampura", waste_category: "Wet Waste", weight_kg: 1.9, qr_scanned: true, gps_match: true, distance_m: 4, proof_photo: true, status: "verified", timestamp: "2026-02-20 07:15", notes: "" },
];

const ZONE_VIOLATIONS: ZoneViolation[] = [
  { id: "V001", type: "GPS Mismatch", household: "B-205", severity: "high", description: "Pickup location 250m away from registered address", timestamp: "2026-02-20 09:15", status: "open", gps_distance_m: 250 },
  { id: "V002", type: "No QR Scan", household: "D-418", severity: "high", description: "Pickup done without scanning household QR code", timestamp: "2026-02-20 10:00", status: "open", gps_distance_m: 500 },
  { id: "V003", type: "Repeat Offender", household: "D-418", severity: "medium", description: "5th violation this month - waste not segregated", timestamp: "2026-02-19 14:20", status: "confirmed", gps_distance_m: null },
  { id: "V004", type: "GPS Mismatch", household: "H-820", severity: "medium", description: "Pickup location 180m away from registered address", timestamp: "2026-02-20 12:00", status: "open", gps_distance_m: 180 },
  { id: "V005", type: "No Proof Photo", household: "D-418", severity: "low", description: "Pickup completed without uploading proof photo", timestamp: "2026-02-20 10:00", status: "open", gps_distance_m: null },
];

const ZONE_COMPLAINTS: ZoneComplaint[] = [
  { id: "C001", citizen: "Arun Mehta", category: "Missed Pickup", description: "No pickup for 2 days despite scheduled service", status: "in_progress", resolution_time_hrs: null, created_at: "2026-02-20 06:30" },
  { id: "C002", citizen: "Ravi Shankar", category: "Bin Overflow", description: "Community bin overflowing since yesterday", status: "pending", resolution_time_hrs: null, created_at: "2026-02-19 15:00" },
  { id: "C003", citizen: "Kavita Rajan", category: "Improper Collection", description: "Waste scattered during morning collection", status: "resolved", resolution_time_hrs: 3.5, created_at: "2026-02-18 10:00" },
  { id: "C004", citizen: "Deepak Malhotra", category: "Late Pickup", description: "Pickup always arrives 3 hours late", status: "in_progress", resolution_time_hrs: null, created_at: "2026-02-19 08:00" },
  { id: "C005", citizen: "Sunita Bhandari", category: "Missed Pickup", description: "House skipped during morning collection round", status: "escalated", resolution_time_hrs: null, created_at: "2026-02-17 12:00" },
];

// Chart data
const DAILY_TREND = [
  { date: "Feb 14", pickups: 78, waste: 265 },
  { date: "Feb 15", pickups: 85, waste: 290 },
  { date: "Feb 16", pickups: 72, waste: 248 },
  { date: "Feb 17", pickups: 90, waste: 312 },
  { date: "Feb 18", pickups: 88, waste: 301 },
  { date: "Feb 19", pickups: 76, waste: 260 },
  { date: "Feb 20", pickups: 82, waste: 287 },
];

const WASTE_BREAKDOWN = [
  { name: "Wet Waste", value: 45, color: "#10b981" },
  { name: "Dry Waste", value: 25, color: "#3b82f6" },
  { name: "Recyclable", value: 16, color: "#f59e0b" },
  { name: "E-Waste", value: 8, color: "#8b5cf6" },
  { name: "Hazardous", value: 4, color: "#ef4444" },
  { name: "Mixed", value: 2, color: "#94a3b8" },
];

const HIGH_WASTE_HOUSEHOLDS = [
  { house: "D-418", waste: 89.3, violations: 5 },
  { house: "F-901", waste: 73.1, violations: 3 },
  { house: "J-333", waste: 68.9, violations: 2 },
  { house: "B-205", waste: 62.8, violations: 2 },
  { house: "H-820", waste: 56.4, violations: 1 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#94a3b8"];

// ═══════════════════════════════════════════════════════════════
// KPI CARD
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
const SupervisorOverview = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {/* Zone KPI Cards */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <KPICard title="Households" value={MY_ZONE.total_households.toLocaleString()} subtitle="In your zone" icon={Home} color="blue" delay={0} />
      <KPICard title="Pickups Today" value={MY_ZONE.pickups_today.toString()} subtitle="vs 76 yesterday" icon={Truck} trend="up" trendValue="+8%" color="cyan" delay={0.05} />
      <KPICard title="Waste Today" value={`${MY_ZONE.total_waste_today_kg} kg`} subtitle="Collected" icon={Weight} trend="up" trendValue="+10%" color="green" delay={0.1} />
      <KPICard title="Compliance" value={`${MY_ZONE.compliance}%`} subtitle="Zone score" icon={Target} trend="up" trendValue="+1.2%" color="amber" delay={0.15} />
      <KPICard title="Complaints" value={MY_ZONE.complaints_open.toString()} subtitle="Open" icon={Megaphone} color="orange" delay={0.2} />
      <KPICard title="Violations" value={MY_ZONE.violations_open.toString()} subtitle="Open" icon={AlertTriangle} color="red" delay={0.25} />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Daily Pickup Trend
            </CardTitle>
            <CardDescription className="text-gray-400">
              Pickups & waste this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={DAILY_TREND}>
                <defs>
                  <linearGradient id="spGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                <Legend />
                <Area type="monotone" dataKey="pickups" stroke="#06b6d4" fill="url(#spGradient)" name="Pickups" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-green-400" />
              Waste Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={WASTE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {WASTE_BREAKDOWN.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Recent Pickups + High Waste Households */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-400" />
              Recent Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ZONE_PICKUPS.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${p.status === "verified" ? "bg-green-400" : p.status === "flagged" ? "bg-orange-400" : p.status === "pending" ? "bg-amber-400" : "bg-red-400"}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{p.household} - {p.waste_category}</p>
                      <p className="text-xs text-gray-400">{p.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{p.weight_kg} kg</span>
                    <Badge className={p.status === "verified" ? "bg-green-500/20 text-green-400" : p.status === "flagged" ? "bg-orange-500/20 text-orange-400" : p.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              High-Waste Households
            </CardTitle>
            <CardDescription className="text-gray-400">Top waste producers in your zone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {HIGH_WASTE_HOUSEHOLDS.map((h, i) => (
                <div key={h.house} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-red-500 text-white" : i === 1 ? "bg-orange-500 text-white" : "bg-slate-700 text-gray-300"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white font-medium">{h.house}</span>
                      <span className="text-sm font-semibold text-amber-400">{h.waste} kg</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(h.waste / 100) * 100}%` }} />
                    </div>
                  </div>
                  {h.violations > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 text-xs">{h.violations} viol.</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// QR SCAN & PICKUP VERIFICATION TAB
// ═══════════════════════════════════════════════════════════════
const QRVerifyTab = () => {
  const [qrInput, setQrInput] = useState("");
  const [scanResult, setScanResult] = useState<ZoneHousehold | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const handleScan = () => {
    const found = ZONE_HOUSEHOLDS.find(
      (h) => h.house_no.toLowerCase() === qrInput.toLowerCase()
    );
    setScanResult(found || null);
  };

  const filteredPickups = ZONE_PICKUPS.filter(
    (p) => filterStatus === "all" || p.status === filterStatus
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* QR Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-slate-900/80 border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scan className="w-5 h-5 text-green-400" />
              Scan QR Code
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter household number or scan QR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* QR Scanner Placeholder */}
              <div className="w-full aspect-square bg-slate-800 rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center">
                <QrCode className="w-16 h-16 text-green-400/50 mb-3" />
                <p className="text-sm text-gray-400">Camera QR Scanner</p>
                <p className="text-xs text-gray-500 mt-1">
                  Point camera at household QR code
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter house no. (e.g. A-101)"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                />
                <Button
                  onClick={handleScan}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {scanResult && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">
                      Household Found
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">House No:</span>
                      <span className="text-white font-medium">
                        {scanResult.house_no}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Address:</span>
                      <span className="text-white text-xs">
                        {scanResult.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Compliance:</span>
                      <span
                        className={`font-medium ${
                          scanResult.compliance_score >= 80
                            ? "text-green-400"
                            : "text-amber-400"
                        }`}
                      >
                        {scanResult.compliance_score}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Pickup:</span>
                      <span className="text-white text-xs">
                        {scanResult.last_pickup}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verify Pickup
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 gap-1"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Flag Issue
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2 bg-slate-700 hover:bg-slate-600 gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Proof Photo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pickup Verification List */}
        <Card className="bg-slate-900/80 border-slate-800 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-cyan-400" />
                  Pickup Verification Queue
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Verify, flag, or approve today's pickups
                </CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-gray-400">
                    <th className="text-left py-2 px-3">House</th>
                    <th className="text-left py-2 px-3">Category</th>
                    <th className="text-center py-2 px-3">Wt</th>
                    <th className="text-center py-2 px-3">QR</th>
                    <th className="text-center py-2 px-3">GPS</th>
                    <th className="text-center py-2 px-3">Photo</th>
                    <th className="text-center py-2 px-3">Status</th>
                    <th className="text-center py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPickups.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-white">
                          {p.household}
                        </span>
                        <br />
                        <span className="text-[10px] text-gray-500">
                          {p.timestamp}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 text-xs">
                        {p.waste_category}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-300">
                        {p.weight_kg}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.qr_scanned ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.gps_match ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-xs text-red-400 font-semibold">
                            {p.distance_m}m
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.proof_photo ? (
                          <Camera className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
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
                      <td className="py-2.5 px-3 text-center">
                        {p.status === "pending" || p.status === "flagged" ? (
                          <div className="flex gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-green-400 hover:bg-green-500/10"
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ZONE ANALYTICS TAB
// ═══════════════════════════════════════════════════════════════
const ZoneAnalyticsTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-cyan-400" />
        Zone Analytics
      </h2>
      <p className="text-gray-400 text-sm mt-1">
        Detailed analytics for {MY_ZONE.name}
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Daily Pickup + Waste Trend */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Daily Pickups & Waste Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={DAILY_TREND}>
              <defs>
                <linearGradient id="zaG1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="zaG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
              <Legend />
              <Area type="monotone" dataKey="pickups" stroke="#06b6d4" fill="url(#zaG1)" name="Pickups" />
              <Area type="monotone" dataKey="waste" stroke="#10b981" fill="url(#zaG2)" name="Waste (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Waste Breakdown */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Waste Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={WASTE_BREAKDOWN}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {WASTE_BREAKDOWN.map((e, i) => (
                  <Cell key={i} fill={e.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* High Waste + Violation Households */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Weight className="w-4 h-4 text-amber-400" />
            High Waste Households
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={HIGH_WASTE_HOUSEHOLDS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="house" type="category" stroke="#94a3b8" fontSize={12} width={60} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="waste" fill="#f59e0b" name="Waste (kg)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Violation Hotspots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ZONE_VIOLATIONS.filter((v) => v.status !== "resolved").map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border-l-4"
                style={{
                  borderLeftColor:
                    v.severity === "high"
                      ? "#ef4444"
                      : v.severity === "medium"
                      ? "#f59e0b"
                      : "#3b82f6",
                }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{v.type}</p>
                  <p className="text-xs text-gray-400">
                    {v.household} • {v.timestamp}
                  </p>
                </div>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// MAP VIEW TAB
// ═══════════════════════════════════════════════════════════════
const MapViewTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <MapPin className="w-6 h-6 text-green-400" />
        Zone Map View
      </h2>
      <p className="text-gray-400 text-sm mt-1">
        Household locations, heatmaps, violation hotspots
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Placeholder */}
      <Card className="bg-slate-900/80 border-slate-800 lg:col-span-2">
        <CardContent className="p-0">
          <div className="w-full h-[500px] bg-slate-800 rounded-lg flex flex-col items-center justify-center">
            <MapPin className="w-20 h-20 text-green-400/30 mb-4" />
            <p className="text-lg text-gray-400 font-medium">
              Interactive Zone Map
            </p>
            <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
              Map integration showing {ZONE_HOUSEHOLDS.length} households with color-coded
              compliance scores, violation hotspots, and pickup routes
            </p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-400">High Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-400">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-gray-400">Low / Violations</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Household List */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">
            Zone Households
          </CardTitle>
          <CardDescription className="text-gray-400">
            {ZONE_HOUSEHOLDS.length} registered households
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {ZONE_HOUSEHOLDS.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      h.compliance_score >= 80
                        ? "bg-green-400"
                        : h.compliance_score >= 60
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {h.house_no}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                      {h.address}
                    </p>
                  </div>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
// VIOLATIONS TAB
// ═══════════════════════════════════════════════════════════════
const ViolationHandlingTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-400" />
          Violation Handling
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Confirm GPS mismatches, mark reasons, escalate to admin
        </p>
      </div>
    </div>

    {/* Violation Summary */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KPICard title="Open Violations" value="3" icon={AlertTriangle} color="red" subtitle="Needs action" delay={0} />
      <KPICard title="Confirmed" value="1" icon={CheckCircle} color="amber" subtitle="Awaiting admin" delay={0.05} />
      <KPICard title="Escalated" value="0" icon={ArrowUpRight} color="orange" subtitle="To admin" delay={0.1} />
      <KPICard title="Resolved" value="1" icon={CheckCircle} color="green" subtitle="This week" delay={0.15} />
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
                <th className="text-center py-3 px-4">Severity</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-center py-3 px-4">GPS Dist.</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ZONE_VIOLATIONS.map((v) => (
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
                  <td className="py-3 px-4 text-center">
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
                  <td className="py-3 px-4 text-gray-400 text-xs max-w-[200px] truncate">
                    {v.description}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {v.gps_distance_m ? (
                      <span
                        className={`text-xs font-semibold ${
                          v.gps_distance_m > 100
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {v.gps_distance_m}m
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      className={
                        v.status === "open"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : v.status === "confirmed"
                          ? "bg-blue-500/20 text-blue-400"
                          : v.status === "escalated"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }
                    >
                      {v.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {v.status === "open" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-blue-400 hover:bg-blue-500/10"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-400 hover:bg-red-500/10"
                          >
                            Escalate
                          </Button>
                        </>
                      )}
                      {v.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Escalate
                        </Button>
                      )}
                      {(v.status === "escalated" ||
                        v.status === "resolved") && (
                        <span className="text-xs text-gray-500">—</span>
                      )}
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
const ComplaintHandlingTab = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-orange-400" />
          Complaint Handling
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          View and manage complaints from your zone
        </p>
      </div>
    </div>

    {/* Complaint Summary */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <KPICard title="Total" value="5" icon={Megaphone} color="blue" subtitle="Zone complaints" delay={0} />
      <KPICard title="Pending" value="1" icon={Clock} color="amber" subtitle="Needs action" delay={0.05} />
      <KPICard title="In Progress" value="2" icon={Activity} color="cyan" subtitle="Being resolved" delay={0.1} />
      <KPICard title="Avg Resolution" value="3.5h" icon={Zap} color="green" subtitle="Time to close" delay={0.15} />
    </div>

    <Card className="bg-slate-900/80 border-slate-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 bg-slate-800/50">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Citizen</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Resolution</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ZONE_COMPLAINTS.map((c) => (
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
                    {c.resolution_time_hrs
                      ? `${c.resolution_time_hrs}h`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {c.created_at}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {c.status !== "resolved" && c.status !== "escalated" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-blue-400 hover:bg-blue-500/10"
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-green-400 hover:bg-green-500/10"
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                      {(c.status === "resolved" ||
                        c.status === "escalated") && (
                        <span className="text-xs text-gray-500">—</span>
                      )}
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const SupervisorDashboard = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  const [isSupervisor, setIsSupervisor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SupervisorTab>("overview");

  const isDemoMode = localStorage.getItem("isDemoMode") === "true";
  const demoUser = isDemoMode
    ? JSON.parse(localStorage.getItem("demoUser") || "null")
    : null;

  useEffect(() => {
    if (isDemoMode && demoUser?.role === "SUPERVISOR") {
      setIsSupervisor(true);
      setLoading(false);
      return;
    }
    if (!authLoading && user) {
      checkSupervisorAccess(user.id).then((hasAccess) => {
        if (!hasAccess) {
          navigate("/dashboard");
          return;
        }
        setIsSupervisor(true);
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
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto" />
            <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            Loading Supervisor Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isSupervisor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Card className="max-w-md bg-slate-900 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              You don't have supervisor privileges.
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
    { key: "qr_verify", label: "QR Scan & Verify", icon: QrCode },
    { key: "analytics", label: "Zone Analytics", icon: PieChartIcon },
    { key: "map", label: "Map View", icon: MapPin },
    { key: "violations", label: "Violations", icon: AlertTriangle },
    { key: "complaints", label: "Complaints", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* HEADER */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Supervisor Control Panel
                </h1>
                <p className="text-sm text-gray-400">
                  {MY_ZONE.name} &bull; Zone-Level Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Online
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">
                <Shield className="w-3 h-3 mr-1" />
                Supervisor
              </Badge>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as SupervisorTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30"
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
          {activeTab === "overview" && (
            <SupervisorOverview key="overview" />
          )}
          {activeTab === "qr_verify" && <QRVerifyTab key="qr_verify" />}
          {activeTab === "analytics" && (
            <ZoneAnalyticsTab key="analytics" />
          )}
          {activeTab === "map" && <MapViewTab key="map" />}
          {activeTab === "violations" && (
            <ViolationHandlingTab key="violations" />
          )}
          {activeTab === "complaints" && (
            <ComplaintHandlingTab key="complaints" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
