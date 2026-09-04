import { useState } from 'react'
import { analyzeImage } from '../utils/api'
import { auth, db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
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

      const user = auth.currentUser
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'analyses'), {
          prediction: data.prediction,
          confidence: data.confidence,
          raw_score: data.raw_score,
          mode,
          filename: file.name,
          createdAt: serverTimestamp(),
        })
      }
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
