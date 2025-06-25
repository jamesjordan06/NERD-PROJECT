require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOAuthFlow() {
  console.log('Testing OAuth flow...\n');

  // Check if users table exists and has data
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error fetching users:', error.message);
    } else {
      console.log('✅ Users table accessible');
      console.log(`   Found ${users.length} users`);
      
      if (users.length > 0) {
        console.log('   Sample user data:');
        users.forEach((user, index) => {
          console.log(`   User ${index + 1}:`, {
            id: user.id,
            email: user.email,
            name: user.name,
            hasPassword: !!user.hashed_password,
            createdAt: user.created_at
          });
        });
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Check if accounts table exists and has data
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error fetching accounts:', error.message);
    } else {
      console.log('✅ Accounts table accessible');
      console.log(`   Found ${accounts.length} accounts`);
      
      if (accounts.length > 0) {
        console.log('   Sample account data:');
        accounts.forEach((account, index) => {
          console.log(`   Account ${index + 1}:`, {
            id: account.id,
            provider: account.provider,
            providerAccountId: account.provider_account_id,
            userId: account.user_id
          });
        });
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\nTest complete!');
}

testOAuthFlow().catch(console.error); 