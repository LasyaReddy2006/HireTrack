const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

/**
 * MySQL Connection Pool Configuration
 * 
 * Why use createPool instead of createConnection?
 * - createConnection creates a single connection that can drop, stall, or fail under concurrent requests.
 * - createPool manages a collection of reusable connections. When a request comes in,
 *   it borrows an available connection, runs the query, and releases it back to the pool.
 *   This avoids the high overhead of establishing a new TCP handshake for every HTTP request.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hiretrack',
  waitForConnections: true,
  connectionLimit: 10, // Max concurrent database connections
  queueLimit: 0        // Unlimited queue for waiting requests
});

/**
 * Helper function to test database connectivity on server startup
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected successfully to MySQL database:', process.env.DB_NAME || 'hiretrack');
    connection.release(); // Always release connection back to pool
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Error Code: ${error.code}`);
    console.log('\n💡 Quick Fix Tip:');
    console.log('   1. Ensure MySQL service is running (e.g. MySQL80 in Services).');
    console.log('   2. Verify DB_PASSWORD, DB_USER, and DB_NAME in server/.env');
    console.log('   3. Run database/schema.sql in MySQL Workbench or MySQL CLI to create the tables.\n');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
