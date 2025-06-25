-- Step 1: Create the profiles table
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_key" ON "profiles"("username");

-- Step 3: Add foreign key constraint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; 