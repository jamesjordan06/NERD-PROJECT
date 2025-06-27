import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, hashed_password")
      .eq("email", email)
      .maybeSingle();

    if (!user || user.hashed_password) {
      return NextResponse.json({ error: "Invalid account" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from("users")
      .update({ hashed_password: hashed })
      .eq("id", user.id);

    if (error) {
      console.error("Set-password-unauth error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Set-password-unauth unexpected:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
