-- Function to update username in both users and profiles tables transactionally
-- Run this in Supabase SQL editor or via supabase.rpc('exec_sql')
CREATE OR REPLACE FUNCTION update_username(uid text, new_username text)
RETURNS void AS $$
BEGIN
    UPDATE profiles SET username = new_username WHERE user_id = uid;
    UPDATE users SET username = new_username WHERE id = uid;
END;
$$ LANGUAGE plpgsql;
