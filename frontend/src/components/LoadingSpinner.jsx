import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner({ message = 'Analysing image…' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p>{message}</p>
    </div>
  )
}
