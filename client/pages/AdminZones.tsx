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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useAuth as useSupabaseAuth } from "@/lib/supabase";
import {
  getAllZones,
  getAllSupervisors,
  createZone,
  updateZone,
  assignSupervisorToZone,
  checkAdminAccess,
} from "@/lib/admin-operations";
import { useNavigate } from "react-router-dom";

interface Zone {
  id: string;
  name: string;
  code: string;
  ward_number: string;
  city: string;
  area_sqkm: number;
  population: number;
  supervisor_id: string;
  status: string;
  created_at: string;
}

interface Supervisor {
  id: string;
  user_id: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
}

const AdminZonesPage = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  const [zones, setZones] = useState<Zone[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    ward_number: "",
    city: "",
    area_sqkm: "",
    population: "",
  });

  const [assignData, setAssignData] = useState({
    supervisor_id: "",
  });

  // Check admin access
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
      const [zonesData, supervisorsData] = await Promise.all([
        getAllZones(),
        getAllSupervisors(),
      ]);
      setZones(zonesData);
      setSupervisors(supervisorsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await createZone({
        name: formData.name,
        code: formData.code,
        ward_number: formData.ward_number,
        city: formData.city,
        area_sqkm: parseFloat(formData.area_sqkm),
        population: parseInt(formData.population),
        supervisor_id: "",
      });

      setSuccess("Zone created successfully!");
      setFormData({
        name: "",
        code: "",
        ward_number: "",
        city: "",
        area_sqkm: "",
        population: "",
      });
      setShowCreateDialog(false);
      await loadData();
    } catch (err) {
      console.error("Error creating zone:", err);
      setError("Failed to create zone");
    }
  };

  const handleAssignSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) return;

    try {
      setError(null);
      await assignSupervisorToZone(
        selectedZone.id,
        assignData.supervisor_id
      );

      setSuccess("Supervisor assigned successfully!");
      setShowAssignDialog(false);
      setAssignData({ supervisor_id: "" });
      setSelectedZone(null);
      await loadData();
    } catch (err) {
      console.error("Error assigning supervisor:", err);
      setError("Failed to assign supervisor");
    }
  };

  const handleEditZone = (zone: Zone) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      code: zone.code,
      ward_number: zone.ward_number,
      city: zone.city,
      area_sqkm: zone.area_sqkm.toString(),
      population: zone.population.toString(),
    });
    setShowCreateDialog(true);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading zones...</p>
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
            Zone Management
          </h1>
          <p className="text-gray-600">Create and manage collection zones</p>
        </div>
        <Button
          onClick={() => {
            setSelectedZone(null);
            setFormData({
              name: "",
              code: "",
              ward_number: "",
              city: "",
              area_sqkm: "",
              population: "",
            });
            setShowCreateDialog(true);
          }}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Create Zone
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Zones Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{zones.length}</div>
            <p className="text-xs text-green-600 mt-2">Active zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Assigned Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {zones.filter((z) => z.supervisor_id).length}
            </div>
            <p className="text-xs text-green-600 mt-2">
              {zones.length - zones.filter((z) => z.supervisor_id).length} unassigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Population
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {zones.reduce((sum, z) => sum + z.population, 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-2">Covered by zones</p>
          </CardContent>
        </Card>
      </div>

      {/* Zones Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Zones</CardTitle>
            <CardDescription>Manage collection zones and supervisors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Area (sq km)</TableHead>
                    <TableHead>Population</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-gray-500">No zones found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    zones.map((zone) => {
                      const supervisor = supervisors.find(
                        (s) => s.user_id === zone.supervisor_id
                      );
                      return (
                        <TableRow key={zone.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              {zone.name}
                            </div>
                          </TableCell>
                          <TableCell>{zone.code}</TableCell>
                          <TableCell>{zone.ward_number}</TableCell>
                          <TableCell>{zone.city}</TableCell>
                          <TableCell>{zone.area_sqkm.toFixed(2)}</TableCell>
                          <TableCell>{zone.population.toLocaleString()}</TableCell>
                          <TableCell>
                            {supervisor ? (
                              <div>
                                <p className="font-medium text-sm">
                                  {supervisor.user_profiles.full_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {supervisor.user_profiles.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                zone.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {zone.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedZone(zone);
                                  setAssignData({ supervisor_id: "" });
                                  setShowAssignDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditZone(zone)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Zone Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedZone ? "Edit Zone" : "Create New Zone"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to {selectedZone ? "update" : "create"} a zone
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateZone} className="space-y-4">
            <div>
              <Label htmlFor="name">Zone Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Zone Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ward_number">Ward Number</Label>
                <Input
                  id="ward_number"
                  value={formData.ward_number}
                  onChange={(e) =>
                    setFormData({ ...formData, ward_number: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area_sqkm">Area (sq km)</Label>
                <Input
                  id="area_sqkm"
                  type="number"
                  step="0.01"
                  value={formData.area_sqkm}
                  onChange={(e) =>
                    setFormData({ ...formData, area_sqkm: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="population">Population</Label>
                <Input
                  id="population"
                  type="number"
                  value={formData.population}
                  onChange={(e) =>
                    setFormData({ ...formData, population: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {selectedZone ? "Update" : "Create"} Zone
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Supervisor Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Supervisor</DialogTitle>
            <DialogDescription>
              Select a supervisor for {selectedZone?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignSupervisor} className="space-y-4">
            <div>
              <Label htmlFor="supervisor_id">Supervisor</Label>
              <Select
                value={assignData.supervisor_id}
                onValueChange={(value) =>
                  setAssignData({ ...assignData, supervisor_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.user_id} value={supervisor.user_id}>
                      {supervisor.user_profiles.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Assign
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssignDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminZonesPage;
