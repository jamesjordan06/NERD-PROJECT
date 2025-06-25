-- Simple cleanup script to remove user with email 'jenkinsj251@gmail.com'
-- This handles UUID type casting properly

-- First, let's see what we're dealing with
SELECT 'Users with this email:' as info;
SELECT id, email, name, username, created_at FROM users WHERE email = 'jenkinsj251@gmail.com';

-- Get the user ID first
DO $$
DECLARE
    user_id_val UUID;
BEGIN
    -- Get the user ID and cast it to UUID
    SELECT id::UUID INTO user_id_val FROM users WHERE email = 'jenkinsj251@gmail.com';
    
    IF user_id_val IS NOT NULL THEN
        RAISE NOTICE 'Found user with ID: %', user_id_val;
        
        -- Delete sessions
        DELETE FROM sessions WHERE user_id = user_id_val;
        RAISE NOTICE 'Deleted sessions for user %', user_id_val;
        
        -- Delete accounts
        DELETE FROM accounts WHERE user_id = user_id_val;
        RAISE NOTICE 'Deleted accounts for user %', user_id_val;
        
        -- Delete profiles
        DELETE FROM profiles WHERE user_id = user_id_val;
        RAISE NOTICE 'Deleted profiles for user %', user_id_val;
        
        -- Delete comments
        DELETE FROM comments WHERE author_id = user_id_val;
        RAISE NOTICE 'Deleted comments for user %', user_id_val;
        
        -- Delete threads
        DELETE FROM threads WHERE author_id = user_id_val;
        RAISE NOTICE 'Deleted threads for user %', user_id_val;
        
        -- Finally delete the user
        DELETE FROM users WHERE id = user_id_val;
        RAISE NOTICE 'Deleted user %', user_id_val;
        
    ELSE
        RAISE NOTICE 'No user found with email jenkinsj251@gmail.com';
    END IF;
END $$;

-- Verify the cleanup
SELECT 'After cleanup - Users with this email:' as info;
SELECT id, email, name, username, created_at FROM users WHERE email = 'jenkinsj251@gmail.com'; 