import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, subject, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate first name
    if (firstName.length > 50) {
      return NextResponse.json(
        { success: false, error: 'First name must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Validate last name
    if (lastName.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Last name must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate phone (optional)
    if (phone && phone.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be 20 characters or less' },
        { status: 400 }
      );
    }

    // Validate phone format (digits only if provided)
    if (phone && !/^\d+$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Phone number must contain only digits' },
        { status: 400 }
      );
    }

    // Validate subject
    if (subject.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Subject must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate message
    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Message must be 1000 characters or less' },
        { status: 400 }
      );
    }

    const client = await getDb();
    
    try {
      // Create contact_messages table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          subject VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert the contact message using parameterized query
      const insertResult = await client.query(
        'INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [firstName, lastName, email, phone || null, subject, message]
      );

      console.log('Contact message saved with ID:', insertResult.rows[0].id);

      return NextResponse.json(
        { success: true },
        { status: 201 }
      );

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
