import { Request, Response, NextFunction } from 'express'
import { auth } from '../auth'
import { db } from '../db'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: req.headers.cookie ?? '' }),
    })
    if (!session?.user?.id) { res.status(401).json({ message: 'Unauthorized' }); return }
    const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id))
    if (u?.role !== 'admin') { res.status(403).json({ message: 'Forbidden' }); return }
    req.userId = session.user.id
    next()
  } catch {
    res.status(403).json({ message: 'Forbidden' })
  }
}
