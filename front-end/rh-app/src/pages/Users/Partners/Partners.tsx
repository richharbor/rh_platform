"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Eye,
  Check,
  X,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";
import PartnerDetails from "./PartnerDetails/PartnerDetails";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  createNewRoleForPartner,
  getPartnerApplications,
  invitePartnerUsingEmail,
  getPartnerRoles,
  fetchAllFranshisesForAdmin,
  updateApplicationStatus,
  deletePartnerRole,
} from "@/services/Role/partnerServices";
import useAuthStore from "@/helpers/authStore";
import { permission } from "process";
import Loading from "@/app/loading";
import { ScrollArea } from "@/components/ui/scroll-area";

type PartnerRow = {
  id: number;
  userId: number;
  name: string;
  email: string;
  state: string;
  role: string;
  registrationStep: number;
  status: string;
  createdAt: string;
  application: any; // Full application data for drawer
};

interface Role {
  id: number;
  name: string;
  permissions: string[];
  description: string;
  franchiseId: number;
}

const availableAccess = [
  {
    id: "dashboard", //view_dashboard
    label: "Access Dashboard",
    description: "View and interact with the main dashboard and its metrics",
  },
  {
    id: "buying", //place_orders
    label: "Buying",
    description: "Create and place customer orders",
  },
  {
    id: "selling", //manage_orders
    label: "Selling",
    description: "Manage and track all customer orders",
  },
  {
    id: "best_deals", //view_products
    label: "Best Deals",
    description: "View product listings, deals, and promotions",
  },
  // {
  //   id: "manage_products", //manage_products
  //   label: "Products",
  //   description: "Add, edit, and manage product inventory",
  // },
  // {
  //   id: "manage_users", //manage_users
  //   label: "Users",
  //   description: "Manage leads, contacts, and team members",
  // },
  // {
  //   id: "view_reports", //view_reports
  //   label: "Reports",
  //   description: "Generate and view business and performance reports",
  // },
  {
    id: "manage_my_bookings",
    label: "My Bookings",
    description: "View and manage your personal bookings",
  },
  {
    id: "manage_my_bids",
    label: "My Bids",
    description: "View and manage your personal bids",
  },
];

