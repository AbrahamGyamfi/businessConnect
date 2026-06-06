import { Router } from 'express'
import { db } from '../db'
import { user, business, job, event } from '../db/schema'
import { count, eq } from 'drizzle-orm'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const [[{ members }], [{ businesses }], [{ jobs }], [{ events }]] = await Promise.all([
      db.select({ members: count() }).from(user),
      db.select({ businesses: count() }).from(business).where(eq(business.isApproved, true)),
      db.select({ jobs: count() }).from(job).where(eq(job.isActive, true)),
      db.select({ events: count() }).from(event).where(eq(event.isPublished, true)),
    ])
    res.json({
      members: Number(members),
      businesses: Number(businesses),
      jobs: Number(jobs),
      events: Number(events),
    })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

export default router
