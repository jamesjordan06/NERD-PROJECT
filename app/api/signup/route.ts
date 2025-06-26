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
    .select("id, hashed_password, username")
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

    await ensureProfile(existing.id, email, existing.username);
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
  
  // Generate a random username
  const generateRandomUsername = () => {
    const adjectives = ['swift', 'bright', 'cosmic', 'stellar', 'lunar', 'solar', 'neon', 'cyber', 'quantum', 'nebula', 'pulsar', 'nova', 'galaxy', 'orbit', 'cosmos', 'astro', 'lunar', 'solar', 'cosmic', 'stellar'];
    const nouns = ['star', 'pilot', 'explorer', 'voyager', 'traveler', 'wanderer', 'seeker', 'finder', 'discoverer', 'creator', 'builder', 'maker', 'dreamer', 'thinker', 'adventurer', 'hero', 'legend', 'champion', 'warrior', 'knight'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    
    return `${randomAdjective}_${randomNoun}_${randomNumber}`;
  };
  
  // Generate a unique username
  let username = generateRandomUsername();
  let attempts = 0;
  const maxAttempts = 10;
  
  // Check if username exists and generate a unique one
  while (attempts < maxAttempts) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    
    if (!existingUser) break;
    
    username = generateRandomUsername();
    attempts++;
  }

  const userId = uuid(); // Generate ID since database doesn't have default

  const { error: insertErr } = await supabase
    .from("users")
    .insert({
      id: userId,
      email: normalizedEmail,
      hashed_password: hashed,
      username,
    });

  if (insertErr) {
    console.error("Signup insert failed:", insertErr.message);
    console.error("Insert error details:", insertErr);
    console.error("Attempted to insert:", { id: userId, email: normalizedEmail, username });
    return NextResponse.json({ error: "signup_insert_error" }, { status: 500 });
  }

  console.log("User created successfully:", { userId, email: normalizedEmail, username });

  await ensureProfile(userId, normalizedEmail, username);
  console.log("Profile creation completed");
  return NextResponse.json({ ok: true });
}

// helper: create profile if it doesn't exist
async function ensureProfile(userId: string, email: string, username: string) {
  console.log("Ensuring profile for user:", { userId, email, username });
  
  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!prof) {
    console.log("Creating new profile for user:", userId);
    const { error } = await supabase.from("profiles").insert({
      id: uuid(),
      user_id: userId,
      username: username,
      avatar_url: null,
      bio: null,
    });
    
    if (error) {
      console.error("Profile creation error:", error);
      console.error("Profile creation error details:", error);
    } else {
      console.log("Profile created successfully for user:", userId);
    }
  } else {
    console.log("Profile already exists for user:", userId);
  }
}
