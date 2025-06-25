// app/api/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .upsert({ email, hashed_password: hashed }, { onConflict: "email" })
    .select()
    .single();

  if (error) {
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "signup_error" }, { status: 400 });
  }

  if (data?.id) {
    await supabase.from("profiles").upsert({ id: data.id }, { onConflict: "id" });
  }

  return NextResponse.json({ ok: true });
}
