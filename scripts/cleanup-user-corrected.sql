-- Corrected cleanup script to remove user with email 'jenkinsj251@gmail.com'
-- This only targets tables that actually exist

-- First, let's see what we're dealing with
SELECT 'Users with this email:' as info;
SELECT id, email, name, username, created_at FROM users WHERE email = 'jenkinsj251@gmail.com';

-- Get the user ID first
DO $$
DECLARE
    user_id_val TEXT;
BEGIN
    -- Get the user ID as text
    SELECT id INTO user_id_val FROM users WHERE email = 'jenkinsj251@gmail.com';
    
    IF user_id_val IS NOT NULL THEN
        RAISE NOTICE 'Found user with ID: %', user_id_val;
        
        -- Delete sessions (if table exists)
        DELETE FROM sessions WHERE user_id::TEXT = user_id_val;
        RAISE NOTICE 'Deleted sessions for user %', user_id_val;
        
        -- Delete accounts (if table exists)
        DELETE FROM accounts WHERE user_id::TEXT = user_id_val;
        RAISE NOTICE 'Deleted accounts for user %', user_id_val;
        
        -- Delete profiles (if table exists)
        DELETE FROM profiles WHERE user_id::TEXT = user_id_val;
        RAISE NOTICE 'Deleted profiles for user %', user_id_val;
        
        -- Finally delete the user
        DELETE FROM users WHERE id::TEXT = user_id_val;
        RAISE NOTICE 'Deleted user %', user_id_val;
        
    ELSE
        RAISE NOTICE 'No user found with email jenkinsj251@gmail.com';
    END IF;
END $$;

-- Verify the cleanup
SELECT 'After cleanup - Users with this email:' as info;
SELECT id, email, name, username, created_at FROM users WHERE email = 'jenkinsj251@gmail.com'; 