import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Secret key cho JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Email không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Tìm user trong database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        },
        { status: 401 }
      );
    }

    // Kiểm tra user có active không
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản đã bị vô hiệu hóa",
        },
        { status: 403 }
      );
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        },
        { status: 401 }
      );
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Đăng nhập thành công",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt,
          },
          accessToken: token,
          refreshToken: refreshToken,
          expiresIn: JWT_EXPIRES_IN,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi server",
      },
      { status: 500 }
    );
  }
}
