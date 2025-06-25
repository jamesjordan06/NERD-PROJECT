import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  
  // Clear all NextAuth related cookies
  const response = NextResponse.json({ success: true });
  
  // Clear the session cookie
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('next-auth.csrf-token');
  response.cookies.delete('__Host-next-auth.csrf-token');
  response.cookies.delete('next-auth.callback-url');
  response.cookies.delete('__Secure-next-auth.callback-url');
  
  return response;
} 