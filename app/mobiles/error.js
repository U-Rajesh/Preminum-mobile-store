'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import styles from './mobiles.module.css';

export default function MobilesError({ error, reset }) {
  useEffect(() => {
    // Log error securely on client console for debugging
    console.error('Catalog page error:', error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.emptyState} role="alert">
          <AlertCircle size={44} className={styles.emptyIcon} aria-hidden="true" />
          <h2 className={styles.emptyTitle}>Something went wrong</h2>
          <p className={styles.emptyText}>
            We couldn&apos;t load the mobile collection.
          </p>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Try again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
