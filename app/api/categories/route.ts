import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("categories")
    .select("name");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }

  return NextResponse.json({ categories: data?.map((c: any) => c.name) || [] });
}
