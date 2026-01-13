import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

export interface Role {
  id: number;
  name: string;
  isPrimary: boolean;
  permissions: string[];
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  franchiseName: string;
  franchiseId: number;
  isSuperAdmin: boolean;
  tier?: number;
  currentRole?: Role;
}

interface OnboardingStatus {
  required: boolean;
  applicationId?: number;
  currentStep?: number;
  completedSteps?: number[];
  status?: string;
  message?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  allRoles: Role[];
  currentRole: Role | null;
  onboardingStatus: OnboardingStatus | null;
  onboardingRequired: boolean;

  setAuth: (user: User, token: string, roles: Role[]) => void;
  setCurrentRole: (roleId: number) => void;
  setOnboardingStatus: (status: OnboardingStatus) => void;
  clearAuth: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasRole: (roleName: string) => boolean;
  getPrimaryRole: () => Role | null;
  isAuthenticated: () => boolean;
}

const formatFranchiseName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      allRoles: [],
      currentRole: null,
      onboardingStatus: null,
      onboardingRequired: false,

      setAuth: (user, token, roles) => {
        const primaryRole = roles.find((r) => r.isPrimary) || roles[0] || null;
        let cookieRole = primaryRole?.name.toLowerCase() || "";
        let cookieFranchise = "";
        let currentRoleToSet = primaryRole;

        if (user.tier === 3 && user.franchiseName) {
          cookieRole = "superadmin";
          cookieFranchise = formatFranchiseName(user.franchiseName);
        } else if (user.tier === 4 && user.franchiseName && primaryRole) {
          cookieRole = primaryRole.name.toLowerCase();
          cookieFranchise = formatFranchiseName(user.franchiseName);
        }

        Cookies.set("currentRole", cookieRole);
        if (cookieFranchise) Cookies.set("franchiseName", cookieFranchise);
        Cookies.set("tier", String(user.tier || 0));

        set({ user, token, allRoles: roles, currentRole: currentRoleToSet });
      },

      setCurrentRole: (roleId: number) => {
        const { allRoles, user } = get();
        if (!user) return;
        const role = allRoles.find((r) => r.id === roleId);
        if (!role) return;

        Cookies.set("currentRole", role.name.toLowerCase());
        set({ currentRole: role });
      },

      setOnboardingStatus: (status) => set({ onboardingStatus: status }),

      clearAuth: () => {
        Cookies.remove("authToken");
        Cookies.remove("currentRole");
        Cookies.remove("franchiseName");
        Cookies.remove("tier");

        set({
          user: null,
          token: null,
          allRoles: [],
          currentRole: null,
          onboardingStatus: null,
        });
      },

      updateUser: (data) => {
        const { user } = get();
        if (user) set({ user: { ...user, ...data } });
      },

      hasRole: (roleName) => get().allRoles.some((r) => r.name === roleName),
      getPrimaryRole: () => get().allRoles.find((r) => r.isPrimary) || null,
      isAuthenticated: () => !!(get().user && get().token),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        allRoles: state.allRoles,
        currentRole: state.currentRole,
      }),
    }
  )
);

export default useAuthStore;
