import { Router } from 'express'
import { db } from '../db'
import { booking, business } from '../db/schema'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

// POST /api/bookings — create booking request (public)
router.post('/', async (req, res) => {
  try {
    const [b] = await db.insert(booking).values(req.body).returning()
    res.status(201).json(b)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// GET /api/bookings/unread-count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const bizes = await db.select({ id: business.id }).from(business).where(eq(business.userId, req.userId!))
    if (!bizes.length) { res.json({ count: 0 }); return }
    const ids = bizes.map((b) => b.id)
    const [r] = await db.select({ count: count() }).from(booking)
      .where(and(eq(booking.isRead, false), sql`${booking.businessId} IN (${sql.join(ids, sql`, `)})`))
    res.json({ count: Number(r?.count ?? 0) })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// GET /api/bookings/:businessId — get bookings for a business (auth required)
router.get('/:businessId', requireAuth, async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId as string)
    const [biz] = await db.select().from(business).where(and(eq(business.id, businessId), eq(business.userId, req.userId!)))
    if (!biz) { res.status(403).json({ message: 'Unauthorized' }); return }
    res.json(await db.select().from(booking).where(eq(booking.businessId, businessId)).orderBy(desc(booking.createdAt)))
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// PATCH /api/bookings/:id/read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string)
    const [b] = await db.select().from(booking).where(eq(booking.id, id))
    if (!b) { res.status(404).json({ message: 'Not found' }); return }
    const [biz] = await db.select().from(business).where(and(eq(business.id, b.businessId), eq(business.userId, req.userId!)))
    if (!biz) { res.status(403).json({ message: 'Unauthorized' }); return }
    await db.update(booking).set({ isRead: true }).where(eq(booking.id, id))
    res.json({ success: true })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// PATCH /api/bookings/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string)
    const [b] = await db.select().from(booking).where(eq(booking.id, id))
    if (!b) { res.status(404).json({ message: 'Not found' }); return }
    const [biz] = await db.select().from(business).where(and(eq(business.id, b.businessId), eq(business.userId, req.userId!)))
    if (!biz) { res.status(403).json({ message: 'Unauthorized' }); return }
    const [updated] = await db.update(booking).set({ status: req.body.status, isRead: true }).where(eq(booking.id, id)).returning()
    res.json(updated)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

export default router
