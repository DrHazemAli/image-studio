import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

/**
 * Extract token from request headers or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // First try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Fallback to cookie
  const cookieToken = request.cookies.get("authToken")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Verify authentication token from request
 */
export function verifyAuthToken(request: NextRequest): {
  valid: boolean;
  userId?: string;
} {
  const token = extractToken(request);

  if (!token) {
    return { valid: false };
  }

  return verifyToken(token);
}

/**
 * Middleware to protect routes that require authentication
 */
export function requireAuth(request: NextRequest): {
  authorized: boolean;
  userId?: string;
  error?: string;
} {
  const { valid, userId } = verifyAuthToken(request);

  if (!valid) {
    return {
      authorized: false,
      error: "Invalid or expired authentication token",
    };
  }

  return { authorized: true, userId };
}
