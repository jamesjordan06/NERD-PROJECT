require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserCreation() {
  console.log('Debugging user creation...\n');

  // Test 1: Check if we can connect to Supabase
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful');
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return;
  }

  // Test 2: Check table structure
  console.log('\n2. Checking table structure...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Table access error:', error.message);
      return;
    }
    
    console.log('✅ Table accessible');
    if (data && data.length > 0) {
      console.log('   Sample columns:', Object.keys(data[0]));
    } else {
      console.log('   Table is empty');
    }
  } catch (error) {
    console.log('❌ Table check error:', error.message);
  }

  // Test 3: Try to create a test user
  console.log('\n3. Testing user creation...');
  try {
    const testUser = {
      id: 'test_user_' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      email_verified: new Date().toISOString(),
      image: null,
      created_at: new Date().toISOString()
    };

    console.log('   Attempting to create test user:', testUser.id);
    
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.log('❌ User creation failed:', error.message);
      console.log('   Error details:', error);
    } else {
      console.log('✅ Test user created successfully:', data.id);
      
      // Clean up - delete the test user
      await supabase.from('users').delete().eq('id', testUser.id);
      console.log('   Test user cleaned up');
    }
  } catch (error) {
    console.log('❌ User creation error:', error.message);
  }

  // Test 4: Check RLS policies
  console.log('\n4. Checking RLS policies...');
  try {
    const { data, error } = await supabase
      .rpc('get_table_policies', { table_name: 'users' });
    
    if (error) {
      console.log('   Note: Could not check RLS policies (this is normal)');
    } else {
      console.log('   RLS policies:', data);
    }
  } catch (error) {
    console.log('   Note: Could not check RLS policies (this is normal)');
  }

  console.log('\nDebug complete!');
}

debugUserCreation().catch(console.error); 