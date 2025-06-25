-- Fix the accounts table to match the Prisma schema
-- Add missing columns that are required by NextAuth

-- First, let's see the current structure
SELECT 'Current accounts table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add 'type' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'type'
    ) THEN
        ALTER TABLE accounts ADD COLUMN type VARCHAR(255);
        RAISE NOTICE 'Added type column to accounts table';
    ELSE
        RAISE NOTICE 'type column already exists';
    END IF;

    -- Add 'refresh_token' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'refresh_token'
    ) THEN
        ALTER TABLE accounts ADD COLUMN refresh_token TEXT;
        RAISE NOTICE 'Added refresh_token column to accounts table';
    ELSE
        RAISE NOTICE 'refresh_token column already exists';
    END IF;

    -- Add 'access_token' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'access_token'
    ) THEN
        ALTER TABLE accounts ADD COLUMN access_token TEXT;
        RAISE NOTICE 'Added access_token column to accounts table';
    ELSE
        RAISE NOTICE 'access_token column already exists';
    END IF;

    -- Add 'expires_at' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE accounts ADD COLUMN expires_at BIGINT;
        RAISE NOTICE 'Added expires_at column to accounts table';
    ELSE
        RAISE NOTICE 'expires_at column already exists';
    END IF;

    -- Add 'token_type' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'token_type'
    ) THEN
        ALTER TABLE accounts ADD COLUMN token_type VARCHAR(255);
        RAISE NOTICE 'Added token_type column to accounts table';
    ELSE
        RAISE NOTICE 'token_type column already exists';
    END IF;

    -- Add 'scope' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'scope'
    ) THEN
        ALTER TABLE accounts ADD COLUMN scope VARCHAR(255);
        RAISE NOTICE 'Added scope column to accounts table';
    ELSE
        RAISE NOTICE 'scope column already exists';
    END IF;

    -- Add 'id_token' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'id_token'
    ) THEN
        ALTER TABLE accounts ADD COLUMN id_token TEXT;
        RAISE NOTICE 'Added id_token column to accounts table';
    ELSE
        RAISE NOTICE 'id_token column already exists';
    END IF;

    -- Add 'session_state' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'session_state'
    ) THEN
        ALTER TABLE accounts ADD COLUMN session_state VARCHAR(255);
        RAISE NOTICE 'Added session_state column to accounts table';
    ELSE
        RAISE NOTICE 'session_state column already exists';
    END IF;

END $$;

-- Show the updated structure
SELECT 'Updated accounts table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position; 