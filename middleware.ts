// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    
    if (isAdminRoute) {
      // Admin routes will be protected by the API routes
      // The actual admin check will be done in the API route
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
