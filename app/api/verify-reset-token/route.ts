import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token } = await req.json();

  console.log("🔐 Received token:", token);

  if (!token) {
    console.log("❌ No token provided");
    return NextResponse.json({ valid: false, reason: "missing_token" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("token, user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  console.log("🧾 Supabase result:", { data, error });
  console.log("🕒 Current time:", new Date());

  if (error || !data) {
    console.log("❌ Token not found");
    return NextResponse.json({ valid: false, reason: "not_found" }, { status: 401 });
  }

  const isExpired = new Date(data.expires_at) < new Date();
  if (isExpired) {
    console.log("⚠️ Token is expired:", data.expires_at);
    return NextResponse.json({ valid: false, reason: "expired" }, { status: 401 });
  }

  console.log("✅ Token is valid, user_id:", data.user_id);

  return NextResponse.json({ valid: true, user_id: data.user_id });
}
