import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const { data: tokenRow } = await supabase
    .from("password_reset_tokens")
    .select("user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const { error: updateErr } = await supabase
    .from("users")
    .update({ hashed_password: hashed })
    .eq("id", tokenRow.user_id);

  if (updateErr) {
    console.error("set-password-from-token update error:", updateErr);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }

  await supabase.from("password_reset_tokens").delete().eq("token", token);

  return NextResponse.json({ success: true });
}
