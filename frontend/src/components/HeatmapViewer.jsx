import styles from './HeatmapViewer.module.css'

export default function HeatmapViewer({ originalUrl, heatmapUrl }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Grad-CAM Visualisation</h3>
      <div className={styles.grid}>
        <figure>
          <img src={originalUrl} alt="Original" className={styles.img} />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          <img src={heatmapUrl} alt="Grad-CAM heatmap" className={styles.img} />
          <figcaption>Attention heatmap</figcaption>
        </figure>
      </div>
      <p className={styles.caption}>
        Highlighted regions indicate areas the model focused on when making its prediction.
      </p>
    </div>
  )
}
