import axios from 'axios'
import FormData from 'form-data'
import { config } from '../config/index.js'
import logger from '../utils/logger.js'

export async function analyzeImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const form = new FormData()
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })
    form.append('mode', req.body.mode || 'ensemble')

    logger.debug(`Forwarding image to AI service: ${config.aiServiceUrl}/analyze`)

    const { data } = await axios.post(`${config.aiServiceUrl}/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 55000,
    })

    res.json(data)
  } catch (err) {
    if (err.response) {
      logger.error('AI service error', { status: err.response.status, data: err.response.data })
      return res.status(502).json({ error: 'AI service returned an error', detail: err.response.data })
    }
    next(err)
  }
}
