import styles from './detail.module.css';

export default function MobileDetailLoading() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading product details">
      <div className="container">
        {/* Breadcrumb Skeleton */}
        <div className={styles.breadcrumbNav}>
          <div
            className={styles.skeletonLine}
            style={{ width: '220px', height: '16px' }}
          />
        </div>

        {/* Two-Column Skeleton Layout */}
        <div className={styles.productGrid}>
          {/* Left Column: Gallery Skeleton */}
          <div>
            <div className={styles.skeletonGallery} />
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={styles.skeletonLine}
                  style={{ width: '72px', height: '84px', borderRadius: '8px' }}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Info Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              className={styles.skeletonLine}
              style={{ width: '100px', height: '14px' }}
            />
            <div
              className={styles.skeletonLine}
              style={{ width: '75%', height: '36px' }}
            />
            <div
              className={styles.skeletonLine}
              style={{ width: '90px', height: '16px' }}
            />
            <div
              className={styles.skeletonLine}
              style={{ width: '160px', height: '32px' }}
            />
            <div
              className={styles.skeletonLine}
              style={{ width: '100%', height: '48px', borderRadius: '8px' }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={styles.skeletonLine}
                  style={{ height: '60px', borderRadius: '8px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
