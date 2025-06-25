const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAccountsTable() {
  try {
    console.log('🔧 Fixing accounts table...');
    
    // Read the SQL script
    const sqlPath = path.join(__dirname, 'fix-accounts-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error running SQL:', error);
      return;
    }
    
    console.log('✅ Accounts table fixed successfully!');
    console.log('📊 Results:', data);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAccountsTable(); 