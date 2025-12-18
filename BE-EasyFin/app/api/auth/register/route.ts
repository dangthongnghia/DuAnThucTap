import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Mock database - Thay thế bằng database thật trong production
const mockUsers: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
}> = [];

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, mật khẩu và tên là bắt buộc",
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Tên phải có ít nhất 2 ký tự",
        },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email đã được sử dụng",
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: "user",
      createdAt: new Date(),
    };

    // Lưu vào database (mock)
    mockUsers.push(newUser);

    // Response thành công (không trả về password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký thành công",
        data: {
          user: userWithoutPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi server",
      },
      { status: 500 }
    );
  }
}
