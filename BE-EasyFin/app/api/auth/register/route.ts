import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

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
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

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
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: "user",
      },
    });

    // Tạo tài khoản mặc định cho user mới
    await prisma.account.create({
      data: {
        userId: newUser.id,
        name: "Ví tiền mặt",
        type: "CASH",
        balance: 0,
        currency: "VND",
        icon: "💵",
        color: "#4CAF50",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký thành công",
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            createdAt: newUser.createdAt,
          },
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
