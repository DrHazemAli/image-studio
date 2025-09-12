import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAuthToken, getUserInfo } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Verify password
    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Get user info and create token
    const userInfo = getUserInfo();
    const token = createAuthToken(userInfo.userId);

    // Create response with token
    const response = NextResponse.json({
      success: true,
      token,
      user: userInfo,
    });

    // Set token in cookie for persistence across requests
    response.cookies.set("authToken", token, {
      path: "/",
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
