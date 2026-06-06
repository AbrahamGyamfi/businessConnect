import { Router } from 'express'
import { db } from '../db'
import { job, user } from '../db/schema'
import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

// Public: list
router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query
    let where
    if (search) {
      where = and(
        eq(job.isActive, true),
        or(ilike(job.title, `%${search}%`), ilike(job.description, `%${search}%`), ilike(job.location, `%${search}%`))
      )
    } else if (type) {
      where = and(eq(job.isActive, true), eq(job.jobType, type as string))
    } else {
      where = eq(job.isActive, true)
    }
    const jobs = await db
      .select({ job, poster: { id: user.id, name: user.name, image: user.image } })
      .from(job)
      .leftJoin(user, eq(job.userId, user.id))
      .where(where)
      .orderBy(desc(job.createdAt))
    res.json(jobs)
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Auth: my jobs
router.get('/mine', requireAuth, async (req, res) => {
  try {
    res.json(
      await db.select().from(job).where(eq(job.userId, req.userId!)).orderBy(desc(job.createdAt))
    )
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Public: by slug
router.get('/:slug', async (req, res) => {
  try {
    const [j] = await db
      .select({ job, poster: { id: user.id, name: user.name, image: user.image } })
      .from(job)
      .leftJoin(user, eq(job.userId, user.id))
      .where(eq(job.slug, req.params.slug as string))
    if (!j) { res.status(404).json({ message: 'Job not found' }); return }
    res.json(j)
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Auth: create
router.post('/', requireAuth, async (req, res) => {
  try {
    const slug =
      req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') +
      '-' + Date.now().toString(36)
    const [newJob] = await db.insert(job).values({ ...req.body, userId: req.userId!, slug }).returning()
    res.status(201).json(newJob)
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Auth: update
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const [updated] = await db
      .update(job)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(job.id, parseInt(req.params.id as string)), eq(job.userId, req.userId!)))
      .returning()
    if (!updated) { res.status(404).json({ message: 'Not found or unauthorized' }); return }
    res.json(updated)
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Auth: delete
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.delete(job).where(and(eq(job.id, parseInt(req.params.id as string)), eq(job.userId, req.userId!)))
    res.status(204).send()
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
