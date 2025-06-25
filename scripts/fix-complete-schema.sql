-- Complete database schema fix for NextAuth
-- This script ensures all tables have the correct structure

-- First, let's see what tables currently exist
SELECT 'Current tables in database:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 1. Create or recreate users table with correct structure
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMP WITH TIME ZONE,
    image TEXT,
    username TEXT UNIQUE,
    hashed_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create or recreate accounts table with correct structure
DROP TABLE IF EXISTS accounts CASCADE;
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, provider_account_id)
);

-- 3. Create or recreate sessions table with correct structure
DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 4. Create or recreate verification_tokens table with correct structure
DROP TABLE IF EXISTS verification_tokens CASCADE;
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY(identifier, token)
);

-- 5. Create or recreate profiles table with correct structure
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider_account_id ON accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 7. Show the final table structures
SELECT 'Users table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Accounts table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position;

SELECT 'Sessions table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

SELECT 'Profiles table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 8. Verify the tables are accessible
SELECT 'Testing table access:' as info;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as accounts_count FROM accounts;
SELECT COUNT(*) as sessions_count FROM sessions;
SELECT COUNT(*) as profiles_count FROM profiles; 