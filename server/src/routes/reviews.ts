import { Router } from 'express'
import { db } from '../db'
import { review, user } from '../db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

router.get('/me/:businessId', requireAuth, async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId as string)
    const [existing] = await db.select().from(review)
      .where(and(eq(review.userId, req.userId!), eq(review.businessId, businessId)))
    res.json(existing ?? null)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { businessId, rating, comment } = req.body
    const [existing] = await db.select().from(review)
      .where(and(eq(review.userId, req.userId!), eq(review.businessId, businessId)))
    if (existing) { res.status(409).json({ message: 'Already reviewed' }); return }
    const [newReview] = await db.insert(review)
      .values({ businessId, rating, comment, userId: req.userId! })
      .returning()
    res.status(201).json(newReview)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const [updated] = await db.update(review)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(review.id, parseInt(req.params.id as string)), eq(review.userId, req.userId!)))
      .returning()
    if (!updated) { res.status(404).json({ message: 'Not found' }); return }
    res.json(updated)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.delete(review)
      .where(and(eq(review.id, parseInt(req.params.id as string)), eq(review.userId, req.userId!)))
    res.status(204).send()
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

export default router
