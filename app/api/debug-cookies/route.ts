import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== API DEBUG COOKIES ===');
  
  try {
    const cookies = request.cookies;
    const cookieList = cookies.getAll();
    
    console.log('Number of cookies:', cookieList.length);
    
    const allCookies: Record<string, string> = {};
    cookieList.forEach(cookie => {
      allCookies[cookie.name] = cookie.value;
      console.log(`Cookie: ${cookie.name} = ${cookie.value}`);
    });

    const response = {
      success: true,
      cookieCount: cookieList.length,
      cookies: allCookies,
      sessionToken: allCookies['next-auth.session-token'] || null,
      csrfToken: allCookies['next-auth.csrf-token'] || null,
      state: allCookies['next-auth.state'] || null
    };

    console.log('Response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in debug-cookies API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 