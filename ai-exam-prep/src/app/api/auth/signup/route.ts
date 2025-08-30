import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { JWTService } from '@/lib/jwt';
import { getDb, initDb } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, school, year } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !school || !year) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const client = await getDb();
    let newUser;
    
    try {
      // Check if user already exists
      const existingUserResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      
      if (existingUserResult.rows.length > 0) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const insertResult = await client.query(
        'INSERT INTO users (firstName, lastName, email, password, school, year) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [firstName, lastName, email, hashedPassword, school, year]
      );

      newUser = insertResult.rows[0];
    } finally {
      client.release();
    }

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    });

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser;
    
    const response = NextResponse.json({
      message: 'User created successfully',
      token,
      user: userWithoutPassword
    }, { status: 201 });

    // Set httpOnly auth cookie for middleware to read
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 