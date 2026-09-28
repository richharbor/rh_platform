import { PrivateAxios } from "@/helpers/PrivateAxios";

export type PermissionsMap = Record<string, Record<string, boolean>>;

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: PermissionsMap;
  is_system: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRolePayload {
  name: string;
  description?: string;
  permissions: PermissionsMap;
}

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const res = await PrivateAxios.get("/admin/roles/all");
    return res.data?.roles ?? res.data;
  },

  async createRole(payload: IRolePayload): Promise<Role> {
    const res = await PrivateAxios.post("/admin/roles", payload);
    return res.data?.role ?? res.data;
  },

  async updateRole(id: number, payload: Partial<IRolePayload>): Promise<Role> {
    const res = await PrivateAxios.patch(`/admin/roles/${id}`, payload);
    return res.data?.role ?? res.data;
  },

  async deleteRole(id: number): Promise<void> {
    const res = await PrivateAxios.delete(`/admin/roles/${id}`);
    return res.data;
  },
};

// The full set of modules/actions the RBAC UI lets an admin toggle when
// building a role. Mirrors the shape rhserver's `admin.roles.permissions`
// JSONB column stores (see rhserver plan's RBAC Design section).
export const PERMISSION_MODULES: {
  module: string;
  label: string;
  actions: { key: string; label: string }[];
}[] = [
  {
    module: "blogs",
    label: "Blogs",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit" },
      { key: "delete", label: "Delete" },
      { key: "publish", label: "Publish" },
    ],
  },
  {
    module: "leads",
    label: "Leads",
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Edit" },
      { key: "assign", label: "Assign" },
      { key: "delete", label: "Delete" },
      { key: "export", label: "Export" },
    ],
  },
  {
    module: "marketing",
    label: "Marketing",
    actions: [
      { key: "view", label: "View" },
      { key: "manage_campaigns", label: "Manage Campaigns" },
      { key: "send_campaigns", label: "Send Campaigns" },
      { key: "manage_contacts", label: "Manage Contacts" },
      { key: "manage_unsubscribes", label: "Manage Unsubscribes" },
    ],
  },
  {
    module: "admin_management",
    label: "Team & Roles",
    actions: [
      { key: "view", label: "View" },
      { key: "invite", label: "Invite" },
      { key: "manage_roles", label: "Manage Roles" },
      { key: "remove", label: "Remove" },
    ],
  },
];
