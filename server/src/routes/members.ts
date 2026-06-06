import { Router } from 'express'
import { db } from '../db'
import { business, user } from '../db/schema'
import { count, desc, eq } from 'drizzle-orm'

const router = Router()

// GET /api/members — all users who have at least one approved listing
router.get('/', async (_req, res) => {
  try {
    const members = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        listingCount: count(business.id),
      })
      .from(business)
      .innerJoin(user, eq(business.userId, user.id))
      .where(eq(business.isApproved, true))
      .groupBy(user.id, user.name, user.image)
      .orderBy(desc(count(business.id)))
    res.json(members)
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/members/:userId/businesses — all businesses for a member
router.get('/:userId/businesses', async (req, res) => {
  try {
    const businesses = await db
      .select()
      .from(business)
      .where(eq(business.userId, req.params.userId as string))
    res.json(businesses)
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
