-- Add hashed_password column to users table
-- Run this in your Supabase SQL editor

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

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'hashed_password'; 