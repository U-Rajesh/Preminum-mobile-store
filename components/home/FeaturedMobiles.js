import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeaturedMobiles } from '@/lib/services/mobiles';
import MobileCard from './MobileCard';
import styles from './FeaturedMobiles.module.css';

export default async function FeaturedMobiles() {
  let mobiles = [];
  let hasError = false;

  try {
    mobiles = await getFeaturedMobiles(8);
  } catch (err) {
    console.error('Error in FeaturedMobiles component:', err.message);
    hasError = true;
  }

  return (
    <section className={styles.section} aria-labelledby="featured-mobiles-heading">
      <div className="container">
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <div className={styles.eyebrowWrapper}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              <span className={styles.eyebrow}>Curated Selection</span>
              <span className={styles.eyebrowLine} aria-hidden="true" />
            </div>
            <h2 id="featured-mobiles-heading" className={styles.heading}>
              Latest in Mobile
            </h2>
            <p className={styles.subtitle}>
              Explore our hand-selected flagship smartphones, engineered for performance, aesthetic refinement, and everyday excellence.
            </p>
          </div>

          <Link href="/mobiles" className={styles.viewAllLink}>
            <span>View all mobiles</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Error State */}
        {hasError ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Unable to load featured mobiles</h3>
            <p className={styles.emptyText}>
              Please check back soon or explore our complete catalog.
            </p>
            <Link href="/mobiles" className={styles.browseBtn}>
              Explore Catalog
            </Link>
          </div>
        ) : mobiles.length > 0 ? (
          /* Product Grid */
          <div className={styles.grid}>
            {mobiles.map((mobile, idx) => (
              <MobileCard key={mobile.id} mobile={mobile} index={idx} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No featured mobiles yet</h3>
            <p className={styles.emptyText}>
              Our latest collection will appear here soon.
            </p>
            <Link href="/mobiles" className={styles.browseBtn}>
              Explore Catalog
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
