import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data } = await supabase
    .from("password_reset_tokens")
    .select("user_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!data || new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, user_id: data.user_id });
}
