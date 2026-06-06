import { Router } from 'express'
import { db } from '../db'
import { category } from '../db/schema'
import { eq } from 'drizzle-orm'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    res.json(await db.select().from(category).orderBy(category.name))
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const [cat] = await db.select().from(category).where(eq(category.slug, req.params.slug))
    if (!cat) { res.status(404).json({ message: 'Not found' }); return }
    res.json(cat)
  } catch {
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
