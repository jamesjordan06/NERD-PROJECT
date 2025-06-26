import { withAuth } from "next-auth/middleware";

export default withAuth({
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    authorized: ({ token }) => {
      console.log("🧪 MIDDLEWARE token:", token); // keep for debugging
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/api/admin/:path*"],
};
