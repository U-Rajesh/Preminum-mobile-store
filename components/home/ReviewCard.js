import ExternalImage from '@/components/common/ExternalImage';
import { Star } from 'lucide-react';
import styles from './ReviewCard.module.css';

/**
 * Extracts 1-2 uppercase initials from customer name.
 * @param {string} name
 * @returns {string} Initials string (e.g. "RK", "A")
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ReviewCard({ review }) {
  if (!review) return null;

  const customerName = review.customer_name || 'Verified Customer';
  const customerRole = review.customer_role || 'Verified Buyer';
  const rating = Math.min(Math.max(Number(review.rating) || 5, 1), 5);
  const initials = getInitials(customerName);
  const reviewContent = review.review_text || review.comment || '';

  return (
    <article className={styles.card} aria-label={`Review by ${customerName}`}>
      {/* Customer Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {review.customer_avatar ? (
            <ExternalImage
              src={review.customer_avatar}
              alt={`${customerName}'s avatar`}
              width={44}
              height={44}
              className={styles.avatarImage}
              fallback={
                <span className={styles.initials} aria-hidden="true">
                  {initials}
                </span>
              }
            />
          ) : (
            <span className={styles.initials} aria-hidden="true">
              {initials}
            </span>
          )}
        </div>

        <div className={styles.userInfo}>
          <span className={styles.name}>{customerName}</span>
          {customerRole && (
            <span className={styles.role}>{customerRole}</span>
          )}
        </div>
      </div>

      {/* Star Rating and Product Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 4px' }}>
        <div
          className={styles.ratingRow}
          role="img"
          aria-label={`${rating} out of 5 stars`}
        >
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <Star
              key={starIndex}
              size={16}
              className={starIndex <= rating ? styles.starFilled : styles.starEmpty}
              aria-hidden="true"
            />
          ))}
        </div>

        {review.mobiles && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
            {review.mobiles.brand} {review.mobiles.name}
          </span>
        )}
      </div>

      {review.title && (
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '4px' }}>
          {review.title}
        </div>
      )}

      {/* Review Text */}
      <p className={styles.reviewText}>
        &ldquo;{reviewContent}&rdquo;
      </p>
    </article>
  );
}
