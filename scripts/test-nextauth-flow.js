require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNextAuthFlow() {
  console.log('Testing NextAuth flow simulation...\n');

  const provider = 'google';
  const providerAccountId = '113435808299581347995';

  // Step 1: Check if account exists (like getUserByAccount)
  console.log('1. Checking if account exists...');
  try {
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("provider", provider)
      .eq("provider_account_id", providerAccountId)
      .maybeSingle();

    if (accountError) {
      console.log('❌ Account check error:', accountError);
      return;
    }

    console.log('Account check result:', account);

    if (!account) {
      console.log('✅ No account found - should create user');
      
      // Step 2: Create user (like createUser)
      console.log('\n2. Creating user...');
      const testUser = {
        id: `google_${providerAccountId}`,
        email: 'jenkinsj251@gmail.com',
        name: 'James Jenkins',
        username: 'jenkinsj251',
        email_verified: new Date().toISOString()
      };

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert([testUser])
        .select()
        .single();

      if (userError) {
        console.log('❌ User creation error:', userError);
        return;
      }

      console.log('✅ User created:', user);

      // Step 3: Link account (like linkAccount)
      console.log('\n3. Linking account...');
      const testAccount = {
        id: `account_${Date.now()}`,
        user_id: user.id,
        type: 'oauth',
        provider: provider,
        provider_account_id: providerAccountId,
        refresh_token: null,
        access_token: null,
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null
      };

      const { data: linkedAccount, error: linkError } = await supabase
        .from("accounts")
        .insert([testAccount])
        .select()
        .single();

      if (linkError) {
        console.log('❌ Account linking error:', linkError);
        return;
      }

      console.log('✅ Account linked:', linkedAccount);

      // Clean up
      await supabase.from("accounts").delete().eq("id", linkedAccount.id);
      await supabase.from("users").delete().eq("id", user.id);
      console.log('✅ Test data cleaned up');
    } else {
      console.log('❌ Account already exists - unexpected');
    }
  } catch (error) {
    console.log('❌ Test error:', error);
  }

  console.log('\nTest complete!');
}

testNextAuthFlow().catch(console.error); 