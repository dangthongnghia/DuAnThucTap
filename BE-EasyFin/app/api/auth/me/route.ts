import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeader, verifyToken, JwtPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    if (!payload?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn",
        },
        { status: 401 }
      );
    }

    // Tìm user trong database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

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
