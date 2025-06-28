// app/profile/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import ProfileView from "../../components/ProfileView";
import ChangeUsernameForm from "../../components/ChangeUsernameForm";
import crypto from "crypto";

export default async function ProfilePage() {
  const session = await getServerSession({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const userId = session!.user.id;

  // Try to fetch the profile
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) console.error("Error fetching profile:", error.message);

  if (!profile) {
    const { data: newProf, error: insertErr } = await supabase
      .from("profiles")
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        username: "user_" + Math.random().toString(36).substring(2, 10),
        bio: "",
        avatar_url: "",
      })
      .select("id, username, avatar_url, bio")
      .single();

    if (insertErr) {
      console.error("Server profile insert error", insertErr);
    }

    profile = newProf ?? null;
  }

  if (!profile) {
    return <p className="p-6 text-center">Unable to load profile.</p>;
  }

  // Fetch stats
  const [{ count: threadCount }, { count: replyCount }] = await Promise.all([
    supabase
      .from("threads")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("replies")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", userId),
  ]);

  return (
    <>
      <ProfileView
        profile={profile}
        stats={{ threads: threadCount ?? 0, replies: replyCount ?? 0 }}
        isOwnProfile={true}
        user={session.user}
      />
      
    </>
  );
}
