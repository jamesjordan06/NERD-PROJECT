import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      console.log("🧪 MIDDLEWARE token:", token); // temporary debug
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/api/admin/:path*"],
};
