import styles from './ForensicReport.module.css'

export default function ForensicReport({ report }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Forensic Report</h3>
      <dl className={styles.grid}>
        <div className={styles.item}><dt>Model</dt><dd>{report.model}</dd></div>
        <div className={styles.item}><dt>Processing time</dt><dd>{report.processing_time_ms} ms</dd></div>
        <div className={styles.item}><dt>Image dimensions</dt><dd>{report.width} × {report.height} px</dd></div>
        <div className={styles.item}><dt>Analysis timestamp</dt><dd>{new Date(report.timestamp).toLocaleString()}</dd></div>
      </dl>
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
