import styles from './ResultCard.module.css'

export default function ResultCard({ result }) {
  const isFake = result.prediction === 'FAKE'
  return (
    <div className={`${styles.card} ${isFake ? styles.fake : styles.real}`}>
      <div className={styles.verdict}>
        <span className={styles.label}>{result.prediction}</span>
        <span className={styles.score}>{(result.confidence * 100).toFixed(1)}% confidence</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${result.confidence * 100}%` }} />
      </div>
      <p className={styles.summary}>
        {isFake
          ? 'This image shows signs of AI-generated or manipulated content.'
          : 'No manipulation artifacts detected. Image appears authentic.'}
      </p>
    </div>
  )
}
