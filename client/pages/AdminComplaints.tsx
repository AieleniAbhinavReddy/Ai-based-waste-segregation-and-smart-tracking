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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Search,
} from "lucide-react";
import { useAuth as useSupabaseAuth } from "@/lib/supabase";
import {
  getAllComplaints,
  getAllSupervisors,
  resolveComplaint,
  assignComplaint,
  checkAdminAccess,
} from "@/lib/admin-operations";
import { useNavigate } from "react-router-dom";

interface Complaint {
  id: string;
  zone_id: string;
  filed_by_id: string;
  assigned_to_id?: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  photo_url?: string;
  created_at: string;
  resolution_details?: string;
}

const AdminComplaintsPage = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("open");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [assignedSupervisor, setAssignedSupervisor] = useState("");

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
      const [complaintsData, supervisorsData] = await Promise.all([
        getAllComplaints(),
        getAllSupervisors(),
      ]);
      setComplaints(complaintsData);
      setSupervisors(supervisorsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setError(null);
      await resolveComplaint(selectedComplaint.id, resolutionText);
      setSuccess("Complaint resolved successfully!");
      setShowResolveDialog(false);
      setResolutionText("");
      setSelectedComplaint(null);
      await loadData();
    } catch (err) {
      console.error("Error resolving complaint:", err);
      setError("Failed to resolve complaint");
    }
  };

  const handleAssignComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setError(null);
      await assignComplaint(selectedComplaint.id, assignedSupervisor);
      setSuccess("Complaint assigned successfully!");
      setShowAssignDialog(false);
      setAssignedSupervisor("");
      setSelectedComplaint(null);
      await loadData();
    } catch (err) {
      console.error("Error assigning complaint:", err);
      setError("Failed to assign complaint");
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesPriority = filterPriority === "all" || c.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  const complaintStats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "open").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complaint Management
          </h1>
          <p className="text-gray-600">Track and resolve citizen complaints</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Refresh
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {complaintStats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {complaintStats.open}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {complaintStats.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {complaintStats.resolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Search complaints..."
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
            <CardDescription>
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">No complaints found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="text-sm">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {complaint.category.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {complaint.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {complaint.status !== "resolved" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedComplaint(complaint);
                                    setShowAssignDialog(true);
                                  }}
                                >
                                  Assign
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedComplaint(complaint);
                                    setShowResolveDialog(true);
                                  }}
                                >
                                  Resolve
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* Resolve Complaint Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Add resolution details for this complaint
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResolveComplaint} className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Complaint: {selectedComplaint?.description}</p>
            </div>
            <div>
              <Label htmlFor="resolution">Resolution Details</Label>
              <Textarea
                id="resolution"
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe how the complaint was resolved..."
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Mark as Resolved
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResolveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Complaint Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Complaint</DialogTitle>
            <DialogDescription>
              Assign this complaint to a supervisor
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignComplaint} className="space-y-4">
            <div>
              <Label htmlFor="supervisor">Select Supervisor</Label>
              <Select
                value={assignedSupervisor}
                onValueChange={setAssignedSupervisor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((s: any) => (
                    <SelectItem key={s.user_id} value={s.user_id}>
                      {s.user_profiles.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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

export default AdminComplaintsPage;
