import { useMemo } from "react";
import { useAuth } from "./auth-context";
import { user } from "./rfin-data";

/**
 * The mock `user` record, overlaid with whatever the real account supplied during
 * registration and onboarding. Without this the app would greet a freshly
 * registered person by the demo name.
 */
export function useDisplayUser() {
  const { profile } = useAuth();
  return useMemo(() => {
    const name = profile.name.trim() || user.name;
    return {
      ...user,
      name,
      firstName: name.split(" ")[0],
      city: profile.city.trim() || user.city,
      roles: profile.roles.length ? profile.roles : user.roles,
    };
  }, [profile.name, profile.city, profile.roles]);
}
