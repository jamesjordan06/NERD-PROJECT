"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import ProfileView from "../../../components/ProfileView";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProfilePageClient() {
  const { userId } = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ threads: 0, replies: 0 });
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);

      // 1) Get NextAuth session
      const session = await getSession();
      console.log('ProfilePage session', session);
      if (!session || !session.user?.id) {
        router.replace("/login");
        return;
      }

      setSession(session);
      const currentUserId = session.user.id;
      setSessionUserId(currentUserId);

      // 2) Resolve "me" → real ID
      const targetId = userId === "me" ? currentUserId : userId;

      // 3) Try to get profile by user_id
      console.log('Looking for profile with user_id:', targetId);
      let { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, user_id, username, avatar_url, bio")
        .eq("user_id", targetId)
        .maybeSingle();
      if (profErr) {
        console.error('Profile fetch error', profErr);
      }
      console.log('Fetched profile result:', { prof, profErr });

      if (!prof && targetId === currentUserId) {
        console.log('Attempting to create profile for user:', targetId);
        
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
          console.error('Profile create error details:', {
            message: insertErr.message,
            code: insertErr.code,
            details: insertErr.details,
            hint: insertErr.hint
          });
          
          // If it's a unique constraint violation, try to fetch the existing profile
          if (insertErr.code === '23505') {
            console.log('Profile already exists, fetching existing profile...');
            const { data: existingProf, error: fetchErr } = await supabase
              .from("profiles")
              .select("id, user_id, username, avatar_url, bio")
              .eq("user_id", targetId)
              .single();
              
            if (fetchErr) {
              console.error('Error fetching existing profile:', fetchErr);
            } else {
              console.log('Found existing profile:', existingProf);
              prof = existingProf;
            }
          }
        } else {
          console.log('Created new profile:', newProf);
          prof = newProf;
        }
      }

      if (!prof || profErr) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(prof);

      // 4) Fetch stats
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

      setStats({
        threads: threadCount ?? 0,
        replies: replyCount ?? 0,
      });

      setLoading(false);
    })();
  }, [userId, router, supabase]);

  if (loading) return <p className="p-6 text-center">Loading…</p>;
  if (!profile) return <p className="p-6 text-center">Profile not found.</p>;

  return (
    <ProfileView
      profile={profile}
      stats={stats}
      isOwnProfile={profile.user_id === sessionUserId}
      user={session?.user}
    />
  );
}
