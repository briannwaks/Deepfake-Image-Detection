import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import ResultCard from '../components/ResultCard'
import HeatmapViewer from '../components/HeatmapViewer'
import ForensicReport from '../components/ForensicReport'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAnalysis } from '../hooks/useAnalysis'
import styles from './Analyze.module.css'

export default function Analyze() {
  const [file, setFile] = useState(null)
  const { result, loading, error, run, reset } = useAnalysis()

  function handleFile(f) {
    reset()
    setFile(f)
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
        <button type="submit" className="btn-primary" disabled={!file || loading}>
          {loading ? 'Analysing…' : 'Run Analysis'}
        </button>
      </form>

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
