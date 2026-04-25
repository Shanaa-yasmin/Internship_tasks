import styles from "../styles/Announcement.module.css";

const typeConfig = {
  critical: { dot: "#d85a30", bg: "#fff8f5", border: "#f5c4b3", tagBg: "#faece7", tagColor: "#993c1d" },
  info:     { dot: "#378add", bg: "#f5f8ff", border: "#b5d4f4", tagBg: "#e6f1fb", tagColor: "#185fa5" },
  success:  { dot: "#3b8a52", bg: "#f4fbf6", border: "#9fe1cb", tagBg: "#e1f5ee", tagColor: "#0f6e56" },
};

function AnnouncementCard({ type, title, message, tag }) {
  const c = typeConfig[type] || typeConfig.info;
  return (
    <div className={styles.card} style={{ background: c.bg, borderColor: c.border }}>
      <div className={styles.cardTop}>
        <div className={styles.dot} style={{ background: c.dot }} />
        <span className={styles.title}>{title}</span>
        <span className={styles.tag} style={{ background: c.tagBg, color: c.tagColor }}>{tag}</span>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

function Announcement({ items }) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Announcements</h2>
        <span className={styles.count}>{items.length} new</span>
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <AnnouncementCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}

export default Announcement;
