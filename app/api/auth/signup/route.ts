import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function uuid() {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const username = normalizedEmail.split("@")[0];
  const hashed = await bcrypt.hash(password, 10);

  // Does user already exist?
  const { data: existing } = await supabase
    .from("users")
    .select("id, hashed_password")
    .eq("email", normalizedEmail)
    .maybeSingle();

  // A) user exists & already has a password  → reject
  if (existing?.hashed_password) {
    return NextResponse.json(
      { error: "Account already exists" },
      { status: 409 }
    );
  }

  const userId = existing?.id || uuid();

  // B) user exists but no password (Google OAuth) → set password
  if (existing && !existing.hashed_password) {
    await supabase
      .from("users")
      .update({ hashed_password: hashed })
      .eq("id", userId);
  }

  // C) brand-new user → insert
  if (!existing) {
    await supabase.from("users").insert({
      id: userId,
      email: normalizedEmail,
      username,
      hashed_password: hashed,
    });
  }

  // Ensure profile row
  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!prof) {
    await supabase.from("profiles").insert({
      id: uuid(),
      user_id: userId,
      username,
      avatar_url: null,
      bio: null,
    });
  }

  // success → let client call signIn()
  return NextResponse.json({ ok: true });
}
