import { getStatsDashboardData } from '@lib/stats-repo';
import styles from './stats.module.css';

export const metadata = {
  title: 'QatarConnect | Statistics',
  description: 'Database-backed platform statistics for QatarConnect.',
};

// /stats is a server component — render fresh stats on every request
export const dynamic = 'force-dynamic';

function truncate(text, max = 140) {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max - 1) + '…';
}

function formatNumber(value) {
  return Number(value).toLocaleString();
}

function formatAverage(value) {
  return Number(value).toFixed(2);
}

function StatCard({ label, value }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statNumber}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default async function StatsPage() {
  const data = await getStatsDashboardData();
  const { totals, averages, mostActiveUserLast3Months, mostLikedPost, mostCommentedPost, generatedAt } = data;

  return (
    <>
      {/* Reuse the existing QatarConnect look — React 19 hoists these to <head> */}
      <link rel="stylesheet" href="/css/base.css" />
      <link rel="stylesheet" href="/css/components.css" />
      <link rel="stylesheet" href="/css/responsive.css" />

      <main className={styles.statsPage}>
        <header className="page-header">
          <h2>QatarConnect Statistics</h2>
        </header>
        <p className={styles.subtitle}>
          Live, database-backed metrics for the QatarConnect platform.
        </p>

        <h3 className={styles.sectionTitle}>Platform Totals</h3>
        <div className={styles.statsGrid}>
          <StatCard label="Users"    value={formatNumber(totals.users)} />
          <StatCard label="Posts"    value={formatNumber(totals.posts)} />
          <StatCard label="Comments" value={formatNumber(totals.comments)} />
          <StatCard label="Likes"    value={formatNumber(totals.likes)} />
          <StatCard label="Follows"  value={formatNumber(totals.follows)} />
        </div>

        <h3 className={styles.sectionTitle}>Averages</h3>
        <div className={styles.statsGrid}>
          <StatCard label="Followers per User" value={formatAverage(averages.followersPerUser)} />
          <StatCard label="Posts per User"     value={formatAverage(averages.postsPerUser)} />
        </div>

        <h3 className={styles.sectionTitle}>Highlights</h3>
        <div className={styles.highlightsGrid}>
          <section className={styles.highlightCard}>
            <div className={styles.highlightTitle}>Most active user · last 3 months</div>
            {mostActiveUserLast3Months ? (
              <>
                <div className={styles.highlightUser}>
                  <img
                    className="avatar avatar-md"
                    src={mostActiveUserLast3Months.avatar || 'https://via.placeholder.com/48'}
                    alt={`${mostActiveUserLast3Months.username} avatar`}
                  />
                  <div>
                    <div className={styles.highlightUserName}>@{mostActiveUserLast3Months.username}</div>
                    <div className={styles.highlightMeta}>
                      {mostActiveUserLast3Months.postCount} posts · {mostActiveUserLast3Months.commentCount} comments
                    </div>
                  </div>
                </div>
                <div className={styles.highlightMeta}>
                  Total activity: <span className={styles.highlightCount}>{mostActiveUserLast3Months.totalActivity}</span>
                </div>
              </>
            ) : (
              <p className={styles.empty}>No activity in the last 3 months.</p>
            )}
          </section>

          <section className={styles.highlightCard}>
            <div className={styles.highlightTitle}>Most liked post</div>
            {mostLikedPost ? (
              <>
                <div className={styles.highlightMeta}>by @{mostLikedPost.authorUsername || 'unknown'}</div>
                <div className={styles.highlightContent}>{truncate(mostLikedPost.content)}</div>
                <div className={styles.highlightMeta}>
                  <span className={styles.highlightCount}>{mostLikedPost.likeCount}</span> likes
                </div>
              </>
            ) : (
              <p className={styles.empty}>No posts yet.</p>
            )}
          </section>

          <section className={styles.highlightCard}>
            <div className={styles.highlightTitle}>Most commented post</div>
            {mostCommentedPost ? (
              <>
                <div className={styles.highlightMeta}>by @{mostCommentedPost.authorUsername || 'unknown'}</div>
                <div className={styles.highlightContent}>{truncate(mostCommentedPost.content)}</div>
                <div className={styles.highlightMeta}>
                  <span className={styles.highlightCount}>{mostCommentedPost.commentCount}</span> comments
                </div>
              </>
            ) : (
              <p className={styles.empty}>No posts yet.</p>
            )}
          </section>
        </div>

        <div className={styles.footerMeta}>
          <span>Generated at {new Date(generatedAt).toLocaleString()}</span>
          <a className="btn btn-secondary" href="/index.html">← Back to QatarConnect</a>
        </div>
      </main>
    </>
  );
}
