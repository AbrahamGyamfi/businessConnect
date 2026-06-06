import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { auth } from './auth'
import { pool } from './db'
import categoriesRouter from './routes/categories'
import businessesRouter from './routes/businesses'
import jobsRouter from './routes/jobs'
import eventsRouter from './routes/events'
import bookingsRouter from './routes/bookings'
import membersRouter from './routes/members'
import adminRouter from './routes/admin'
import uploadRouter from './routes/upload'
import statsRouter from './routes/stats'
import reviewsRouter from './routes/reviews'
import inquiriesRouter from './routes/inquiries'

const app = express()
const PORT = process.env.PORT ?? 4000
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? '/tmp/uploads'

// Run init.sql on startup (idempotent — all statements use IF NOT EXISTS)
async function initDb() {
  const sqlPath = path.join(__dirname, '../../init.sql')
  if (fs.existsSync(sqlPath)) {
    const sql = fs.readFileSync(sqlPath, 'utf8')
    const client = await pool.connect()
    try { await client.query(sql) } catch (e) { console.error('DB init error:', e) } finally { client.release() }
    console.log('DB initialized')
  }
}

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use('/uploads', express.static(UPLOADS_DIR))

// Auth — better-auth handles its own routes
app.all('/api/auth/*', async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const headers = new Headers(req.headers as Record<string, string>)
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
  const response = await auth.handler(new Request(url.toString(), { method: req.method, headers, body }))
  res.status(response.status)
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.send(await response.text())
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/upload', uploadRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/businesses', businessesRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/members', membersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/stats', statsRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/inquiries', inquiriesRouter)

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
