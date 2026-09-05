import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import styles from './History.module.css'

const MODE_LABELS = {
  ensemble: 'Full Ensemble',
  'ai-art': 'AI Art Detector',
  'face-deepfake': 'Face Deepfake',
  'full-scan': 'Full Image Scan',
}

export default function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) { navigate('/login'); return }

    async function fetchHistory() {
      const q = query(
        collection(db, 'users', user.uid, 'analyses'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      setAnalyses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }

    fetchHistory()
  }, [navigate])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <FiClock size={24} className={styles.headerIcon} />
        <h1 className={styles.title}>Analysis History</h1>
      </div>

      {loading && <p className={styles.empty}>Loading…</p>}

      {!loading && analyses.length === 0 && (
        <p className={styles.empty}>No analyses yet. <a href="/analyze">Run your first one.</a></p>
      )}

      {!loading && analyses.length > 0 && (
        <div className={styles.list}>
          {analyses.map(a => (
            <div key={a.id} className={styles.card}>
              <div className={styles.cardLeft}>
                {a.prediction === 'FAKE'
                  ? <FiAlertTriangle className={styles.iconFake} size={20} />
                  : <FiCheckCircle className={styles.iconReal} size={20} />
                }
                <div>
                  <span className={a.prediction === 'FAKE' ? styles.badgeFake : styles.badgeReal}>
                    {a.prediction}
                  </span>
                  <p className={styles.filename}>{a.filename || 'Unknown file'}</p>
                </div>
              </div>
              <div className={styles.cardRight}>
                <span className={styles.mode}>{MODE_LABELS[a.mode] || a.mode}</span>
                <span className={styles.confidence}>{Math.round(a.confidence * 100)}% confidence</span>
                <span className={styles.date}>
                  {a.createdAt?.toDate().toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  }) ?? '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
