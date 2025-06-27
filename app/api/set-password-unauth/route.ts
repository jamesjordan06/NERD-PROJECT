import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password too short" },
        { status: 400 }
      );
    }

    const { data: tokenRow } = await supabase
      .from("verification_tokens")
      .select("identifier, expires")
      .eq("token", token)
      .maybeSingle();

    if (
      !tokenRow ||
      !tokenRow.identifier.startsWith("set-password:") ||
      new Date(tokenRow.expires).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const userId = tokenRow.identifier.replace("set-password:", "");

    const { data: user } = await supabase
      .from("users")
      .select("id, hashed_password, email")
      .eq("id", userId)
      .maybeSingle();

    if (!user || user.hashed_password) {
      return NextResponse.json({ error: "Invalid account" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from("users")
      .update({ hashed_password: hashed })
      .eq("id", user.id);

    await supabase.from("verification_tokens").delete().eq("token", token);

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
