import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./rfin-data";

type Ctx = { role: Role; setRole: (r: Role) => void };
const RoleContext = createContext<Ctx>({ role: "buyer", setRole: () => {} });
const KEY = "rfin.role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("buyer");

  // Restore the persisted role on mount (web app used localStorage).
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (!alive) return;
        if (saved === "buyer" || saved === "seller" || saved === "referral") setRoleState(saved);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    AsyncStorage.setItem(KEY, r).catch(() => {});
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
