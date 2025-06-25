const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createProfilesTable() {
  console.log('Creating profiles table...');
  
  try {
    // Create the profiles table
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
      console.error('Error creating table:', createError);
      return;
    }

    // Create unique indexes
    const { error: index1Error } = await supabase.rpc('exec_sql', {
      sql: 'CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");'
    });

    if (index1Error) {
      console.error('Error creating user_id index:', index1Error);
    }

    const { error: index2Error } = await supabase.rpc('exec_sql', {
      sql: 'CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_key" ON "profiles"("username");'
    });

    if (index2Error) {
      console.error('Error creating username index:', index2Error);
    }

    // Add foreign key constraint
    const { error: fkError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
    });

    if (fkError) {
      console.error('Error adding foreign key:', fkError);
    }

    console.log('Profiles table created successfully!');
    
    // Create profiles for existing users
    console.log('Creating profiles for existing users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, image');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    for (const user of users) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          username: user.username,
          avatar_url: user.image,
          bio: null
        });

      if (insertError) {
        console.error(`Error creating profile for user ${user.id}:`, insertError);
      } else {
        console.log(`Created profile for user ${user.id}`);
      }
    }

    console.log('Done!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createProfilesTable(); 