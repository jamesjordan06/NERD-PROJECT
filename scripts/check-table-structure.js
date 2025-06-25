const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructure() {
  console.log('Checking table structure...');
  
  try {
    // Check users table structure
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log('Users table columns:', Object.keys(usersData[0] || {}));
    console.log('Sample user data:', usersData[0]);

    // Check if profiles table exists
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('Profiles table error (expected if table doesn\'t exist):', profilesError.message);
    } else {
      console.log('Profiles table columns:', Object.keys(profilesData[0] || {}));
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTableStructure(); 