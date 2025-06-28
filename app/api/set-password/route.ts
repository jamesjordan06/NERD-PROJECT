import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession({
      ...authOptions,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { password } = await req.json().catch(() => ({}));

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error: updateErr } = await supabase
      .from("users")
      .update({ hashed_password: hashed, has_password: true })
      .eq("id", session.user.id);

    if (updateErr) {
      console.error("Error updating password:", updateErr);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in set-password route:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
