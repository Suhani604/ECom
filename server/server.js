import 'dotenv/config'
import express           from 'express'
import http              from 'http'
import cors              from 'cors'
import morgan            from 'morgan'
import path              from 'path'
import { fileURLToPath } from 'url'
import 'express-async-errors'

import connectDB         from './config/db.js'
import errorHandler      from './middlewares/errorHandler.js'
import { initSocket }    from './sockets/socketServer.js'

import authRoutes        from './routes/authRoutes.js'
import sellerRoutes      from './routes/sellerRoutes.js'
import adminRoutes       from './routes/adminRoutes.js'
import productRoutes     from './routes/productRoutes.js'
import orderRoutes       from './routes/orderRoutes.js'
import buyerRoutes       from './routes/buyerRoutes.js'
import categoryRoutes    from './routes/categoryRoutes.js'   // 🆕
import reviewRoutes from './routes/reviewRoutes.js'
import bannerRoutes from './routes/bannerRoutes.js'


const app    = express()
const server = http.createServer(app)
const PORT   = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

connectDB()
export const io = initSocket(server)

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://e-com-neon-kappa.vercel.app'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('dev'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🟢 API running' })
})

app.use('/api/auth',     authRoutes)
app.use('/api/seller',   sellerRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/buyer',    buyerRoutes)
app.use('/api/reviews', reviewRoutes)
// ...
app.use('/api/banners', bannerRoutes)
// server.js
app.use('/api/categories', categoryRoutes)   // ✅ was: /api

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` }))
app.use(errorHandler)

server.listen(PORT, () => {
  console.log(`\n🚀  Server: http://localhost:${PORT}`)
  console.log(`🔌  Socket.io: ws://localhost:${PORT}`)
  console.log(`📦  Env: ${process.env.NODE_ENV}\n`)
})

export default app