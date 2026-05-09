import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>DeepGuard</span>
      <div className={styles.links}>
        <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
        <NavLink to="/analyze" className={({ isActive }) => isActive ? styles.active : ''}>Analyze</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>About</NavLink>
      </div>
    </nav>
  )
}
