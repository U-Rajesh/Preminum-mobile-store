'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MessageSquarePlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './ProductReviews.module.css';

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProductReviews({ mobileId, mobileName, initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating from 1 to 5.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg('Please write a review comment (minimum 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setSuccessMsg('Thank you! Your review has been published.');
        setReviews((prev) => [data.review, ...prev]);
        setTitle('');
        setComment('');
        setRating(5);
        setShowForm(false);
      } else {
        setErrorMsg(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred while submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.reviewsSection} aria-labelledby="product-reviews-heading">
      <div className={styles.header}>
        <div>
          <h2 id="product-reviews-heading" className={styles.title}>
            Customer Reviews ({reviews.length})
          </h2>
          <p className={styles.subtitle}>
            Verified customer ratings and real feedback for {mobileName}.
          </p>
        </div>

        {/* Review Action Trigger (Hidden for Admin Users) */}
        {!isAdmin && (
          <div>
            {user ? (
              <button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="btn btn-outline"
                style={{ height: '40px', padding: '0 16px' }}
              >
                <MessageSquarePlus size={16} style={{ marginRight: '6px' }} />
                <span>{showForm ? 'Close Review Form' : 'Write a Review'}</span>
              </button>
            ) : (
              <Link
                href={`/login?next=/mobiles/${mobileId}`}
                className="btn btn-outline"
                style={{ height: '40px', padding: '0 16px', fontSize: '0.875rem' }}
              >
                <span>Login to write a review</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {successMsg && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.875rem',
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Review Submission Form (Only if authenticated customer and opened) */}
      {showForm && user && !isAdmin && (
        <div className={styles.reviewFormCard}>
          <h3 className={styles.formTitle}>Share Your Experience with {mobileName}</h3>

          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.8125rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Interactive Stars */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                Overall Rating
              </label>
              <div className={styles.starRatingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={styles.starBtn}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} star rating`}
                  >
                    <Star
                      size={24}
                      fill={(hoverRating || rating) >= star ? '#eab308' : 'none'}
                      color="#eab308"
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: '8px', color: 'var(--color-foreground)' }}>
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                Headline / Title (optional)
              </label>
              <input
                type="text"
                className="input"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-foreground)',
                  fontSize: '0.875rem',
                }}
                placeholder="e.g. Incredible battery life and screen clarity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Review Comment */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                Your Review
              </label>
              <textarea
                style={{
                  width: '100%',
                  minHeight: '90px',
                  padding: '10px 12px',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-foreground)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
                placeholder="What did you like or dislike about this smartphone?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ height: '40px', padding: '0 20px', fontSize: '0.875rem' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
                style={{ height: '40px', padding: '0 16px', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className={styles.reviewGrid}>
          {reviews.map((r) => {
            const initial = (r.customer_name || 'C')[0].toUpperCase();
            return (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewerRow}>
                  <div className={styles.avatar}>{initial}</div>
                  <div>
                    <div className={styles.reviewerName}>{r.customer_name}</div>
                    <div className={styles.reviewRole}>{r.customer_role || 'Verified Buyer'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                  <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < r.rating ? '#eab308' : 'none'}
                        color="#eab308"
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                    {formatDate(r.created_at)}
                  </span>
                </div>

                {r.title && <div className={styles.reviewTitle}>{r.title}</div>}
                <p className={styles.reviewText}>{r.review_text}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-secondary)' }}>
            No customer reviews for {mobileName} yet.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
            Be the first to share your experience with this device.
          </p>
        </div>
      )}
    </section>
  );
}
