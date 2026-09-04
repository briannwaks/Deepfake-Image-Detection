import { NavLink, useNavigate } from 'react-router-dom'
import { FiShield, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Signed out.')
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>
        <FiShield size={20} className={styles.brandIcon} />
        <span className={styles.brandText}>DeepGuard</span>
      </span>
      <div className={styles.links}>
        <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
        <NavLink to="/analyze" className={({ isActive }) => isActive ? styles.active : ''}>Analyze</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>About</NavLink>
      </div>
      <div className={styles.auth}>
        {user ? (
          <>
            <span className={styles.userName}>{user.displayName || user.email}</span>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
              <FiLogOut size={16} />
            </button>
          </>
        ) : (
          <NavLink to="/login" className={styles.loginLink}>Sign In</NavLink>
        )}
      </div>
    </nav>
  )
}
