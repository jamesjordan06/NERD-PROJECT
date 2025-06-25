-- Add missing columns to match Prisma schema
-- Run this in your Supabase SQL editor

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to users table';
    ELSE
        RAISE NOTICE 'created_at column already exists in users table';
    END IF;
END $$;

-- Add email_verified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added email_verified column to users table';
    ELSE
        RAISE NOTICE 'email_verified column already exists in users table';
    END IF;
END $$;

-- Add hashed_password column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hashed_password') THEN
        ALTER TABLE users ADD COLUMN hashed_password TEXT;
        RAISE NOTICE 'Added hashed_password column to users table';
    ELSE
        RAISE NOTICE 'hashed_password column already exists in users table';
    END IF;
END $$;

-- Verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 