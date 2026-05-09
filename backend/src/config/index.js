import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()),
}
