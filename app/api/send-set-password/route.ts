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
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color:#1a202c;">Welcome to Interstellar Nerd!</h2>
          <p>You signed up using Google OAuth but didn't set a password.</p>
          <p>Click the button below to finish setting up your account. This link expires in one hour.</p>
          <p style="text-align:center; margin: 30px 0;">
            <a href="${link}" style="display:inline-block;padding:10px 20px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:5px;">Set My Password</a>
          </p>
          <p>If you didn't request this email, you can safely ignore it.</p>
          <p style="margin-top:30px;">Thanks,<br/>The Interstellar Nerd Team</p>
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
