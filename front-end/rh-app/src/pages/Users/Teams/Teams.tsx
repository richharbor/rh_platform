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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  User,
  Shield,
  Trash2,
  Settings,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { id } from "zod/v4/locales";
import {
  createNewRoleForTeams,
  deleteTeamRole,
  getAllTeamMembers,
  getTeamRoles,
  inviteTeamMember,
} from "@/services/Role/teamService";
import Loading from "@/app/loading";
import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   getAllTeamMembers,
//   inviteTeamMember,
//   updateUserRole,
//   deactivateUser,
// } from "@/services/Role/teamServices";

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
  //   id: "manage_products",
  //   label: "Products",
  //   description: "Add, edit, and manage product inventory",
  // },
  // {
  //   id: "manage_users",
  //   label: "Users",
  //   description: "Manage leads, contacts, and team members",
  // },
  // {
  //   id: "view_reports",
  //   label: "Reports",
  //   description: "Generate and view business and performance reports",
  // },
  {
    id: "manage_franchise",
    label: "Franchises",
    description: "Add, remove, and manage franchise members",
  },
  {
    id: "manage_partners",
    label: "Partners",
    description: "Add, remove, and manage partner accounts",
  },
  {
    id: "manage_bookings",
    label: "Bookings",
    description: "See, all bookings and execute deals",
  },
  {
    id: "manage_bids",
    label: "Bids",
    description: "See, all bids and execute deals",
  },
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

