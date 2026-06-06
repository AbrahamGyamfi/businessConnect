import { betterAuth } from 'better-auth'
import Redis from 'ioredis'
import { pool } from './db'

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.SERVER_URL ?? 'http://localhost:4000',
  secret: process.env.BETTER_AUTH_SECRET ?? 'change-me-in-production',
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(redis ? {
    secondaryStorage: {
      get: (key: string) => redis.get(key),
      set: (key: string, value: string, ttl?: number) =>
        ttl ? redis.set(key, value, 'EX', ttl).then(() => undefined)
             : redis.set(key, value).then(() => undefined),
      delete: (key: string) => redis.del(key).then(() => undefined),
    },
  } : {}),
})
