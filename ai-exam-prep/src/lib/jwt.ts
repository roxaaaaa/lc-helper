import jwt from 'jsonwebtoken';
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

// Improved Edge Runtime detection
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge' ||
                     (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis);

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

    if (isEdgeRuntime) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const alg = 'HS256';
      
      return new SignJWT(standardizedPayload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
    } else {
      return jwt.sign(standardizedPayload, JWT_SECRET, {
        expiresIn: '7d'
      });
    }
  }

  /**
   * Verify a JWT token with improved error handling and validation
   */
  static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      let payload: any;

      if (isEdgeRuntime) {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload: josePayload } = await jwtVerify(token, secret);
        payload = josePayload;
      } else {
        payload = jwt.verify(token, JWT_SECRET);
      }

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