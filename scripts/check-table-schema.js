require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableSchema() {
  console.log('Checking database schema...\n');

  // Check users table schema
  console.log('1. Users table schema:');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing users table:', error.message);
    } else {
      console.log('✅ Users table accessible');
      
      // Try to get column information
      const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { table_name: 'users' });
      
      if (colError) {
        console.log('   Note: Could not get column info via RPC');
        // Try a different approach - insert a minimal record to see what works
        console.log('   Testing minimal insert...');
        
        const testData = {
          id: 'test_' + Date.now(),
          email: 'test@test.com'
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert([testData])
          .select()
          .single();
        
        if (insertError) {
          console.log('   ❌ Minimal insert failed:', insertError.message);
        } else {
          console.log('   ✅ Minimal insert successful');
          console.log('   Created record:', insertData);
          
          // Clean up
          await supabase.from('users').delete().eq('id', testData.id);
        }
      } else {
        console.log('   Columns:', columns);
      }
    }
  } catch (error) {
    console.log('❌ Schema check error:', error.message);
  }

  // Check accounts table schema
  console.log('\n2. Accounts table schema:');
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing accounts table:', error.message);
    } else {
      console.log('✅ Accounts table accessible');
    }
  } catch (error) {
    console.log('❌ Accounts table error:', error.message);
  }

  // Check sessions table schema
  console.log('\n3. Sessions table schema:');
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing sessions table:', error.message);
    } else {
      console.log('✅ Sessions table accessible');
    }
  } catch (error) {
    console.log('❌ Sessions table error:', error.message);
  }

  console.log('\nSchema check complete!');
}

checkTableSchema().catch(console.error); 