import styles from "../styles/RecentItems.module.css";

function ActivityRow({ user, action, detail, time, avatar }) {
  return (
    <>
      <li className={styles.row}>
        <div className={styles.avatar}>{avatar}</div>
        <div className={styles.info}>
          <p className={styles.text}>
            <strong>{user}</strong> <span>{action}</span>
          </p>
          <span className={styles.detail}>{detail}</span>
        </div>
        <span className={styles.time}>{time}</span>
      </li>
      <div className={styles.divider} />
    </>
  );
}

function RecentItems({ items }) {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Recent activity</h2>
        <button className={styles.viewAll}>View all</button>
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <ActivityRow key={item.id} {...item} />
        ))}
      </ul>
    </section>
  );
}

export default RecentItems;
