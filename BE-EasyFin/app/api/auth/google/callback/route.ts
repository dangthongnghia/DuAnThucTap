import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "easyfin-secret-key-2024";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

// Get base URL for redirect
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3001";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

/**
 * GET /api/auth/google/callback - Google OAuth callback
 * Xử lý callback từ Google sau khi user authorize
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // redirect_uri from mobile app
    const error = searchParams.get("error");

    // Handle error from Google
    if (error) {
      const redirectUri = state || "quanlytaichinh://login";
      return NextResponse.redirect(
        `${redirectUri}?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      const redirectUri = state || "quanlytaichinh://login";
      return NextResponse.redirect(
        `${redirectUri}?error=${encodeURIComponent("Không nhận được authorization code")}`
      );
    }

    const baseUrl = getBaseUrl(request);

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange error:", errorData);
      const redirectUri = state || "quanlytaichinh://login";
      return NextResponse.redirect(
        `${redirectUri}?error=${encodeURIComponent("Lỗi xác thực với Google")}`
      );
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!userResponse.ok) {
      const redirectUri = state || "quanlytaichinh://login";
      return NextResponse.redirect(
        `${redirectUri}?error=${encodeURIComponent("Không thể lấy thông tin người dùng")}`
      );
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    if (!googleUser.email) {
      const redirectUri = state || "quanlytaichinh://login";
      return NextResponse.redirect(
        `${redirectUri}?error=${encodeURIComponent("Không thể lấy email từ Google")}`
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          password: "", // No password for Google login
          name: googleUser.name || googleUser.email.split("@")[0],
          avatar: googleUser.picture,
          role: "user",
          isActive: true,
        },
      });

      // Create default account for new user
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

      // Create welcome notification
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
      // Update avatar if not set
      if (!user.avatar && googleUser.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: googleUser.picture },
        });
        user.avatar = googleUser.picture;
      }
    }

    // Check if account is active
    if (!user.isActive) {
      const redirectUri = state || "quanlytaichinh://login";
      return NextResponse.redirect(
        `${redirectUri}?error=${encodeURIComponent("Tài khoản đã bị khóa")}`
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    };

    // Redirect back to mobile app with token and user data
    const redirectUri = state || "quanlytaichinh://login";
    const params = new URLSearchParams({
      success: "true",
      token,
      user: JSON.stringify(userData),
    });

    return NextResponse.redirect(`${redirectUri}?${params.toString()}`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const redirectUri = "quanlytaichinh://login";
    return NextResponse.redirect(
      `${redirectUri}?error=${encodeURIComponent("Đã xảy ra lỗi khi đăng nhập")}`
    );
  }
}
