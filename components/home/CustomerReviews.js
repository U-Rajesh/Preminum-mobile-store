import { getVisibleReviews } from '@/lib/services/reviews';
import ReviewCard from './ReviewCard';
import styles from './CustomerReviews.module.css';

export default async function CustomerReviews() {
  let reviews = [];
  let hasError = false;

  try {
    reviews = await getVisibleReviews();
  } catch (err) {
    console.error('Error in CustomerReviews component:', err.message);
    hasError = true;
  }

  // Split reviews into two rows if 4 or more reviews exist
  const hasMultipleRows = reviews.length >= 4;
  const row1Reviews = hasMultipleRows
    ? reviews.filter((_, idx) => idx % 2 === 0)
    : reviews;
  const row2Reviews = hasMultipleRows
    ? reviews.filter((_, idx) => idx % 2 !== 0)
    : [];

  return (
    <section className={styles.section} aria-labelledby="customer-reviews-heading">
      {/* Section Header */}
      <div className="container">
        <div className={styles.header}>
          <div className={styles.eyebrowWrapper}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span className={styles.eyebrow}>Verified Feedback</span>
            <span className={styles.eyebrowLine} aria-hidden="true" />
          </div>
          <h2 id="customer-reviews-heading" className={styles.heading}>
            Loved by people who value great technology.
          </h2>
          <p className={styles.subtitle}>
            Real experiences from customers who found their next everyday device
            with us.
          </p>
        </div>
      </div>

      {/* Error State */}
      {hasError ? (
        <div className="container">
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Unable to load customer stories</h3>
            <p className={styles.emptyText}>
              Please check back later to read real experiences from our community.
            </p>
          </div>
        </div>
      ) : reviews.length > 0 ? (
        /* Infinite Marquee Rows */
        <div className={styles.marqueeContainer}>
          {/* Row 1: Right to Left */}
          <div className={styles.viewport}>
            <div className={`${styles.track} ${styles.trackLeft}`}>
              {/* Primary Accessible Group */}
              <div className={styles.group}>
                {row1Reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Duplicate Group for Seamless Loop */}
              <div className={styles.group} aria-hidden="true">
                {row1Reviews.map((review, i) => (
                  <ReviewCard key={`dup-row1-${review.id}-${i}`} review={review} />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Left to Right (if multiple rows available) */}
          {hasMultipleRows && row2Reviews.length > 0 && (
            <div className={styles.viewport}>
              <div className={`${styles.track} ${styles.trackRight}`}>
                {/* Primary Accessible Group */}
                <div className={styles.group}>
                  {row2Reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {/* Duplicate Group for Seamless Loop */}
                <div className={styles.group} aria-hidden="true">
                  {row2Reviews.map((review, i) => (
                    <ReviewCard key={`dup-row2-${review.id}-${i}`} review={review} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="container">
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Customer Reviews</h3>
            <p className={styles.emptyText}>
              Be the first to share your experience. Real customer stories will appear here soon.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
