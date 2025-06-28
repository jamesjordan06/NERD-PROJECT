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
    return NextResponse.json({ success: true }); // Don't reveal if user exists
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min

  const { error: insertError } = await supabase.from("password_reset_tokens").insert([
    {
      token,
      user_id: user.id,
      expires_at: expiresAt,
    },
  ]);

  if (insertError) {
    console.error("❌ Error inserting token:", insertError.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/set-password?token=${token}`;

  await resend.emails.send({
    from: "Interstellar Nerd <noreply@interstellarnerd.com>",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return NextResponse.json({ success: true });
}