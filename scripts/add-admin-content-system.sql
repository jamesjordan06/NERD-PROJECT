-- Add admin fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_urls TEXT[] DEFAULT '{}',
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    publish_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[] DEFAULT '{}',
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0
);

-- Create revisions table
CREATE TABLE IF NOT EXISTS revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_published_published_at ON posts(published, published_at);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_revisions_post_id ON revisions(post_id);
CREATE INDEX IF NOT EXISTS idx_revisions_author_id ON revisions(author_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- Add RLS policies for posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all posts
CREATE POLICY "Admins can read all posts" ON posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = posts.author_id 
            AND profiles.is_admin = TRUE
        )
    );

-- Allow admins to insert posts
CREATE POLICY "Admins can insert posts" ON posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = posts.author_id 
            AND profiles.is_admin = TRUE
        )
    );

-- Allow admins to update posts
CREATE POLICY "Admins can update posts" ON posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = posts.author_id 
            AND profiles.is_admin = TRUE
        )
    );

-- Allow admins to delete posts
CREATE POLICY "Admins can delete posts" ON posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = posts.author_id 
            AND profiles.is_admin = TRUE
        )
    );

-- Add RLS policies for revisions table
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all revisions
CREATE POLICY "Admins can read all revisions" ON revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = revisions.author_id 
            AND profiles.is_admin = TRUE
        )
    );

-- Allow admins to insert revisions
CREATE POLICY "Admins can insert revisions" ON revisions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = revisions.author_id 
            AND profiles.is_admin = TRUE
        )
    );

-- Add RLS policies for admin_sessions table
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own admin sessions
CREATE POLICY "Users can manage their admin sessions" ON admin_sessions
    FOR ALL USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a sample admin user (replace with your actual user ID)
-- UPDATE profiles SET is_admin = TRUE WHERE user_id = 'your-user-id-here';

-- Grant necessary permissions
GRANT ALL ON posts TO authenticated;
GRANT ALL ON revisions TO authenticated;
GRANT ALL ON admin_sessions TO authenticated; 