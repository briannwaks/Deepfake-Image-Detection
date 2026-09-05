import styles from './HeatmapViewer.module.css'

export default function HeatmapViewer({ originalUrl, heatmapUrl }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Attention Rollout Map</h3>
      <div className={styles.grid}>
        <figure>
          <img src={originalUrl} alt="Original" className={styles.img} />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          <img src={heatmapUrl} alt="Attention rollout heatmap" className={styles.img} />
          <figcaption>Attention heatmap</figcaption>
        </figure>
      </div>
      <p className={styles.caption}>
        Attention Rollout propagates transformer attention weights across all layers — warmer colours (red/yellow) indicate regions the model focused on when making its decision.
      </p>
    </div>
  )
}
