import { Request, Response, NextFunction } from 'express'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4001'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/get-session`, {
      headers: { cookie: req.headers.cookie ?? '' },
    })
    const session = await response.json()
    if (!session?.user?.id) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    req.userId = session.user.id
    next()
  } catch {
    res.status(401).json({ message: 'Unauthorized' })
  }
}

declare global {
  namespace Express {
    interface Request { userId?: string }
  }
}
