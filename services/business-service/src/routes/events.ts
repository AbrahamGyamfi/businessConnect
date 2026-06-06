import { Router } from 'express'
import { db } from '../db'
import { event, user } from '../db/schema'
import { and, asc, desc, eq, gte } from 'drizzle-orm'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const now = new Date()
    const events = await db
      .select({ event, poster: { id: user.id, name: user.name, image: user.image } })
      .from(event)
      .leftJoin(user, eq(event.userId, user.id))
      .where(and(eq(event.isPublished, true), gte(event.eventDate, now)))
      .orderBy(asc(event.eventDate))
    res.json(events)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/past', async (_req, res) => {
  try {
    const events = await db
      .select({ event, poster: { id: user.id, name: user.name, image: user.image } })
      .from(event).leftJoin(user, eq(event.userId, user.id))
      .where(eq(event.isPublished, true))
      .orderBy(desc(event.eventDate))
      .limit(20)
    res.json(events)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/mine', requireAuth, async (req, res) => {
  try {
    res.json(await db.select().from(event).where(eq(event.userId, req.userId!)).orderBy(desc(event.createdAt)))
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/:slug', async (req, res) => {
  try {
    const [e] = await db
      .select({ event, poster: { id: user.id, name: user.name, image: user.image } })
      .from(event).leftJoin(user, eq(event.userId, user.id))
      .where(eq(event.slug, req.params.slug as string))
    if (!e) { res.status(404).json({ message: 'Not found' }); return }
    res.json(e)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
    const [e] = await db.insert(event).values({ ...req.body, userId: req.userId!, slug }).returning()
    res.status(201).json(e)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const [updated] = await db.update(event)
      .set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(event.id, parseInt(req.params.id as string)), eq(event.userId, req.userId!)))
      .returning()
    if (!updated) { res.status(404).json({ message: 'Not found' }); return }
    res.json(updated)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.delete(event).where(and(eq(event.id, parseInt(req.params.id as string)), eq(event.userId, req.userId!)))
    res.status(204).send()
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

export default router