export default function Teams() {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedAccess, setSelectedAccess] = useState<string[]>([]);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);

  const [removingRole, setRemovingRole] = useState(-1);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [customRoles, setCustomRoles] = useState<any[]>([]);

  //invite team
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchTeamsMembers();
    fetchAllRoles();
  }, []);

  const fetchAllRoles = async () => {
    try {
      const response = await getTeamRoles();
      if (response?.success) {
        setCustomRoles(response.roles || []);
      } else {
        console.error("Failed to load roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchTeamsMembers = async () => {
    try {
      const data = await getAllTeamMembers();
      console.log(data);

      if (data.success && data.users) {
        setTeams(data.users);
      } else {
        setTeams([]);
      }
    } catch (err) {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      //   await deactivateUser(id);
      toast.success("User deactivated");
      fetchTeamsMembers();
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  // const filteredTeams = teams.filter(
  //   (u: any) =>
  //     u.name.toLowerCase().includes(search.toLowerCase()) ||
  //     u.email.toLowerCase().includes(search.toLowerCase())
  // );
  const filteredTeams = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "Manager",
      franchiseName: "Franchise A",
      isActive: true,
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.smith@example.com",
      role: "Agent",
      franchiseName: "Franchise B",
      isActive: false,
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      role: "Supervisor",
      franchiseName: null, // will show "Global"
      isActive: true,
    },
    {
      id: 4,
      name: "Diana Prince",
      email: "diana.prince@example.com",
      role: "Agent",
      franchiseName: "Franchise C",
      isActive: false,
    },
    {
      id: 5,
      name: "Ethan Hunt",
      email: "ethan.hunt@example.com",
      role: "Manager",
      franchiseName: "Franchise A",
      isActive: true,
    },
  ];

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

  const handleAccessChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccess([...selectedAccess, permissionId]);
    } else {
      setSelectedAccess(selectedAccess.filter((id) => id !== permissionId));
    }
  };

  const handleCreateRole = async () => {
    if (newRoleName && selectedAccess.length > 0) {
      const requestBody = {
        name: newRoleName.toLowerCase().replace(/\s+/g, "-"),
        permissions: selectedAccess,
        description: newRoleDescription || "", // optional
      };

      try {
        setSaveLoading(true);

        const response = await createNewRoleForTeams(requestBody);

        // Optional: refresh roles list
        await fetchAllRoles();

        toast.success(`Role "${response.role.name}" created successfully`);

        // setCustomRoles((prev) => [
        //   ...prev,
        //   { name: response.role.name, permissions: response.role.permissions },
        // ]);
      } catch (error) {
        toast.error("Error creating role");
        console.error("Error creating role:", error);
      } finally {
        setSaveLoading(false);
        setNewRoleName("");
        setNewRoleDescription("");
        setSelectedAccess([]);
        setCreateRoleModalOpen(false);
      }
    } else {
      toast.error(
        "Please provide a role name and select at least one permission."
      );
      setNewRoleName("");
      setNewRoleDescription("");
      setSelectedAccess([]);
      setCreateRoleModalOpen(false);
    }
  };

  const handleRoleDelete = async (roleId: number) => {
    try {
      if (!roleId) {
        toast.error("Invalid role ID");
        return;
      }

      setRemovingRole(roleId);

      // Call API
      const response = await deleteTeamRole(roleId);

      if (response?.success) {
        toast.success(response.message || "Role deleted successfully");

        // Refresh roles after deletion
        await fetchAllRoles();

        // Optional: check if deleted role was current user's role
        // if (currentUserRoles.includes(roleId)) {
        //   toast.info("Your assigned role was deleted. Redirecting...");
        //   router.push("/");
        // }
      } else {
        toast.error(response?.error || "Failed to delete role");
      }
    } catch (error: any) {
      console.error("Delete role failed:", error);
      toast.error(
        error?.response?.data?.error ||
        "An error occurred while deleting the role"
      );
    } finally {
      setRemovingRole(-1);
    }
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const invitePartner = async () => {
    if (!email || !firstName || !lastName || selectedRoles.length === 0) {
      toast.error("Please fill in all fields and select at least one role");
      return;
    }

    try {
      setSaveLoading(true);

      await inviteTeamMember({
        email,
        firstName,
        lastName,
        roles: selectedRoles, // array of role IDs
      });
      await fetchTeamsMembers();
      toast.success(`Invitation sent to ${email}`);

      // Reset form
      setEmail("");
      setFirstName("");
      setLastName("");
      setSelectedRoles([]);
      setIsInviteOpen(false);
    } catch (error) {
      console.error("Error inviting partner:", error);
      toast.error("Failed to send invitation");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4.7rem)] flex flex-col relative overflow-hidden rounded-md">
        <Loading areaOnly={true} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)]  w-full overflow-hidden rounded-lg border-2 max-md:border-none flex-col relative gap-6">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-6  p-6 max-md:p-3">
            <div className="flex max-md:flex-col max-md:items-start gap-5 items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
                <p className="text-muted-foreground">
                  Manage super admin and admin users
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRolesModalOpen(true)}
                  className="flex items-center gap-2">
                  Roles
                  <Settings className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsInviteOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Invite Team Member
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            <div className="rounded-md border max-md:flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    {/* <TableHead>Phone</TableHead> */}
                    <TableHead>Role</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : teams.length ? (
                    teams.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          {t.firstName} {t.lastName}
                        </TableCell>
                        <TableCell>{t.email}</TableCell>
                        {/* <TableCell>{t.phoneNumber || "N/A"}</TableCell> */}
                        <TableCell>
                          {t.roles && t.roles.length
                            ? t.roles.map((r: any) => r.name).join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell>{t.creatorName || "N/A"}</TableCell>
                        <TableCell>{t.tier}</TableCell>
                        <TableCell>
                          <Badge
                            variant={t.emailVerified ? "default" : "destructive"}>
                            {t.emailVerified ? "Acceprted" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(t.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        No team members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

          </div>
        </ScrollArea>
      </div>


      {/* Invite Partner Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite a Team Members</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter the partner’s details. An invitation link will be sent to
              their email.
            </p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="teammember@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* ✅ Roles Selector */}
            <div className="relative grid gap-2">
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
              onClick={() => setIsInviteOpen(false)}
              disabled={saveLoading}>
              Cancel
            </Button>
            <Button onClick={invitePartner} disabled={saveLoading}>
              {saveLoading ? "Sending..." : "Send Invite"}
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
