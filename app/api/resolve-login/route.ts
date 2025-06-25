// app/api/resolve-login/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service‐role client so we can look up usernames
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { login } = await request.json().catch(() => ({}));
  if (!login || typeof login !== "string") {
    return NextResponse.json({ error: "Missing login" }, { status: 400 });
  }

  let email = login.trim();

  // If it’s not an email, treat as username
  if (!email.includes("@")) {
    const { data: prof, error: profErr } = await admin
      .from("profiles")
      .select("id")
      .eq("username", email)
      .single();

    if (profErr || !prof?.id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the Auth user’s email
    const {
      data: { user },
      error: userErr,
    } = await admin.auth.admin.getUserById(prof.id);

    if (userErr || !user?.email) {
      return NextResponse.json({ error: "Cannot resolve email" }, { status: 500 });
    }
    email = user.email;
  }

  return NextResponse.json({ email });
}
