import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secret key cho JWT (nên đặt trong .env)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Mock database - Thay thế bằng database thật trong production
const mockUsers = [
  // {
  //   id: "1",
  //   email: "admin@easyfin.com",
  //   password: "$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/6EzJMhMV5O3gCC", // password: "123456"
  //   name: "Admin User",
  //   role: "admin",
  // },
  // {
  //   id: "2",
  //   email: "user@easyfin.com",
  //   password: "$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/6EzJMhMV5O3gCC", // password: "123456"
  //   name: "Normal User",
  //   role: "user",
  // },
];

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
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        },
        { status: 401 }
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

    // Response thành công (không trả về password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: "Đăng nhập thành công",
        data: {
          user: userWithoutPassword,
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
