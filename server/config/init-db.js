const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Database Initialization Script
 * Reads schema.sql and runs all DDL & DML statements to prepare the MySQL database.
 * Run via: npm run init-db
 */
async function initializeDatabase() {
  console.log('🔄 Initializing HireTrack MySQL Database...');

  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  let connection;
  try {
    // 1. Connect to MySQL server (without specifying DB first)
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true // Allows executing multiple SQL statements from file
    });

    console.log(`✅ Connected to MySQL server at ${host}:${port}`);

    // 2. Read schema.sql file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // 3. Execute the schema statements
    console.log('⚡ Executing schema.sql statements...');
    await connection.query(schemaSql);

    console.log('🎉 Database and tables created successfully!');
    console.log('📋 Database: hiretrack');
    console.log('   - Users');
    console.log('   - Applications');
    console.log('   - JobListings (with sample placement openings)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:');
    console.error(`   ${error.message}`);
    console.log('\n💡 Please check:');
    console.log('   1. Is MySQL Server running on your computer?');
    console.log('   2. Did you set the correct DB_PASSWORD in server/.env?');
    console.log('   3. Alternatively, open MySQL Workbench and execute database/schema.sql manually.\n');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initializeDatabase();
