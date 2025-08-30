import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { getDb } from '@/lib/database';

export async function DELETE(request: NextRequest) {
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
    
    // Delete user from database
    const client = await getDb();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Delete payment history first (due to foreign key constraint)
      await client.query(
        'DELETE FROM payment_history WHERE userId = $1',
        [payload.userId]
      );
      
      // Delete the user
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [payload.userId]
      );
      
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
