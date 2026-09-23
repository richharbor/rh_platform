"use client";

import { useEffect, useState } from "react";
import { Edit, PlusCircle, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useNotification } from "@/helpers/NotificationContext";
import { roleService, Role } from "@/services/admin/roleService";
import RoleFormDialog from "./RoleFormDialog/RoleFormDialog";

export default function Roles() {
  const { showNotification } = useNotification();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getRoles();
      setRoles(response ?? []);
    } catch (error) {
      console.error(error);
      showNotification("error", "Fetch Failed", "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteClick = (id: number) => {
    setSelectedRoleId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRole = async () => {
    if (selectedRoleId === null) return;
    try {
      await roleService.deleteRole(selectedRoleId);
      setRoles((prev) => prev.filter((r) => r.id !== selectedRoleId));
      showNotification("success", "Role Deleted", "Role removed successfully!");
    } catch (error) {
      console.error(error);
      showNotification("error", "Delete Failed", "Failed to delete role.");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRoleId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="px-5 h-16 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger size={"lg"} />
          <p className="text-lg font-semibold">Roles</p>
        </div>

        <Button
          onClick={() => {
            setEditingRole(null);
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Role
        </Button>
      </div>

      {loading ? (
        <HoverLoading title="Loading roles..." />
      ) : (
        <div className="p-5 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {role.name}
                    {role.is_system && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        System
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingRole(role);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={role.is_system}
                        onClick={() => handleDeleteClick(role.id)}
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
                  This will permanently delete the role. Admins assigned to it
                  will need to be reassigned first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteRole}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <RoleFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            initialData={editingRole}
            onSaved={() => {
              setIsDialogOpen(false);
              fetchRoles();
            }}
          />
        </div>
      )}
    </div>
  );
}
