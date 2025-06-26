import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get total posts count
    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    // Get published posts count
    const { count: publishedPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("published", true);

    // Get draft posts count (not published and no publish_at date)
    const { count: draftPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("published", false)
      .is("publish_at", null);

    // Get scheduled posts count (has publish_at date but not published)
    const { count: scheduledPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("published", false)
      .not("publish_at", "is", null);

    // Get total views and likes
    const { data: statsData } = await supabase
      .from("posts")
      .select("views, likes");

    const totalViews = statsData?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
    const totalLikes = statsData?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0;

    const stats = {
      totalPosts: totalPosts || 0,
      publishedPosts: publishedPosts || 0,
      draftPosts: draftPosts || 0,
      scheduledPosts: scheduledPosts || 0,
      totalViews,
      totalLikes
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 