require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserCreation() {
  console.log('Testing user creation with username...\n');

  try {
    const testUser = {
      id: 'test_user_' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser_' + Date.now(),
      email_verified: new Date().toISOString(),
      image: null
    };

    console.log('Attempting to create test user:', testUser.id);
    console.log('User data:', testUser);
    
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.log('❌ User creation failed:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Test user created successfully!');
      console.log('Created user:', data);
      
      // Clean up - delete the test user
      await supabase.from('users').delete().eq('id', testUser.id);
      console.log('Test user cleaned up');
    }
  } catch (error) {
    console.log('❌ User creation error:', error.message);
  }

  console.log('\nTest complete!');
}

testUserCreation().catch(console.error); 