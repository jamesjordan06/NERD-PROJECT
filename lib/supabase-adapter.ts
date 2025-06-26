// lib/supabase-adapter.ts
import { Adapter } from "next-auth/adapters";
import { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Helper function to generate UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Helper function to map Prisma field names to database column names
export function mapUserFields(user: any) {
  const mapped: any = {};
  
  // Only map fields that we know exist in the database
  if (user.id !== undefined) mapped.id = user.id;
  if (user.name !== undefined) mapped.name = user.name;
  if (user.email !== undefined) mapped.email = user.email;
  if (user.emailVerified !== undefined) mapped.email_verified = user.emailVerified;
  if (user.image !== undefined) mapped.image = user.image;
  if (user.username !== undefined) mapped.username = user.username;
  if (user.hashed_password !== undefined) mapped.hashed_password = user.hashed_password;
  
  // Don't include created_at - let the database handle it with default value
  
  return mapped;
}

// Helper function to map database column names back to Prisma field names
export function mapUserFieldsFromDB(user: any) {
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.email_verified,
    image: user.image,
    username: user.username,
    hashed_password: user.hashed_password,
    createdAt: user.created_at || new Date(), // Provide fallback if created_at doesn't exist
  };
}

// Helper function to map account fields
export function mapAccountFields(account: any) {
  const mapped: any = {};
  
  if (account.id !== undefined) mapped.id = account.id;
  if (account.userId !== undefined) mapped.user_id = account.userId;
  if (account.type !== undefined) mapped.type = account.type;
  if (account.provider !== undefined) mapped.provider = account.provider;
  if (account.providerAccountId !== undefined) mapped.provider_account_id = account.providerAccountId;
  if (account.refresh_token !== undefined) mapped.refresh_token = account.refresh_token;
  if (account.access_token !== undefined) mapped.access_token = account.access_token;
  if (account.expires_at !== undefined) mapped.expires_at = account.expires_at;
  if (account.token_type !== undefined) mapped.token_type = account.token_type;
  if (account.scope !== undefined) mapped.scope = account.scope;
  if (account.id_token !== undefined) mapped.id_token = account.id_token;
  if (account.session_state !== undefined) mapped.session_state = account.session_state;
  
  return mapped;
}

// Helper function to map session fields
function mapSessionFields(session: any) {
  const mapped: any = {};
  
  if (session.id !== undefined) mapped.id = session.id;
  if (session.sessionToken !== undefined) mapped.session_token = session.sessionToken;
  if (session.userId !== undefined) mapped.user_id = session.userId;
  if (session.expires !== undefined) {
    // Handle expires field carefully
    let expiresValue;
    if (session.expires instanceof Date) {
      expiresValue = session.expires.toISOString();
    } else if (typeof session.expires === 'string') {
      // If it's already a string, validate it's a proper ISO string
      try {
        new Date(session.expires); // Validate it's a valid date
        expiresValue = session.expires;
      } catch {
        // If invalid, convert to ISO string
        expiresValue = new Date(session.expires).toISOString();
      }
    } else if (typeof session.expires === 'number') {
      // If it's a timestamp
      expiresValue = new Date(session.expires).toISOString();
    } else {
      // Fallback - try to convert to Date and then to ISO string
      expiresValue = new Date(session.expires).toISOString();
    }
    

    
    mapped.expires = expiresValue;
  }
  
  return mapped;
}

