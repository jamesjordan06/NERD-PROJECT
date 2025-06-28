import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (userError || !user) {
    console.log("User lookup failed or not found for", email, userError);
    return NextResponse.json({ success: true }); // Don't reveal if user exists
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  console.log("🔑 Creating reset token", { token, user: user.id, expiresAt });

  const { error: insertError } = await supabase
    .from("password_reset_tokens")
    .insert([{ token, user_id: user.id, expires_at: expiresAt }]);

  if (insertError) {
    console.error("❌ Error inserting token:", insertError.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?token=${token}`;

  await resend.emails.send({
    from: "Interstellar Nerd <noreply@interstellarnerd.com>",
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Reset Your Password</h2>
        <p>Hey there!</p>
        <p>Click the button below to reset your password. This link is valid for 30 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p style="color: #888;">— The Interstellar Nerd Team 🚀</p>
      </div>
    `,
  });

  console.log("✉️ Sent reset email to", email, "with", resetUrl);

  return NextResponse.json({ success: true });
}