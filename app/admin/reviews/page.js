'use client';

import { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Trash2, Search, Filter } from 'lucide-react';
import AutoHorizontalScroll from '@/components/common/AutoHorizontalScroll';
import styles from './reviews.module.css';

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'visible' | 'hidden'
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleToggleVisibility = async (id, currentHidden) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_hidden: !currentHidden }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_hidden: !currentHidden } : r))
        );
      } else {
        alert(data.message || 'Failed to update visibility.');
      }
    } catch (err) {
      console.error('Error toggling visibility:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) {
      return;
    }
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.message || 'Failed to delete review.');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredReviews = reviews.filter((r) => {
    // 1. Filter by visibility tab
    if (filter === 'visible' && r.is_hidden) return false;
    if (filter === 'hidden' && !r.is_hidden) return false;

    // 2. Filter by search query
    const q = search.toLowerCase();
    if (!q) return true;
    const nameMatch = r.customer_name?.toLowerCase().includes(q);
    const prodMatch = r.mobiles ? `${r.mobiles.brand} ${r.mobiles.name}`.toLowerCase().includes(q) : false;
    const textMatch = r.review_text?.toLowerCase().includes(q) || r.title?.toLowerCase().includes(q);
    return nameMatch || prodMatch || textMatch;
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Reviews Management</h1>
          <p className={styles.subtitle}>
            Moderate customer product feedback, toggle homepage visibility, and remove spam.
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by customer, product, or review text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search reviews"
          />
        </div>

        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === 'visible' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('visible')}
          >
            Visible ({reviews.filter((r) => !r.is_hidden).length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === 'hidden' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('hidden')}
          >
            Hidden ({reviews.filter((r) => r.is_hidden).length})
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <AutoHorizontalScroll className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>Loading customer reviews...</div>
          ) : filteredReviews.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Customer</th>
                  <th className={styles.th}>Product</th>
                  <th className={styles.th}>Rating</th>
                  <th className={styles.th}>Review Content</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r) => (
                  <tr key={r.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>
                        {r.customer_name}
                      </div>
                      {r.customer_role && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                          {r.customer_role}
                        </div>
                      )}
                    </td>
                    <td className={styles.td}>
                      <span style={{ fontWeight: 500 }}>
                        {r.mobiles ? `${r.mobiles.brand} ${r.mobiles.name}` : 'General Review'}
                      </span>
                    </td>
                    <td className={styles.td}>
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
                    </td>
                    <td className={styles.td} style={{ maxWidth: '300px' }}>
                      {r.title && <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{r.title}</div>}
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                        {r.review_text}
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                      {formatDate(r.created_at)}
                    </td>
                    <td className={styles.td}>
                      {r.is_hidden ? (
                        <span className={styles.hiddenBadge}>Hidden</span>
                      ) : (
                        <span className={styles.visibleBadge}>Visible</span>
                      )}
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(r.id, r.is_hidden)}
                          disabled={actionLoading[r.id]}
                          className="btn btn-outline"
                          style={{ height: '30px', padding: '0 8px', fontSize: '0.75rem' }}
                          title={r.is_hidden ? 'Make visible' : 'Hide from storefront'}
                        >
                          {r.is_hidden ? (
                            <>
                              <Eye size={12} style={{ marginRight: '4px' }} /> Show
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} style={{ marginRight: '4px' }} /> Hide
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          disabled={actionLoading[r.id]}
                          className="btn btn-outline"
                          style={{ height: '30px', padding: '0 8px', fontSize: '0.75rem', color: '#ef4444' }}
                          title="Delete review"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              {search ? 'No reviews matched your search.' : 'No customer reviews recorded yet.'}
            </div>
          )}
        </AutoHorizontalScroll>
      </div>
    </div>
  );
}
