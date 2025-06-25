import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .update({ hashed_password: hashed })
      .eq("id", token.sub as string);

    if (error) {
      console.error("Error updating password:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Password set successfully for user ${token.sub}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in set-password route:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
