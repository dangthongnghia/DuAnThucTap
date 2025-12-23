import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token từ request header
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Lấy token từ Authorization header
 */
export function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Middleware để bảo vệ các route cần authentication
 * Hỗ trợ cả static routes và dynamic routes với params
 */
export function withAuth<T = unknown>(
  handler: (request: NextRequest, user: JwtPayload, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    const token = getTokenFromHeader(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token không được cung cấp",
        },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn",
        },
        { status: 401 }
      );
    }
    
    return handler(request, payload, context);
  };
}

/**
 * Middleware để bảo vệ các route cần role cụ thể
 * Hỗ trợ cả static routes và dynamic routes với params
 */
export function withRole<T = unknown>(
  roles: string[],
  handler: (request: NextRequest, user: JwtPayload, context?: T) => Promise<NextResponse>
) {
  return withAuth<T>(async (request: NextRequest, user: JwtPayload, context?: T) => {
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Bạn không có quyền truy cập",
        },
        { status: 403 }
      );
    }
    
    return handler(request, user, context);
  });
}
