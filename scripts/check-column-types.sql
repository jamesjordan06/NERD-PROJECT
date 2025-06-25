-- Check the actual column types in the database
-- This will help us understand what type casting is needed

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'accounts', 'sessions', 'profiles', 'threads', 'comments')
AND column_name IN ('id', 'user_id', 'author_id')
ORDER BY table_name, column_name;

-- Also check for any existing users with the email
SELECT 'Current users with jenkinsj251@gmail.com:' as info;
SELECT id, email, name, username, created_at FROM users WHERE email = 'jenkinsj251@gmail.com'; 