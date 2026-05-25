const sql = require('mssql');
require('dotenv').config({ path: './backend/.env' });

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: 'AetherPlant', // force target database
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
  }
};

console.log('Connecting to AWS Database to verify tables...');
console.log('Server:', config.server);

async function test() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected successfully!');
    
    // Check tables
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log('\nList of tables in AetherPlant database:');
    tablesResult.recordset.forEach(row => {
      console.log(`- ${row.TABLE_NAME}`);
    });
    
    // Check products count
    if (tablesResult.recordset.some(r => r.TABLE_NAME.toLowerCase() === 'sanpham')) {
      const countResult = await pool.request().query('SELECT COUNT(*) as cnt FROM SanPham');
      console.log(`\n📦 Total products in SanPham: ${countResult.recordset[0].cnt}`);
    } else {
      console.log('❌ Table SanPham NOT found!');
    }
    
    await sql.close();
  } catch (err) {
    console.error('❌ Error querying database:', err.message);
  }
}

test();
