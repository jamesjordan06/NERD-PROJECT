require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMinimalUser() {
  console.log('Testing minimal user creation...\n');

  // Test with just the required fields
  const minimalUser = {
    id: 'google_113435808299581347995',
    email: 'jenkinsj251@gmail.com',
    name: 'James Jenkins',
    username: 'jenkinsj251'
  };

  console.log('Attempting to create minimal user:', minimalUser.id);
  console.log('User data:', minimalUser);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([minimalUser])
      .select()
      .single();

    if (error) {
      console.log('❌ Minimal user creation failed:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Minimal user created successfully!');
      console.log('Created user:', data);
      
      // Clean up - delete the test user
      await supabase.from('users').delete().eq('id', minimalUser.id);
      console.log('Test user cleaned up');
    }
  } catch (error) {
    console.log('❌ Minimal user creation error:', error.message);
  }

  console.log('\nTest complete!');
}

testMinimalUser().catch(console.error); 