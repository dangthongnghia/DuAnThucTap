import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, handleCors } from './lib/cors';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Xử lý CORS preflight cho API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(request),
    });
  }

  // Thêm CORS headers cho API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    const headers = corsHeaders(request);
    
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/'],
};