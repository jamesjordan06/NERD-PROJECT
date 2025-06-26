import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const session = await getServerSession({
    ...authOptions,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from("users")
      .update({ hashed_password: hashed })
      .eq("id", session.user.id);

    if (error) {
      console.error("Error updating password:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in set-password route:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
