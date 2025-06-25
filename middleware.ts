// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function middleware(req: NextRequest) {
  // Skip middleware for JWT sessions - all user data is in the token
  return NextResponse.next();
  
  // const token = await getToken({ req });

  // // Skip middleware for API routes, static files, and set-password page
  // if (
  //   req.nextUrl.pathname.startsWith("/api") ||
  //   req.nextUrl.pathname.startsWith("/_next") ||
  //   req.nextUrl.pathname.startsWith("/set-password") ||
  //   req.nextUrl.pathname.startsWith("/clear-session") ||
  //   req.nextUrl.pathname.startsWith("/favicon.ico")
  // ) {
  //   return NextResponse.next();
  // }

  // // Only check for users who are authenticated
  // if (token?.id) {
  //   console.log('Middleware: Checking user', token.id);
    
  //   const { data: user, error } = await supabase
  //     .from("users")
  //     .select("hashed_password")
  //     .eq("id", token.id)
  //     .maybeSingle();

  //   if (error) {
  //     console.error('Middleware: Database error:', error);
  //     // If there's a database error, allow the request to continue
  //     return NextResponse.next();
  //   }

  //   // If user doesn't exist in database, clear the session
  //   if (!user) {
  //     console.log('Middleware: User not found in database, redirecting to clear session');
  //     const url = req.nextUrl.clone();
  //     url.pathname = "/clear-session";
  //     return NextResponse.redirect(url);
  //   }

  //   // Skip password check for OAuth users - they don't need passwords
  //   // if (!user.hashed_password) {
  //   //   console.log('Middleware: User has no password, redirecting to set-password');
  //   //   const url = req.nextUrl.clone();
  //   //   url.pathname = "/set-password";
  //   //   return NextResponse.redirect(url);
  //   // }
  // }

  // return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"], // optional: exclude more if needed
};
