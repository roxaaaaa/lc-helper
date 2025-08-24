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
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        school TEXT NOT NULL,
        year TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}

// Close database pool
export async function closeDb() {
  await pool.end();
}
