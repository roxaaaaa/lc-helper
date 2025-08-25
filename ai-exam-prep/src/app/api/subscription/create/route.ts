import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../../../../lib/jwt';
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

    // Verify the token
    const payload = await JWTService.verifyToken(token);
    
    // Get request body
    const { planId, paymentData } = await request.json();

    if (!planId || !paymentData) {
      return NextResponse.json(
        { message: 'Plan ID and payment data are required' },
        { status: 400 }
      );
    }

    const client = await getDb();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Get the subscription plan
      const planResult = await client.query(
        'SELECT * FROM subscription_plans WHERE id = $1 AND isActive = true',
        [planId]
      );
      
      if (planResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { message: 'Invalid subscription plan' },
          { status: 400 }
        );
      }
      
      const plan = planResult.rows[0];
      
      // Validate payment amount
      if (paymentData.amount !== plan.price) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { message: 'Payment amount does not match plan price' },
          { status: 400 }
        );
      }
      
      // Generate a mock transaction ID (in real implementation, integrate with payment processor)
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Record the payment
      await client.query(
        `INSERT INTO payment_history 
         (userId, planId, amount, currency, status, paymentMethod, transactionId) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          payload.userId,
          planId,
          plan.price,
          'USD',
          'completed',
          'credit_card',
          transactionId
        ]
      );
      
      // Calculate subscription end date
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.duration_months);
      
      // Update user subscription
      await client.query(
        `UPDATE users 
         SET subscriptionStatus = 'active', 
             subscriptionType = $1, 
             subscriptionEndDate = $2 
         WHERE id = $3`,
        [plan.name, subscriptionEndDate, payload.userId]
      );
      
      // Commit the transaction
      await client.query('COMMIT');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: 'Subscription created successfully',
      transactionId: IDBTransaction
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
