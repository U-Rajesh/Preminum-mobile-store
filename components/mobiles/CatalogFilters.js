'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import CatalogSearch from './CatalogSearch';
import styles from './CatalogFilters.module.css';

const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB'];
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'normal' },
  { label: 'Price: Low to High', value: 'price-low-high' },
  { label: 'Price: High to Low', value: 'price-high-low' },
];

export default function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRam = searchParams.get('ram') || 'all';
  const currentStorage = searchParams.get('storage') || 'all';
  const currentSort = searchParams.get('sort') || 'normal';
  const currentQuery = searchParams.get('q') || '';

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Safe URL parameter updater preserving existing parameters
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'all' && value !== 'normal') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const queryString = params.toString();
    router.replace(queryString ? `/mobiles?${queryString}` : '/mobiles', {
      scroll: false,
    });
  };

  const handleReset = () => {
    router.replace('/mobiles', { scroll: false });
    setIsDrawerOpen(false);
  };

  const hasActiveFilters =
    Boolean(currentQuery) ||
    currentRam !== 'all' ||
    currentStorage !== 'all' ||
    currentSort !== 'normal';

  const activeFilterCount =
    (currentRam !== 'all' ? 1 : 0) + (currentStorage !== 'all' ? 1 : 0);

  return (
    <div className={styles.filterToolbar}>
      {/* Top Action Row: Search and Desktop Sort */}
      <div className={styles.topRow}>
        <div className={styles.searchContainer}>
          <CatalogSearch />
        </div>

        {/* Desktop Sort Control */}
        <div className={styles.sortContainer}>
          <label htmlFor="sort-select" className={styles.sortLabel}>
            Sort by:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className={styles.sortSelect}
            aria-label="Sort mobiles"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Filter Pills */}
      <div className={styles.desktopFilters}>
        {/* RAM Filter Row */}
        <div className={styles.filterGroupRow}>
          <span className={styles.filterGroupLabel}>RAM:</span>
          <div className={styles.pillList} role="group" aria-label="RAM filter">
            <button
              type="button"
              onClick={() => updateFilter('ram', 'all')}
              className={`${styles.pillBtn} ${
                currentRam === 'all' ? styles.pillBtnActive : ''
              }`}
              aria-pressed={currentRam === 'all'}
            >
              All
            </button>
            {RAM_OPTIONS.map((ram) => (
              <button
                key={ram}
                type="button"
                onClick={() => updateFilter('ram', ram)}
                className={`${styles.pillBtn} ${
                  currentRam === ram ? styles.pillBtnActive : ''
                }`}
                aria-pressed={currentRam === ram}
              >
                {ram}
              </button>
            ))}
          </div>
        </div>

        {/* Storage Filter Row */}
        <div className={styles.filterGroupRow}>
          <span className={styles.filterGroupLabel}>Storage:</span>
          <div
            className={styles.pillList}
            role="group"
            aria-label="Storage filter"
          >
            <button
              type="button"
              onClick={() => updateFilter('storage', 'all')}
              className={`${styles.pillBtn} ${
                currentStorage === 'all' ? styles.pillBtnActive : ''
              }`}
              aria-pressed={currentStorage === 'all'}
            >
              All
            </button>
            {STORAGE_OPTIONS.map((storage) => (
              <button
                key={storage}
                type="button"
                onClick={() => updateFilter('storage', storage)}
                className={`${styles.pillBtn} ${
                  currentStorage === storage ? styles.pillBtnActive : ''
                }`}
                aria-pressed={currentStorage === storage}
              >
                {storage}
              </button>
            ))}
          </div>

          {/* Reset Filters Action Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetBtn}
              aria-label="Reset all active filters"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Controls Row (< 768px) */}
      <div className={styles.mobileControls}>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={styles.mobileFilterBtn}
          aria-expanded={isDrawerOpen}
          aria-controls="mobile-filter-drawer"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className={styles.badge}>{activeFilterCount}</span>
          )}
        </button>

        <select
          value={currentSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className={styles.sortSelect}
          style={{ flex: 1 }}
          aria-label="Sort mobiles on mobile"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {isDrawerOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-filter-drawer"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Filter options"
          >
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Filters</h3>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className={styles.drawerCloseBtn}
                aria-label="Close filter drawer"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* RAM Section */}
            <div className={styles.drawerSection}>
              <span className={styles.drawerSectionTitle}>RAM</span>
              <div className={styles.pillList}>
                <button
                  type="button"
                  onClick={() => updateFilter('ram', 'all')}
                  className={`${styles.pillBtn} ${
                    currentRam === 'all' ? styles.pillBtnActive : ''
                  }`}
                >
                  All
                </button>
                {RAM_OPTIONS.map((ram) => (
                  <button
                    key={ram}
                    type="button"
                    onClick={() => updateFilter('ram', ram)}
                    className={`${styles.pillBtn} ${
                      currentRam === ram ? styles.pillBtnActive : ''
                    }`}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Section */}
            <div className={styles.drawerSection}>
              <span className={styles.drawerSectionTitle}>Storage</span>
              <div className={styles.pillList}>
                <button
                  type="button"
                  onClick={() => updateFilter('storage', 'all')}
                  className={`${styles.pillBtn} ${
                    currentStorage === 'all' ? styles.pillBtnActive : ''
                  }`}
                >
                  All
                </button>
                {STORAGE_OPTIONS.map((storage) => (
                  <button
                    key={storage}
                    type="button"
                    onClick={() => updateFilter('storage', storage)}
                    className={`${styles.pillBtn} ${
                      currentStorage === storage ? styles.pillBtnActive : ''
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className={styles.drawerFooter}>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className={styles.drawerResetBtn}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className={styles.applyBtn}
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
