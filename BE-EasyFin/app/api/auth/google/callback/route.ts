import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || "easyfin-secret-key-2024";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // Đây là deep link của App
    const error = searchParams.get("error");

    const appRedirectUri = state || "easyfin-login://login";

    if (error || !code) {
        return NextResponse.redirect(`${appRedirectUri}?error=${encodeURIComponent(error || "No code returned")}`);
    }

    try {
        const googleClientId = process.env.GOOGLE_CLIENT_ID!;
        const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;

        // Xác định Callback URL (phải khớp với lúc gọi start)
        const host = request.headers.get("host");
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const backendBaseUrl = `${protocol}://${host}`;
        const callbackUrl = `${backendBaseUrl}/api/auth/google/callback`;

        // 1. Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: googleClientId,
                client_secret: googleClientSecret,
                code,
                grant_type: "authorization_code",
                redirect_uri: callbackUrl,
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Google Token Error:", tokens);
            return NextResponse.redirect(`${appRedirectUri}?error=${encodeURIComponent("Failed to exchange code")}`);
        }

        // 2. Get User Info
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userRes.ok) {
            return NextResponse.redirect(`${appRedirectUri}?error=${encodeURIComponent("Failed to get user info")}`);
        }

        const googleUser = await userRes.json();

        // 3. Find or Create User (Logic copied from POST route for consistency)
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email.toLowerCase() },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: googleUser.email.toLowerCase(),
                    password: "",
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
            if (!user.avatar && googleUser.picture) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { avatar: googleUser.picture },
                });
                user.avatar = googleUser.picture;
            }
        }

        if (!user.isActive) {
            return NextResponse.redirect(`${appRedirectUri}?error=${encodeURIComponent("Account is locked")}`);
        }

        // 4. Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Redirect back to App
        const userString = JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
        });

        return NextResponse.redirect(
            `${appRedirectUri}?success=true&token=${token}&user=${encodeURIComponent(userString)}`
        );

    } catch (error) {
        console.error("Callback Error:", error);
        return NextResponse.redirect(`${appRedirectUri}?error=${encodeURIComponent("Internal Server Error")}`);
    }
}
