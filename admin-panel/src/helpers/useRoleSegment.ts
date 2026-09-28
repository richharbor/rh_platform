"use client";
import { useParams } from "next/navigation";

// Reads the current `/[role]/...` URL segment. Client components under the
// [role] route tree use this instead of a hardcoded "/dashboard" prefix, so
// links stay inside whichever role-namespace the user is actually in.
export function useRoleSegment(): string {
  const params = useParams<{ role?: string | string[] }>();
  const value = params?.role;
  return (Array.isArray(value) ? value[0] : value) || "admin";
}
