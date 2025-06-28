import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const OFFENSIVE = [
  "admin",
  "mod",
  "fuck",
  "shit",
  "bitch",
  "nigger",
  "slut",
  "cunt",
];

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newUsername } = await req.json();
    const username = (newUsername || "").trim();

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    if (OFFENSIVE.some((w) => username.toLowerCase().includes(w))) {
      return NextResponse.json(
        { error: "Offensive term not allowed" },
        { status: 400 }
      );
    }

    // Check if the desired username is already taken in profiles table
    const { data: existing, error: fetchErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("user_id", token.sub as string)
      .maybeSingle();

    // Also ensure no other auth user already has this username
    const { data: existingUser, error: userFetchErr } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", token.sub as string)
      .maybeSingle();

    if (fetchErr || userFetchErr) {
      console.error("Check username error", fetchErr || userFetchErr);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    if (existing || existingUser) {
      return NextResponse.json({ error: "Username taken" }, { status: 409 });
    }

    // Update username in profiles table
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ username })
      .eq("user_id", token.sub as string);

    if (profileErr) {
      console.error("Update username error", profileErr);
      return NextResponse.json(
        { error: "Failed to update username" },
        { status: 500 }
      );
    }

    // Also update username in users table to keep both tables in sync
    const { data: updatedUser, error: userErr } = await supabase
      .from("users")
      .update({ username })
      .eq("id", token.sub as string)
      .select("id")
      .maybeSingle();

    if (userErr || !updatedUser) {
      console.error("Update auth user username error", userErr);
      return NextResponse.json(
        { error: "Failed to update username" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, username });
  } catch (err) {
    console.error("Change username route error", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
