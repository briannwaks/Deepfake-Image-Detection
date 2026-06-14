import styles from './ForensicReport.module.css'

function shortName(modelId) {
  return modelId.split('/')[1] ?? modelId
}

export default function ForensicReport({ report }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Forensic Report</h3>

      <dl className={styles.grid}>
        <div className={styles.item}><dt>Processing time</dt><dd>{report.processing_time_ms} ms</dd></div>
        <div className={styles.item}><dt>Image dimensions</dt><dd>{report.width} × {report.height} px</dd></div>
        <div className={styles.item}><dt>Analysis timestamp</dt><dd>{new Date(report.timestamp).toLocaleString()}</dd></div>
      </dl>

      {report.model_scores && (
        <div className={styles.modelScores}>
          <h4>Model ensemble scores</h4>
          <ul>
            {Object.entries(report.model_scores).map(([model, score]) => (
              <li key={model}>
                <span className={styles.modelName}>{shortName(model)}</span>
                <span className={styles.scoreBar}>
                  <span
                    className={styles.scoreFill}
                    style={{
                      width: score != null ? `${(score * 100).toFixed(1)}%` : '0%',
                      background: score > 0.5 ? 'var(--danger)' : 'var(--success)',
                    }}
                  />
                </span>
                <span className={styles.scoreValue}>
                  {score != null ? `${(score * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.scoreNote}>Fake probability per model — averaged for final verdict</p>
        </div>
      )}

      {report.artifacts?.length > 0 && (
        <div className={styles.artifacts}>
          <h4>Detected artifacts</h4>
          <ul>
            {report.artifacts.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
