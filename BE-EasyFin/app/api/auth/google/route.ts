import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "easyfin-secret-key-2024";

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

interface GoogleIdTokenPayload {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  sub: string;
}

/**
 * Decode Google ID Token (credential) without verification
 * In production, you should verify the token with Google's public keys
 */
function decodeGoogleIdToken(credential: string): GoogleIdTokenPayload | null {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * POST /api/auth/google - Đăng nhập/đăng ký bằng Google
 * Supports both access token and credential (ID token) methods
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, credential } = body;

    let googleUser: GoogleUserInfo | null = null;

    // Method 1: Using credential (ID token from Google Sign-In)
    if (credential) {
      const decoded = decodeGoogleIdToken(credential);
      if (!decoded || !decoded.email) {
        return NextResponse.json(
          { success: false, error: "Credential không hợp lệ" },
          { status: 401 }
        );
      }
      
      googleUser = {
        id: decoded.sub,
        email: decoded.email,
        verified_email: decoded.email_verified,
        name: decoded.name,
        given_name: decoded.name?.split(" ")[0] || "",
        family_name: decoded.name?.split(" ").slice(1).join(" ") || "",
        picture: decoded.picture,
      };
    }
    // Method 2: Using access token
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

      googleUser = await googleResponse.json();
    } else {
      return NextResponse.json(
        { success: false, error: "Access token hoặc credential là bắt buộc" },
        { status: 400 }
      );
    }

    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { success: false, error: "Không thể lấy email từ Google" },
        { status: 400 }
      );
    }

    // Tìm hoặc tạo user
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

      // Tạo tài khoản mặc định cho user mới
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

    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Tài khoản đã bị khóa" },
        { status: 403 }
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
