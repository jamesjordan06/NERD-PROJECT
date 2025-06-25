import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("email", email)
    .maybeSingle();

  if (error || !data?.username) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ username: data.username });
}
