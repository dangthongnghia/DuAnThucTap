import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, handleCors } from './lib/cors';

export function middleware(request: NextRequest) {
  // Xử lý CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(request),
    });
  }

  // Thêm CORS headers cho response
  const response = NextResponse.next();
  const headers = corsHeaders(request);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};