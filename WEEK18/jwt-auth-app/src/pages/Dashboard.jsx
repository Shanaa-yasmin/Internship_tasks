import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAxiosPrivate } from '../api/useAxiosPrivate'
import styles from './Dashboard.module.css'

/* ── Icons ── */
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

/* ── Stat card data ── */
const STATS = [
  {
    label: 'Active Sessions',
    value: '1',
    change: '+1 today',
    up: true,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'API Calls',
    value: '2,847',
    change: '+12% vs last week',
    up: true,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    label: 'Token Refreshes',
    value: '14',
    change: '-3 vs yesterday',
    up: false,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    ),
  },
  {
    label: 'Security Score',
    value: '98',
    change: '+2 this month',
    up: true,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
]

export default function Dashboard() {
  const { user, accessToken, logout } = useAuth()
  const navigate = useNavigate()

  /*
   * useAxiosPrivate gives us an axios instance with interceptors attached.
   * Any request made with `api` will automatically carry the Bearer token
   * and handle silent refresh on 401s.
   */
  const api = useAxiosPrivate()

  const handleLogout = async () => {
    await logout()          // clears state + calls /api/logout
    navigate('/login', { replace: true })
  }

  // Truncate token for display (never expose full token in UI)
  const truncateToken = (token) => {
    if (!token) return '—'
    return `${token.slice(0, 20)}…${token.slice(-8)}`
  }

  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <div className={styles.navIcon}><IconShield /></div>
          <span className={styles.navTitle}>SecureAuth</span>
        </div>

        <div className={styles.navRight}>
          {user && (
            <div className={styles.navUser}>
              <div className={styles.avatar}>{user.avatar || user.name?.[0] || 'U'}</div>
              <div className={styles.navUserInfo}>
                <span className={styles.navUserName}>{user.name}</span>
                <span className={styles.navUserRole}>{user.role}</span>
              </div>
            </div>
          )}
          <div className={styles.divider} />
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <IconLogout />
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className={styles.main}>
        {/* Welcome */}
        <div className={styles.welcome}>
          <p className={styles.welcomeEyebrow}>Dashboard</p>
          <h1 className={styles.welcomeHeading}>
            Hello, <span>{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className={styles.welcomeSub}>
            You're authenticated. Your session is active and tokens are valid.
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{s.label}</span>
                <div className={styles.statIcon} style={{ background: s.bg }}>
                  {s.icon}
                </div>
              </div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={`${styles.statChange} ${s.up ? styles.statChangeUp : styles.statChangeDown}`}>
                {s.up ? '↑' : '↓'} {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Auth Info */}
        <p className={styles.sectionTitle}>Auth Context</p>
        <div className={styles.infoCard}>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Status</span>
              <span><span className={styles.badge}>Authenticated</span></span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>User ID</span>
              <span className={styles.infoVal}>{user?.id ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Email</span>
              <span className={styles.infoVal}>{user?.email ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Role</span>
              <span className={styles.infoVal}>{user?.role ?? '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Access Token (memory)</span>
              <span className={styles.infoVal}>{truncateToken(accessToken)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>Refresh Token</span>
              <span className={styles.infoVal}>httpOnly cookie (not readable by JS)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
