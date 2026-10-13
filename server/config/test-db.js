const { pool, testConnection } = require('./db');

async function run() {
  console.log('Testing MySQL Connection with settings from .env...');
  const success = await testConnection();
  if (success) {
    try {
      const [tables] = await pool.query('SHOW TABLES;');
      console.log('Found tables in database:');
      console.table(tables);
    } catch (err) {
      console.error('Error fetching tables:', err.message);
    }
  }
  process.exit(success ? 0 : 1);
}

run();
