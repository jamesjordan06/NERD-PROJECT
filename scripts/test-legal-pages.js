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

const debug = (...args) => {
  if (process.env.NODE_ENV !== 'production') console.log(...args);
};

async function testLegalPages() {
  debug('Testing legal pages...\n');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!');
    debug('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    debug('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
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
    
    debug(`Found ${allPages.length} legal pages:`);
    allPages.forEach(page => {
      debug(`- ${page.slug}: ${page.title}`);
    });
    
    // Test 2: Test specific pages
    const testSlugs = ['privacy', 'terms', 'cookie-policy'];
    
    for (const slug of testSlugs) {
      debug(`\nTesting ${slug}...`);
      const { data: page, error } = await supabase
        .from('legal_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        console.error(`Error fetching ${slug}:`, error);
      } else if (page) {
        debug(`✓ ${slug} found: ${page.title}`);
      } else {
        debug(`✗ ${slug} not found`);
      }
    }
    
    // Test 3: Test all-slugs page
    debug('\nTesting all-slugs page...');
    const { data: allSlugsPage, error: allSlugsError } = await supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', 'all-slugs')
      .single();
    
    if (allSlugsError) {
      console.error('Error fetching all-slugs page:', allSlugsError);
    } else if (allSlugsPage) {
      debug('✓ all-slugs page found');
      const markdown = allSlugsPage.body;
      debug('Body length:', markdown.length);
    } else {
      debug('✗ all-slugs page not found');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testLegalPages(); 