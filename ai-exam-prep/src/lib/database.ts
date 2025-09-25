import { Pool, PoolClient } from 'pg';


// Database connection configuration
const getDbConfig = () => {
  // In production (Vercel), use DATABASE_URL if available
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10, // Reduced for serverless
    };
  }

  // Fallback to individual parameters
  const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10, // Reduced for serverless
  };
};

// Database connection pool
const pool = new Pool(getDbConfig());

// Get database connection
export async function getDb(): Promise<PoolClient> {
  try {
    console.log('Attempting database connection...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Not set');
    
    const client = await pool.connect();
    console.log('Database connection successful');
    return client;
  } catch (err) {
    console.error('Database connection error:', err);
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      code: (err as any)?.code,
      detail: (err as any)?.detail,
      hint: (err as any)?.hint
    });
    throw err;
  }
}

// Initialize database tables
export async function initDb() {
  console.log('Initializing database...');
  const client = await getDb();
  try {
    // Create users table with subscription fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        school TEXT NOT NULL,
        year TEXT NOT NULL,
        trialStartDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        trialEndDate TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
        subscriptionStatus TEXT DEFAULT 'trial',
        subscriptionType TEXT DEFAULT NULL,
        subscriptionEndDate TIMESTAMP DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscription plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration_months INTEGER NOT NULL,
        features TEXT[] NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payment history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
        planId INTEGER REFERENCES subscription_plans(id),
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT NOT NULL,
        paymentMethod TEXT,
        transactionId TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default subscription plans if they don't exist
    await client.query(`
      INSERT INTO subscription_plans (name, price, duration_months, features) 
      VALUES 
        ('Monthly', 9.99, 1, ARRAY['Unlimited practice questions', 'Detailed explanations', 'Progress tracking', 'Mock exams']),
        ('Yearly', 99.99, 12, ARRAY['Unlimited practice questions', 'Detailed explanations', 'Progress tracking', 'Mock exams', 'Priority support', '2 months free'])
      ON CONFLICT DO NOTHING
    `);

  } finally {
    client.release();
  }
}

// Close database pool
export async function closeDb() {
  await pool.end();
}
