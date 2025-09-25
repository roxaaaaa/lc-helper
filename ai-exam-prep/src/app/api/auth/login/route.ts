import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { JWTService } from '@/lib/jwt';
import { getDb, initDb } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started');
    // Initialize database if needed
    await initDb();
    
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = await getDb();
    let user;
    
    try {
      console.log('Querying database for user...');
      // Find user by email
      const result = await client.query(
        'SELECT id, email, password, firstName, lastName, school, year, createdAt FROM users WHERE email = $1', 
        [email]
      );
      user = result.rows[0];
      console.log('User found:', user ? 'Yes' : 'No');
    } finally {
      client.release();
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
          const token = await JWTService.generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
    console.log('Generated token:', token.substring(0, 20) + '...');

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

    // Set httpOnly auth cookie for middleware to read
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    console.log('Token set in cookie');

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}