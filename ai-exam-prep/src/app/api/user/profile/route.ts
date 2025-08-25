import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../../../../lib/jwt';
import { getDb } from '../../../../lib/database';

export async function GET(request: NextRequest) {
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

    // Verify the token
    const payload = await JWTService.verifyToken(token);
    
    // Get user data from database
    const client = await getDb();
    let user;
    
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [payload.userId]
      );
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

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
