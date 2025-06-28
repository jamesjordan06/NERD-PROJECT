import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import ProfileView from "../../../components/ProfileView";
import { createClient } from "@supabase/supabase-js";

export default async function ProfilePage({ params }: { params: { userId: string } }) {
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

  const currentUserId = session.user.id;
  const targetId = params.userId === "me" ? currentUserId : params.userId;

  let { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, user_id, username, avatar_url, bio")
    .eq("user_id", targetId)
    .maybeSingle();

  if (!profile && targetId === currentUserId) {
    const { data: newProf, error: insertErr } = await supabase
      .from("profiles")
      .insert({
        user_id: targetId,
        username: "user_" + Math.random().toString(36).substring(2, 10),
        bio: "",
        avatar_url: "",
      })
      .select()
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") {
        const { data: existingProf } = await supabase
          .from("profiles")
          .select("id, user_id, username, avatar_url, bio")
          .eq("user_id", targetId)
          .single();
        profile = existingProf ?? null;
      }
    } else {
      profile = newProf;
    }
  }

  if (!profile || profErr) {
    return <p className="p-6 text-center">Profile not found.</p>;
  }

  const [{ count: threadCount }, { count: replyCount }] = await Promise.all([
    supabase
      .from("threads")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", targetId),
    supabase
      .from("replies")
      .select("id", { head: true, count: "exact" })
      .eq("user_id", targetId),
  ]);

  return (
    <ProfileView
      profile={profile}
      stats={{ threads: threadCount ?? 0, replies: replyCount ?? 0 }}
      isOwnProfile={profile.user_id === currentUserId}
      user={session.user}
    />
  );
}
