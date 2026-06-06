import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAuth } from '../middleware/requireAuth'

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? '/uploads'
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname).toLowerCase())
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

const router = Router()

router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' })
    return
  }
  res.json({ url: `/uploads/${req.file.filename}` })
})

export default router
