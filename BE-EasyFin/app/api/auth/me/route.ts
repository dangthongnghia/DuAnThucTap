import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeader, verifyToken, JwtPayload } from "@/lib/auth";

// Mock database - Thay thế bằng database thật trong production
const mockUsers = [
  {
    id: "1",
    email: "admin@easyfin.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "user@easyfin.com",
    name: "Normal User",
    role: "user",
  },
];

export async function GET(request: NextRequest) {
  try {
    // Lấy token từ header
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

    // Verify token
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

    // Tìm user trong database
    const user = mockUsers.find((u) => u.id === payload.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy người dùng",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lấy thông tin thành công",
        data: {
          user,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi server",
      },
      { status: 500 }
    );
  }
}
