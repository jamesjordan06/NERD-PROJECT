require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const debug = (...args) => {
  if (process.env.NODE_ENV !== 'production') console.log(...args);
};

async function testOAuthFlow() {
  debug('Testing OAuth flow...\n');

  // Check if users table exists and has data
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      debug('❌ Error fetching users:', error.message);
    } else {
      debug('✅ Users table accessible');
      debug(`   Found ${users.length} users`);
      
      if (users.length > 0) {
        debug('   Sample user data:');
        users.forEach((user, index) => {
          debug(`   User ${index + 1}:`, {
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
    debug('❌ Error:', error.message);
  }

  // Check if accounts table exists and has data
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .limit(5);

    if (error) {
      debug('❌ Error fetching accounts:', error.message);
    } else {
      debug('✅ Accounts table accessible');
      debug(`   Found ${accounts.length} accounts`);
      
      if (accounts.length > 0) {
        debug('   Sample account data:');
        accounts.forEach((account, index) => {
          debug(`   Account ${index + 1}:`, {
            id: account.id,
            provider: account.provider,
            providerAccountId: account.provider_account_id,
            userId: account.user_id
          });
        });
      }
    }
  } catch (error) {
    debug('❌ Error:', error.message);
  }

  debug('\nTest complete!');
}

testOAuthFlow().catch(console.error); 