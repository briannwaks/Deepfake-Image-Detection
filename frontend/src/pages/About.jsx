import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles.page}>
      <h2>About DeepGuard</h2>
      <p>
        DeepGuard is a final-year project by <strong>Brian</strong> and{' '}
        <strong>Mohammed Abdul Basit</strong>, built to detect AI-generated and
        manipulated images using deep learning.
      </p>
      <h3>How it works</h3>
      <ol>
        <li>Upload a JPEG, PNG, or WebP image.</li>
        <li>The image is sent to our FastAPI AI service.</li>
        <li>An EfficientNet / Xception CNN classifies it as Real or Fake.</li>
        <li>Grad-CAM generates a heatmap highlighting suspicious regions.</li>
        <li>A forensic report is returned alongside the verdict.</li>
      </ol>
      <h3>Stack</h3>
      <ul>
        <li>Frontend: React + Vite (PWA)</li>
        <li>Backend: Node.js + Express</li>
        <li>AI module: Python + FastAPI + TensorFlow/Keras</li>
      </ul>
    </div>
  )
}
