import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession({
      ...authOptions,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get user's current hashed password
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("hashed_password")
      .eq("id", session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For Google OAuth users who don't have a password yet
    if (!user.hashed_password) {
      // Hash the new password and save it
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const { error: updateError } = await supabase
        .from("users")
        .update({ hashed_password: hashedPassword })
        .eq("id", session.user.id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
      }

      return NextResponse.json({ message: "Password set successfully" });
    }

    // For users with existing passwords, verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.hashed_password);
    
    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const { error: updateError } = await supabase
      .from("users")
      .update({ hashed_password: hashedPassword })
      .eq("id", session.user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 