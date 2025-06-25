// lib/auth-options.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "./supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import NextAuth, { NextAuthOptions } from "next-auth";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Import the mapping functions from supabase-adapter
import {
  mapUserFields,
  mapUserFieldsFromDB,
  mapAccountFields,
} from "./supabase-adapter";

// Debug environment variables
console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
console.log(
  "GOOGLE_CLIENT_ID:",
  process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET"
);
console.log(
  "GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET"
);
console.log(
  "NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET"
);
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET"
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET"
);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log(
  "NEXTAUTH_SECRET:",
  process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET"
);

// Create Supabase clients only when environment variables are available
function createSupabaseClients() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase environment variables are not configured");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  return { supabase, adminSupabase };
}

function generateUsername() {
  return "user_" + Math.random().toString(36).substring(2, 10);
}

function generatePassword() {
  return crypto.randomBytes(12).toString("base64");
}

function generateUUID() {
  return crypto.randomUUID();
}

async function ensureUserProfile(
  userId: string,
  email?: string | null,
  name?: string | null
) {
  console.log("=== ENSURE USER PROFILE START ===");
  console.log("Ensuring profile for user:", { userId, email, name });

  const { adminSupabase } = createSupabaseClients();

  // Check if user exists and has required fields
  const { data: user, error } = await adminSupabase
    .from("users")
    .select("id, email, name, username, image")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("ensureUserProfile: fetch error", error);
    return;
  }

  if (!user) {
    console.error("ensureUserProfile: user not found", userId);
    return;
  }

  console.log("Current user data:", user);

  // Update user with any missing information from Google OAuth
  const updates: Record<string, any> = {};
  if (!user.name && name) {
    updates.name = name;
    console.log("Will update name to:", name);
  }
  if (!user.email && email) {
    updates.email = email;
    console.log("Will update email to:", email);
  }

  if (Object.keys(updates).length) {
    console.log("Updating user with:", updates);
    const { error: updateErr } = await adminSupabase
      .from("users")
      .update(updates)
      .eq("id", userId);
    if (updateErr) {
      console.error("ensureUserProfile: update error", updateErr);
    } else {
      console.log(`ensureUserProfile: updated user ${userId}`);
    }
  } else {
    console.log("No updates needed for user profile");
  }

  // Ensure profile record exists
  console.log("Checking if profile record exists...");
  const { data: existingProfile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("ensureUserProfile: profile fetch error", profileError);
    return;
  }

  if (!existingProfile) {
    console.log("Creating profile record for user:", userId);
    const profileData = {
      id: generateUUID(),
      user_id: userId,
      username: user.username || email?.split("@")[0] || `user_${Date.now()}`,
      avatar_url: user.image,
      bio: null,
    };

    const { error: insertErr } = await adminSupabase
      .from("profiles")
      .insert([profileData]);

    if (insertErr) {
      console.error("ensureUserProfile: profile insert error", insertErr);
    } else {
      console.log(`ensureUserProfile: created profile for user ${userId}`);
    }
  } else {
    console.log("Profile record already exists:", existingProfile);
  }

  console.log("=== ENSURE USER PROFILE END ===");
}

async function ensureProfile(user: { id: string; email?: string | null; image?: string | null }) {
  const { adminSupabase } = createSupabaseClients();

  const { data: existing } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    const profileData = {
      id: crypto.randomUUID(),
      user_id: user.id,
      username:
        user.email?.split("@")[0] ||
        "user_" + Math.random().toString(36).slice(2, 10),
      avatar_url: user.image ?? null,
      bio: null,
    };

    const { error } = await adminSupabase.from("profiles").insert(profileData);
    if (error) console.error("ensureProfile insert error:", error.message);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: SupabaseAdapter(createSupabaseClients().supabase),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {},
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.username =
          (user as any).username ||
          user.email?.split("@")[0] ||
          "user_" + Math.random().toString(36).slice(2, 10);
      }
      return token;
    },
    async session({ session, token }) {
      try {
        console.log("=== SESSION CALLBACK ===");
        console.log("Session received:", session);
        console.log("Token received:", token);
        console.log("Session callback called at:", new Date().toISOString());

        if (token) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
          (session.user as any).username = token.username as string;

          console.log("Session updated with token data:", session.user);
        } else {
          console.log("No token provided to session callback");
        }

        console.log("Final session returned:", session);
        return session;
      } catch (error) {
        console.error("=== SESSION CALLBACK ERROR ===", error);
        throw error;
      }
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { data: existingUser, error } = await adminSupabase
          .from("users")
          .select("id, email, image")
          .eq("email", user.email)
          .maybeSingle();

        if (error) return false;

        if (existingUser) {
          await ensureProfile(existingUser);
          const { data: linked } = await adminSupabase
            .from("accounts")
            .select("id")
            .match({
              provider: "google",
              provider_account_id: account.providerAccountId,
            })
            .maybeSingle();

          if (!linked) {
            await adminSupabase.from("accounts").insert({
              user_id: existingUser.id,
              provider: account.provider,
              provider_account_id: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            });
          }
          return true;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("=== REDIRECT CALLBACK ===");
      console.log("URL:", url);
      console.log("Base URL:", baseUrl);
      console.log("URL starts with /:", url.startsWith("/"));

      // Only try to get origin for absolute URLs
      if (url.startsWith("http")) {
        console.log("URL origin:", new URL(url).origin);
        console.log("Base URL origin:", new URL(baseUrl).origin);
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (url.startsWith("http") && new URL(url).origin === baseUrl)
        return url;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV !== "production",
};

export default NextAuth(authOptions);
