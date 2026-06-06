import { Request, Response, NextFunction } from 'express'
import { db } from '../db'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4001'

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/get-session`, {
      headers: { cookie: req.headers.cookie ?? '' },
    })
    const session = await response.json()
    if (!session?.user?.id) { res.status(401).json({ message: 'Unauthorized' }); return }

    const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, session.user.id))
    if (!u || u.role !== 'admin') { res.status(403).json({ message: 'Forbidden' }); return }

    req.userId = session.user.id
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
