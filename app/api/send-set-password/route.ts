import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

  const { data: user, error } = await supabase
    .from("users")
    .select("id, hashed_password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Send-set-password lookup error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
  }

  if (user.hashed_password) {
    return NextResponse.json({ error: "User already has a password" }, { status: 400 });
  }

  try {
    const site =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nerd-project.vercel.app";
    const link = `${site}/set-password?email=${encodeURIComponent(email)}`;
    await resend.emails.send({
      from: "Interstellar Nerd <noreply@interstellarnerd.com>",
      to: email,
      subject: "Set Your Password for Interstellar Nerd",
      html: `
        <h1>Set Your Password</h1>
        <p>You signed up with Google OAuth but didn't create a password. Use the link below to set one now.</p>
        <p><a href="${link}">Set Password</a></p>
      `,
    });
  } catch (err) {
    console.error("Send-set-password email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
