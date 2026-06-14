import { betterAuth } from 'better-auth'
import Redis from 'ioredis'
import { pool } from './db'
import nodemailer from 'nodemailer'

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  : null

const FROM = process.env.FROM_EMAIL ?? 'noreply@churchconnect.app'
const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3000'

function brandedEmail(title: string, body: string) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;background:#fff">
      <div style="text-align:center;margin-bottom:28px">
        <div style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:12px 20px">
          <span style="color:#fff;font-size:18px;font-weight:700">⛪ ChurchConnect</span>
        </div>
      </div>
      <h2 style="color:#1e1b4b;margin-top:0;text-align:center">${title}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#9ca3af;font-size:12px;text-align:center">Church Connect — Connecting our community</p>
    </div>`
}

async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) { console.warn('SMTP not configured — skipping email:', subject); return }
  await transporter.sendMail({ from: `"Church Connect" <${FROM}>`, to, subject, html }).catch(console.error)
}

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.SERVER_URL ?? 'http://localhost:4000',
  secret: process.env.BETTER_AUTH_SECRET ?? 'change-me-in-production',
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      sendMail(user.email, 'Reset your ChurchConnect password',
        brandedEmail('Reset Your Password', `
          <p style="color:#374151;text-align:center">Click the button below to reset your password. This link expires in 1 hour.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${url}" style="background:#4f46e5;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">
              Reset Password
            </a>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center">If you didn't request this, ignore this email.</p>
        `))
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      // Link goes to Netlify frontend — avoids cross-origin redirect issues
      const verifyUrl = `${FRONTEND}/verify-email?token=${token}`
      sendMail(user.email, 'Verify your ChurchConnect email',
        brandedEmail('Verify Your Email', `
          <p style="color:#374151;text-align:center">Welcome, <strong>${user.name}</strong>! Please verify your email address to unlock all features.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${verifyUrl}" style="background:#4f46e5;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">
              Verify Email
            </a>
          </div>
          <p style="color:#9ca3af;font-size:13px;text-align:center">If you didn't create an account, ignore this email.</p>
        `))
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  trustedOrigins: [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
    'https://churchconnectlink.netlify.app',
    'http://localhost:3000',
  ].filter(Boolean),
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
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
