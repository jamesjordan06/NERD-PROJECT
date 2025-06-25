-- Clean up existing user data to allow fresh Google OAuth sign-in
-- This will delete the user with email 'jenkinsj251@gmail.com' and all related data

-- First, let's see what we're dealing with
SELECT 'Users with this email:' as info;
SELECT id, email, name, username, created_at FROM users WHERE email = 'jenkinsj251@gmail.com';

SELECT 'Accounts for this user:' as info;
SELECT a.id, a.provider, a.provider_account_id, a.user_id 
FROM accounts a 
JOIN users u ON a.user_id::uuid = u.id::uuid 
WHERE u.email = 'jenkinsj251@gmail.com';

SELECT 'Sessions for this user:' as info;
SELECT s.id, s.session_token, s.user_id, s.expires 
FROM sessions s 
JOIN users u ON s.user_id::uuid = u.id::uuid 
WHERE u.email = 'jenkinsj251@gmail.com';

SELECT 'Profiles for this user:' as info;
SELECT p.id, p.username, p.avatar_url, p.user_id 
FROM profiles p 
JOIN users u ON p.user_id::uuid = u.id::uuid 
WHERE u.email = 'jenkinsj251@gmail.com';

-- Now delete everything in the correct order (respecting foreign keys)
BEGIN;

-- Delete sessions first (they reference users)
DELETE FROM sessions 
WHERE user_id::uuid IN (SELECT id::uuid FROM users WHERE email = 'jenkinsj251@gmail.com');

-- Delete accounts (they reference users)
DELETE FROM accounts 
WHERE user_id::uuid IN (SELECT id::uuid FROM users WHERE email = 'jenkinsj251@gmail.com');

-- Delete profiles (they reference users)
DELETE FROM profiles 
WHERE user_id::uuid IN (SELECT id::uuid FROM users WHERE email = 'jenkinsj251@gmail.com');

-- Delete threads and comments (they reference users)
DELETE FROM comments 
WHERE author_id::uuid IN (SELECT id::uuid FROM users WHERE email = 'jenkinsj251@gmail.com');

DELETE FROM threads 
WHERE author_id::uuid IN (SELECT id::uuid FROM users WHERE email = 'jenkinsj251@gmail.com');

-- Finally delete the user
DELETE FROM users WHERE email = 'jenkinsj251@gmail.com';

COMMIT;

-- Verify the cleanup
SELECT 'After cleanup - Users with this email:' as info;
SELECT id, email, name, username, created_at FROM users WHERE email = 'jenkinsj251@gmail.com';

SELECT 'After cleanup - Accounts for this user:' as info;
SELECT a.id, a.provider, a.provider_account_id, a.user_id 
FROM accounts a 
JOIN users u ON a.user_id::uuid = u.id::uuid 
WHERE u.email = 'jenkinsj251@gmail.com'; 