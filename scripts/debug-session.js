// scripts/debug-session.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSessions() {
  console.log('=== DEBUGGING SESSIONS ===');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check all sessions in the database
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error fetching sessions:', error);
    return;
  }
  
  console.log('Recent sessions:', sessions);
  
  // Check all users
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }
  
  console.log('Recent users:', users);
  
  // Check all accounts
  const { data: accounts, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (accountError) {
    console.error('Error fetching accounts:', accountError);
    return;
  }
  
  console.log('Recent accounts:', accounts);
}

debugSessions().catch(console.error); 