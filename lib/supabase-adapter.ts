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
    
    console.log('Expires field processing:', {
      original: session.expires,
      type: typeof session.expires,
      processed: expiresValue
    });
    
    mapped.expires = expiresValue;
  }
  
  return mapped;
}

export function SupabaseAdapter(supabase: SupabaseClient): Adapter {
  console.log('=== SUPABASE ADAPTER INITIALIZED ===');
  
  return {
    async createUser(user: any) {
      console.log('=== CREATE USER START ===');
      console.log('createUser called with:', {
        id: user.id,
        email: user.email,
        name: user.name
      });

      // Generate UUID for user if not provided
      const userId = user.id || generateUUID();
      
      // Generate username from email
      const username = user.email?.split('@')[0] || `user_${Date.now()}`;

      const userData = {
        name: user.name,
        email: user.email,
        email_verified: user.emailVerified,
        image: user.image,
        id: userId,
        username: username
      };

      console.log('Attempting to insert user data:', userData);

      const mappedUser = mapUserFields(userData);
      console.log('Mapped user fields:', mappedUser);

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

        console.log('=== CREATE USER SUCCESS ===', data);

        // Create profile immediately after user creation
        console.log('=== CREATING PROFILE FOR NEW USER ===');
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
        } else {
          console.log('=== PROFILE CREATED SUCCESSFULLY ===', profileData);
        }

        return mapUserFieldsFromDB(data);
      } catch (error) {
        console.error('=== CREATE USER ERROR ===', error);
        throw error;
      }
    },

    async getUser(id: string) {
      console.log('=== GET USER ===', id);
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      return mapUserFieldsFromDB(data) || null;
    },

    async getUserByEmail(email: string) {
      console.log('=== GET USER BY EMAIL ===', email);
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      return mapUserFieldsFromDB(data) || null;
    },

    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      console.log('=== GET USER BY ACCOUNT ===', { provider, providerAccountId });
      
      try {
        const { data: account, error: accountError } = await supabase
          .from("accounts")
          .select("*")
          .eq("provider", provider)
          .eq("provider_account_id", providerAccountId)
          .maybeSingle();

        if (accountError) {
          console.log('=== GET USER BY ACCOUNT ERROR ===', accountError);
          return null;
        }

        console.log('=== GET USER BY ACCOUNT RESULT ===', { account });

        if (!account) {
          console.log('=== NO ACCOUNT FOUND === - Should trigger createUser');
          return null;
        }

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", account.user_id)
          .single();

        if (userError) {
          console.log('=== GET USER ERROR ===', userError);
          return null;
        }

        console.log('=== USER FOUND ===', user);
        return mapUserFieldsFromDB(user) || null;
      } catch (error) {
        console.log('=== GET USER BY ACCOUNT EXCEPTION ===', error);
        return null;
      }
    },

    async updateUser(user: any) {
      console.log('=== UPDATE USER ===', user.id);
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
      console.log('=== DELETE USER ===', id);
      await supabase.from("accounts").delete().eq("user_id", id);
      await supabase.from("sessions").delete().eq("user_id", id);
      await supabase.from("users").delete().eq("id", id);
    },

    async linkAccount(account: any) {
      console.log('=== LINK ACCOUNT ===', account.provider);
      
      // Generate a proper UUID for the account ID if not provided
      const accountData = {
        ...mapAccountFields(account),
        id: account.id || generateUUID()
      };
      
      console.log('Linking account data:', accountData);
      
      try {
        const { data, error } = await supabase.from("accounts").insert([accountData]);
        if (error) {
          console.log('=== LINK ACCOUNT ERROR ===', error);
          throw error;
        }
        console.log('=== LINK ACCOUNT SUCCESS ===');
      } catch (error) {
        console.log('=== LINK ACCOUNT EXCEPTION ===', error);
        throw error;
      }
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      console.log('=== UNLINK ACCOUNT ===', { provider, providerAccountId });
      await supabase
        .from("accounts")
        .delete()
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId);
    },

    async createSession(session: any) {
      console.log('=== CREATE SESSION ===', session.userId);
      console.log('Session data received:', {
        id: session.id,
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
        expiresType: typeof session.expires,
        expiresInstance: session.expires instanceof Date
      });
      
      // Generate an ID for the session if not provided
      const sessionWithId = {
        ...session,
        id: session.id || generateUUID()
      };
      
      const mappedSession = mapSessionFields(sessionWithId);
      console.log('Mapped session data:', mappedSession);
      console.log('Session token being stored:', mappedSession.session_token);
      
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
        
        console.log('=== CREATE SESSION SUCCESS ===', data);
        console.log('Session token in database:', data.session_token);
        
        // Convert expires string back to Date object for NextAuth
        const sessionForNextAuth = {
          ...data,
          expires: data.expires ? new Date(data.expires) : session.expires
        };
        
        console.log('Session returned to NextAuth:', sessionForNextAuth);
        return sessionForNextAuth;
      } catch (error) {
        console.error('=== CREATE SESSION EXCEPTION ===', error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken: string) {
      console.log('=== GET SESSION AND USER ===', sessionToken);
      console.log('Session token type:', typeof sessionToken);
      console.log('Session token length:', sessionToken?.length);
      console.log('Session token is undefined string:', sessionToken === 'undefined');
      console.log('Session token is empty:', sessionToken === '');
      console.log('Session token is null:', sessionToken === null);
      console.log('Session token value:', JSON.stringify(sessionToken));
      console.log('Session token starts with:', sessionToken?.substring(0, 10));
      
      if (!sessionToken || sessionToken === 'undefined' || sessionToken === 'null') {
        console.log('=== NO VALID SESSION TOKEN PROVIDED ===');
        console.log('This means the session cookie is not being set or read properly');
        console.log('Expected session token format: UUID-like string');
        return null;
      }
      
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .single();

      if (sessionError) {
        console.log('=== SESSION FETCH ERROR ===', sessionError);
        return null;
      }

      if (!session) {
        console.log('=== NO SESSION FOUND IN DATABASE ===');
        console.log('Session token provided but no matching session in database');
        console.log('Token provided:', sessionToken);
        return null;
      }

      console.log('=== SESSION FOUND ===', session);

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
        console.log('=== USER FETCH ERROR ===', userError);
        return null;
      }

      const mappedUser = mapUserFieldsFromDB(user);
      if (!mappedUser) {
        console.log('=== USER MAPPING FAILED ===');
        return null;
      }

      console.log('=== SESSION AND USER RETURNED ===', { session, user: mappedUser });
      return { session, user: mappedUser };
    },

    async updateSession(session: any) {
      console.log('=== UPDATE SESSION ===', session.sessionToken);
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
      console.log('=== DELETE SESSION ===', sessionToken);
      await supabase.from("sessions").delete().eq("session_token", sessionToken);
    },

    async createVerificationToken(token: any) {
      console.log('=== CREATE VERIFICATION TOKEN ===', token.identifier);
      const { data } = await supabase
        .from("verification_tokens")
        .insert([token])
        .select()
        .single();
      return data;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      console.log('=== USE VERIFICATION TOKEN ===', { identifier, token });
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