export default function Partners() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [removingRole, setRemovingRole] = useState(-1);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedAccess, setSelectedAccess] = useState<string[]>([]);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [customRoles, setCustomRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const franchiseId = useAuthStore((state) => state.user?.franchiseId);
  const isSuperAdmin = useAuthStore((state) => state.user?.isSuperAdmin);
  const tier = useAuthStore((state) => state.user?.tier);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [tableState, setTableState] = useState("all");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSuperAdmin || tier === 2) {
      fetchAllFranchises();
    } else if (tier === 3 && franchiseId) {
      setSelectedFranchiseId(franchiseId);
      fetchAllRoles(franchiseId);
      fetchPartners(franchiseId);
    }
  }, [isSuperAdmin, tier, franchiseId]);

  const invitePartner = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsInviting(true);

      await invitePartnerUsingEmail(
        inviteEmail,
        selectedRoles,
        selectedFranchiseId!
      );

      console.log(inviteEmail);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setIsInviteDialogOpen(false);
      // fetchPartners(); // refresh table
    } catch (error) {
      console.error("Error inviting partner:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const fetchAllFranchises = async () => {
    try {
      const response = await fetchAllFranshisesForAdmin();
      if (response?.success) {
        setFranchises(response.franchises || []);
        const firstId = response.franchises[0]?.id || null;
        setSelectedFranchiseId(firstId);

        if (firstId) {
          await fetchAllRoles(firstId);
          await fetchPartners(firstId);
        }
      }
    } catch (err) {
      console.error("Error fetching franchises:", err);
    }
  };

  const fetchAllRoles = async (fid?: number) => {
    try {
      const response = await getPartnerRoles(fid || selectedFranchiseId!);
      if (response?.success) {
        setCustomRoles(response.roles || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchPartners = async (fid?: number) => {
    try {
      const data = await getPartnerApplications({
        status: statusFilter,
        page: 1,
        limit: 20,
        franchiseId: fid || selectedFranchiseId!,
      });

      const formatted: PartnerRow[] = data.applications.map((app: any) => ({
        id: app.user.id,
        userId: app.userId,
        name:
          // app.formData?.step2?.name ||
          app.formData?.step1?.fullName ||
          `${app.user?.firstName || ""} ${app.user?.lastName || ""}`.trim(),
        email: app.user?.email,
        state: app.formData?.step2?.state || "N/A",
        role: app.requestedRole.name,
        registrationStep: app.currentStep || 0,
        status: app.status,
        createdAt: app.createdAt,
        application: app,
      }));

      setPartners(formatted);
    } catch (err) {
      console.error("Error fetching partners", err);
      toast.error("Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      draft: "outline",
    } as const;
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStepBadge = (step: number) => (
    <Badge variant={step === 6 ? "default" : "outline"}>Step {step}/6</Badge>
  );

  const approvePartner = async (applicationId: number) => {
    try {
      setLoading(true);
      await updateApplicationStatus(applicationId, "approved");
      toast.success("Partner approved!");
      await fetchPartners();
    } catch (error) {
      toast.error("Failed to approve partner");
    } finally {
      setLoading(false);
    }
  };

  const rejectPartner = async (applicationId: number) => {
    try {
      setLoading(true);
      await updateApplicationStatus(
        applicationId,
        "rejected",
        "Rejected by admin"
      );
      toast.success("Partner rejected!");
      await fetchPartners();
    } catch (error) {
      toast.error("Failed to reject partner");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (partner: PartnerRow) => {
    setSelectedApplication(partner.application);
    setIsDrawerOpen(true);
  };

  const totalPartners = partners.length;
  const approvedPartners = partners.filter(
    (p) => p.status === "approved"
  ).length;
  const pendingPartners = partners.filter((p) => p.status === "pending").length;

  const handleAccessChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccess([...selectedAccess, permissionId]);
    } else {
      setSelectedAccess(selectedAccess.filter((id) => id !== permissionId));
    }
  };

  const handleCreateRole = async () => {
    // console.log("Before:", customRoles);
    setSaveLoading(true);

    if (newRoleName && selectedAccess.length > 0 && selectedFranchiseId) {
      const value = {
        name: newRoleName.toLowerCase().replace(/\s+/g, "-"),
        permissions: selectedAccess,
        description: newRoleDescription || "",
        franchiseId: selectedFranchiseId,
      };

      console.log(value);

      // setCustomRoles((prev) => [...prev, value]);

      try {
        await createNewRoleForPartner(value);

        await fetchAllRoles();

        console.log("New Role Added:", value);
        toast.success(`Role "${newRoleName}" created successfully`);
      } catch (error) {
        toast.error("Error in creating role");
        console.error("Error creating role:", error);
      }

      setSaveLoading(false);

      // Reset UI
      setNewRoleName("");
      setNewRoleDescription("");
      setSelectedAccess([]);
      setCreateRoleModalOpen(false);
    } else {
      setNewRoleName("");
      setNewRoleDescription("");
      setSelectedAccess([]);
      setCreateRoleModalOpen(false);
      toast.error(
        "Please provide a role name and select at least one permission."
      );
    }
  };

  const handleRoleDelete = async (roleId: number) => {
    try {
      if (!roleId) {
        toast.error("Invalid role ID");
        return;
      }

      // const confirmDelete = window.confirm(
      //   "Are you sure you want to delete this partner role?"
      // );
      // if (!confirmDelete) return;
      setRemovingRole(roleId);

      const response = await deletePartnerRole(roleId);

      if (response?.success) {
        toast.success(response.message || "Partner role deleted successfully");

        // Refresh your roles list (if you have a fetch function)
        await fetchAllRoles();

        // Optional: if you want to refresh related users or roles data
        // await getAllUsers?.();
      } else {
        toast.error(response?.error || "Failed to delete partner role");
      }
    } catch (err: any) {
      console.error("Failed to delete partner role:", err);
      toast.error(
        err?.response?.data?.error ||
        "An error occurred while deleting the partner role"
      );
    } finally {
      setRemovingRole(-1);
    }
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
        <Loading areaOnly />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative gap-6">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-6  p-6 max-md:p-3">
            <div className="flex items-center max-md:flex-col gap-3 max-md:items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Partner Management
                </h2>
                <p className="text-muted-foreground">
                  Manage partner registrations and approvals
                </p>
              </div>
              <div className="flex items-center max-md:flex-col max-md:items-start gap-2">
                {(isSuperAdmin || tier === 2) && (
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Select Franchise:</Label>
                    <Select
                      value={selectedFranchiseId?.toString() || ""}
                      onValueChange={(val) => {
                        const fid = parseInt(val);
                        setSelectedFranchiseId(fid);
                        fetchAllRoles(fid);
                        fetchPartners(fid);
                      }}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Franchise" />
                      </SelectTrigger>
                      <SelectContent>
                        {franchises.map((f) => (
                          <SelectItem key={f.id} value={f.id.toString()}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setRolesModalOpen(true)}
                    className="flex items-center gap-2">
                    Roles
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Partner
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              <Card onClick={() => setTableState("all")} className={`bg-transparent ${tableState === "all" ? "bg-card" : " cursor-pointer"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 max-md:p-2">
                  <CardTitle className="text-sm font-medium">
                    Total Partners
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="max-md:p-2 max-md:pt-0">
                  <div className="text-2xl font-bold">{totalPartners}</div>
                  <p className="text-xs text-muted-foreground">Registered partners</p>
                </CardContent>
              </Card>

              <Card onClick={() => setTableState("approved")} className={`bg-transparent ${tableState === "approved" ? "bg-card" : " cursor-pointer"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 max-md:p-2">
                  <CardTitle className="text-sm font-medium">
                    Approved Partners
                  </CardTitle>
                  <Check className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="max-md:p-2 max-md:pt-0">
                  <div className="text-2xl font-bold text-green-600">
                    {approvedPartners}
                  </div>
                  <p className="text-xs text-muted-foreground">Active partners</p>
                </CardContent>
              </Card>

              <Card onClick={() => setTableState("pending")} className={`bg-transparent ${tableState === "pending" ? "bg-card" : " cursor-pointer"}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 max-md:p-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Approvals
                  </CardTitle>
                  <X className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent className="max-md:p-2 max-md:pt-0">
                  <div className="text-2xl font-bold text-orange-600">
                    {pendingPartners}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requesting Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredPartners.filter((partner) => {
                    if (tableState === "all") {
                      return true;
                    }
                    return partner.status === tableState;
                  }).length > 0 ? (
                    filteredPartners.filter((partner) => {
                      if (tableState === "all") {
                        return true;
                      }
                      return partner.status === tableState;
                    }).map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{partner.state}</TableCell>
                        <TableCell>
                          {getStepBadge(partner.registrationStep)}
                        </TableCell>
                        <TableCell>{getStatusBadge(partner.status)}</TableCell>
                        <TableCell className="capitalize">{partner.role}</TableCell>
                        <TableCell>
                          {new Date(partner.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(partner)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {partner.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => approvePartner(partner.userId)}
                                  className="text-green-600 hover:text-green-700">
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => rejectPartner(partner.userId)}
                                  className="text-red-600 hover:text-red-700">
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No partners found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
      </div>


      {/* Partner Details Drawer */}
      <PartnerDetails
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        application={selectedApplication}
      />
      {/* Invite Partner Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Partner</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter the partner's email address. An invitation link will be sent
              to them.
            </p>
          </DialogHeader>
          <div className=" grid gap-4 space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Partner Email</Label>
              <Input
                id="email"
                placeholder="partner@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roles">Roles</Label>
              <div className="relative w-full" ref={dropdownRef}>
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="flex w-full items-center justify-between border rounded-md px-3 py-2 text-sm bg-background hover:bg-muted transition-colors">
                  {selectedRoles.length > 0
                    ? customRoles
                      .filter((role) => selectedRoles.includes(role.id))
                      .map((role) => role.name)
                      .join(", ")
                    : "Select roles"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </button>

                {/* Dropdown Content */}
                {open && (
                  <div className="absolute left-0 top-full mt-2 w-full rounded-md border bg-background shadow-lg z-10 p-2 space-y-1">
                    {customRoles.length > 0 ? (
                      customRoles.map((role) => (
                        <div
                          key={role.id}
                          onClick={() => handleToggleRole(role.id)}
                          className={cn(
                            "flex items-center p-2 rounded-md cursor-pointer hover:bg-muted",
                            selectedRoles.includes(role.id) && "bg-muted"
                          )}>
                          <div className="mr-2">
                            {selectedRoles.includes(role.id) ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <div className="h-4 w-4 border rounded-sm" />
                            )}
                          </div>
                          <span>{role.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center p-2 rounded-md text-sm text-muted-foreground">
                        No roles available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={isInviting}>
              Cancel
            </Button>
            <Button onClick={invitePartner} disabled={isInviting}>
              {isInviting ? "Inviting..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={createRoleModalOpen} onOpenChange={setCreateRoleModalOpen}>
        <DialogContent className="sm:max-w-5xl max-w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Create a custom role with specific permissions for your team
              members.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Role name */}
            <div className="grid gap-2">
              <Label htmlFor="roleName">Role name</Label>
              <Input
                id="roleName"
                placeholder="Enter role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roleName">Role Description</Label>
              <Input
                id="roleDescription"
                placeholder="Enter role Description"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
              />
            </div>
            {/* Access section */}
            <div className="grid gap-3">
              <Label>Access</Label>

              {/* ✅ Added grid layout (2x2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableAccess.map((access) => (
                  <div key={access.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={access.id}
                      checked={selectedAccess.includes(access.id)}
                      onCheckedChange={(checked) =>
                        handleAccessChange(access.id, checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={access.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {access.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {access.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateRoleModalOpen(false)}
              disabled={saveLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={
                !newRoleName || selectedAccess.length === 0 || saveLoading
              }>
              {saveLoading ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roles Modal */}

      <Dialog open={rolesModalOpen} onOpenChange={setRolesModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Roles</DialogTitle>
            <DialogDescription>
              Manage roles and permissions for your team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {customRoles.map((role) => {
              return (
                <div
                  key={role.name}
                  className="flex justify-between items-center p-2 rounded-md border hover:bg-muted">
                  <span>{role.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    disabled={removingRole === role.id}
                    onClick={() => handleRoleDelete(role.id)}>
                    {removingRole === role.id ? 'Removing...' : 'Remove'}
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setRolesModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // setRolesModalOpen(false);
                setCreateRoleModalOpen(true); // open Create Role modal
              }}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
