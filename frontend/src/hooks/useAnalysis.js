import { useState } from 'react'
import { analyzeImage } from '../utils/api'
import toast from 'react-hot-toast'

export function useAnalysis() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function run(file, mode = 'ensemble') {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeImage(file, mode)
      setResult(data)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return { result, loading, error, run, reset }
}
