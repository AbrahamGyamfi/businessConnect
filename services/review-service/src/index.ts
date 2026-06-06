import express from 'express'
import reviewsRouter from './routes/reviews'

const app = express()
const PORT = process.env.PORT ?? 4003

app.use(express.json())
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'review-service' }))
app.use('/api/reviews', reviewsRouter)

app.listen(PORT, () => console.log(`review-service running on port ${PORT}`))
