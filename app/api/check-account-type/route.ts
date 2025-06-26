import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log("=== CHECK ACCOUNT TYPE API ===");
    console.log("Email received:", email);

    if (!email) {
      console.log("No email provided");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Normalized email:", normalizedEmail);

    // Check if user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, hashed_password")
      .eq("email", normalizedEmail)
      .maybeSingle();

    console.log("Database query result:", { user: !!user, error, hasPassword: !!user?.hashed_password });

    if (error) {
      console.error("Error checking account type:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!user) {
      console.log("User doesn't exist");
      // User doesn't exist
      return NextResponse.json({ 
        exists: false,
        accountType: "none"
      });
    }

    // User exists, check if they have a password
    if (!user.hashed_password) {
      console.log("User exists but has no password - OAuth-only account");
      return NextResponse.json({ 
        exists: true,
        accountType: "oauth-only"
      });
    } else {
      console.log("User exists and has password - password-enabled account");
      return NextResponse.json({ 
        exists: true,
        accountType: "password-enabled"
      });
    }

  } catch (error) {
    console.error("Error in check-account-type:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 