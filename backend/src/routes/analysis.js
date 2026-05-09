import { Router } from 'express'
import upload from '../middleware/upload.js'
import { analyzeImage } from '../controllers/analysisController.js'

const router = Router()

router.post('/analyze', upload.single('image'), analyzeImage)

export default router
