import styles from "../styles/StatCard.module.css";

const icons = {
  users: (
    <svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>
  ),
  sales: (
    <svg viewBox="0 0 16 16"><path d="M2 2h2l2 8h6l2-6H5"/><circle cx="7" cy="13" r="1"/><circle cx="12" cy="13" r="1"/></svg>
  ),
  revenue: (
    <svg viewBox="0 0 16 16"><line x1="8" y1="1" x2="8" y2="3"/><path d="M5 5h4.5a2 2 0 0 1 0 4H5v4h5"/><line x1="8" y1="13" x2="8" y2="15"/></svg>
  ),
};

function StatCard({ title, value, change, positive, icon }) {
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.iconWrap}>{icons[icon]}</div>
        <span className={`${styles.badge} ${positive ? styles.positive : styles.negative}`}>
          {positive ? "+" : ""}{change}
        </span>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{title}</div>
    </div>
  );
}

export default StatCard;
