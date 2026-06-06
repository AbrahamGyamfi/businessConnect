import express from 'express'
import inquiriesRouter from './routes/inquiries'

const app = express()
const PORT = process.env.PORT ?? 4004

app.use(express.json())
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'inquiry-service' }))
app.use('/api/inquiries', inquiriesRouter)

app.listen(PORT, () => console.log(`inquiry-service running on port ${PORT}`))
