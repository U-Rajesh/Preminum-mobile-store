import styles from './contact.module.css';

export default function ContactLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading contact page">
      <div className="container">
        {/* Hero Skeleton */}
        <div className={styles.hero}>
          <div
            className={styles.skeletonLine}
            style={{ width: '120px', height: '14px', marginBottom: '12px' }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: '80%', height: '36px', marginBottom: '16px' }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: '95%', height: '18px' }}
          />
        </div>

        {/* Layout Skeleton */}
        <div className={styles.layoutGrid}>
          {/* Left Column Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className={styles.skeletonBox} style={{ height: '240px' }} />
            <div className={styles.skeletonBox} style={{ height: '260px' }} />
          </div>

          {/* Right Column Skeleton */}
          <div>
            <div className={styles.skeletonBox} style={{ height: '520px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
