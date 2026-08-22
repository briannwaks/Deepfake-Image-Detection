import { useState } from 'react'
import { FiCamera, FiLayers, FiImage, FiUser, FiSearch } from 'react-icons/fi'
import ImageUploader from '../components/ImageUploader'
import WebcamCapture from '../components/WebcamCapture'
import ResultCard from '../components/ResultCard'
import HeatmapViewer from '../components/HeatmapViewer'
import ForensicReport from '../components/ForensicReport'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAnalysis } from '../hooks/useAnalysis'
import styles from './Analyze.module.css'

const MODES = [
  {
    id: 'ensemble',
    icon: <FiLayers size={15} />,
    label: 'Full Ensemble',
    desc: 'All 3 models averaged — best when unsure',
  },
  {
    id: 'ai-art',
    icon: <FiImage size={15} />,
    label: 'AI Art Detector',
    desc: 'Stable Diffusion, Midjourney, DALL·E',
  },
  {
    id: 'face-deepfake',
    icon: <FiUser size={15} />,
    label: 'Face Deepfake',
    desc: 'Face-swaps, GAN faces, social media deepfakes',
  },
  {
    id: 'full-scan',
    icon: <FiSearch size={15} />,
    label: 'Full Image Scan',
    desc: 'Subtle edits and general manipulation',
  },
]

export default function Analyze() {
  const [file, setFile] = useState(null)
  const [webcamOpen, setWebcamOpen] = useState(false)
  const [mode, setMode] = useState('ensemble')
  const { result, loading, error, run, reset } = useAnalysis()

  function handleFile(f) {
    reset()
    setFile(f)
  }

  function handleWebcamCapture(f) {
    setWebcamOpen(false)
    handleFile(f)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (file) run(file, mode)
  }

  const originalUrl = file ? URL.createObjectURL(file) : null

  return (
    <div className={styles.page}>
      <h2>Analyse Image</h2>

      <div className={styles.modeSection}>
        <p className={styles.modeLabel}>Detection mode</p>
        <div className={styles.modeGrid}>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.modeBtn} ${mode === m.id ? styles.modeActive : ''}`}
              onClick={() => setMode(m.id)}
              disabled={loading}
            >
              <span className={styles.modeIcon}>{m.icon}</span>
              <span className={styles.modeName}>{m.label}</span>
              <span className={styles.modeDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <ImageUploader onFileSelected={handleFile} disabled={loading} />

        <div className={styles.inputRow}>
          <button
            type="button"
            className={styles.webcamBtn}
            onClick={() => setWebcamOpen(true)}
            disabled={loading}
          >
            <FiCamera size={16} />
            Use Webcam
          </button>
          <button type="submit" className="btn-primary" disabled={!file || loading}>
            {loading ? 'Analysing…' : 'Run Analysis'}
          </button>
        </div>
      </form>

      {webcamOpen && (
        <WebcamCapture
          onCapture={handleWebcamCapture}
          onClose={() => setWebcamOpen(false)}
        />
      )}

      {loading && <LoadingSpinner />}

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.results}>
          <ResultCard result={result} />
          {result.heatmap_url && (
            <HeatmapViewer originalUrl={originalUrl} heatmapUrl={result.heatmap_url} />
          )}
          {result.report && <ForensicReport report={result.report} />}
        </div>
      )}
    </div>
  )
}
