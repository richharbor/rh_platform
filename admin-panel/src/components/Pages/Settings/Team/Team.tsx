"use client";

import { useEffect, useState } from "react";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/helpers/NotificationContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  getAllUsers,
  updateUsers,
  deleteUser,
  IUpdateUser,
  IInviteUser,
  inviteUser,
} from "@/services/auth/authService";
import { roleService, Role } from "@/services/admin/roleService";
import AddUserDialog from "./AddUserDialog/AddUserDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HoverLoading } from "@/components/Common/Loading/HoverLoading";

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name?: string;
  status: "invited" | "active" | "disabled" | string;
  createdAt: string;
  updatedAt: string;
}

export default function Team() {
  const { showNotification } = useNotification();

  const [users, setUsers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const roleName = (roleId: number) =>
    roles.find((r) => r.id === roleId)?.name ?? "Unknown";

  const handleAddUser = async (newUser: IInviteUser) => {
    setIsLoading(true);
    try {
      const response = await inviteUser(newUser);
      if (response) {
        showNotification("success", "Invite Sent", "Invitation email sent successfully!");
        await getAllUsersFn();
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Invite Failed", "Failed to invite user.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (id: number, updatedUser: IUpdateUser) => {
    try {
      const response = await updateUsers(id, updatedUser);
      if (response) {
        await getAllUsersFn();
        showNotification("success", "User Updated", "User updated successfully!");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Update Failed", "Failed to update user.");
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUserId === null) return;

    try {
      await deleteUser(selectedUserId);
      setUsers((prev) => prev.filter((user) => user.id !== selectedUserId));
      showNotification("success", "User Removed", "User removed successfully!");
    } catch (error) {
      console.error(error);
      showNotification("error", "Delete Failed", "Failed to remove user.");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id);
    setDeleteDialogOpen(true);
  };

  const getAllUsersFn = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response?.admins ?? response?.users ?? []);
    } catch (error) {
      console.error(error);
      showNotification("error", "Fetch Failed", "Failed to fetch team members.");
    }
  };

  const getRolesFn = async () => {
    try {
      const response = await roleService.getRoles();
      setRoles(response ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([getAllUsersFn(), getRolesFn()]);
      setIsLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="px-5 h-16 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger size={"lg"} />
          <p className="text-lg font-semibold">Team</p>
        </div>

        <Button
          onClick={() => {
            setEditingUser(null);
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {isLoading ? (
        <HoverLoading title="Loading team..." />
      ) : (
        <div className="p-5 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role_name ?? roleName(user.role_id)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "active" ? "default" : "secondary"}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingUser(user);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove the
                  team member.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AddUserDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            editMode={!!editingUser}
            initialData={editingUser}
            roles={roles}
          />
        </div>
      )}
    </div>
  );
}
