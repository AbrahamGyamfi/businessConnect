import { Request, Response, NextFunction } from 'express'
import { auth } from '../auth'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: req.headers.cookie ?? '' }),
    })
    if (!session?.user?.id) { res.status(401).json({ message: 'Unauthorized' }); return }
    req.userId = session.user.id
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

declare global {
  namespace Express { interface Request { userId?: string } }
}
