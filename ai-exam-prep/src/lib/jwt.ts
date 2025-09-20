import { jwtVerify, SignJWT } from 'jose';

// Secure secret handling
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    console.warn('Using default JWT secret - change in production!');
    return 'your-secret-key-change-in-production';
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();

// Note: Using jose library for both Edge and Node runtimes for consistency

export interface JWTPayload {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

// Type guard for payload validation
function isJWTPayload(payload: unknown): payload is JWTPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    ('userId' in payload) &&
    ('email' in payload) &&
    ('firstName' in payload) &&
    ('lastName' in payload) &&
    (typeof (payload as any).userId === 'number' || typeof (payload as any).userId === 'string') &&
    typeof (payload as any).email === 'string' &&
    typeof (payload as any).firstName === 'string' &&
    typeof (payload as any).lastName === 'string'
  );
}

export class JWTService {
  /**
   * Generate a JWT token for a user with standardized payload
   */
  static async generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    // Standardize payload across environments
    const standardizedPayload = {
      userId: Number(payload.userId),
      email: String(payload.email),
      firstName: String(payload.firstName),
      lastName: String(payload.lastName)
    };

    // Always use jose for consistency between Edge and Node runtimes
    const secret = new TextEncoder().encode(JWT_SECRET);
    const alg = 'HS256';
    
    return new SignJWT(standardizedPayload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
  }

  /**
   * Verify a JWT token with improved error handling and validation
   */
  static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Always use jose for consistency between Edge and Node runtimes
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Validate payload structure
      if (!isJWTPayload(payload)) {
        console.error('Invalid JWT payload structure:', payload);
        throw new Error('Invalid token payload');
      }

      // Convert types to match interface
      return {
        userId: Number(payload.userId),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        iat: payload.iat,
        exp: payload.exp
      };
    } catch (error) {
      console.error('JWT verification failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Check if a token should be refreshed based on its expiration time
   * Returns true if the token expires within the next 30 minutes
   */
  static shouldRefreshToken(token: string): boolean {
    try {
      // Decode the token without verification to check expiration
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true; // Invalid token format, should refresh
      }

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      
      if (!exp) {
        return true; // No expiration, should refresh
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = exp - now;
      const thirtyMinutes = 30 * 60; // 30 minutes in seconds

      // Refresh if token expires within 30 minutes
      return timeUntilExpiry <= thirtyMinutes;
    } catch (error) {
      console.error('Error checking token refresh:', error);
      return true; // If we can't parse the token, assume it needs refresh
    }
  }

  // ... other methods with improved Edge Runtime support
}