export function SupabaseAdapter(supabase: SupabaseClient): Adapter {
  
  return {
    async createUser(user: any) {

      // Generate UUID for user if not provided
      const userId = user.id || generateUUID();
      
      // Use provided username or generate from email
      const username = user.username || user.email?.split('@')[0] || `user_${Date.now()}`;

      const userData = {
        name: user.name,
        email: user.email,
        email_verified: user.emailVerified,
        image: user.image,
        id: userId,
        username: username
      };


      const mappedUser = mapUserFields(userData);

      try {
        const { data, error } = await supabase
          .from("users")
          .insert([mappedUser])
          .select()
          .single();

        if (error) {
          console.error('=== CREATE USER ERROR ===', error);
          throw error;
        }


        // Create profile immediately after user creation
        const profileData = {
          id: generateUUID(),
          user_id: userId,
          username: username,
          avatar_url: user.image,
          bio: null
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .insert([profileData]);

        if (profileError) {
          console.error('=== CREATE PROFILE ERROR ===', profileError);
          // Don't throw error for profile creation - user is already created
        }

        return mapUserFieldsFromDB(data);
      } catch (error) {
        console.error('=== CREATE USER ERROR ===', error);
        throw error;
      }
    },

    async getUser(id: string) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      return mapUserFieldsFromDB(data) || null;
    },

    async getUserByEmail(email: string) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      return mapUserFieldsFromDB(data) || null;
    },

    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      
      try {
        const { data: account, error: accountError } = await supabase
          .from("accounts")
          .select("*")
          .eq("provider", provider)
          .eq("provider_account_id", providerAccountId)
          .maybeSingle();

        if (accountError) {
          return null;
        }


        if (!account) {
          return null;
        }

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", account.user_id)
          .single();

        if (userError) {
          return null;
        }

        return mapUserFieldsFromDB(user) || null;
      } catch (error) {
        return null;
      }
    },

    async updateUser(user: any) {
      const mappedUser = mapUserFields(user);
      const { data } = await supabase
        .from("users")
        .update(mappedUser)
        .eq("id", user.id)
        .select()
        .single();
      
      const mappedData = mapUserFieldsFromDB(data);
      if (!mappedData) throw new Error("User not found after update");
      return mappedData;
    },

    async deleteUser(id: string) {
      await supabase.from("accounts").delete().eq("user_id", id);
      await supabase.from("sessions").delete().eq("user_id", id);
      await supabase.from("users").delete().eq("id", id);
    },

    async linkAccount(account: any) {
      
      // Generate a proper UUID for the account ID if not provided
      const accountData = {
        ...mapAccountFields(account),
        id: account.id || generateUUID()
      };
      
      
      try {
        const { data, error } = await supabase.from("accounts").insert([accountData]);
        if (error) {
          throw error;
        }
      } catch (error) {
        throw error;
      }
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await supabase
        .from("accounts")
        .delete()
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId);
    },

    async createSession(session: any) {
      
      // Generate an ID for the session if not provided
      const sessionWithId = {
        ...session,
        id: session.id || generateUUID()
      };
      
      const mappedSession = mapSessionFields(sessionWithId);
      
      try {
        const { data, error } = await supabase
          .from("sessions")
          .insert([mappedSession])
          .select()
          .single();
          
        if (error) {
          console.error('=== CREATE SESSION ERROR ===', error);
          throw error;
        }
        
        // Convert expires string back to Date object for NextAuth
        const sessionForNextAuth = {
          ...data,
          expires: data.expires ? new Date(data.expires) : session.expires
        };
        
        return sessionForNextAuth;
      } catch (error) {
        console.error('=== CREATE SESSION EXCEPTION ===', error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken: string) {
      
      if (!sessionToken || sessionToken === 'undefined' || sessionToken === 'null') {
        
        return null;
      }
      
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .single();

      if (sessionError) {
        return null;
      }

      if (!session) {
        
        return null;
      }


      // Convert expires string back to Date object for NextAuth
      if (session.expires) {
        try {
          session.expires = new Date(session.expires);
        } catch (error) {
          console.error('Error converting expires to Date:', error);
          // If conversion fails, use current time + 30 days as fallback
          session.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user_id)
        .single();

        if (userError) {
          return null;
        }

      const mappedUser = mapUserFieldsFromDB(user);
      if (!mappedUser) {
        return null;
      }

      return { session, user: mappedUser };
    },

    async updateSession(session: any) {
      const mappedSession = mapSessionFields(session);
      const { data, error } = await supabase
        .from("sessions")
        .update(mappedSession)
        .eq("session_token", session.sessionToken)
        .select()
        .single();
        
      if (error) {
        console.error('=== UPDATE SESSION ERROR ===', error);
        throw error;
      }
      
      // Convert expires string back to Date object for NextAuth
      if (data.expires) {
        try {
          data.expires = new Date(data.expires);
        } catch (error) {
          console.error('Error converting expires to Date:', error);
          // If conversion fails, use current time + 30 days as fallback
          data.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
      }
      
      return data;
    },

    async deleteSession(sessionToken: string) {
      await supabase.from("sessions").delete().eq("session_token", sessionToken);
    },

    async createVerificationToken(token: any) {
      const { data } = await supabase
        .from("verification_tokens")
        .insert([token])
        .select()
        .single();
      return data;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const { data } = await supabase
        .from("verification_tokens")
        .delete()
        .eq("identifier", identifier)
        .eq("token", token)
        .select()
        .single();
      return data;
    },
  };
}
