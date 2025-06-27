import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, hashed_password")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Send-set-password lookup error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json(
      { error: "No user found with this email" },
      { status: 404 }
    );
  }

  if (user.hashed_password) {
    return NextResponse.json(
      { error: "User already has a password" },
      { status: 400 }
    );
  }

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await supabase
      .from("verification_tokens")
      .delete()
      .eq("identifier", `set-password:${user.id}`);

    await supabase.from("verification_tokens").insert({
      identifier: `set-password:${user.id}`,
      token,
      expires: expires.toISOString(),
    });

    const site =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nerd-project.vercel.app";
    const link = `${site}/set-password?token=${token}`;

    await resend.emails.send({
      from: "Interstellar Nerd <noreply@interstellarnerd.com>",
      to: email,
      subject: "Complete Your Account Setup",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Set Your Password for Interstellar Nerd</h2>
          <p>Hey there!</p>
          <p>You originally signed up using Google. To enable login with your email and password, you’ll need to set a password.</p>
          <p>Click the button below to set your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Set Password</a>
          </div>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <p style="color: #888;">— The Interstellar Nerd Team 🚀</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Send-set-password email error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
