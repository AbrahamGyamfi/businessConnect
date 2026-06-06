import { Router } from 'express'
import { db } from '../db'
import { inquiry, business, user } from '../db/schema'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { requireAuth } from '../middleware/requireAuth'
import { sendInquiryNotification } from '../mailer'

const router = Router()

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const bizes = await db.select({ id: business.id }).from(business).where(eq(business.userId, req.userId!))
    if (!bizes.length) { res.json({ count: 0 }); return }
    const ids = bizes.map((b) => b.id)
    const [result] = await db.select({ count: count() }).from(inquiry)
      .where(and(eq(inquiry.isRead, false), sql`${inquiry.businessId} IN (${sql.join(ids, sql`, `)})`))
    res.json({ count: Number(result?.count ?? 0) })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.get('/:businessId', requireAuth, async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId as string)
    const [biz] = await db.select().from(business)
      .where(and(eq(business.id, businessId), eq(business.userId, req.userId!)))
    if (!biz) { res.status(403).json({ message: 'Unauthorized' }); return }
    res.json(await db.select().from(inquiry).where(eq(inquiry.businessId, businessId)).orderBy(desc(inquiry.createdAt)))
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.post('/', async (req, res) => {
  try {
    const data = req.body as { businessId: number; name: string; email: string; phone?: string; message: string }
    const [newInquiry] = await db.insert(inquiry).values(data).returning()
    db.select({ biz: business, owner: user })
      .from(business).innerJoin(user, eq(business.userId, user.id))
      .where(eq(business.id, data.businessId))
      .then(([row]) => {
        if (row) sendInquiryNotification({
          ownerEmail: row.owner.email, ownerName: row.owner.name,
          businessName: row.biz.name, fromName: data.name,
          fromEmail: data.email, message: data.message,
        })
      }).catch(() => {})
    res.status(201).json(newInquiry)
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string)
    const [inq] = await db.select().from(inquiry).where(eq(inquiry.id, id))
    if (!inq) { res.status(404).json({ message: 'Not found' }); return }
    const [biz] = await db.select().from(business)
      .where(and(eq(business.id, inq.businessId), eq(business.userId, req.userId!)))
    if (!biz) { res.status(403).json({ message: 'Unauthorized' }); return }
    await db.update(inquiry).set({ isRead: true }).where(eq(inquiry.id, id))
    res.json({ success: true })
  } catch { res.status(500).json({ message: 'Internal server error' }) }
})

export default router
