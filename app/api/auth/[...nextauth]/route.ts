// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions as sharedAuthOptions } from "../../../../lib/auth-options";

console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NEXTAUTH_URL_INTERNAL:", process.env.NEXTAUTH_URL_INTERNAL);
console.log(
  "Google provider config:",
  (sharedAuthOptions.providers || []).find((p) => p.id === "google")
);
console.log("redirect:", sharedAuthOptions.callbacks?.redirect);
console.log("Session strategy:", sharedAuthOptions.session?.strategy);
console.log("JWT secret set:", !!sharedAuthOptions.jwt?.secret);

const handler = NextAuth(sharedAuthOptions);

export { handler as GET, handler as POST };
