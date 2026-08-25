'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import AutoHorizontalScroll from '@/components/common/AutoHorizontalScroll';
import styles from './InquiriesTable.module.css';

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusBadgeClass(status) {
  const s = typeof status === 'string' ? status.toLowerCase() : '';
  switch (s) {
    case 'resolved':
      return styles.statusResolved;
    case 'read':
      return styles.statusRead;
    case 'new':
    case 'unread':
    default:
      return styles.statusNew;
  }
}

export default function InquiriesTable({ initialInquiries = [] }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fetchError, setFetchError] = useState(null);

  // Sync with initialInquiries when props change
  useEffect(() => {
    if (Array.isArray(initialInquiries) && initialInquiries.length > 0) {
      setInquiries(initialInquiries);
    }
  }, [initialInquiries]);

  // Load fresh inquiries from the admin API endpoint
  const loadFreshInquiries = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      } else if (data.error || data.message) {
        setFetchError(data.message || data.error);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      setFetchError('Unable to load inquiries. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFreshInquiries();
  }, []);

  const filteredInquiries = (inquiries || []).filter((inq) => {
    const term = search.toLowerCase().trim();
    const matchSearch =
      !term ||
      inq.name?.toLowerCase().includes(term) ||
      inq.email?.toLowerCase().includes(term) ||
      inq.phone?.toLowerCase().includes(term) ||
      inq.subject?.toLowerCase().includes(term) ||
      inq.message?.toLowerCase().includes(term);

    const matchStatus =
      statusFilter === 'all' ||
      inq.status?.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === 'new' && (!inq.status || inq.status === 'unread'));

    return matchSearch && matchStatus;
  });

  return (
    <div className={styles.container}>
      {/* Filter / Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or subject..."
            className={styles.searchInput}
            aria-label="Search inquiries"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by inquiry status"
          >
            <option value="all">All Inquiries</option>
            <option value="new">New / Unread</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            type="button"
            onClick={loadFreshInquiries}
            className="btn btn-outline"
            style={{ height: '40px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            aria-label="Refresh inquiries"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} aria-hidden="true" />
            <span style={{ fontSize: '0.8125rem' }}>Refresh</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
          }}
          role="alert"
        >
          <AlertCircle size={16} aria-hidden="true" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Inquiries Table */}
      <div className={styles.tableCard}>
        <AutoHorizontalScroll className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Subject</th>
                <th className={styles.th}>Message Preview</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (!inquiries || inquiries.length === 0) ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-muted)' }}>
                    Loading customer inquiries...
                  </td>
                </tr>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((inq) => (
                  <tr key={inq.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{inq.name || 'Anonymous Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                        {inq.email} {inq.phone ? `· ${inq.phone}` : ''}
                      </div>
                    </td>

                    <td className={styles.td} style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {inq.subject || 'No Subject'}
                    </td>

                    <td className={styles.td} style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-secondary)' }}>
                      {inq.message || '—'}
                    </td>

                    <td className={styles.td}>{formatDate(inq.created_at)}</td>

                    <td className={styles.td}>
                      <span className={`${styles.badge} ${getStatusBadgeClass(inq.status)}`}>
                        {inq.status || 'new'}
                      </span>
                    </td>

                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <Link
                        href={`/admin/inquiries/${inq.id}`}
                        className="btn btn-outline"
                        style={{ height: '32px', padding: '0 10px', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} aria-hidden="true" style={{ marginRight: '4px' }} />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-muted)' }}>
                    No customer inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </AutoHorizontalScroll>
      </div>
    </div>
  );
}
