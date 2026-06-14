import styles from './HeatmapViewer.module.css'

export default function HeatmapViewer({ originalUrl, heatmapUrl }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>ELA Forensic Map</h3>
      <div className={styles.grid}>
        <figure>
          <img src={originalUrl} alt="Original" className={styles.img} />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          <img src={heatmapUrl} alt="ELA forensic heatmap" className={styles.img} />
          <figcaption>ELA heatmap</figcaption>
        </figure>
      </div>
      <p className={styles.caption}>
        Error Level Analysis highlights compression inconsistencies — bright regions indicate areas likely affected by digital manipulation.
      </p>
    </div>
  )
}
