// Turns a role's display name (e.g. "Super Admin", "Editor") into a URL-safe
// route segment (e.g. "super-admin", "editor"). Roles are admin-defined rows
// in the backend's `roles` table (Settings > Roles), not a fixed enum, so
// route trees are keyed by this slug rather than a hardcoded list of
// role names — see src/app/[role]/**.
export function slugifyRole(name: string | null | undefined): string {
  const slug = (name ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return slug || "admin";
}
