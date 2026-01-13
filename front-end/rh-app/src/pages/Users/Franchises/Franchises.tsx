"use client";
import { useEffect, useState } from "react";
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
import { Search, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getFranchiseMembers,
  inviteFranchisesAdmin,
} from "@/services/Role/franchisesServices";
import Loading from "@/app/loading";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Franchises() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    franchiseName: "",
    firstName: "",
    lastName: "",
    inviteEmail: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getFranchiseMembers();
      console.log(data); // Check API response
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
        toast.error("No users found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load franchise users");
    } finally {
      setLoading(false);
    }
  };

  // const filtered = users.filter(
  //   (u: any) =>
  //     u.name.toLowerCase().includes(search.toLowerCase()) ||
  //     u.email.toLowerCase().includes(search.toLowerCase())
  // );

  const inviteFranchises = async () => {
    try {
      setSaveLoading(true);
      console.log("Form Data:", formData);
      await inviteFranchisesAdmin(formData);
      await fetchMembers();
      setIsInviteDialogOpen(false);
      toast.success("Invitation sent successfully");
    } catch (error: any) {
      console.error("Failed to invite team member:", error);

      // Axios puts the server message in error.response.data
      const serverMessage =
        error?.response?.data?.error || // backend explicit error field
        error?.response?.data?.message || // sometimes backend sends 'message'
        error?.message || // generic network/axios message
        "Failed to send invitation."; // fallback message

      toast.error(serverMessage);
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
            <div className="flex items-center max-md:flex-col max-md:items-start gap-5 justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Franchise Members
                </h2>
                <p className="text-muted-foreground">
                  Manage your franchise team and onboarding users
                </p>
              </div>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Invite User
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-md border max-md:flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Franchise Admin</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead>Subdomain</TableHead> */}

                    {/* <TableHead>Phone Number</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : users.length ? (
                    users.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.franchise?.name}</TableCell>
                        <TableCell>
                          {`${u.firstName || ""} ${u.lastName || ""}`}
                        </TableCell>
                        <TableCell>{u.creator?.email || u.email}</TableCell>
                        <TableCell>{`${u.franchise?.creator?.firstName || ""} ${u.franchise?.creator?.lastName || ""
                          }`}</TableCell>
                        <TableCell>{u.tier || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.emailVerified ? "default" : "destructive"}>
                            {u.emailVerified ? "Accepted" : "Pending"}
                          </Badge>
                        </TableCell>
                        {/* <TableCell>{u.subdomain || "N/A"}</TableCell> */}
                        {/* <TableCell>{u.phoneNumber || "N/A"}</TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>


          </div>
        </ScrollArea>
      </div>




      {/* Invite Franchises Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Franchise Admin</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter the partner's email address. An invitation link will be sent
              to them.
            </p>
          </DialogHeader>
          <div className=" grid gap-4 space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="text">Franchise Name</Label>
              <Input
                id="text"
                placeholder="Enter Franchise Name"
                value={formData.franchiseName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    franchiseName: e.target.value,
                  }))
                }
              // disabled={isInviting}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="text">First Name</Label>
              <Input
                id="text"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              // disabled={isInviting}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="text">last Name</Label>
              <Input
                id="text"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              // disabled={isInviting}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="franchisesadmin@example.com"
                value={formData.inviteEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inviteEmail: e.target.value,
                  }))
                }
              // disabled={isInviting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={inviteFranchises}
              disabled={saveLoading}
            >
              {saveLoading ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
