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
function isJWTPayload(payload: any): payload is JWTPayload {
  return (
    payload &&
    (typeof payload.userId === 'number' || typeof payload.userId === 'string') &&
    typeof payload.email === 'string' &&
    typeof payload.firstName === 'string' &&
    typeof payload.lastName === 'string'
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

  // ... other methods with improved Edge Runtime support
}