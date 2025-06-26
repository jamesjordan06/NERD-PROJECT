require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const debug = (...args) => {
  if (process.env.NODE_ENV !== 'production') console.log(...args);
};

async function checkDatabaseSchema() {
  debug('=== CHECKING DATABASE SCHEMA ===');
  
  try {
    // Check if profiles table exists by trying to query it
    const { data: profilesCheck, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError && profilesError.code === '42P01') {
      debug('Profiles table does not exist. Creating it...');
      
      // Create profiles table using SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS "profiles" (
            "id" TEXT NOT NULL,
            "user_id" TEXT NOT NULL,
            "username" TEXT,
            "avatar_url" TEXT,
            "bio" TEXT,
            CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
          );
        `
      });
      
      if (createError) {
        console.error('Error creating profiles table:', createError);
        return;
      }
      
      // Create unique indexes
      await supabase.rpc('exec_sql', {
        sql: 'CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");'
      });
      
      await supabase.rpc('exec_sql', {
        sql: 'CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_key" ON "profiles"("username");'
      });
      
      // Add foreign key constraint
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      });
      
      debug('Profiles table created successfully!');
    } else if (profilesError) {
      console.error('Error checking profiles table:', profilesError);
      return;
    } else {
      debug('Profiles table already exists.');
    }
    
    // Check current users and their profiles
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, username, image, hashed_password');
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    debug(`Found ${users.length} users in database:`);
    users.forEach(user => {
      debug(`- ${user.email} (${user.id}) - Password: ${user.hashed_password ? 'SET' : 'NOT SET'}`);
    });
    
    // Check profiles
    const { data: profiles, error: profilesError2 } = await supabase
      .from('profiles')
      .select('id, user_id, username');
    
    if (profilesError2) {
      console.error('Error fetching profiles:', profilesError2);
      return;
    }
    
    debug(`Found ${profiles.length} profiles in database:`);
    profiles.forEach(profile => {
      debug(`- Profile for user ${profile.user_id} (${profile.username})`);
    });
    
    // Find users without profiles
    const usersWithoutProfiles = users.filter(user => 
      !profiles.some(profile => profile.user_id === user.id)
    );
    
    if (usersWithoutProfiles.length > 0) {
      debug(`\nUsers without profiles (${usersWithoutProfiles.length}):`);
      usersWithoutProfiles.forEach(user => {
        debug(`- ${user.email} (${user.id})`);
      });
      
      debug('\nCreating missing profiles...');
      for (const user of usersWithoutProfiles) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: require('crypto').randomUUID(),
            user_id: user.id,
            username: user.username || user.email?.split('@')[0] || `user_${Date.now()}`,
            avatar_url: user.image,
            bio: null
          });
        
        if (insertError) {
          console.error(`Error creating profile for ${user.email}:`, insertError);
        } else {
          debug(`Created profile for ${user.email}`);
        }
      }
    }
    
    debug('\n=== DATABASE SCHEMA CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabaseSchema(); 