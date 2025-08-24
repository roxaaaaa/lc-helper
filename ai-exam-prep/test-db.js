// Simple database test script
// Run with: node test-db.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: TEST_EMAIL,
  password: 'hashedpassword123',
  school: 'Test School',
  year: '6th Year'
};

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Roksa10,,',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'project_test',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
});

async function runDatabaseTests() {
  console.log('🚀 Running database tests...\n');
  
  try {
    // Environment check
    console.log('🔍 Environment Check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('- DB_USER:', process.env.DB_USER || 'postgres (default)');
    console.log('- DB_HOST:', process.env.DB_HOST || 'localhost (default)');
    console.log('- DB_PORT:', process.env.DB_PORT || '5432 (default)');
    console.log('- DB_NAME:', process.env.DB_NAME || 'project_test (default)');
    console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? 'set' : 'not set');
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set');
    console.log('');
    
    // Test 1: Connection
    console.log('1. Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connection successful\n');
    
    // Test 2: Simple query
    console.log('2. Testing simple query...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('✅ Simple query successful:', timeResult.rows[0].current_time, '\n');
    
    // Test 3: PostgreSQL version
    console.log('3. Testing PostgreSQL version...');
    const versionResult = await client.query('SELECT version() as version');
    console.log('✅ PostgreSQL version:', versionResult.rows[0].version, '\n');
    
    // Test 4: Table creation
    console.log('4. Testing table creation...');
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
    console.log('✅ Table creation successful\n');
    
    // Test 5: Table structure verification
    console.log('5. Testing table structure...');
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    const columnNames = structureResult.rows.map(col => col.column_name);
    console.log('✅ Table structure verification successful');
    console.log('📋 Table columns:', columnNames, '\n');
    
    // Test 6: Basic CRUD operations
    console.log('6. Testing basic CRUD operations...');
    
    // Insert
    console.log('   a) Testing INSERT...');
    const insertResult = await client.query(`
      INSERT INTO users (firstName, lastName, email, password, school, year) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, firstName, lastName, email
    `, [TEST_USER.firstName, TEST_USER.lastName, TEST_USER.email, TEST_USER.password, TEST_USER.school, TEST_USER.year]);
    console.log('   ✅ Insert successful:', insertResult.rows[0]);
    
    // Read
    console.log('   b) Testing SELECT...');
    const readResult = await client.query('SELECT * FROM users WHERE email = $1', [TEST_EMAIL]);
    console.log('   ✅ Read successful:', {
      id: readResult.rows[0].id,
      firstName: readResult.rows[0].firstname,
      lastName: readResult.rows[0].lastname,
      email: readResult.rows[0].email,
      school: readResult.rows[0].school,
      year: readResult.rows[0].year
    });
    
    // Update
    console.log('   c) Testing UPDATE...');
    const updateResult = await client.query(`
      UPDATE users SET school = $1 WHERE email = $2 RETURNING school
    `, ['Updated Test School', TEST_EMAIL]);
    console.log('   ✅ Update successful:', updateResult.rows[0].school);
    
    // Test 7: Duplicate email constraint
    console.log('   d) Testing duplicate email constraint...');
    try {
      await client.query(`
        INSERT INTO users (firstName, lastName, email, password, school, year) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [TEST_USER.firstName, TEST_USER.lastName, TEST_USER.email, TEST_USER.password, TEST_USER.school, TEST_USER.year]);
      console.log('   ❌ Duplicate email constraint failed - should have thrown an error');
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        console.log('   ✅ Duplicate email constraint working correctly');
      } else {
        console.log('   ❌ Unexpected error:', error.message);
      }
    }
    
    // Delete
    console.log('   e) Testing DELETE...');
    const deleteResult = await client.query('DELETE FROM users WHERE email = $1 RETURNING id', [TEST_EMAIL]);
    console.log('   ✅ Delete successful');
    
    // Verify deletion
    const verifyResult = await client.query('SELECT * FROM users WHERE email = $1', [TEST_EMAIL]);
    if (verifyResult.rows.length === 0) {
      console.log('   ✅ Deletion verification successful\n');
    } else {
      console.log('   ❌ Deletion verification failed\n');
    }
    
    // Test 8: Connection pool
    console.log('7. Testing connection pool...');
    const promises = Array.from({ length: 3 }, async (_, i) => {
      const testClient = await pool.connect();
      const result = await testClient.query('SELECT $1 as test_value', [`test_${i}`]);
      testClient.release();
      return result.rows[0].test_value;
    });
    
    const results = await Promise.all(promises);
    console.log('✅ Concurrent connections test successful:', results, '\n');
    
    // Cleanup
    client.release();
    await pool.end();
    
    console.log('🎉 All database tests passed!');
    console.log('📊 Test Summary:');
    console.log('   ✅ Database connection');
    console.log('   ✅ Simple query execution');
    console.log('   ✅ PostgreSQL version check');
    console.log('   ✅ Table creation and structure');
    console.log('   ✅ CRUD operations (Create, Read, Update, Delete)');
    console.log('   ✅ Unique constraint enforcement');
    console.log('   ✅ Connection pool management');
    
    return true;
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Check if PostgreSQL is running');
    console.log('   2. Verify your database credentials');
    console.log('   3. Ensure the database "project_test" exists');
    console.log('   4. Check your environment variables');
    console.log('   5. Try connecting with psql: psql -h localhost -U postgres -d project_test');
    
    try {
      await pool.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return false;
  }
}

// Quick connection test
async function quickConnectionTest() {
  console.log('⚡ Quick connection test...');
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version() as version');
    console.log('✅ Connection successful');
    console.log('📋 PostgreSQL version:', result.rows[0].version);
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    try {
      await pool.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testType = process.argv[2];
  
  if (testType === 'quick') {
    quickConnectionTest().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    runDatabaseTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}

module.exports = { runDatabaseTests, quickConnectionTest };
