import express from 'express'
import { auth } from './auth'

const app = express()
const PORT = process.env.PORT ?? 4001

app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }))

app.all('/api/auth/*', async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const headers = new Headers(req.headers as Record<string, string>)
  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined

  const response = await auth.handler(
    new Request(url.toString(), { method: req.method, headers, body })
  )

  res.status(response.status)
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.send(await response.text())
})

app.listen(PORT, () => console.log(`auth-service running on port ${PORT}`))
