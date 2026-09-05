import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : 'https://deepfake-image-detection-1-3egt.onrender.com/api',
  timeout: 60000,
})

export async function analyzeImage(file, mode = 'ensemble') {
  const form = new FormData()
  form.append('image', file)
  form.append('mode', mode)
  const { data } = await api.post('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function healthCheck() {
  const { data } = await api.get('/health')
  return data
}

export default api
