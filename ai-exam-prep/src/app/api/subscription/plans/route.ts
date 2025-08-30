import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const client = await getDb();
    let plans;
    
    try {
      const result = await client.query(
        'SELECT * FROM subscription_plans WHERE isActive = true ORDER BY price ASC'
      );
      plans = result.rows;
    } finally {
      client.release();
    }

    return NextResponse.json(plans);

  } catch (error) {
    console.error('Plans fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
