import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000,
})

export async function analyzeImage(file) {
  const form = new FormData()
  form.append('image', file)
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
