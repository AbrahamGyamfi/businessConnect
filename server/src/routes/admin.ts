import { Router } from 'express'
import { db } from '../db'
import { business, user, job, event, booking } from '../db/schema'
import { count, desc, eq } from 'drizzle-orm'
import { requireAdmin } from '../middleware/requireAdmin'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

// Check if current user is admin
router.get('/check', requireAuth, async (req, res) => {
  try {
    const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, req.userId!))
    res.json({ isAdmin: u?.role === 'admin' })
  } catch { res.json({ isAdmin: false }) }
})

// Promote a user to admin via setup secret
router.post('/setup', async (req, res) => {
  try {
    const { email, secret } = req.body
    if (!secret || secret !== process.env.ADMIN_SETUP_SECRET) {
      res.status(403).json({ message: 'Invalid setup secret' }); return
    }
    const [updated] = await db.update(user).set({ role: 'admin' })
      .where(eq(user.email as any, email))
      .returning()
    if (!updated) { res.status(404).json({ message: 'User not found' }); return }
    res.json({ message: `${email} is now an admin` })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// Stats
router.get('/stats', requireAdmin, async (_req, res) => {
  try {
    const [[{ total: totalUsers }], [{ total: totalBusinesses }], [{ total: pendingBusinesses }],
      [{ total: totalJobs }], [{ total: totalEvents }], [{ total: totalBookings }]] = await Promise.all([
      db.select({ total: count() }).from(user),
      db.select({ total: count() }).from(business),
      db.select({ total: count() }).from(business).where(eq(business.isApproved, false)),
      db.select({ total: count() }).from(job),
      db.select({ total: count() }).from(event),
      db.select({ total: count() }).from(booking),
    ])
    res.json({ totalUsers, totalBusinesses, pendingBusinesses, totalJobs, totalEvents, totalBookings })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// All businesses (admin)
router.get('/businesses', requireAdmin, async (_req, res) => {
  try {
    const businesses = await db
      .select({ business, owner: { id: user.id, name: user.name } })
      .from(business).leftJoin(user, eq(business.userId, user.id))
      .orderBy(eq(business.isApproved, false), desc(business.createdAt))
    res.json(businesses)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// Approve/reject/feature a business
router.patch('/businesses/:id', requireAdmin, async (req, res) => {
  try {
    const [updated] = await db.update(business)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(business.id, parseInt(req.params.id as string)))
      .returning()
    res.json(updated)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// All members
router.get('/members', requireAdmin, async (_req, res) => {
  try {
    const members = await db.select().from(user).orderBy(desc(user.role))
    res.json(members)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

// Update member (verify, change role)
router.patch('/members/:id', requireAdmin, async (req, res) => {
  try {
    const [updated] = await db.update(user).set(req.body).where(eq(user.id, req.params.id as string)).returning()
    res.json(updated)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

export default router
