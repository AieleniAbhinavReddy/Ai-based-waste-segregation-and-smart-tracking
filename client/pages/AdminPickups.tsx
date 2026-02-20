import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import { useAuth as useSupabaseAuth } from "@/lib/supabase";
import {
  getPickupLogs,
  checkAdminAccess,
  getAllZones,
} from "@/lib/admin-operations";
import { useNavigate } from "react-router-dom";

interface PickupLog {
  id: string;
  zone_id: string;
  worker_id: string;
  citizen_id: string;
  gps_latitude: number;
  gps_longitude: number;
  qr_code: string;
  qr_verified: boolean;
  status: string;
  created_at: string;
  waste_weight: number;
  photo_proof_url?: string;
}

const AdminPickupsPage = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  const [pickups, setPickups] = useState<PickupLog[]>([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterZone, setFilterZone] = useState("all");

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess(user.id).then((hasAccess) => {
        if (!hasAccess) {
          navigate("/dashboard");
          return;
        }
        setIsAdmin(true);
        loadData();
      });
    } else if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pickupsData, zonesData] = await Promise.all([
        getPickupLogs(),
        getAllZones(),
      ]);
      setPickups(pickupsData);
      setZones(zonesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load pickup data");
    } finally {
      setLoading(false);
    }
  };

  const filteredPickups = pickups.filter((p) => {
    const matchesSearch =
      p.zone_id.includes(searchQuery) ||
      p.worker_id?.includes(searchQuery) ||
      p.citizen_id?.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesZone = filterZone === "all" || p.zone_id === filterZone;
    return matchesSearch && matchesStatus && matchesZone;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pickups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Real-Time Pickup Monitoring
          </h1>
          <p className="text-gray-600">Track all waste collection pickups</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {pickups.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {pickups.filter((p) => p.status === "completed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {pickups.filter((p) => p.status === "failed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              QR Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {pickups.filter((p) => p.qr_verified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Search by zone, worker, or citizen ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterZone} onValueChange={setFilterZone}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {zones.map((zone: any) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pickups Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Pickup Logs</CardTitle>
            <CardDescription>
              Showing {filteredPickups.length} of {pickups.length} pickups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Zone ID</TableHead>
                    <TableHead>Worker ID</TableHead>
                    <TableHead>Citizen ID</TableHead>
                    <TableHead>GPS Location</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>QR Verified</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPickups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-gray-500">No pickups found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPickups.map((pickup) => (
                      <TableRow key={pickup.id}>
                        <TableCell className="text-sm">
                          {new Date(pickup.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {pickup.zone_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {pickup.worker_id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {pickup.citizen_id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {pickup.gps_latitude && pickup.gps_longitude ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              {pickup.gps_latitude.toFixed(4)},
                              {pickup.gps_longitude.toFixed(4)}
                            </div>
                          ) : (
                            <span className="text-gray-400">No GPS</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {pickup.waste_weight?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell>
                          {pickup.qr_verified ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(pickup.status)}>
                            {pickup.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminPickupsPage;
