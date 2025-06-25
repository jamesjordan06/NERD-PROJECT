const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseDatabase() {
  console.log('Diagnosing database structure...');
  
  try {
    // Try to get a sample user with specific columns
    console.log('\n1. Testing specific column selection...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email, name, image')
      .limit(1);

    if (userError) {
      console.error('Error with specific columns:', userError);
    } else {
      console.log('User data with specific columns:', userData[0]);
    }

    // Try to get all columns
    console.log('\n2. Testing all columns selection...');
    const { data: allUserData, error: allUserError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (allUserError) {
      console.error('Error with all columns:', allUserError);
    } else {
      console.log('All user columns:', Object.keys(allUserData[0] || {}));
      console.log('Full user data:', allUserData[0]);
    }

    // Check if profiles table exists
    console.log('\n3. Checking profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('Profiles table error:', profilesError.message);
    } else {
      console.log('Profiles table exists and has columns:', Object.keys(profilesData[0] || {}));
    }

    // Try a simple query to see what works
    console.log('\n4. Testing simple query...');
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log('Number of users in database:', count);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

diagnoseDatabase(); 