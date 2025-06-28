import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token } = await req.json();
  console.log("🔐 Token received:", token);

  if (!token) {
    return NextResponse.json({ valid: false, reason: "missing_token" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("token, user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  console.log("📦 Query result:", { data, error });

  if (error || !data) {
    return NextResponse.json({ valid: false, reason: "not_found" }, { status: 401 });
  }

  const now = Date.now();
  const expiresAt = new Date(data.expires_at).getTime();

  if (expiresAt < now) {
    console.log("⚠️ Token expired:", data.expires_at);
    return NextResponse.json({ valid: false, reason: "expired" }, { status: 401 });
  }

  console.log("✅ Token is valid for user:", data.user_id);
  return NextResponse.json({ valid: true, user_id: data.user_id });
}