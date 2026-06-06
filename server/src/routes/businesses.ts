import { Router } from 'express'
import { db } from '../db'
import { business, category, review, user } from '../db/schema'
import { and, avg, count, desc, eq, ilike, or } from 'drizzle-orm'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6
    res.json(
      await db
        .select({ business, category, avgRating: avg(review.rating), reviewCount: count(review.id) })
        .from(business)
        .leftJoin(category, eq(business.categoryId, category.id))
        .leftJoin(review, eq(business.id, review.businessId))
        .where(and(eq(business.isFeatured, true), eq(business.isApproved, true)))
        .groupBy(business.id, category.id)
        .orderBy(desc(business.createdAt))
        .limit(limit)
    )
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/mine', requireAuth, async (req, res) => {
  try {
    res.json(
      await db
        .select({ business, category, avgRating: avg(review.rating), reviewCount: count(review.id) })
        .from(business)
        .leftJoin(category, eq(business.categoryId, category.id))
        .leftJoin(review, eq(business.id, review.businessId))
        .where(eq(business.userId, req.userId!))
        .groupBy(business.id, category.id)
        .orderBy(desc(business.createdAt))
    )
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/', async (req, res) => {
  try {
    const { categorySlug, search, limit: lq, offset: oq } = req.query
    const limit = parseInt(lq as string) || 12
    const offset = parseInt(oq as string) || 0

    let where
    if (categorySlug) {
      where = and(eq(business.isApproved, true), eq(category.slug, categorySlug as string))
    } else if (search) {
      where = and(
        eq(business.isApproved, true),
        or(ilike(business.name, `%${search}%`), ilike(business.description, `%${search}%`), ilike(business.city, `%${search}%`))
      )
    } else {
      where = eq(business.isApproved, true)
    }

    res.json(
      await db
        .select({ business, category, avgRating: avg(review.rating), reviewCount: count(review.id) })
        .from(business)
        .leftJoin(category, eq(business.categoryId, category.id))
        .leftJoin(review, eq(business.id, review.businessId))
        .where(where)
        .groupBy(business.id, category.id)
        .orderBy(desc(business.isFeatured), desc(business.createdAt))
        .limit(limit)
        .offset(offset)
    )
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const slug =
      req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
      '-' + Date.now().toString(36)
    const [biz] = await db.insert(business).values({ ...req.body, userId: req.userId!, slug }).returning()
    res.status(201).json(biz)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/:id/reviews', async (req, res) => {
  try {
    const businessId = parseInt(req.params.id as string)
    res.json(
      await db
        .select({ review, user: { id: user.id, name: user.name, image: user.image } })
        .from(review)
        .leftJoin(user, eq(review.userId, user.id))
        .where(eq(review.businessId, businessId))
        .orderBy(desc(review.createdAt))
    )
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/:id/stats', async (req, res) => {
  try {
    const businessId = parseInt(req.params.id as string)
    const [stats] = await db
      .select({ avgRating: avg(review.rating), reviewCount: count(review.id) })
      .from(review)
      .where(eq(review.businessId, businessId))
    res.json({ avgRating: stats?.avgRating ? Number(stats.avgRating) : 0, reviewCount: Number(stats?.reviewCount ?? 0) })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/:id/mine', requireAuth, async (req, res) => {
  try {
    const [biz] = await db
      .select()
      .from(business)
      .where(and(eq(business.id, parseInt(req.params.id as string)), eq(business.userId, req.userId!)))
    if (!biz) { res.status(404).json({ message: 'Not found' }); return }
    res.json(biz)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const [updated] = await db
      .update(business)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(business.id, parseInt(req.params.id as string)), eq(business.userId, req.userId!)))
      .returning()
    if (!updated) { res.status(404).json({ message: 'Not found or unauthorized' }); return }
    res.json(updated)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.delete(business).where(and(eq(business.id, parseInt(req.params.id as string)), eq(business.userId, req.userId!)))
    res.status(204).send()
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/:slug', async (req, res) => {
  try {
    const [biz] = await db
      .select({ business, category, owner: { id: user.id, name: user.name, image: user.image } })
      .from(business)
      .leftJoin(category, eq(business.categoryId, category.id))
      .leftJoin(user, eq(business.userId, user.id))
      .where(eq(business.slug, req.params.slug))
    if (!biz) { res.status(404).json({ message: 'Not found' }); return }
    // Increment view count (fire-and-forget)
    db.update(business).set({ views: biz.business.views + 1 }).where(eq(business.slug, req.params.slug)).catch(() => {})
    res.json(biz)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

export default router
