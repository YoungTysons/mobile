const fs = require('fs');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: 'master', // Kích hoạt kết nối vào master trước để tạo database
  user: process.env.DB_USER || 'saa',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function run() {
  // Kiểm tra cấu hình mật khẩu
  if (!config.password || config.password === '1234') {
    console.error('❌ LỖI: Vui lòng mở file backend/.env và nhập Mật khẩu AWS của bạn vào biến DB_PASSWORD trước khi chạy!');
    process.exit(1);
  }

  console.log('🚀 Bắt đầu kết nối đến AWS RDS SQL Server...');
  console.log(`Server: ${config.server}`);
  console.log(`User: ${config.user}`);

  let pool;
  try {
    // 1. Kết nối tới master db để tạo database AetherPlant
    pool = await sql.connect(config);
    console.log('✅ Đã kết nối thành công tới database master.');

    console.log('⏳ Đang tạo database AetherPlant nếu chưa tồn tại...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AetherPlant')
      BEGIN
          CREATE DATABASE AetherPlant;
          PRINT 'Database AetherPlant created.';
      END
      ELSE
      BEGIN
          PRINT 'Database AetherPlant already exists.';
      END
    `);
    console.log('✅ Đã hoàn tất kiểm tra/tạo database AetherPlant.');
    
    // Đóng pool hiện tại
    await pool.close();

    // 2. Kết nối trực tiếp vào database AetherPlant vừa tạo
    config.database = 'AetherPlant';
    pool = await sql.connect(config);
    console.log('✅ Đã kết nối thành công tới database AetherPlant.');

    // 3. Đọc file SQL schema & data
    const sqlPath = path.join(__dirname, '..', 'FullProjectDatabase.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Không tìm thấy file SQL tại đường dẫn: ${sqlPath}`);
    }

    console.log('📖 Đang đọc file FullProjectDatabase.sql...');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Tách các lô câu lệnh bằng chữ "GO" đứng riêng lẻ trên một dòng
    const rawQueries = sqlContent.split(/^\s*GO\s*$/gim);
    const cleanQueries = rawQueries
      .map(q => q.trim())
      .filter(q => {
        if (q.length === 0) return false;
        
        // Bỏ qua các lệnh USE và CREATE DATABASE ở đầu file vì chúng ta đã tạo và USE tự động rồi
        const lower = q.toLowerCase();
        if (lower.startsWith('use ') || lower.includes('create database aetherplant')) {
          return false;
        }
        return true;
      });

    console.log(`⚡ Tìm thấy ${cleanQueries.length} khối câu lệnh cần thực thi.`);
    console.log('⏳ Đang chạy import dữ liệu (vui lòng đợi, quá trình này mất khoảng 5-15 giây)...');

    // Chạy từng khối câu lệnh tuần tự
    for (let i = 0; i < cleanQueries.length; i++) {
      const query = cleanQueries[i];
      try {
        await pool.request().query(query);
        // In tiến trình
        const percent = Math.round(((i + 1) / cleanQueries.length) * 100);
        process.stdout.write(`\rProgress: ${percent}% (${i + 1}/${cleanQueries.length})`);
      } catch (err) {
        console.error(`\n❌ Lỗi tại khối câu lệnh số ${i + 1}:`);
        console.error(query.substring(0, 300) + '...');
        throw err;
      }
    }

    console.log('\n\n🎉 CHÚC MỪNG! Toàn bộ cơ sở dữ liệu đã được nạp lên AWS thành công rực rỡ!');
    console.log('💡 Bây giờ bạn có thể sửa file backend/.env dòng DB_NAME=master thành DB_NAME=AetherPlant để chạy server rồi.');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Có lỗi xảy ra trong quá trình khởi tạo:', err.message);
    if (pool) {
      try { await pool.close(); } catch (_) {}
    }
    process.exit(1);
  }
}

run();
