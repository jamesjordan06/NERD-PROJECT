import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "@resend/node";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("request-password-reset lookup error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from("password_reset_tokens").delete().eq("user_id", user.id);

    const { error: insertErr } = await supabase
      .from("password_reset_tokens")
      .insert({ user_id: user.id, token, expires_at: expiresAt });

    if (insertErr) {
      console.error("request-password-reset insert error:", insertErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://interstellarnerd.com";
    const link = `${site}/set-password?token=${token}`;

    try {
      await resend.emails.send({
        from: "Interstellar Nerd <noreply@interstellarnerd.com>",
        to: email,
        subject: "Reset Your Password",
        html: `
          <h1>Password Reset</h1>
          <p>We received a request to reset your password.</p>
          <p>Click the link below to choose a new password. This link expires in 15 minutes.</p>
          <p><a href="${link}">${link}</a></p>
        `,
        text: `Reset your password using this link: ${link}`,
      });
    } catch (err) {
      console.error("request-password-reset email error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("request-password-reset unexpected error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
