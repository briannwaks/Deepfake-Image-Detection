import { Router } from 'express'
import axios from 'axios'
import { config } from '../config/index.js'

const router = Router()

router.get('/health', async (req, res) => {
  let aiStatus = 'unreachable'
  try {
    await axios.get(`${config.aiServiceUrl}/health`, { timeout: 3000, headers: { 'ngrok-skip-browser-warning': 'true' } })
    aiStatus = 'ok'
  } catch (_) {}

  res.json({
    status: 'ok',
    service: 'deepfake-detection-backend',
    ai_service: aiStatus,
    timestamp: new Date().toISOString(),
  })
})

export default router
