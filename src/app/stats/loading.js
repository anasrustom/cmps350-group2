import styles from './stats.module.css';

export default function StatsLoading() {
  return (
    <>
      <link rel="stylesheet" href="/css/base.css" />
      <link rel="stylesheet" href="/css/components.css" />
      <link rel="stylesheet" href="/css/responsive.css" />

      <main className={styles.statsPage}>
        <header className="page-header">
          <h2>QatarConnect Statistics</h2>
        </header>
        <p className={styles.subtitle}>Loading platform statistics…</p>

        <h3 className={styles.sectionTitle}>Platform Totals</h3>
        <div className={styles.statsGrid}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />
          ))}
        </div>

        <h3 className={styles.sectionTitle}>Averages</h3>
        <div className={styles.statsGrid}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />
          ))}
        </div>

        <h3 className={styles.sectionTitle}>Highlights</h3>
        <div className={styles.highlightsGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonHighlight}`} />
          ))}
        </div>
      </main>
    </>
  );
}
