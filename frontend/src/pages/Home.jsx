import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.hero}>
      <h1>Detect AI-generated images <span>instantly</span></h1>
      <p>
        DeepGuard uses EfficientNet / Xception CNNs and Grad-CAM visualisations
        to identify deepfakes and manipulated images with high accuracy.
      </p>
      <Link to="/analyze">
        <button className="btn-primary">Analyse an Image</button>
      </Link>
      <div className={styles.features}>
        <div className={styles.feature}><strong>Real / Fake verdict</strong><span>Confidence score from 0–100%</span></div>
        <div className={styles.feature}><strong>Grad-CAM heatmap</strong><span>See exactly what the model detected</span></div>
        <div className={styles.feature}><strong>Forensic report</strong><span>Detailed artifact breakdown</span></div>
      </div>
    </div>
  )
}
