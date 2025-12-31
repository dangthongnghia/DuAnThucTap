import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || 'easyfin-login://login';

    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        return NextResponse.json(
            { error: "GOOGLE_CLIENT_ID is not defined" },
            { status: 500 }
        );
    }

    // Xác định Callback URL của Backend
    // Trên Vercel, dùng host header hoặc env
    const host = request.headers.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const backendBaseUrl = `${protocol}://${host}`;
    const callbackUrl = `${backendBaseUrl}/api/auth/google/callback`;

    // Tạo Google Auth URL
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ].join(" ");

    const params = new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: callbackUrl,
        response_type: "code",
        scope: scopes,
        access_type: "offline",
        prompt: "consent", // Force consent to ensure refresh token if needed
        state: redirectUri, // Truyền redirect URI của App qua state
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(url);
}
