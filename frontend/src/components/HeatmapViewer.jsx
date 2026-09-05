import styles from './HeatmapViewer.module.css'

export default function HeatmapViewer({ originalUrl, heatmapUrl }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Grad-CAM Forensic Map</h3>
      <div className={styles.grid}>
        <figure>
          <img src={originalUrl} alt="Original" className={styles.img} />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          <img src={heatmapUrl} alt="Grad-CAM heatmap" className={styles.img} />
          <figcaption>Grad-CAM heatmap</figcaption>
        </figure>
      </div>
      <p className={styles.caption}>
        Gradient-weighted Class Activation Mapping (Grad-CAM) highlights the regions the model focused on — warmer colours indicate areas with stronger manipulation signals.
      </p>
    </div>
  )
}
