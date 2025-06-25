import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Hardcoded list of files to import from the public `images` bucket
const files = [
  {
    name: "2293E5D0-A377-457E-8DCC-3AA22054BA89.png",
    prompt: "Homepage hero image of a mysterious galaxy",
  },
  {
    name: "065E17BA-5821-482B-B7DA-411CC16B5491.png",
    prompt: "Interstellar Nerd website logo",
  },
];

export async function POST() {
  try {
    // Create a server-side Supabase client using the user's cookies
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch the current session (may be null if not signed in)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Insert each file into the media_assets table
    for (const file of files) {
      // Build the public URL for this file
      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(file.name);

      const { error } = await supabase.from("media_assets").insert({
        file_name: file.name,
        url: data.publicUrl,
        prompt: file.prompt,
        created_by: session?.user.id ?? null,
        type: "uploaded",
      });

      if (error) throw error;
    }

    return NextResponse.json({ success: true, imported: files.length });
  } catch (err: any) {
    console.error("Image import failed", err);
    return NextResponse.json(
      { error: err.message ?? "Import failed" },
      { status: 500 }
    );
  }
}

// Allow triggering via GET as well as POST
export const GET = POST;

/* Example request:

fetch("/api/import-images", { method: "POST" })
  .then((res) => res.json())
  .then(console.log);

// or using curl:
// curl -X POST http://localhost:3000/api/import-images
*/
