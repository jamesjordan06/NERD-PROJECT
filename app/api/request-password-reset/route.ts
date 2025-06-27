import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
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
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // remove existing tokens for this user to avoid clutter
    await supabase.from("password_reset_tokens").delete().eq("user_id", user.id);

    const { error: insertErr } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertErr) {
      console.error("request-password-reset insert error:", insertErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nerd-project.vercel.app";
    const link = `${siteUrl}/set-password?token=${token}`;

    await resend.emails.send({
      from: "Interstellar Nerd <noreply@interstellarnerd.com>",
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Click <a href="${link}">here</a> to reset your password.</p>
        <p>This link will expire in 15 minutes.</p>
      `,
      text: `Reset your password using this link: ${link}\n\nThis link will expire in 15 minutes.`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("request-password-reset error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
