// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions as sharedAuthOptions } from "../../../../lib/auth-options";

const handler = NextAuth(sharedAuthOptions);

export { handler as GET, handler as POST };
