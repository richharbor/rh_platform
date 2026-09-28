"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotification } from "@/helpers/NotificationContext";
import {
  roleService,
  Role,
  PermissionsMap,
  PERMISSION_MODULES,
} from "@/services/admin/roleService";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Role | null;
  onSaved: () => void;
}

const emptyPermissions = (): PermissionsMap =>
  Object.fromEntries(
    PERMISSION_MODULES.map((m) => [
      m.module,
      Object.fromEntries(m.actions.map((a) => [a.key, false])),
    ]),
  );

export default function RoleFormDialog({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: RoleFormDialogProps) {
  const { showNotification } = useNotification();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<PermissionsMap>(
    emptyPermissions(),
  );
  const [saving, setSaving] = useState(false);

  const editMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? "");
      setPermissions({ ...emptyPermissions(), ...initialData.permissions });
    } else {
      setName("");
      setDescription("");
      setPermissions(emptyPermissions());
    }
  }, [initialData, open]);

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module]?.[action],
      },
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showNotification("error", "Name required", "Please enter a role name.");
      return;
    }

    setSaving(true);
    try {
      if (editMode && initialData) {
        await roleService.updateRole(initialData.id, {
          name,
          description,
          permissions,
        });
        showNotification("success", "Role Updated", "Role updated successfully!");
      } else {
        await roleService.createRole({ name, description, permissions });
        showNotification("success", "Role Created", "Role created successfully!");
      }
      onSaved();
    } catch (error) {
      console.error(error);
      showNotification("error", "Save Failed", "Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-[600px] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Role" : "New Role"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Editor"
              disabled={initialData?.is_system}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What can this role do?"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label>Permissions</Label>
            {PERMISSION_MODULES.map((mod) => (
              <div key={mod.module} className="rounded-lg border p-3">
                <p className="text-sm font-semibold mb-2">{mod.label}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mod.actions.map((action) => (
                    <label
                      key={action.key}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={!!permissions[mod.module]?.[action.key]}
                        onCheckedChange={() =>
                          togglePermission(mod.module, action.key)
                        }
                        disabled={initialData?.is_system}
                      />
                      {action.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || initialData?.is_system}>
            {saving ? "Saving..." : editMode ? "Update Role" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
