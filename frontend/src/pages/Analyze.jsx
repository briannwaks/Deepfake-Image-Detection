import { useState } from 'react'
import { FiCamera } from 'react-icons/fi'
import ImageUploader from '../components/ImageUploader'
import WebcamCapture from '../components/WebcamCapture'
import ResultCard from '../components/ResultCard'
import HeatmapViewer from '../components/HeatmapViewer'
import ForensicReport from '../components/ForensicReport'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAnalysis } from '../hooks/useAnalysis'
import styles from './Analyze.module.css'

export default function Analyze() {
  const [file, setFile] = useState(null)
  const [webcamOpen, setWebcamOpen] = useState(false)
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
    if (file) run(file)
  }

  const originalUrl = file ? URL.createObjectURL(file) : null

  return (
    <div className={styles.page}>
      <h2>Analyse Image</h2>
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
