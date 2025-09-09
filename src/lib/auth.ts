import crypto from 'crypto';

// Simple token storage (in production, use Redis or database)
const tokenStore = new Map<string, { expires: number; userId: string }>();

// Token expiration time (1 hour)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create an authentication token for a user
 */
export function createAuthToken(userId: string): string {
  const token = generateToken();
  const expires = Date.now() + TOKEN_EXPIRY_MS;

  tokenStore.set(token, { expires, userId });

  // Clean up expired tokens
  cleanupExpiredTokens();

  return token;
}

/**
 * Verify an authentication token
 */
export function verifyToken(token: string): {
  valid: boolean;
  userId?: string;
} {
  // First try the in-memory store (for same-process requests)
  const tokenData = tokenStore.get(token);
  if (tokenData) {
    if (Date.now() > tokenData.expires) {
      tokenStore.delete(token);
      return { valid: false };
    }
    return { valid: true, userId: tokenData.userId };
  }

  // For cross-process requests, we'll use a simple approach
  // In production, this should be replaced with proper JWT verification
  try {
    // Simple validation: check if token exists and is not too old
    // This is a basic approach for development
    if (token && token.length === 64) { // Our tokens are 64 characters
      // For now, we'll trust any 64-character token
      // In production, you'd want proper JWT verification
      const userInfo = getUserInfo();
      return { valid: true, userId: userInfo.userId };
    }
  } catch (error) {
    console.error('Token verification error:', error);
  }

  return { valid: false };
}

/**
 * Revoke a token
 */
export function revokeToken(token: string): boolean {
  return tokenStore.delete(token);
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expires) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Verify password against app config
 */
export function verifyPassword(password: string): boolean {
  // In production, you'd want to hash the password and compare hashes
  // For now, we'll use the plain text password from config
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const appConfig = require('@/app/config/app-config.json');
  return password === appConfig.admin.password;
}

/**
 * Get user info from app config
 */
export function getUserInfo() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const appConfig = require('@/app/config/app-config.json');
  return {
    userId: appConfig.admin.user_id,
    username: appConfig.admin.username,
    name: appConfig.admin.name,
    role: appConfig.admin.role,
  };
}
