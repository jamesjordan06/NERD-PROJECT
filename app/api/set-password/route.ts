import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
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
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", tokenRow.user_id)
      .maybeSingle();

    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error: updateErr } = await supabase
      .from("users")
      .update({ hashed_password: hashed })
      .eq("id", tokenRow.user_id);

    if (updateErr) {
      console.error("Error updating password:", updateErr);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    await supabase.from("password_reset_tokens").delete().eq("token", token);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      `${req.headers.get("x-forwarded-proto") || "http"}://${req.headers.get(
        "host"
      )}`;

    const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
    const { csrfToken } = await csrfRes.json();

    const form = new URLSearchParams();
    form.set("csrfToken", csrfToken);
    form.set("email", user.email);
    form.set("password", password);
    form.set("json", "true");

    const callbackRes = await fetch(
      `${baseUrl}/api/auth/callback/credentials`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }
    );

    const signInData = await callbackRes.json();

    if (!callbackRes.ok || signInData.error) {
      console.error("Auto-login failed:", signInData);
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });
    const rawCookies = (callbackRes.headers as any).raw?.()["set-cookie"] as
      | string[]
      | undefined;
    if (rawCookies) {
      for (const cookie of rawCookies) {
        response.headers.append("set-cookie", cookie);
      }
    }

    return response;
  } catch (error) {
    console.error("Error in set-password route:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
