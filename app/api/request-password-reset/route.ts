import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, link } = await req.json();

    if (
      !email ||
      !link ||
      typeof email !== "string" ||
      typeof link !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing email or link" },
        { status: 400 },
      );
    }

    try {
      await resend.emails.send({
        from: "Interstellar Nerd <noreply@interstellarnerd.com>",
        to: email,
        subject: "Reset Your Password",
        html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
        text: `Reset your password using this link: ${link}`,
        disableLinkTracking: true,
      });
    } catch (err) {
      console.error("request-password-reset email error:", err);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("request-password-reset unexpected error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
