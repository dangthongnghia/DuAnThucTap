import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'https://dangnghia.me',
  'https://admin.dangnghia.me',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:8081',
  'http://10.0.2.2:3001',
  'http://10.0.2.2:3002',
  'http://172.28.192.1:3001',
  'http://172.28.192.1:3002',
];

export function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Cho phép tất cả origin trong development hoặc khi không có origin (mobile app)
  if (process.env.NODE_ENV !== 'production') {
    headers['Access-Control-Allow-Origin'] = origin || '*';
  } else if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (!origin) {
    // Mobile apps thường không gửi origin header
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Credentials'] = 'false';
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