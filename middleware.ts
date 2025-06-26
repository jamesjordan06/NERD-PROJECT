// middleware.ts
import { withAuth } from "next-auth/middleware";
import { authOptions } from "./lib/auth-options";

export default withAuth({
  ...authOptions,
  callbacks: {
    authorized: ({ token }) => {
      console.log("🧪 MIDDLEWARE token:", token);
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
