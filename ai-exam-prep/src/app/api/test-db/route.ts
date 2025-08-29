import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Try to initialize the database
    await initDb();
    console.log('Database initialization successful');
    
    // Try to get a connection
    const client = await getDb();
    console.log('Database connection successful');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Query successful:', result.rows[0]);
    
    client.release();
    
    return NextResponse.json({
      message: 'Database connection successful',
      timestamp: result.rows[0].current_time
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
