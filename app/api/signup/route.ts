import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function uuid() { return crypto.randomUUID(); }

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id, hashed_password")
    .eq("email", email)
    .maybeSingle();

  const hashed = await bcrypt.hash(password, 10);

  // A: User exists but no password yet → set password
  if (existing && !existing.hashed_password) {
    const { error: updErr } = await supabase
      .from("users")
      .update({ hashed_password: hashed })
      .eq("id", existing.id);

    if (updErr) {
      console.error("Set-password failed:", updErr);
      return NextResponse.json({ error: "set_password_error" }, { status: 500 });
    }

    await ensureProfile(existing.id, email);
    return NextResponse.json({ ok: true, setPassword: true });
  }

  // B: User exists and already has a password → reject
  if (existing) {
    return NextResponse.json(
      { exists: true, message: "Account already exists with password" },
      { status: 409 }
    );
  }

  // C: New user → insert and create profile
  const normalizedEmail = email.toLowerCase().trim();
  const username = normalizedEmail.split("@")[0];

  const { data: user, error } = await supabase
    .from("users")
    .insert(
      { email: normalizedEmail, hashed_password: hashed, username },
      { returning: "representation" }
    )
    .single();

  if (error) {
    console.error("Signup failed:", error.message);
    return NextResponse.json({ error: "signup_error" }, { status: 500 });
  }

  await ensureProfile(user.id, email);
  return NextResponse.json({ ok: true });
}

// helper: create profile if it doesn’t exist
async function ensureProfile(userId: string, email: string) {
  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!prof) {
    await supabase.from("profiles").insert({
      id: uuid(),
      user_id: userId,
      username: email.split("@")[0],
      avatar_url: null,
      bio: null,
    });
  }
}
