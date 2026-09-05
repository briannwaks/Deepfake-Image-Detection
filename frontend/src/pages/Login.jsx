import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { Link, useNavigate } from 'react-router-dom'
import { FiShield, FiMail, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/analyze')
    } catch (err) {
      toast.error(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <FiShield size={32} />
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to DeepGuard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <FiMail className={styles.fieldIcon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <FiLock className={styles.fieldIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    default:
      return 'Sign in failed. Please try again.'
  }
}
