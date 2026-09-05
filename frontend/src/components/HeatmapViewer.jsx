import styles from './HeatmapViewer.module.css'

export default function HeatmapViewer({ originalUrl, heatmapUrl, elaUrl }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Forensic Analysis</h3>
      <div className={styles.grid}>
        <figure>
          <img src={originalUrl} alt="Original" className={styles.img} />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          <img src={heatmapUrl} alt="Grad-CAM heatmap" className={styles.img} />
          <figcaption>Grad-CAM heatmap</figcaption>
        </figure>
        {elaUrl && (
          <figure>
            <img src={elaUrl} alt="ELA heatmap" className={styles.img} />
            <figcaption>ELA heatmap</figcaption>
          </figure>
        )}
      </div>
      <p className={styles.caption}>
        <strong>Grad-CAM</strong> highlights regions the model focused on for its decision.
        {elaUrl && <> <strong>ELA</strong> reveals compression inconsistencies from digital manipulation.</>}
      </p>
    </div>
  )
}
