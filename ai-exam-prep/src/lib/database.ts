import { Pool, PoolClient } from 'pg';

// Helper function to properly format connection string
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // If the connection string already contains encoded characters, use it as is
  if (connectionString.includes('%')) {
    return connectionString;
  }
  
  // Otherwise, try to parse and re-encode it properly
  try {
    const url = new URL(connectionString);
    // Re-encode the password if it contains special characters
    if (url.password) {
      url.password = encodeURIComponent(url.password);
    }
    return url.toString();
  } catch (error) {
    // If URL parsing fails, return the original string
    return connectionString;
  }
}

// Database connection pool
const pool = new Pool({
  // Use individual parameters if connection string fails
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Roksa10,,',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'project_test',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Get database connection
export async function getDb(): Promise<PoolClient> {
  try {
    return await pool.connect();
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    throw error;
  }
}

// Initialize database tables
export async function initDb() {
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
