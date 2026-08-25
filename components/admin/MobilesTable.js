'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExternalImage from '@/components/common/ExternalImage';
import { useRouter } from 'next/navigation';
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Smartphone,
  Check,
} from 'lucide-react';
import AutoHorizontalScroll from '@/components/common/AutoHorizontalScroll';
import styles from './MobilesTable.module.css';

/**
 * Formats price to INR currency string.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function getStockBadgeClass(status) {
  switch (status) {
    case 'limited_stock':
      return styles.limitedStock;
    case 'out_of_stock':
      return styles.outOfStock;
    case 'in_stock':
    default:
      return styles.inStock;
  }
}

export default function MobilesTable({ initialMobiles = [] }) {
  const router = useRouter();
  const [mobiles, setMobiles] = useState(initialMobiles);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [deletingMobile, setDeletingMobile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Extract unique brands for filter dropdown
  const uniqueBrands = Array.from(new Set(mobiles.map((m) => m.brand))).filter(Boolean);

  // Filter & Sort Mobiles
  const filteredMobiles = mobiles
    .filter((m) => {
      const matchSearch =
        !search.trim() ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brand.toLowerCase().includes(search.toLowerCase());

      const matchBrand = brandFilter === 'all' || m.brand === brandFilter;
      const matchStock = stockFilter === 'all' || m.stock_status === stockFilter;
      const matchFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && m.is_featured) ||
        (featuredFilter === 'standard' && !m.is_featured);
      const matchVisibility =
        visibilityFilter === 'all' ||
        (visibilityFilter === 'visible' && !m.is_hidden) ||
        (visibilityFilter === 'hidden' && m.is_hidden);

      return matchSearch && matchBrand && matchStock && matchFeatured && matchVisibility;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'price-low-high') {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === 'price-high-low') {
        return Number(b.price) - Number(a.price);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Toggle Visibility
  const handleToggleVisibility = async (mobile) => {
    const nextHidden = !mobile.is_hidden;
    setActionError('');
    try {
      const res = await fetch(`/api/admin/mobiles/${mobile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mobile, is_hidden: nextHidden }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMobiles((prev) =>
          prev.map((m) => (m.id === mobile.id ? { ...m, is_hidden: nextHidden } : m))
        );
        router.refresh();
      } else {
        setActionError(data.message || 'Unable to update product visibility.');
      }
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setActionError('Unable to update product visibility. Please try again.');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (mobile) => {
    const nextFeatured = !mobile.is_featured;
    setActionError('');
    try {
      const res = await fetch(`/api/admin/mobiles/${mobile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mobile, is_featured: nextFeatured }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMobiles((prev) =>
          prev.map((m) => (m.id === mobile.id ? { ...m, is_featured: nextFeatured } : m))
        );
        router.refresh();
      } else {
        setActionError(data.message || 'Unable to update featured status.');
      }
    } catch (err) {
      console.error('Error toggling featured:', err);
      setActionError('Unable to update featured status. Please try again.');
    }
  };

  // Delete Mobile
  const handleConfirmDelete = async () => {
    if (!deletingMobile) return;
    setIsDeleting(true);
    setActionError('');
    try {
      const res = await fetch(`/api/admin/mobiles/${deletingMobile.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMobiles((prev) => prev.filter((m) => m.id !== deletingMobile.id));
        setDeletingMobile(null);
        router.refresh();
      } else {
        setActionError(data.message || 'Unable to delete mobile.');
      }
    } catch (err) {
      console.error('Error deleting mobile:', err);
      setActionError('Unable to delete mobile. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      {actionError && (
        <div
          role="alert"
          style={{
            marginBottom: '16px',
            padding: '12px 14px',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            color: '#fca5a5',
            background: 'rgba(127, 29, 29, 0.2)',
          }}
        >
          {actionError}
        </div>
      )}

      {/* Controls / Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or brand..."
            className={styles.searchInput}
            aria-label="Search mobiles"
          />
        </div>

        <div className={styles.selectGroup}>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by brand"
          >
            <option value="all">All Brands</option>
            {uniqueBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by stock status"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="limited_stock">Limited Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by featured status"
          >
            <option value="all">All Products</option>
            <option value="featured">Featured Only</option>
            <option value="standard">Standard</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by visibility"
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
            aria-label="Sort mobiles"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Mobiles Catalog Table */}
      <div className={styles.tableCard}>
        <AutoHorizontalScroll className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Product</th>
                <th className={styles.th}>Specs</th>
                <th className={styles.th}>Price</th>
                <th className={styles.th}>Stock</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMobiles.length > 0 ? (
                filteredMobiles.map((mobile) => {
                  const primaryImg =
                    mobile.mobile_images?.find((img) => img.display_order === 0)?.image_url ||
                    mobile.mobile_images?.[0]?.image_url;

                  return (
                    <tr key={mobile.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.productCell}>
                          <div className={styles.thumbnail}>
                            <ExternalImage
                              src={primaryImg}
                              alt={mobile.name}
                              fill
                              sizes="44px"
                              className={styles.thumbImg}
                              fallbackIcon={<Smartphone size={20} color="#94a3b8" aria-hidden="true" />}
                            />
                          </div>
                          <div>
                            <span className={styles.brand}>{mobile.brand}</span>
                            <div className={styles.name}>{mobile.name}</div>
                          </div>
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                          {mobile.ram} · {mobile.storage}
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.price}>{formatCurrency(mobile.price)}</div>
                        {mobile.original_price && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                            {formatCurrency(mobile.original_price)}
                          </div>
                        )}
                      </td>

                      <td className={styles.td}>
                        <span className={`${styles.badge} ${getStockBadgeClass(mobile.stock_status)}`}>
                          {mobile.stock_status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className={styles.td}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span
                            className={`${styles.badge} ${
                              mobile.is_hidden ? styles.hiddenBadge : styles.visibleBadge
                            }`}
                          >
                            {mobile.is_hidden ? 'Hidden' : 'Visible'}
                          </span>
                          {mobile.is_featured && (
                            <span className={`${styles.badge} ${styles.featuredBadge}`}>
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                          {/* Toggle Featured */}
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(mobile)}
                            className={styles.actionBtn}
                            title={mobile.is_featured ? 'Remove from featured' : 'Set as featured'}
                            aria-label={`Toggle featured for ${mobile.name}`}
                          >
                            <Star
                              size={15}
                              color={mobile.is_featured ? '#eab308' : 'currentColor'}
                              fill={mobile.is_featured ? '#eab308' : 'none'}
                            />
                          </button>

                          {/* Toggle Visibility */}
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(mobile)}
                            className={styles.actionBtn}
                            title={mobile.is_hidden ? 'Make visible' : 'Hide from storefront'}
                            aria-label={`Toggle visibility for ${mobile.name}`}
                          >
                            {mobile.is_hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>

                          {/* Edit Mobile */}
                          <Link
                            href={`/admin/mobiles/${mobile.id}/edit`}
                            className={styles.actionBtn}
                            title="Edit product"
                            aria-label={`Edit ${mobile.name}`}
                          >
                            <Edit2 size={15} />
                          </Link>

                          {/* Delete Mobile */}
                          <button
                            type="button"
                            onClick={() => setDeletingMobile(mobile)}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Delete product"
                            aria-label={`Delete ${mobile.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-muted)' }}>
                    No mobiles found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </AutoHorizontalScroll>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingMobile && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDeletingMobile(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete Mobile</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete <strong>{deletingMobile.name}</strong>?
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeletingMobile(null)}
                className="btn btn-outline"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
