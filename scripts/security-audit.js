const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

let issues = [];

function walk(dir, cb) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (['node_modules', '.git', '.next'].some(d => full.includes(d))) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb); else cb(full);
  }
}

function checkSensitiveEnvUsage() {
  const sensitive = ['SUPABASE_SERVICE_ROLE_KEY', 'NEXTAUTH_SECRET'];
  const bad = [];
  walk('.', file => {
    if (!/\.(js|ts|tsx)$/.test(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    for (const key of sensitive) {
      if (content.includes(`process.env.${key}`)) {
        if (file.startsWith('app/') && !file.startsWith('app/api')) {
          bad.push(`${file} -> ${key}`);
        }
      }
    }
  });
  if (bad.length) {
    issues.push('Sensitive env vars used outside API: ' + bad.join(', '));
  }
}

function verifyAuthCookies() {
  const file = path.join('lib', 'auth-options.ts');
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/cookies\s*:\s*{([\s\S]*?)}/m);
  if (match) {
    const block = match[1];
    if (!/secure:\s*true/.test(block) || !/httpOnly:\s*true/.test(block) || !/sameSite:\s*["']lax["']/.test(block)) {
      issues.push('authOptions.cookies missing secure settings');
    }
  } else {
    issues.push('authOptions.cookies not found');
  }
}

async function checkRls() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;
    const client = createClient(url, key);
    const { data, error } = await client
      .from('pg_class')
      .select('relname,relrowsecurity')
      .match({ relkind: 'r' });
    if (error) throw error;
    const openTables = data.filter(t => !t.relrowsecurity).map(t => t.relname);
    if (openTables.length) issues.push('Tables without RLS: ' + openTables.join(', '));
  } catch (err) {
    issues.push('RLS check failed: ' + err.message);
  }
}

function checkHeaders() {
  const cfg = fs.readFileSync('next.config.js', 'utf8');
  const required = ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options'];
  for (const h of required) {
    if (!cfg.includes(h)) issues.push(`Security header ${h} missing in next.config.js`);
  }
}

function runNpmAudit() {
  try {
    const out = execSync('npm audit --json --production', { encoding: 'utf8' });
    const json = JSON.parse(out);
    const { critical = 0, high = 0 } = json.metadata.vulnerabilities || {};
    if (critical > 0) issues.push(`npm audit found ${critical} critical vulnerabilities`);
    if (high > 0) issues.push(`npm audit found ${high} high vulnerabilities`);
  } catch (err) {
    issues.push('npm audit failed');
  }
}

async function run() {
  checkSensitiveEnvUsage();
  verifyAuthCookies();
  await checkRls();
  checkHeaders();
  runNpmAudit();

  if (issues.length) {
    console.error('Security audit issues found:\n' + issues.join('\n'));
    process.exit(1);
  } else {
    console.log('Security audit passed');
  }
}

run();
