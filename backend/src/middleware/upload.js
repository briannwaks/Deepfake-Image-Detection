import multer from 'multer'
import { config } from '../config/index.js'

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter(_, file, cb) {
    if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true)
    cb(new Error(`Unsupported file type: ${file.mimetype}`))
  },
})

export default upload
