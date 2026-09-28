"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import {
  login as loginService,
  AuthCredentialsLogin,
} from "../services/auth/authService";
import { useRouter } from "next/navigation";
import { slugifyRole } from "./roleSlug";

// Permissions shape returned by the backend's RBAC role, e.g.
// { blogs: { view: true, create: true, ... }, leads: {...}, marketing: {...}, admin_management: {...} }
export type Permissions = Record<string, Record<string, boolean>>;

interface User {
  id?: number;
  name: string;
  email: string;
  role_id?: number;
  role?: string;
  permissions?: Permissions;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: AuthCredentialsLogin) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = Cookies.get("admin_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const storedUser = Cookies.get("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load stored session:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (userData: AuthCredentialsLogin) => {
    setIsLoading(true);
    try {
      const response = await loginService(userData);
      Cookies.set("admin_token", response.token, { expires: 7, secure: true });
      if (response.refreshToken) {
        Cookies.set("admin_refreshToken", response.refreshToken, {
          expires: 30,
          secure: true,
        });
      }
      // Backend returns `admin: { id, name, email, status, role: { id, name, permissions } }`
      // — flatten that into the User shape the rest of the app reads.
      const loggedInUser: User = {
        id: response.admin?.id,
        name: response.admin?.name,
        email: response.admin?.email,
        role_id: response.admin?.role?.id,
        role: response.admin?.role?.name,
        permissions: response.admin?.role?.permissions,
      };
      Cookies.set("user", JSON.stringify(loggedInUser), {
        expires: 7,
        secure: true,
      });
      // A separate role-namespace tree (/<roleSlug>/blogs, /<roleSlug>/leads,
      // ...) per PSA's pattern — see src/middleware.ts, which blocks a
      // logged-in user from crossing into another role's URL segment.
      const roleSlug = slugifyRole(loggedInUser.role);
      Cookies.set("currentRole", roleSlug, { expires: 7, secure: true });
      setUser(loggedInUser);
      router.push(`/${roleSlug}/blogs`);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("admin_token");
    Cookies.remove("admin_refreshToken");
    Cookies.remove("user");
    Cookies.remove("currentRole");
    setUser(null);
    router.push("/auth/login");
  };

  // Missing permissions map (e.g. legacy/seed super admin) defaults to
  // "allow everything" so the seeded superadmin isn't locked out before
  // roles are configured.
  const hasPermission = (module: string, action: string) => {
    if (!user) return false;
    if (!user.permissions) return true;
    return !!user.permissions?.[module]?.[action];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
