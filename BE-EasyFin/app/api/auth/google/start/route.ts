import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

// Get base URL for redirect
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3001";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/**
 * GET /api/auth/google/start - Start Google OAuth flow
 * Redirect user to Google OAuth consent screen
 * 
 * Query params:
 * - redirect_uri: Deep link to redirect back to mobile app (default: quanlytaichinh://login)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobileRedirectUri = searchParams.get("redirect_uri") || "quanlytaichinh://login";
    
    const baseUrl = getBaseUrl(request);
    const callbackUrl = `${baseUrl}/api/auth/google/callback`;

    // Build Google OAuth URL
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");
    // Pass mobile redirect URI in state parameter
    googleAuthUrl.searchParams.set("state", mobileRedirectUri);

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("Google OAuth start error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể khởi tạo đăng nhập Google" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/google/start - Get Google OAuth URL without redirect
 * Returns the OAuth URL for mobile app to open in browser
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mobileRedirectUri = body.redirect_uri || "quanlytaichinh://login";
    
    const baseUrl = getBaseUrl(request);
    const callbackUrl = `${baseUrl}/api/auth/google/callback`;

    // Build Google OAuth URL
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", callbackUrl);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");
    googleAuthUrl.searchParams.set("state", mobileRedirectUri);

    return NextResponse.json({
      success: true,
      authUrl: googleAuthUrl.toString(),
    });
  } catch (error) {
    console.error("Google OAuth start error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể khởi tạo đăng nhập Google" },
      { status: 500 }
    );
  }
}
