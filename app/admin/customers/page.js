'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, ShoppingBag, Star, ArrowRight, Phone, Mail, Calendar } from 'lucide-react';
import AutoHorizontalScroll from '@/components/common/AutoHorizontalScroll';
import styles from './customers.module.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/admin/customers');
        const data = await res.json();
        if (data.success) {
          setCustomers(data.customers || []);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const nameMatch = c.full_name?.toLowerCase().includes(q);
    const emailMatch = c.email?.toLowerCase().includes(q);
    const phoneMatch = c.phone?.toLowerCase().includes(q);
    return !q || nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Management</h1>
          <p className={styles.subtitle}>
            View registered customer accounts, order summaries, and activity metrics.
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by customer name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search customers"
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <AutoHorizontalScroll className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>Loading customer accounts...</div>
          ) : filteredCustomers.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Customer</th>
                  <th className={styles.th}>Contact Info</th>
                  <th className={styles.th}>Joined Date</th>
                  <th className={styles.th}>Total Orders</th>
                  <th className={styles.th}>Total Spent</th>
                  <th className={styles.th}>Reviews</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>
                        {c.full_name || 'Anonymous Customer'}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8125rem' }}>
                        {c.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)' }}>
                            <Mail size={12} /> {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)' }}>
                            <Phone size={12} /> {c.phone}
                          </span>
                        )}
                        {!c.email && !c.phone && <span style={{ color: 'var(--color-secondary)' }}>—</span>}
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                      {formatDate(c.created_at)}
                    </td>
                    <td className={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <ShoppingBag size={14} style={{ color: 'var(--color-secondary)' }} />
                        {c.total_orders}
                      </span>
                    </td>
                    <td className={styles.td} style={{ fontWeight: 600 }}>
                      {formatCurrency(c.total_spent)}
                    </td>
                    <td className={styles.td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)' }}>
                        <Star size={14} />
                        {c.review_count}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="btn btn-outline"
                        style={{ height: '32px', padding: '0 10px', fontSize: '0.75rem' }}
                      >
                        <span>Details</span>
                        <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              {search ? 'No customers found matching your search.' : 'No customer profiles registered yet.'}
            </div>
          )}
        </AutoHorizontalScroll>
      </div>
    </div>
  );
}
