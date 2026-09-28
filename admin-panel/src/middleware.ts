import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// PSA-style route guard: a separate URL namespace per role
// (/<roleSlug>/blogs, /<roleSlug>/leads, ...), keyed by the `currentRole`
// cookie set at login (see AuthContext.login, roleSlug.ts). Unlike PSA's
// fixed admin/superadmin/creator/sales enum, roles here are admin-defined
// rows in the backend's `roles` table, so the segment is whatever that
// role's slug is — a single [role] route tree serves every role's
// namespace, and this middleware is what actually blocks a user from
// crossing into another role's segment. Per-module/action visibility
// inside a role's tree is still enforced by RBAC permissions
// (AuthContext.hasPermission), not by this middleware.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authToken = request.cookies.get("admin_token")?.value;
  const currentRole = request.cookies.get("currentRole")?.value;

  const isAuthPage = path.startsWith("/auth");

  if (authToken && isAuthPage) {
    return NextResponse.redirect(
      new URL(`/${currentRole || "admin"}/blogs`, request.url),
    );
  }

  if (!authToken && !isAuthPage) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("admin_token");
    response.cookies.delete("currentRole");
    return response;
  }

  if (authToken && !isAuthPage && currentRole) {
    const roleSegment = path.split("/").filter(Boolean)[0];
    if (roleSegment && roleSegment !== currentRole) {
      return NextResponse.redirect(
        new URL(`/${currentRole}/blogs`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's own internals and static assets — the role
  // segment is dynamic, so this can't be a literal "/dashboard/:path*"
  // pattern the way it could when there was one fixed tree.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
