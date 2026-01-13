import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getBasePath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

function getRedirectPath(
  currentRole: string | undefined,
  franchiseName: string | undefined,
  tier: string | undefined
): string {
  if (!currentRole) return "";

  const tierNum = parseInt(tier || "0", 10);

  // Tier 3 → b/[franchise]/superadmin
  if (tierNum === 3 && franchiseName) {
    return `b/${franchiseName.toLowerCase()}/superadmin`;
  }

  // Tier 4 → b/[franchise]/[role]
  if (tierNum === 4 && franchiseName && currentRole) {
    return `b/${franchiseName.toLowerCase()}/${currentRole.toLowerCase()}`;
  }

  // Tier 2 & Tier 1 (superadmin) → a/[role]
  return `a/${currentRole.toLowerCase()}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get("authToken")?.value;
  const currentRole = request.cookies.get("currentRole")?.value;
  const franchiseName = request.cookies.get("franchiseName")?.value;
  const tier = request.cookies.get("tier")?.value;

  const publicRoutes = [
    "/auth/login",
    // "/auth/onboarding",
    "/auth/verify",
    "/auth/forgot-password",
    "/auth/signup",
  ];

  // Public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (authToken && pathname.startsWith("/auth/login") && currentRole) {
      const redirectPath = getRedirectPath(currentRole, franchiseName, tier);
      return NextResponse.redirect(
        new URL(`/${redirectPath}/dashboard`, request.url)
      );
    }
    return NextResponse.next();
  }

  //  Home path → handled client-side --
  if (pathname === "/") return NextResponse.next();

  // Not authenticated → redirect login
  if (!authToken || !currentRole)
    return NextResponse.redirect(new URL("/auth/login", request.url));

  //  Check route access
  const redirectPath = getRedirectPath(currentRole, franchiseName, tier);
  const targetUrl = `/${redirectPath}/dashboard`.replace(/\/+$/, "");
  const normalizedPath = pathname.replace(/\/+$/, "");
  const basePath = getBasePath(pathname);

  // If user hits the wrong route, redirect them to their area
  if (!normalizedPath.startsWith(`/${redirectPath}`)) {
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.pdf$|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
