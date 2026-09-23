import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Single-tier route guard: no admin/superadmin/creator/sales split. Any
// active, authenticated session (an admin_token cookie) can reach
// /dashboard/**; per-module visibility inside the dashboard is enforced by
// RBAC permissions returned from the backend, not by separate route trees.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authToken = request.cookies.get("admin_token")?.value;

  const isAuthPage = path.startsWith("/auth");
  const isDashboardRoute = path.startsWith("/dashboard");

  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard/blogs", request.url));
  }

  if (!authToken && isDashboardRoute) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("admin_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};
