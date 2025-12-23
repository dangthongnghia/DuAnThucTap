import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://dangnghia.me',
  'https://admin.dangnghia.me',
  'http://localhost:3001',
  'http://localhost:8081',
];

export function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Kiểm tra origin có được phép không
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
    headers['Access-Control-Allow-Origin'] = origin || '*';
  }

  return headers;
}

export function handleCors(request: NextRequest) {
  // Xử lý preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(request),
    });
  }
  return null;
}