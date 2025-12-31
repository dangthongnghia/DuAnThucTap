import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "easyfin-secret-key-2024";

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

/**
 * POST /api/auth/google - Đăng nhập/đăng ký bằng Google
 * Hỗ trợ Web (credential) và Mobile (idToken/accessToken)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // credential: từ Web (GSI)
    // idToken: từ Mobile (React Native)
    // accessToken: từ Mobile hoặc OAuth flow truyền thống
    const { accessToken, credential, idToken } = body;

    let googleUser: GoogleUserInfo | null = null;
    const idTokenToVerify = credential || idToken;

    // Cách 1: Xác thực ID Token (Khuyên dùng cho cả Web & Mobile)
    if (idTokenToVerify) {
      // Gọi Google để verify token thay vì decode local (bảo mật hơn)
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idTokenToVerify}`
      );

      if (!verifyRes.ok) {
        return NextResponse.json(
          { success: false, error: "Google ID Token không hợp lệ" },
          { status: 401 }
        );
      }

      const payload = await verifyRes.json();
      
      // Kiểm tra audience (client_id) nếu cần thiết để tăng bảo mật
      // if (payload.aud !== process.env.GOOGLE_CLIENT_ID) ...

      googleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified === "true" || payload.email_verified === true,
      };
    }
    // Cách 2: Sử dụng Access Token
    else if (accessToken) {
      const googleResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!googleResponse.ok) {
        return NextResponse.json(
          { success: false, error: "Token Google không hợp lệ" },
          { status: 401 }
        );
      }

      const rawUser = await googleResponse.json();
      googleUser = {
        email: rawUser.email,
        name: rawUser.name,
        picture: rawUser.picture,
        email_verified: rawUser.verified_email,
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp idToken hoặc accessToken" },
        { status: 400 }
      );
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { success: false, error: "Không thể lấy email từ Google" },
        { status: 400 }
      );
    }

    // Tìm hoặc tạo user trong DB
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (!user) {
      // Tạo user mới
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          password: "", // Không cần password cho Google login
          name: googleUser.name || googleUser.email.split("@")[0],
          avatar: googleUser.picture,
          role: "user",
          isActive: true,
        },
      });

      // Tạo tài khoản mặc định
      await prisma.account.create({
        data: {
          userId: user.id,
          name: "Ví tiền mặt",
          type: "CASH",
          balance: 0,
          currency: "VND",
          icon: "💵",
          color: "#4CAF50",
        },
      });

      // Tạo thông báo chào mừng
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Chào mừng đến với EasyFin! 🎉",
          message: "Bắt đầu quản lý tài chính của bạn ngay hôm nay.",
          type: "INFO",
          category: "SYSTEM",
        },
      });
    } else {
      // Cập nhật avatar nếu chưa có
      if (!user.avatar && googleUser.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: googleUser.picture },
        });
        user.avatar = googleUser.picture;
      }
    }

    // Kiểm tra khóa tài khoản
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Tài khoản đã bị khóa" },
        { status: 403 }
      );
    }

    // Tạo JWT token của hệ thống
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi khi đăng nhập" },
      { status: 500 }
    );
  }
}
