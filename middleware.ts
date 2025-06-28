import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path = req.nextUrl.pathname;

    if (
      token &&
      token.has_password === false &&
      !path.startsWith("/set-password") &&
      !path.startsWith("/api") &&
      !path.startsWith("/_next") &&
      path !== "/favicon.ico"
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/set-password";
      url.search = "";
      return NextResponse.redirect(url);
    }
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
