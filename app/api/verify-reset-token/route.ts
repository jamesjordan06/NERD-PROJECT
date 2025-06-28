import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token } = await req.json();
  console.log("🔐 Received token:", token);

  if (!token || typeof token !== "string") {
    console.log("❌ Missing or invalid token");
    return NextResponse.json({ valid: false, reason: "missing_token" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("token, user_id, expires_at")
    .eq("token", token.trim())
    .maybeSingle();

  console.log("🧾 DB response:", { data, error });
  console.log("🕒 Current time (UTC):", new Date().toISOString());

  if (error || !data) {
    console.log("❌ Token not found in database");
    return NextResponse.json({ valid: false, reason: "not_found" }, { status: 404 });
  }

  if (!data.expires_at) {
    console.log("❌ Missing expires_at field");
    return NextResponse.json({ valid: false, reason: "no_expiry" }, { status: 400 });
  }

  const now = new Date();
  const expiry = new Date(data.expires_at);
  const isExpired = expiry.getTime() < now.getTime();

  console.log("📅 Token expires at:", expiry.toISOString());
  console.log("⏳ Is expired?", isExpired);

  if (isExpired) {
    console.log("⚠️ Token is expired");
    return NextResponse.json({ valid: false, reason: "expired" }, { status: 401 });
  }

  console.log("✅ Token is valid for user:", data.user_id);
  return NextResponse.json({ valid: true, user_id: data.user_id });
}
