// Test script to verify legal pages are working
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

// Simple env loader
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLegalPages() {
  console.log('Testing legal pages...\n');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    return;
  }
  
  try {
    // Test 1: Check if legal_pages table exists and has data
    const { data: allPages, error: allError } = await supabase
      .from('legal_pages')
      .select('*');
    
    if (allError) {
      console.error('Error fetching all legal pages:', allError);
      return;
    }
    
    console.log(`Found ${allPages.length} legal pages:`);
    allPages.forEach(page => {
      console.log(`- ${page.slug}: ${page.title}`);
    });
    
    // Test 2: Test specific pages
    const testSlugs = ['privacy', 'terms', 'cookie-policy'];
    
    for (const slug of testSlugs) {
      console.log(`\nTesting ${slug}...`);
      const { data: page, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error(`Error fetching ${slug}:`, error);
      } else if (page) {
        console.log(`✓ ${slug} found: ${page.title}`);
      } else {
        console.log(`✗ ${slug} not found`);
      }
    }
    
    // Test 3: Test all-slugs page
    console.log('\nTesting all-slugs page...');
    const { data: allSlugsPage, error: allSlugsError } = await supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', 'all-slugs')
      .single();
    
    if (allSlugsError) {
      console.error('Error fetching all-slugs page:', allSlugsError);
    } else if (allSlugsPage) {
      console.log('✓ all-slugs page found');
      const markdown = allSlugsPage.body;
      console.log('Body length:', markdown.length);
    } else {
      console.log('✗ all-slugs page not found');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testLegalPages(); 