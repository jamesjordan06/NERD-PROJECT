import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    console.error("Token not found or DB error:", error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const now = new Date();
  const expiresAt = new Date(data.expires_at);

  if (expiresAt < now) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true, user_id: data.user_id });
}
