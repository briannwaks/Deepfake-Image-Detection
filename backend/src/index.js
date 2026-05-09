import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config/index.js'
import analysisRouter from './routes/analysis.js'
import healthRouter from './routes/health.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import logger from './utils/logger.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: config.corsOrigins, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please slow down.' },
}))

app.use('/api', healthRouter)
app.use('/api', analysisRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(config.port, () => {
  logger.info(`Backend running on http://localhost:${config.port}`)
})
