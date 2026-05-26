const sql = require('mssql');

const config = {
  server: 'localhost',
  port: 1433,
  database: 'AetherPlant',
  user: 'saa',
  password: '1234',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function checkSchema() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected to database AetherPlant');

    // Get columns of ThongBao
    const thongBaoCols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'ThongBao'
    `);
    console.log('\nColumns of ThongBao table:');
    thongBaoCols.recordset.forEach(c => {
      console.log(`  - ${c.COLUMN_NAME} (${c.DATA_TYPE})`);
    });

    // Sample record
    const sample = await pool.request().query(`SELECT TOP 1 * FROM ThongBao`);
    console.log('\nSample Notification Record:', sample.recordset[0]);

    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
}

checkSchema();
