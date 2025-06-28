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


  // Update user with any missing information from Google OAuth
  const updates: Record<string, any> = {};
  if (!user.name && name) {
    updates.name = name;
  }
  if (!user.email && email) {
    updates.email = email;
  }

  if (Object.keys(updates).length) {
    const { error: updateErr } = await adminSupabase
      .from("users")
      .update(updates)
      .eq("id", userId);
    if (updateErr) {
      console.error("ensureUserProfile: update error", updateErr);
    }
  }

  // Ensure profile record exists
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
    }
  }

}

async function ensureProfile(user: {
  id: string;
  email?: string | null;
  image?: string | null;
  username?: string | null;
}) {
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
        user.username ||
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
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { supabase } = createSupabaseClients();

        // Find user by email
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, hashed_password, name, username, image")
          .eq("email", credentials.email.toLowerCase().trim())
          .single();

        if (error || !user) {
          return null;
        }

        // Check if user exists but has no password (OAuth-only account)
        if (!user.hashed_password) {
          const error = new Error("OAUTH_ONLY");
          (error as any).code = "OAUTH_ONLY";
          throw error;
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashed_password
        );

        if (!isValid) {
          return null;
        }

        // Return user object for NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
        };
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

      if (user) {
        const { adminSupabase } = createSupabaseClients();
        const { data } = await adminSupabase
          .from("users")
          .select("has_password")
          .eq("id", user.id)
          .single();
        (token as any).has_password = data?.has_password ?? false;
      }

      return token;
    },
    async session({ session, token }) {
      try {

        if (token) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
          (session.user as any).username = token.username as string;
          (session.user as any).has_password = (token as any).has_password as boolean;


        }

        return session;
      } catch (error) {
        console.error("=== SESSION CALLBACK ERROR ===", error);
        throw error;
      }
    },
    async signIn({ user, account }) {

      // Only credentials logins should trigger a password check.
      if (account?.provider === "credentials") {
        const { adminSupabase } = createSupabaseClients();
        const { data: record, error } = await adminSupabase
          .from("users")
          .select("hashed_password")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user during signIn:", error);
          return false;
        }

        // If the user signed up via OAuth previously and has no password set,
        // redirect them to the set password flow.
        if (!record?.hashed_password) {
          return "/set-password";
        }
      }

      if (account?.provider === "google") {

        const { data: existingUser, error } = await adminSupabase
          .from("users")
          .select("id, email, image, hashed_password, username")
          .eq("email", user.email)
          .maybeSingle();

        if (error) {
          console.error("Error checking existing user:", error);
          return false;
        }

        if (existingUser) {

          // If user has a password, this is an email/password account
          if (existingUser.hashed_password) {

            // Check if OAuth account is already linked
            const { data: linkedAccount } = await adminSupabase
              .from("accounts")
              .select("id")
              .match({
                provider: "google",
                provider_account_id: account.providerAccountId,
                user_id: existingUser.id,
              })
              .maybeSingle();

            if (!linkedAccount) {
              // Link the OAuth account to the existing user
              const { error: linkError } = await adminSupabase
                .from("accounts")
                .insert({
                  id: crypto.randomUUID(), // Generate ID for accounts table
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

              if (linkError) {
                console.error("Error linking OAuth account:", linkError);
                return false;
              }
            } else {
            }
          } else {
          }

          await ensureProfile(existingUser);
          return true;
        } else {

          // Generate random username for new OAuth user
          const generateRandomUsername = () => {
            const adjectives = [
              "swift",
              "bright",
              "cosmic",
              "stellar",
              "lunar",
              "solar",
              "neon",
              "cyber",
              "quantum",
              "nebula",
              "pulsar",
              "nova",
              "galaxy",
              "orbit",
              "cosmos",
              "astro",
            ];
            const nouns = [
              "star",
              "pilot",
              "explorer",
              "voyager",
              "traveler",
              "wanderer",
              "seeker",
              "finder",
              "discoverer",
              "creator",
              "builder",
              "maker",
              "dreamer",
              "thinker",
              "adventurer",
              "hero",
              "legend",
              "champion",
              "warrior",
              "knight",
            ];

            const randomAdjective =
              adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
            const randomNumber = Math.floor(Math.random() * 999) + 1;

            return `${randomAdjective}_${randomNoun}_${randomNumber}`;
          };

          // Generate unique username
          let username = generateRandomUsername();
          let attempts = 0;
          const maxAttempts = 10;

          while (attempts < maxAttempts) {
            const { data: existingUserWithUsername } = await adminSupabase
              .from("users")
              .select("id")
              .eq("username", username)
              .maybeSingle();

            if (!existingUserWithUsername) break;

            username = generateRandomUsername();
            attempts++;
          }


          // Update the user object with the generated username
          (user as any).username = username;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {

      // Only try to get origin for absolute URLs
      if (url.startsWith("http")) {
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
