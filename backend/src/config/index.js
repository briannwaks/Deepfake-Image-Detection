import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  corsOrigins: [
    'http://localhost:5173',
    'https://deepfake-image-detection-six.vercel.app',
    'https://deepfake-image-detection-f4i19lypd-deepguard.vercel.app',
    'https://deepfake-image-detection-ihafmflh6-deepguard.vercel.app',
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : []),
  ],
}
