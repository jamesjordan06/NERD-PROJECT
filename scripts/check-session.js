require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const debug = (...args) => {
  if (process.env.NODE_ENV !== 'production') console.log(...args);
};

async function checkSession() {
  debug('Checking session and user data...\n');

  // Check if there are any sessions in the database
  debug('1. Checking sessions table:');
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(5);

    if (error) {
      debug('❌ Error accessing sessions:', error.message);
    } else {
      debug(`✅ Found ${sessions.length} sessions`);
      if (sessions.length > 0) {
        sessions.forEach((session, index) => {
          debug(`   Session ${index + 1}:`, {
            id: session.id,
            userId: session.user_id,
            expires: session.expires,
            sessionToken: session.session_token
          });
        });
      }
    }
  } catch (error) {
    debug('❌ Sessions check error:', error.message);
  }

  // Check if there are any users in the database
  debug('\n2. Checking users table:');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      debug('❌ Error accessing users:', error.message);
    } else {
      debug(`✅ Found ${users.length} users`);
      if (users.length > 0) {
        users.forEach((user, index) => {
          debug(`   User ${index + 1}:`, {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            hasPassword: !!user.hashed_password
          });
        });
      }
    }
  } catch (error) {
    debug('❌ Users check error:', error.message);
  }

  // Check if there are any accounts in the database
  debug('\n3. Checking accounts table:');
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .limit(5);

    if (error) {
      debug('❌ Error accessing accounts:', error.message);
    } else {
      debug(`✅ Found ${accounts.length} accounts`);
      if (accounts.length > 0) {
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
    debug('❌ Accounts check error:', error.message);
  }

  debug('\nSession check complete!');
}

checkSession().catch(console.error); 