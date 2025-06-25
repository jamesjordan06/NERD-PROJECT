// This script provides the SQL commands to create the profiles table
// Run these commands in your Supabase SQL Editor

const sqlCommands = [
  // Create the profiles table
  `CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
  );`,

  // Create unique indexes
  `CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "profiles_username_key" ON "profiles"("username");`,

  // Add foreign key constraint
  `ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,

  // Create profiles for existing users
  `INSERT INTO "profiles" ("id", "user_id", "username", "avatar_url", "bio")
   SELECT 
     gen_random_uuid()::text as id,
     u.id as user_id,
     u.username,
     u.image as avatar_url,
     NULL as bio
   FROM "users" u
   WHERE NOT EXISTS (
     SELECT 1 FROM "profiles" p WHERE p.user_id = u.id
   );`
];

console.log('Run these SQL commands in your Supabase SQL Editor:');
console.log('==================================================');
sqlCommands.forEach((sql, index) => {
  console.log(`\n--- Command ${index + 1} ---`);
  console.log(sql);
});
console.log('\n==================================================');
console.log('After running these commands, the profiles table will be created and populated with existing users.'); 