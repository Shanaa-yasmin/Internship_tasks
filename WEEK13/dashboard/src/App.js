import StatCard from "./components/StatCard";
import RecentItems from "./components/RecentItems";
import Announcement from "./components/Announcement";
import { statsData, recentItems, announcements } from "./data/dashboardData";
import styles from "./styles/App.module.css";

const navItems = [
  { label: "Overview",  active: true },
  { label: "Analytics" },
  { label: "Users" },
  { label: "Reports" },
  { label: "Settings" },
];

function App() {
  const now = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoDot} />
          <span className={styles.logoText}>Workspace</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ label, active }) => (
            <button key={label} className={`${styles.navItem} ${active ? styles.navActive : ""}`}>
              <span className={styles.navLabel}>{label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>AD</div>
            <div>
              <p className={styles.userName}>Admin</p>
              <p className={styles.userRole}>super user</p>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>{greeting}</h1>
            <p className={styles.pageDate}>{now}</p>
          </div>
          <div className={styles.topActions}>
            <button className={styles.actionBtn} aria-label="Notifications">
              <svg viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 1a5 5 0 0 1 5 5c0 3 1 4 1.5 5h-13C2 10 3 9 3 6a5 5 0 0 1 5-5zM6 11a2 2 0 0 0 4 0"/>
              </svg>
              <span className={styles.notifDot} />
            </button>
            <button className={styles.actionBtn} aria-label="Search">
              <svg viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/>
              </svg>
            </button>
          </div>
        </header>

        <section className={styles.statsRow}>
          {statsData.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </section>

        <section className={styles.bottomRow}>
          <RecentItems items={recentItems} />
          <Announcement items={announcements} />
        </section>
      </main>
    </div>
  );
}

export default App;
