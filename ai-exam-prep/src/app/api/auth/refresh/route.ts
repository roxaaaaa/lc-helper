import { NextRequest, NextResponse } from 'next/server';
import { JWTServiceEdge } from '../../../../lib/jwt-edge';
import { getDb } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies or headers
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify the current token
    const payload = await JWTServiceEdge.verifyToken(token);
    
    // Get fresh user data from database
    const client = await getDb();
    let user;
    
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
      user = result.rows[0];
    } finally {
      client.release();
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new token
    const newToken = await JWTServiceEdge.generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Return user data (without password) and new token
    const { password: _, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: userWithoutPassword
    });

    // Set new httpOnly auth cookie
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
