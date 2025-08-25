import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  /**
   * Generate a JWT token for a user
   */
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'lc-helper-app',
      audience: 'lc-helper-users'
    });
  }

  /**
   * Verify a JWT token and return the payload
   */
  static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET),
        {
          issuer: 'lc-helper-app',
          audience: 'lc-helper-users'
        }
      );
      
      return payload as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode a JWT token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Refresh a token if it's close to expiring
   */
  static shouldRefreshToken(token: string, thresholdMinutes: number = 60): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const thresholdSeconds = thresholdMinutes * 60;
      
      return decoded.exp - currentTime < thresholdSeconds;
    } catch (error) {
      return true;
    }
  }
}
