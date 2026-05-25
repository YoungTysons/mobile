const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───
app.use(cors())
app.use(express.json())

// ─── Routes ───
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/san-pham',  require('./routes/sanPham'))
app.use('/api/danh-muc',  require('./routes/danhMuc'))
app.use('/api/chatbot',   require('./routes/chatbot'))
app.use('/api/don-hang',  require('./routes/donHang'))
app.use('/api/nguoi-dung',require('./routes/nguoiDung'))
app.use('/api/danh-gia',  require('./routes/danhGia'))
app.use('/api/bai-viet',  require('./routes/baiViet'))
app.use('/api/kho',       require('./routes/kho'))
app.use('/api/ocr',       require('./routes/ocr'))
app.use('/api/thong-ke',  require('./routes/thongKe'))
app.use('/api/contact',   require('./routes/contact'))
app.use('/api/experts',   require('./routes/experts'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/thu-chi',   require('./routes/thuChi'))

// ─── Health check ───
app.get('/', (req, res) => {
  res.json({ message: '🌿 Aether API đang chạy!', version: '1.0.0' })
})

// ─── Start ───
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
})
