import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Previously this middleware redirected any session where
    // `has_password` was false to `/set-password`. This caused
    // OAuth users without a password to always be redirected after
    // sign in. The redirect logic is now handled during the
    // credentials sign-in flow only.
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (
          pathname.startsWith("/profile") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/api/admin")
        ) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/(.*)"]
};
