import styles from './mobiles.module.css';

export default function MobilesLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading catalog">
      <div className="container">
        {/* Header Skeleton */}
        <header className={styles.header}>
          <div
            className={styles.skeletonLine}
            style={{ width: '120px', height: '14px', marginBottom: '12px' }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: '70%', height: '36px', marginBottom: '16px' }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: '90%', height: '18px' }}
          />
        </header>

        {/* Search & Filter Toolbar Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div
              className={styles.skeletonLine}
              style={{ width: '320px', height: '44px', borderRadius: '8px' }}
            />
            <div
              className={styles.skeletonLine}
              style={{ width: '160px', height: '44px', borderRadius: '8px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={styles.skeletonLine}
                style={{ width: '56px', height: '32px', borderRadius: '9999px' }}
              />
            ))}
          </div>
        </div>

        {/* Meta Row Skeleton */}
        <div className={styles.metaRow}>
          <div className={styles.skeletonLine} style={{ width: '140px' }} />
        </div>

        {/* 8 Card Skeletons Grid */}
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} aria-hidden="true">
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonBody}>
                <div
                  className={styles.skeletonLine}
                  style={{ width: '40%', height: '12px' }}
                />
                <div
                  className={styles.skeletonLine}
                  style={{ width: '85%', height: '18px' }}
                />
                <div
                  className={styles.skeletonLine}
                  style={{ width: '55%', height: '14px' }}
                />
                <div
                  className={styles.skeletonLine}
                  style={{
                    width: '50%',
                    height: '20px',
                    marginTop: '8px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
