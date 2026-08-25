import Link from 'next/link';
import { Smartphone, AlertCircle, RotateCcw } from 'lucide-react';
import { getMobiles } from '@/lib/services/mobiles';
import MobileCard from '@/components/home/MobileCard';
import CatalogFilters from '@/components/mobiles/CatalogFilters';
import styles from './mobiles.module.css';

export const metadata = {
  title: 'All Mobiles & Smartphones',
  description: 'Explore the complete collection of flagship smartphones with detailed specifications, manufacturer warranty, and filters by brand, RAM, storage, and price.',
};

export default async function MobilesPage({ searchParams }) {
  const params = await searchParams;

  const search = typeof params?.q === 'string' ? params.q.trim() : '';
  const ram = typeof params?.ram === 'string' ? params.ram.trim() : '';
  const storage = typeof params?.storage === 'string' ? params.storage.trim() : '';
  const sort =
    params?.sort && ['normal', 'price-low-high', 'price-high-low'].includes(params.sort)
      ? params.sort
      : 'normal';

  const isFiltered = Boolean(
    search || ram || storage || (sort && sort !== 'normal')
  );

  let mobiles = [];
  let hasError = false;

  try {
    mobiles = await getMobiles({ search, ram, storage, sort });
  } catch (err) {
    console.error('Error fetching mobiles with filters:', err.message);
    hasError = true;
  }

  const countText =
    mobiles.length === 1
      ? '1 mobile'
      : mobiles.length > 1
      ? `${mobiles.length} mobiles`
      : 'No mobiles found';

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page Header */}
        <header className={styles.header}>
          <div className={styles.eyebrowWrapper}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span className={styles.eyebrow}>The Flagship Catalog</span>
            <span className={styles.eyebrowLine} aria-hidden="true" />
          </div>
          <h1 className={styles.title}>Find your next smartphone.</h1>
          <p className={styles.subtitle}>
            Explore our curated collection of premium smartphones, selected for
            performance, design, and everyday experience.
          </p>
        </header>

        {/* Filter and Search Toolbar */}
        <CatalogFilters />

        {/* Result Count Row */}
        <div className={styles.metaRow}>
          <span className={styles.count}>{countText}</span>
        </div>

        {/* Catalog Content */}
        {hasError ? (
          <div className={styles.emptyState}>
            <AlertCircle size={40} className={styles.emptyIcon} aria-hidden="true" />
            <h2 className={styles.emptyTitle}>Unable to load mobiles</h2>
            <p className={styles.emptyText}>
              We&apos;re having trouble loading the collection. Please try again later.
            </p>
          </div>
        ) : mobiles.length > 0 ? (
          <div className={styles.grid}>
            {mobiles.map((mobile, idx) => (
              <MobileCard key={mobile.id} mobile={mobile} index={idx} />
            ))}
          </div>
        ) : isFiltered ? (
          /* Filtered Empty State */
          <div className={styles.emptyState}>
            <Smartphone size={40} className={styles.emptyIcon} aria-hidden="true" />
            <h2 className={styles.emptyTitle}>No mobiles match your filters</h2>
            <p className={styles.emptyText}>
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <Link
              href="/mobiles"
              className="btn btn-primary"
              style={{
                marginTop: 'var(--space-4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>Reset Filters</span>
            </Link>
          </div>
        ) : (
          /* Default Empty State */
          <div className={styles.emptyState}>
            <Smartphone size={40} className={styles.emptyIcon} aria-hidden="true" />
            <h2 className={styles.emptyTitle}>No mobiles available</h2>
            <p className={styles.emptyText}>
              Our collection is being updated. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
